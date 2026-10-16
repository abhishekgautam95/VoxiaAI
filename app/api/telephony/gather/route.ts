import { db } from "@/lib/db";
import { AppointmentStatus, CallRole, IntegrationProvider, Prisma } from "@prisma/client";
import { dispatchAppointmentWebhook, sendSmsConfirmation } from "@/lib/notifications";
import { syncAppointmentToDoctorGoogleCalendar } from "@/lib/calendar/google-sync";
import { recordAuditLog } from "@/lib/audit";
import {
  escapeXml,
  normalizeAndValidateE164,
  signTelephonyContext,
  verifyTelephonyContext,
  verifyTwilioSignature,
} from "@/lib/telephony/security";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId") || "";
  const callSid = url.searchParams.get("callSid") || "";
  const sig = url.searchParams.get("sig") || "";

  // 1. Verify HMAC-signed telephony context (prevents caller-controlled orgId spoofing)
  if (!verifyTelephonyContext(orgId, callSid, sig)) {
    return Response.json(
      { error: "Forbidden: Invalid or missing signed telephony routing context" },
      { status: 403 }
    );
  }

  const rawParams: Record<string, string> = {};
  let speechResult = "";
  let callerNumber = "";

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (typeof value === "string") rawParams[key] = value;
      });
      speechResult = rawParams.SpeechResult || "";
      callerNumber = rawParams.From || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      for (const [k, v] of Object.entries(json || {})) {
        if (typeof v === "string") rawParams[k] = v;
      }
      speechResult = rawParams.SpeechResult || "";
      callerNumber = rawParams.From || "";
    }
  } catch {
    return Response.json({ error: "Invalid gather payload" }, { status: 400 });
  }

  // 2. Strictly lookup organization by verified orgId (no cross-tenant fallback)
  const organization = await db.organization.findUnique({ where: { id: orgId } });
  if (!organization) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  // 3. Verify X-Twilio-Signature
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
  const officeHours = agentConfig?.officeHours || "Monday through Friday 8 AM to 6 PM";
  const address =
    agentConfig?.businessAddress || "742 Evergreen Terrace, Suite 200, San Francisco";

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
    const validatedE164 =
      normalizeAndValidateE164(agentConfig?.phoneNumber) || "+14158004291";

    recordAuditLog({
      organizationId: organization.id,
      action: "INTEGRATION_UPDATED",
      entityType: "CallTransfer",
      entityId: callSid || null,
      metadata: {
        reason: "Human escalation triggered via speech keywords",
        callerText: speechResult,
        transferTo: validatedE164,
        callSid,
      },
    }).catch(() => {});

    if (callSid) {
      const callRecord = await db.callRecord.findUnique({ where: { callId: callSid } });
      if (callRecord && callRecord.organizationId === organization.id) {
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
  <Dial>${escapeXml(validatedE164)}</Dial>
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

    const createdApt = await db.$transaction(
      async (tx) => {
        const bookedAppointments = await tx.appointment.findMany({
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

        return tx.appointment.create({
          data: {
            organizationId: organization.id,
            customerName: "Inbound Telephony Caller",
            phoneNumber: callerNumber || "+1 (415) 329-8812",
            service: "Routine Dental Cleaning & Exam",
            provider: "Dr. Sarah Smith",
            date: dateStr,
            time: timeSlot,
            status: AppointmentStatus.CONFIRMED,
            notes: `Autonomously booked via live telephony speech call (${callSid})`,
            bookedBy: "AI Telephony Carrier",
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    recordAuditLog({
      organizationId: organization.id,
      action: "APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: createdApt.id,
      metadata: {
        customer: createdApt.customerName,
        phone: createdApt.phoneNumber,
        source: "Telephony Carrier",
        callSid,
      },
    }).catch(() => {});

    syncAppointmentToDoctorGoogleCalendar(organization.id, {
      appointmentId: createdApt.id,
      customerName: createdApt.customerName,
      phoneNumber: createdApt.phoneNumber,
      service: createdApt.service,
      providerName: createdApt.provider,
      date: createdApt.date,
      time: createdApt.time,
      notes: createdApt.notes,
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

    replyText = `Wonderful! I have reserved tomorrow, ${dateStr} at ${createdApt.time} for your cleaning with Dr. Smith. We sent a confirmation SMS to your number. Is there anything else I can help you with?`;
  } else if (
    lower.includes("hour") ||
    lower.includes("open") ||
    lower.includes("close") ||
    lower.includes("time")
  ) {
    replyText = `Our regular clinic operating hours are ${officeHours}. Would you like to schedule an appointment?`;
  } else if (
    lower.includes("where") ||
    lower.includes("address") ||
    lower.includes("location") ||
    lower.includes("direction")
  ) {
    replyText = `We are located at ${address}. There is dedicated parking right by our front door.`;
  } else if (
    lower.includes("bye") ||
    lower.includes("thank") ||
    lower.includes("that's all") ||
    lower.includes("no")
  ) {
    replyText = `You are very welcome! Have a fantastic day. Goodbye!`;
    shouldHangup = true;
  } else {
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

  if (callSid) {
    const callRecord = await db.callRecord.findUnique({ where: { callId: callSid } });
    if (callRecord && callRecord.organizationId === organization.id) {
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

  const nextSig = signTelephonyContext(organization.id, callSid);
  const gatherActionUrl = `/api/telephony/gather?orgId=${encodeURIComponent(
    organization.id
  )}&callSid=${encodeURIComponent(callSid)}&sig=${encodeURIComponent(nextSig)}`;

  const twiml = shouldHangup
    ? `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${escapeXml(replyText)}</Say>
  <Hangup/>
</Response>`
    : `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${escapeXml(replyText)}</Say>
  <Gather input="speech" action="${escapeXml(gatherActionUrl)}" method="POST" speechTimeout="auto" timeout="3">
    <Say voice="Polly.Joanna-Neural">How else may I assist you today?</Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural">Thank you for calling ${escapeXml(businessName)}. Goodbye!</Say>
  <Hangup/>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
