import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";
import { AppointmentStatus, CallStatus, CallRole } from "@prisma/client";
import { dispatchAppointmentWebhook, sendSmsConfirmation } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/audit";

const CANDIDATE_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "10:30 AM",
  "11:30 AM",
  "01:30 PM",
  "02:00 PM",
  "03:30 PM",
  "04:30 PM",
];

const simulateSchema = z.object({
  callerText: z.string().trim().optional(),
  callerNumber: z.string().default("+1 (415) 329-8812"),
  callerName: z.string().optional(),
  history: z
    .array(
      z.object({
        sender: z.enum(["caller", "agent", "user", "ai"]),
        text: z.string(),
      })
    )
    .default([]),
  callEnded: z.boolean().optional(),
  callDuration: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof simulateSchema>;
  try {
    body = simulateSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const agentConfig = await db.agentConfig.findUnique({
    where: { organizationId: session.organizationId },
  });

  const businessName = agentConfig?.businessName || session.organization.name;
  const officeHours = agentConfig?.officeHours || "Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM";
  const address = agentConfig?.businessAddress || "742 Evergreen Terrace, Suite 200, San Francisco, CA";
  const agentName = agentConfig?.displayName?.replace(/\s*\(AI Receptionist\)$/i, "") || "Sarah";

  // If client signaled that the call ended, persist CallRecord & CallTranscripts
  if (body.callEnded && body.history.length > 0) {
    const isBooked = body.history.some(
      (h) =>
        h.text.toLowerCase().includes("reserved") ||
        h.text.toLowerCase().includes("confirmed") ||
        h.text.toLowerCase().includes("booked")
    );

    const duration = body.callDuration ?? Math.max(body.history.length * 5, 30);
    const count = await db.callRecord.count({ where: { organizationId: session.organizationId } });
    const callId = `CALL-SIM-${1000 + count + 1}`;

    const createdCall = await db.callRecord.create({
      data: {
        callId,
        organizationId: session.organizationId,
        callerNumber: body.callerNumber,
        callerName: body.callerName || "Web Simulator Caller",
        durationSeconds: duration,
        durationFormatted: `${Math.floor(duration / 60)}m ${duration % 60}s`,
        status: isBooked ? CallStatus.APPOINTMENT_BOOKED : CallStatus.COMPLETED,
        aiSummary: `Interactive test session with ${agentName}. Handled ${
          body.history.filter((h) => h.sender === "caller" || h.sender === "user").length
        } caller turns.`,
        keyTakeaways: [
          `Session handled autonomously by ${agentName}`,
          `Verified business hours, insurance, and service parameters`,
          isBooked
            ? "Appointment autonomously reserved in calendar"
            : "Inquiry resolved satisfactorily",
        ],
        sentiment: "Positive",
        audioDurationSec: duration,
        transcripts: {
          create: body.history.map((t, idx) => ({
            role: t.sender === "agent" || t.sender === "ai" ? CallRole.AI : CallRole.USER,
            text: t.text,
            timestamp: `${Math.floor((idx * 5) / 60)}:${((idx * 5) % 60).toString().padStart(2, "0")}`,
            sequence: idx,
          })),
        },
      },
    });

    return Response.json({
      success: true,
      message: "Call persisted successfully",
      callRecordId: createdCall.id,
      callId: createdCall.callId,
    });
  }

  const callerText = body.callerText || "";
  if (!callerText) {
    return Response.json({ error: "Missing callerText" }, { status: 400 });
  }

  const lower = callerText.toLowerCase();

  const knowledgeDocs = await db.knowledgeDocument.findMany({
    where: { organizationId: session.organizationId, enabled: true },
  });

  const kbText = knowledgeDocs
    .map((d) => `[${d.category}] ${d.title}: ${d.content}`)
    .join("\n");

  // Detect Appointment Booking Intent
  let bookedAppointment: {
    id: string;
    customerName: string;
    phoneNumber: string;
    service: string;
    provider: string | null;
    date: string;
    time: string;
  } | null = null;
  let intent = "general_inquiry";

  const isBookingWord =
    lower.includes("appointment") ||
    lower.includes("book") ||
    lower.includes("schedule") ||
    lower.includes("cleaning") ||
    lower.includes("visit") ||
    lower.includes("exam") ||
    lower.includes("toothache");

  const hasTimingClue =
    lower.includes("tomorrow") ||
    lower.includes("tuesday") ||
    lower.includes("wednesday") ||
    lower.includes("thursday") ||
    lower.includes("friday") ||
    lower.includes("morning") ||
    lower.includes("afternoon") ||
    lower.includes("today") ||
    lower.includes("10:30") ||
    lower.includes("2:00") ||
    lower.includes("pm") ||
    lower.includes("am");

  if (isBookingWord && hasTimingClue) {
    intent = "appointment_booking";

    const customerName = body.callerName || "Eleanor Vance";
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    const dateStr = appointmentDate.toISOString().split("T")[0];
    const preferredSlot = lower.includes("afternoon") ? "02:00 PM" : "10:30 AM";

    // Slot Conflict Check
    const existingAppointments = await db.appointment.findMany({
      where: {
        organizationId: session.organizationId,
        date: dateStr,
        status: AppointmentStatus.CONFIRMED,
      },
      select: { time: true },
    });
    const bookedTimes = new Set(existingAppointments.map((a) => a.time));

    let chosenSlot = preferredSlot;
    if (bookedTimes.has(chosenSlot)) {
      const nextOpen = CANDIDATE_SLOTS.find((s) => !bookedTimes.has(s));
      if (nextOpen) {
        chosenSlot = nextOpen;
      }
    }

    const createdApt = await db.appointment.create({
      data: {
        organizationId: session.organizationId,
        customerName,
        phoneNumber: body.callerNumber,
        service: lower.includes("toothache")
          ? "Emergency Toothache Exam"
          : "Routine Dental Cleaning & Exam",
        provider: "Dr. Sarah Smith",
        date: dateStr,
        time: chosenSlot,
        status: AppointmentStatus.CONFIRMED,
        notes: `Autonomously booked via live voice call (${customerName})`,
        bookedBy: `AI Receptionist (${agentName})`,
      },
    });

    bookedAppointment = createdApt;

    recordAuditLog({
      organizationId: session.organizationId,
      actorUserId: session.userId,
      action: "APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: createdApt.id,
      metadata: {
        customer: createdApt.customerName,
        date: createdApt.date,
        time: createdApt.time,
        service: createdApt.service,
        source: "Voice Simulator",
      },
    }).catch(() => {});

    dispatchAppointmentWebhook(session.organizationId, {
      id: createdApt.id,
      customerName: createdApt.customerName,
      phoneNumber: createdApt.phoneNumber,
      service: createdApt.service,
      date: createdApt.date,
      time: createdApt.time,
      provider: createdApt.provider,
    }).catch(() => {});

    sendSmsConfirmation(session.organizationId, {
      id: createdApt.id,
      customerName: createdApt.customerName,
      phoneNumber: createdApt.phoneNumber,
      service: createdApt.service,
      date: createdApt.date,
      time: createdApt.time,
      provider: createdApt.provider,
    }).catch(() => {});
  } else if (isBookingWord) {
    intent = "appointment_booking_inquiry";
  }

  // Phrasing reply: Try Gemini first if configured, else fall back to rule engine
  let reply = "";
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const basePrompt =
        agentConfig?.systemPrompt ||
        `You are ${agentName}, the AI receptionist at ${businessName}. Hours: ${officeHours}. Address: ${address}.`;

      let instructionSuffix = `
CLINIC KNOWLEDGE BASE & POLICIES:
${kbText}

Instructions:
- Keep answers concise and friendly for telephone conversations (1-3 sentences).
- Accurately reference the knowledge base for insurance, parking, emergency care, pricing, and services.`;

      if (bookedAppointment) {
        instructionSuffix += `
NOTE: An appointment was just reserved for ${bookedAppointment.customerName} on ${bookedAppointment.date} at ${bookedAppointment.time} for ${bookedAppointment.service} with ${bookedAppointment.provider}. A confirmation text has been dispatched to ${body.callerNumber}.
Please confirm these exact details warmly to the caller in 1-2 friendly sentences.`;
      }

      const contents = [
        ...body.history.map((h) => ({
          role: h.sender === "caller" || h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        { role: "user", parts: [{ text: callerText }] },
      ];

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `${basePrompt}\n${instructionSuffix}` }] },
            contents,
            generationConfig: { maxOutputTokens: 250, temperature: 0.6 },
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          reply = geminiText.trim();
        }
      }
    } catch (err) {
      console.warn("Gemini phrasing failed, falling back to rule engine:", err);
    }
  }

  // Fallback Rule Engine if Gemini is not configured or failed
  if (!reply) {
    if (bookedAppointment) {
      reply = `Wonderful! I have reserved ${bookedAppointment.date} at ${bookedAppointment.time} for your visit with Dr. Smith. I've sent a confirmation text to ${body.callerNumber}. Is there anything else I can help you with today?`;
    } else if (intent === "appointment_booking_inquiry") {
      reply = `I would love to help you schedule an appointment at ${businessName}! We have openings tomorrow at 10:30 AM or Thursday at 2:00 PM. Which of those times works best for you?`;
    } else if (
      lower.includes("hour") ||
      lower.includes("open") ||
      lower.includes("close") ||
      lower.includes("time") ||
      lower.includes("weekend")
    ) {
      intent = "office_hours";
      reply = `Our regular clinic operating hours are ${officeHours}. We also keep reserve slots open for same-day emergencies. Would you like to schedule a visit?`;
    } else if (
      lower.includes("where") ||
      lower.includes("address") ||
      lower.includes("location") ||
      lower.includes("park") ||
      lower.includes("directions")
    ) {
      intent = "location_inquiry";
      reply = `We are located at ${address}. There is dedicated complimentary patient parking right next to our main entrance.`;
    } else if (
      lower.includes("insurance") ||
      lower.includes("cost") ||
      lower.includes("price") ||
      lower.includes("copay") ||
      lower.includes("accept")
    ) {
      intent = "insurance_verification";
      reply = `At ${businessName}, we accept most major PPO insurances including Delta Dental, MetLife, Cigna, Guardian, and Aetna. We always verify coverage and provide zero-surprise cost breakdowns before procedures.`;
    } else if (lower.includes("cancel") || lower.includes("reschedule") || lower.includes("change")) {
      intent = "reschedule_request";
      reply = `I can certainly help you reschedule your appointment. What date and time would be more convenient for you?`;
    } else if (
      lower.includes("hello") ||
      lower.includes("hi") ||
      lower.includes("hey") ||
      lower.includes("morning")
    ) {
      intent = "greeting";
      reply = `Good day! Thank you for calling ${businessName}. This is ${agentName}, your AI receptionist. How can I assist you today?`;
    } else {
      const matchedDoc = knowledgeDocs.find((doc) => {
        const keywords = (doc.title + " " + doc.category)
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        return keywords.some((k) => lower.includes(k));
      });

      if (matchedDoc) {
        intent = "knowledge_base_match";
        reply = `${matchedDoc.content} Would you like to schedule an appointment regarding this?`;
      } else {
        reply = `Thank you for asking. As the front desk receptionist for ${businessName}, I can assist with scheduling visits, checking insurance coverage, or answering office questions. How may I help you?`;
      }
    }
  }

  return Response.json({
    reply,
    intent,
    appointment: bookedAppointment,
  });
}
