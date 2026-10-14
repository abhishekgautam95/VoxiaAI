import { db } from "@/lib/db";
import { AppointmentStatus, CallRole } from "@prisma/client";
import { dispatchAppointmentWebhook, sendSmsConfirmation } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId") || "";
  const callSid = url.searchParams.get("callSid") || "";

  let speechResult = "";
  let callerNumber = "+1 (415) 329-8812";

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      speechResult = (formData.get("SpeechResult") as string) || "";
      callerNumber = (formData.get("From") as string) || callerNumber;
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      speechResult = json.SpeechResult || "";
      callerNumber = json.From || callerNumber;
    }
  } catch {
    // fallback
  }

  const organization =
    (await db.organization.findUnique({ where: { id: orgId } })) ||
    (await db.organization.findFirst({ where: { slug: "apex-health-dental" } })) ||
    (await db.organization.findFirst());

  if (!organization) {
    const hangupTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`;
    return new Response(hangupTwiml, { status: 200, headers: { "Content-Type": "text/xml" } });
  }

  const agentConfig = await db.agentConfig.findUnique({
    where: { organizationId: organization.id },
  });

  const businessName = agentConfig?.businessName || organization.name;
  const officeHours = agentConfig?.officeHours || "Monday through Friday 8 AM to 6 PM";
  const address = agentConfig?.businessAddress || "742 Evergreen Terrace, Suite 200, San Francisco";

  const lower = speechResult.toLowerCase();
  let replyText = "";
  let shouldHangup = false;

  const conf =
    agentConfig?.configuration && typeof agentConfig.configuration === "object"
      ? (agentConfig.configuration as Record<string, unknown>)
      : {};

  const transferKeywordsRaw =
    typeof conf.transferKeywords === "string"
      ? conf.transferKeywords
      : "human, operator, person, emergency, severe pain, doctor, receptionist, speak to someone";

  const transferKeywords = transferKeywordsRaw
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  const isTransferRequested = transferKeywords.some((kw) => lower.includes(kw));

  if (isTransferRequested) {
    const destinationPhone = agentConfig?.phoneNumber || "+14158004291";
    recordAuditLog({
      organizationId: organization.id,
      action: "INTEGRATION_UPDATED",
      entityType: "CallTransfer",
      entityId: callSid || null,
      metadata: {
        reason: "Human escalation triggered via speech keywords",
        callerText: speechResult,
        transferTo: destinationPhone,
        callSid,
      },
    }).catch(() => {});

    if (callSid) {
      const callRecord = await db.callRecord.findUnique({ where: { callId: callSid } });
      if (callRecord) {
        if (speechResult) {
          await db.callTranscript.create({
            data: {
              callRecordId: callRecord.id,
              role: CallRole.USER,
              text: speechResult,
              timestamp: "0:05",
            },
          });
        }
        await db.callTranscript.create({
          data: {
            callRecordId: callRecord.id,
            role: CallRole.AI,
            text: "Please hold while I transfer you to our front desk staff.",
            timestamp: "0:08",
          },
        });
      }
    }

    const transferTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Please hold while I transfer you to our front desk staff.</Say>
  <Dial>${destinationPhone}</Dial>
</Response>`;

    return new Response(transferTwiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  if (
    lower.includes("appointment") ||
    lower.includes("book") ||
    lower.includes("schedule") ||
    lower.includes("cleaning") ||
    lower.includes("visit")
  ) {
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    const dateStr = appointmentDate.toISOString().split("T")[0];
    const preferredSlot = lower.includes("afternoon") ? "02:00 PM" : "10:30 AM";

    const candidateSlots = [
      "09:00 AM",
      "10:00 AM",
      "10:30 AM",
      "11:30 AM",
      "01:30 PM",
      "02:00 PM",
      "03:30 PM",
      "04:30 PM",
    ];

    const bookedAppointments = await db.appointment.findMany({
      where: {
        organizationId: organization.id,
        date: dateStr,
        status: AppointmentStatus.CONFIRMED,
      },
      select: { time: true },
    });
    const bookedTimes = new Set(bookedAppointments.map((a) => a.time));

    let timeSlot = preferredSlot;
    if (bookedTimes.has(timeSlot)) {
      const nextOpen = candidateSlots.find((s) => !bookedTimes.has(s));
      if (nextOpen) {
        timeSlot = nextOpen;
      }
    }

    // Auto-create real appointment
    const createdApt = await db.appointment.create({
      data: {
        organizationId: organization.id,
        customerName: "Inbound Telephony Caller",
        phoneNumber: callerNumber,
        service: "Routine Dental Cleaning & Exam",
        provider: "Dr. Sarah Smith",
        date: dateStr,
        time: timeSlot,
        status: AppointmentStatus.CONFIRMED,
        notes: `Autonomously booked via live telephony speech call (${callSid})`,
        bookedBy: "AI Telephony Carrier",
      },
    });

    recordAuditLog({
      organizationId: organization.id,
      action: "APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: createdApt.id,
      metadata: {
        customer: createdApt.customerName,
        phone: callerNumber,
        source: "Telephony Carrier",
        callSid,
      },
    }).catch(() => {});

    dispatchAppointmentWebhook(organization.id, {
      id: createdApt.id,
      customerName: createdApt.customerName,
      phoneNumber: createdApt.phoneNumber,
      service: createdApt.service,
      date: createdApt.date,
      time: createdApt.time,
      provider: createdApt.provider,
    }).catch(() => {});

    sendSmsConfirmation(organization.id, {
      id: createdApt.id,
      customerName: createdApt.customerName,
      phoneNumber: createdApt.phoneNumber,
      service: createdApt.service,
      date: createdApt.date,
      time: createdApt.time,
      provider: createdApt.provider,
    }).catch(() => {});

    replyText = `Wonderful! I have reserved tomorrow, ${dateStr} at ${timeSlot} for your cleaning with Dr. Smith. We sent a confirmation SMS to your number. Is there anything else I can help you with?`;
  } else if (lower.includes("hour") || lower.includes("open") || lower.includes("close") || lower.includes("time")) {
    replyText = `Our regular clinic operating hours are ${officeHours}. Would you like to schedule an appointment?`;
  } else if (lower.includes("where") || lower.includes("address") || lower.includes("location") || lower.includes("direction")) {
    replyText = `We are located at ${address}. There is dedicated parking right by our front door.`;
  } else if (lower.includes("bye") || lower.includes("thank") || lower.includes("that's all") || lower.includes("no")) {
    replyText = `You are very welcome! Have a fantastic day. Goodbye!`;
    shouldHangup = true;
  } else {
    // Knowledge Base RAG Search for live telephony callers
    const knowledgeDocs = await db.knowledgeDocument.findMany({
      where: { organizationId: organization.id, enabled: true },
    });

    const matchedDoc = knowledgeDocs.find((doc) => {
      const keywords = (doc.title + " " + doc.category)
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      return (
        keywords.some((k) => lower.includes(k)) ||
        (lower.includes("insurance") && doc.category.toLowerCase().includes("insurance")) ||
        (lower.includes("park") && doc.title.toLowerCase().includes("park")) ||
        (lower.includes("emergency") && doc.title.toLowerCase().includes("emergency")) ||
        (lower.includes("whiten") && doc.title.toLowerCase().includes("whiten")) ||
        (lower.includes("price") && doc.category.toLowerCase().includes("pricing")) ||
        (lower.includes("cancel") && doc.title.toLowerCase().includes("cancel"))
      );
    });

    if (matchedDoc) {
      replyText = `${matchedDoc.content} Would you like to schedule a visit or ask anything else?`;
    } else {
      replyText = `Thank you for asking. As the front desk receptionist for ${businessName}, I can help you schedule appointments, verify insurances, or provide clinic directions.`;
    }
  }

  // Update call record and log transcripts if CallRecord exists
  if (callSid) {
    const callRecord = await db.callRecord.findUnique({ where: { callId: callSid } });
    if (callRecord) {
      if (speechResult) {
        await db.callTranscript.create({
          data: {
            callRecordId: callRecord.id,
            role: CallRole.USER,
            text: speechResult,
            timestamp: "0:05",
          },
        });
      }
      await db.callTranscript.create({
        data: {
          callRecordId: callRecord.id,
          role: CallRole.AI,
          text: replyText,
          timestamp: "0:10",
        },
      });

      if (lower.includes("appointment") || lower.includes("book")) {
        await db.callRecord.update({
          where: { id: callRecord.id },
          data: { status: "APPOINTMENT_BOOKED" },
        });
      }
    }
  }

  const twiml = shouldHangup
    ? `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${replyText}</Say>
  <Hangup/>
</Response>`
    : `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${replyText}</Say>
  <Gather input="speech" action="/api/telephony/gather?orgId=${organization.id}&amp;callSid=${callSid}" method="POST" speechTimeout="auto" timeout="3">
    <Say voice="Polly.Joanna-Neural">How else may I assist you today?</Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural">Thank you for calling ${businessName}. Goodbye!</Say>
  <Hangup/>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
