import { db } from "@/lib/db";
import { IntegrationProvider } from "@prisma/client";
import {
  escapeXml,
  extractLast10Digits,
  signTelephonyContext,
  verifyTwilioSignature,
} from "@/lib/telephony/security";

export async function POST(request: Request) {
  const rawParams: Record<string, string> = {};
  let from = "";
  let to = "";
  let callSid = "";

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (typeof value === "string") rawParams[key] = value;
      });
      from = rawParams.From || "";
      to = rawParams.To || "";
      callSid = rawParams.CallSid || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      for (const [k, v] of Object.entries(json || {})) {
        if (typeof v === "string") rawParams[k] = v;
      }
      from = rawParams.From || "";
      to = rawParams.To || "";
      callSid = rawParams.CallSid || "";
    }
  } catch {
    return new Response("Invalid telephony payload", { status: 400 });
  }

  if (!to || !from || !callSid) {
    return new Response("Missing required telephony parameters (To, From, CallSid)", {
      status: 400,
    });
  }

  // Strictly resolve organization from a verified active PhoneNumber mapping (no cross-tenant fallback)
  const toLast10 = extractLast10Digits(to);
  const matchedPhone = await db.phoneNumber.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { number: to },
        ...(toLast10.length === 10 ? [{ number: { contains: toLast10 } }] : []),
      ],
    },
    include: { organization: true },
  });

  if (!matchedPhone?.organization) {
    const unmappedTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Thank you for calling. No active voice receptionist is currently configured for this line. Goodbye.</Say>
  <Hangup/>
</Response>`;
    return new Response(unmappedTwiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const organization = matchedPhone.organization;

  // Verify X-Twilio-Signature against organization's Twilio authToken or global TWILIO_AUTH_TOKEN
  const twilioIntegration = await db.integrationConfig.findUnique({
    where: {
      organizationId_provider: {
        organizationId: organization.id,
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

  const agentConfig = await db.agentConfig.findUnique({
    where: { organizationId: organization.id },
  });

  const businessName = agentConfig?.businessName || organization.name;
  const agentName = agentConfig?.displayName?.split(" ")[0] || "Sarah";
  const greetingText = agentConfig?.systemPrompt
    ? `Hello! Thank you for calling ${businessName}. This is ${agentName}, your AI receptionist. How may I assist you today?`
    : `Hello! Thank you for calling ${businessName}. How may I help you today?`;

  await db.callRecord.upsert({
    where: { callId: callSid },
    update: {
      callerNumber: from,
    },
    create: {
      callId: callSid,
      organizationId: organization.id,
      callerNumber: from,
      callerName: "Inbound SIP Caller",
      durationSeconds: 0,
      durationFormatted: "0m 0s",
      status: "COMPLETED",
      aiSummary: `Incoming telephony call received from ${from} routed to ${agentName}.`,
      keyTakeaways: [`Inbound call initiated on ${to}`, `Routed to ${businessName}`],
      sentiment: "Neutral",
    },
  });

  const contextSig = signTelephonyContext(organization.id, callSid);

  // Real-Time Sub-300ms Twilio Media Streams Mode when configured
  const { searchParams } = new URL(request.url);
  const useMediaStream =
    process.env.ENABLE_TWILIO_MEDIA_STREAMS === "true" ||
    searchParams.get("stream") === "true";

  if (useMediaStream && process.env.MEDIA_STREAM_WSS_URL) {
    const streamTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${escapeXml(process.env.MEDIA_STREAM_WSS_URL)}">
      <Parameter name="orgId" value="${escapeXml(organization.id)}" />
      <Parameter name="callSid" value="${escapeXml(callSid)}" />
      <Parameter name="callerNumber" value="${escapeXml(from)}" />
      <Parameter name="sig" value="${escapeXml(contextSig)}" />
    </Stream>
  </Connect>
</Response>`;

    return new Response(streamTwiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const gatherActionUrl = `/api/telephony/gather?orgId=${encodeURIComponent(
    organization.id
  )}&callSid=${encodeURIComponent(callSid)}&sig=${encodeURIComponent(contextSig)}`;

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${escapeXml(greetingText)}</Say>
  <Gather input="speech" action="${escapeXml(gatherActionUrl)}" method="POST" speechTimeout="auto" timeout="3">
    <Say voice="Polly.Joanna-Neural">Please say how I can help you, such as booking an appointment or checking office hours.</Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural">I did not hear your response. You can visit our website to book online 24/7. Have a wonderful day!</Say>
  <Hangup/>
</Response>`;

  return new Response(twimlResponse, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
