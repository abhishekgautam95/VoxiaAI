import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { IntegrationProvider } from "@prisma/client";
import { verifyTwilioSignature } from "@/lib/telephony/security";

export async function POST(request: Request) {
  const rawParams: Record<string, string> = {};
  let callSid = "";
  let duration = 0;
  let recordingUrl = "";

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (typeof value === "string") rawParams[key] = value;
      });
      callSid = rawParams.CallSid || "";
      duration = parseInt(rawParams.CallDuration || "0", 10);
      recordingUrl = rawParams.RecordingUrl || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      for (const [k, v] of Object.entries(json || {})) {
        if (typeof v === "string") rawParams[k] = v;
      }
      callSid = rawParams.CallSid || "";
      duration = parseInt(rawParams.CallDuration || String(json.CallDuration || "0"), 10);
      recordingUrl = rawParams.RecordingUrl || "";
    }
  } catch {
    return Response.json({ error: "Invalid status payload" }, { status: 400 });
  }

  if (!callSid) {
    return Response.json({ error: "Missing CallSid" }, { status: 400 });
  }

  const existingRecord = await db.callRecord.findUnique({ where: { callId: callSid } });
  if (!existingRecord) {
    return Response.json({ error: "CallRecord not found" }, { status: 404 });
  }

  const twilioIntegration = await db.integrationConfig.findUnique({
    where: {
      organizationId_provider: {
        organizationId: existingRecord.organizationId,
        provider: IntegrationProvider.TWILIO,
      },
    },
  });
  const orgAuthToken = (twilioIntegration?.config as Record<string, unknown> | null)?.authToken as
    | string
    | undefined;

  const sigCheck = verifyTwilioSignature(request, rawParams, orgAuthToken);
  if (!sigCheck.valid) {
    return Response.json({ error: sigCheck.reason || "Invalid Twilio signature" }, { status: 403 });
  }

  const safeDuration = Number.isFinite(duration) && duration >= 0 ? duration : 0;
  const mins = Math.floor(safeDuration / 60);
  const secs = safeDuration % 60;
  const formatted = `${mins}m ${secs}s`;

  await db.callRecord.update({
    where: { id: existingRecord.id },
    data: {
      durationSeconds: safeDuration,
      durationFormatted: formatted,
      audioDurationSec: safeDuration,
      audioUrl: recordingUrl ? recordingUrl : undefined,
    },
  });

  recordAuditLog({
    organizationId: existingRecord.organizationId,
    action: "CALL_RECORDED",
    entityType: "CallRecord",
    entityId: existingRecord.id,
    metadata: {
      callSid,
      duration: safeDuration,
      durationFormatted: formatted,
      callerNumber: existingRecord.callerNumber,
      hasRecording: Boolean(recordingUrl),
    },
  }).catch(() => {});

  return Response.json({ received: true });
}
