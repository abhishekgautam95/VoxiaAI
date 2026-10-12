import { db } from "@/lib/db";

export async function POST(request: Request) {
  let callSid = "";
  let duration = 0;
  let recordingUrl = "";

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      callSid = (formData.get("CallSid") as string) || "";
      duration = parseInt((formData.get("CallDuration") as string) || "0", 10);
      recordingUrl = (formData.get("RecordingUrl") as string) || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      callSid = json.CallSid || "";
      duration = parseInt(json.CallDuration || "0", 10);
      recordingUrl = json.RecordingUrl || "";
    }
  } catch {
    // fallback
  }

  if (callSid) {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const formatted = `${mins}m ${secs}s`;

    await db.callRecord.updateMany({
      where: { callId: callSid },
      data: {
        durationSeconds: duration,
        durationFormatted: formatted,
        audioDurationSec: duration,
        audioUrl: recordingUrl || undefined,
      },
    });
  }

  return Response.json({ received: true });
}
