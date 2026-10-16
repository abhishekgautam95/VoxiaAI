import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { MembershipRole } from "@prisma/client";
import { canManageTeamAndSettings, canAssignRole } from "../lib/auth/session";
import {
  escapeXml,
  normalizeAndValidateE164,
  computeTwilioSignature,
  verifyTwilioSignature,
  signTelephonyContext,
  verifyTelephonyContext,
} from "../lib/telephony/security";
import { verifyStripeWebhookSignature, resolveTierFromPriceId } from "../lib/stripe";
import {
  signOAuthState,
  verifyOAuthState,
  computeSlotWithBuffer,
} from "../lib/calendar/google-sync";

describe("RBAC Authorization & Privilege Escalation Guards", () => {
  it("allows only OWNER and ADMIN to manage team and integration settings", () => {
    expect(canManageTeamAndSettings(MembershipRole.OWNER)).toBe(true);
    expect(canManageTeamAndSettings(MembershipRole.ADMIN)).toBe(true);
    expect(canManageTeamAndSettings(MembershipRole.OPERATOR)).toBe(false);
    expect(canManageTeamAndSettings(MembershipRole.ANALYST)).toBe(false);
  });

  it("prevents ADMIN from escalating privileges to OWNER", () => {
    expect(canAssignRole(MembershipRole.OWNER, MembershipRole.OWNER)).toBe(true);
    expect(canAssignRole(MembershipRole.OWNER, MembershipRole.ADMIN)).toBe(true);
    expect(canAssignRole(MembershipRole.ADMIN, MembershipRole.ADMIN)).toBe(true);
    expect(canAssignRole(MembershipRole.ADMIN, MembershipRole.OPERATOR)).toBe(true);
    expect(canAssignRole(MembershipRole.ADMIN, MembershipRole.OWNER)).toBe(false);
    expect(canAssignRole(MembershipRole.OPERATOR, MembershipRole.OPERATOR)).toBe(false);
  });
});

describe("Telephony Trust Boundaries, Signatures & XML Escaping", () => {
  it("escapes XML special characters to prevent TwiML injection", () => {
    const maliciousInput = `Hello </Say><Dial>+19999999999</Dial><Say attr="x&y">'test'`;
    const escaped = escapeXml(maliciousInput);
    expect(escaped).not.toContain("</Say>");
    expect(escaped).not.toContain("<Dial>");
    expect(escaped).toContain("&lt;/Say&gt;&lt;Dial&gt;");
    expect(escaped).toContain("&amp;");
    expect(escaped).toContain("&quot;");
    expect(escaped).toContain("&apos;");
  });

  it("validates and normalizes E.164 phone numbers and rejects invalid strings", () => {
    expect(normalizeAndValidateE164("+1 (415) 800-4291")).toBe("+14158004291");
    expect(normalizeAndValidateE164("415-800-4291")).toBe("+14158004291");
    expect(normalizeAndValidateE164("invalid-phone")).toBeNull();
    expect(normalizeAndValidateE164("12345")).toBeNull();
  });

  it("signs and verifies telephony routing context and rejects tampered orgId", () => {
    const orgId = "org_clinic_alpha";
    const callSid = "CA1234567890abcdef";
    const sig = signTelephonyContext(orgId, callSid);

    expect(verifyTelephonyContext(orgId, callSid, sig)).toBe(true);
    expect(verifyTelephonyContext("org_attacker_tenant", callSid, sig)).toBe(false);
    expect(verifyTelephonyContext(orgId, "CA_TAMPERED", sig)).toBe(false);
    expect(verifyTelephonyContext(orgId, callSid, "")).toBe(false);
  });

  it("verifies X-Twilio-Signature using HMAC-SHA1 and rejects forged requests", () => {
    const authToken = "twilio_test_secret_token_991";
    const url = "https://app.voxia.ai/api/telephony/inbound";
    const params = {
      CallSid: "CA99887766",
      From: "+14153298812",
      To: "+14158004291",
    };

    const validSig = computeTwilioSignature(authToken, url, params);
    const validReq = new Request(url, {
      method: "POST",
      headers: { "x-twilio-signature": validSig },
    });

    expect(verifyTwilioSignature(validReq, params, authToken).valid).toBe(true);

    const forgedReq = new Request(url, {
      method: "POST",
      headers: { "x-twilio-signature": "forged_signature_value" },
    });
    expect(verifyTwilioSignature(forgedReq, params, authToken).valid).toBe(false);
  });
});

describe("Stripe Webhook Cryptographic Verification & Tier Mapping", () => {
  const secret = "whsec_test_stripe_secret_key";
  const payload = JSON.stringify({
    id: "evt_123",
    type: "checkout.session.completed",
    data: { object: { id: "cs_test_1" } },
  });

  it("accepts valid Stripe HMAC-SHA256 webhook signature within replay window", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const sigHex = createHmac("sha256", secret)
      .update(`${timestamp}.${payload}`, "utf8")
      .digest("hex");
    const header = `t=${timestamp},v1=${sigHex}`;

    const res = verifyStripeWebhookSignature(payload, header, secret);
    expect(res.valid).toBe(true);
  });

  it("rejects tampered webhook body or expired replay timestamp", () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 900; // 15 mins old
    const sigHex = createHmac("sha256", secret)
      .update(`${oldTimestamp}.${payload}`, "utf8")
      .digest("hex");

    const expiredRes = verifyStripeWebhookSignature(
      payload,
      `t=${oldTimestamp},v1=${sigHex}`,
      secret
    );
    expect(expiredRes.valid).toBe(false);

    const nowTs = Math.floor(Date.now() / 1000);
    const validSigForOriginal = createHmac("sha256", secret)
      .update(`${nowTs}.${payload}`, "utf8")
      .digest("hex");

    const tamperedRes = verifyStripeWebhookSignature(
      payload + "tampered",
      `t=${nowTs},v1=${validSigForOriginal}`,
      secret
    );
    expect(tamperedRes.valid).toBe(false);
  });

  it("maps Stripe price IDs to the correct VoxiaAI subscription tier", () => {
    expect(resolveTierFromPriceId("price_starter_199").id).toBe("STARTER");
    expect(resolveTierFromPriceId("price_enterprise_999").id).toBe("ENTERPRISE");
    expect(resolveTierFromPriceId("unknown_price").id).toBe("PRO");
  });
});

describe("Google Calendar OAuth2 State & 15-Minute Buffer Padding", () => {
  it("signs and verifies Google OAuth2 CSRF state tokens", () => {
    const state = signOAuthState({ organizationId: "org_123", userId: "usr_456" });
    const verified = verifyOAuthState(state);
    expect(verified).toEqual({ organizationId: "org_123", userId: "usr_456" });
    expect(verifyOAuthState(state + "tamper")).toBeNull();
  });

  it("computes 45-minute treatment + 15-minute sterilization buffer (60 mins total block)", () => {
    const slot = computeSlotWithBuffer("2026-10-20", "10:30 AM", 45, 15);
    expect(slot.startIso).toBe("2026-10-20T10:30:00");
    expect(slot.treatmentEndIso).toBe("2026-10-20T11:15:00");
    expect(slot.bufferedEndIso).toBe("2026-10-20T11:30:00");
    expect(slot.totalBlockedMinutes).toBe(60);
  });
});
