import { createHmac, timingSafeEqual } from "crypto";

const CONTEXT_SIGNING_SECRET =
  process.env.TELEPHONY_CONTEXT_SECRET ||
  process.env.TWILIO_AUTH_TOKEN ||
  process.env.DATABASE_URL ||
  "voxia-telephony-hmac-secret";

/**
 * Escapes untrusted strings before interpolating into XML/TwiML documents
 * to prevent XML injection and arbitrary TwiML verb injection.
 */
export function escapeXml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Converts a display phone number like "+1 (415) 800-4291" into strict E.164 "+14158004291"
 * and validates that it conforms to ITU-T E.164 format. Returns null if invalid.
 */
export function normalizeAndValidateE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  if (digitsOnly.length >= 11 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }
  return null;
}

/**
 * Extracts normalized last 10 digits for canonical phone number matching in the database.
 */
export function extractLast10Digits(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

/**
 * Computes the official Twilio webhook HMAC-SHA1 signature for a URL and sorted form parameters.
 */
export function computeTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>
): string {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + (params[key] ?? "");
  }
  return createHmac("sha1", authToken).update(data, "utf8").digest("base64");
}

/**
 * Verifies an incoming Twilio webhook request signature (`X-Twilio-Signature`).
 * - When `authToken` is configured (via env `TWILIO_AUTH_TOKEN` or organization integration),
 *   strict cryptographic verification is enforced.
 * - If `TWILIO_ENFORCE_SIGNATURE === "true"` and no token/signature is present, rejects immediately.
 */
export function verifyTwilioSignature(
  request: Request,
  params: Record<string, string>,
  orgAuthToken?: string | null
): { valid: boolean; reason?: string } {
  const authToken = orgAuthToken || process.env.TWILIO_AUTH_TOKEN;
  const enforceStrict = process.env.TWILIO_ENFORCE_SIGNATURE === "true" || Boolean(authToken);

  if (!enforceStrict) {
    return { valid: true };
  }

  if (!authToken) {
    return { valid: false, reason: "Missing Twilio auth token for signature verification" };
  }

  const providedSig = request.headers.get("x-twilio-signature");
  if (!providedSig) {
    return { valid: false, reason: "Missing X-Twilio-Signature header" };
  }

  const publicUrl =
    process.env.TWILIO_WEBHOOK_BASE_URL
      ? `${process.env.TWILIO_WEBHOOK_BASE_URL}${new URL(request.url).pathname}${new URL(request.url).search}`
      : request.url;

  const expectedSig = computeTwilioSignature(authToken, publicUrl, params);

  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { valid: false, reason: "Invalid X-Twilio-Signature" };
  }

  return { valid: true };
}

/**
 * Signs telephony routing context (`orgId` + `callSid`) so subsequent TwiML `<Gather>` callbacks
 * cannot be tampered with to cross tenant boundaries.
 */
export function signTelephonyContext(orgId: string, callSid: string): string {
  return createHmac("sha256", CONTEXT_SIGNING_SECRET)
    .update(`${orgId}:${callSid}`)
    .digest("base64url");
}

/**
 * Verifies the HMAC signature on a telephony callback context.
 */
export function verifyTelephonyContext(
  orgId: string,
  callSid: string,
  signature: string | null | undefined
): boolean {
  if (!orgId || !callSid || !signature) return false;
  const expected = signTelephonyContext(orgId, callSid);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
