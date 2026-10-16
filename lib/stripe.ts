import { createHmac, timingSafeEqual } from "crypto";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

export interface TierSpec {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number;
  stripePriceId: string;
  includedMinutes: number;
  includedNumbers: number;
  extraMinuteRate: number;
  description: string;
  features: string[];
}

export const TIER_CATALOG: Record<SubscriptionTier, TierSpec> = {
  STARTER: {
    id: SubscriptionTier.STARTER,
    name: "Clinic Starter",
    priceMonthly: 199,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "price_starter_199",
    includedMinutes: 400,
    includedNumbers: 1,
    extraMinuteRate: 0.2,
    description: "Ideal for solo practitioners and boutique clinics.",
    features: [
      "1 Dedicated Carrier Line",
      "400 Minutes Monthly Answering",
      "Google Calendar 2-Way Sync",
      "Standard Voice Synthesis",
      "Email & Webhook Alerts",
    ],
  },
  PRO: {
    id: SubscriptionTier.PRO,
    name: "Practice Pro",
    priceMonthly: 499,
    stripePriceId: process.env.STRIPE_PRICE_PRO || "price_pro_499",
    includedMinutes: 1000,
    includedNumbers: 3,
    extraMinuteRate: 0.15,
    description: "The complete autonomous front desk for busy healthcare practices.",
    features: [
      "3 Dedicated Carrier Lines",
      "1,000 Minutes Monthly Answering",
      "RAG Clinic Knowledge Base (Unlimited FAQs)",
      "Conflict-Free Multi-Doctor Scheduling",
      "ElevenLabs Turbo v2.5 Voice Synthesis",
      "Instant Post-Call SMS Confirmations",
      "HIPAA Compliance Audit Trail",
    ],
  },
  ENTERPRISE: {
    id: SubscriptionTier.ENTERPRISE,
    name: "Multi-Location Enterprise",
    priceMonthly: 999,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise_999",
    includedMinutes: 3000,
    includedNumbers: 10,
    extraMinuteRate: 0.1,
    description: "High-volume call center and hospital group voice orchestration.",
    features: [
      "10 Dedicated Toll-Free & Local Lines",
      "3,000 Minutes Monthly Answering",
      "Custom Voice Cloning & Localization",
      "Custom EHR/EMR Integration",
      "Signed HIPAA BAA Agreement",
      "Dedicated 24/7 Priority Telecom SLA",
    ],
  },
};

export function resolveTierFromPriceId(priceId?: string | null): TierSpec {
  const matched = Object.values(TIER_CATALOG).find((t) => t.stripePriceId === priceId);
  return matched || TIER_CATALOG.PRO;
}

export function mapStripeSubscriptionStatus(status?: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "past_due":
    case "unpaid":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "incomplete_expired":
    default:
      return SubscriptionStatus.CANCELED;
  }
}

/**
 * Verifies the official Stripe `Stripe-Signature` header (`t=timestamp,v1=signature`)
 * using HMAC-SHA256 and timing-safe comparison, with a 5-minute replay tolerance.
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
  toleranceSeconds = 300
): { valid: boolean; reason?: string } {
  if (!signatureHeader) {
    return { valid: false, reason: "Missing Stripe-Signature header" };
  }

  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const v1Parts = parts.filter((p) => p.startsWith("v1="));

  if (!timestampPart || v1Parts.length === 0) {
    return { valid: false, reason: "Malformed Stripe-Signature header" };
  }

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp)) {
    return { valid: false, reason: "Invalid Stripe-Signature timestamp" };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return { valid: false, reason: "Stripe webhook timestamp outside replay tolerance window" };
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSig = createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");
  const expectedBuf = Buffer.from(expectedSig, "utf8");

  const matched = v1Parts.some((v1) => {
    const sigHex = v1.slice(3);
    const sigBuf = Buffer.from(sigHex, "utf8");
    return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
  });

  if (!matched) {
    return { valid: false, reason: "Invalid Stripe webhook signature" };
  }

  return { valid: true };
}

/**
 * Helper to call the Stripe REST API v1 directly using form-encoded parameters.
 */
export async function stripeRequest<T = Record<string, unknown>>(
  path: string,
  params?: Record<string, string>,
  method: "GET" | "POST" = "POST"
): Promise<T> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const url = `https://api.stripe.com/v1${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" && params ? new URLSearchParams(params).toString() : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe API error (${res.status})`);
  }
  return data as T;
}
