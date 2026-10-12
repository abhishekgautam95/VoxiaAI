import { db } from "@/lib/db";

export async function POST(request: Request) {
  let from = "+1 (415) 329-8812";
  let to = "+1 (415) 800-4291";
  let callSid = `CALL-SIP-${Date.now().toString(36).toUpperCase()}`;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      from = (formData.get("From") as string) || from;
      to = (formData.get("To") as string) || to;
      callSid = (formData.get("CallSid") as string) || callSid;
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      from = json.From || from;
      to = json.To || to;
      callSid = json.CallSid || callSid;
    }
  } catch {
    // default fallbacks
  }

  // Find organization by dialed number, or default to primary org
  const matchedPhone = await db.phoneNumber.findFirst({
    where: { number: to },
    include: { organization: true },
  });

  const organization =
    matchedPhone?.organization ||
    (await db.organization.findFirst({ where: { slug: "apex-health-dental" } })) ||
    (await db.organization.findFirst());

  if (!organization) {
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Thank you for calling. No active voice receptionist is currently configured for this line. Goodbye.</Say>
  <Hangup/>
</Response>`;
    return new Response(fallbackTwiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const agentConfig = await db.agentConfig.findUnique({
    where: { organizationId: organization.id },
  });

  const businessName = agentConfig?.businessName || organization.name;
  const agentName = agentConfig?.displayName?.split(" ")[0] || "Sarah";
  const greetingText =
    agentConfig?.systemPrompt
      ? `Hello! Thank you for calling ${businessName}. This is ${agentName}, your AI receptionist. How may I assist you today?`
      : `Hello! Thank you for calling ${businessName}. How may I help you today?`;

  // Log incoming call session in database
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

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${greetingText}</Say>
  <Gather input="speech" action="/api/telephony/gather?orgId=${organization.id}&amp;callSid=${callSid}" method="POST" speechTimeout="auto" timeout="3">
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
