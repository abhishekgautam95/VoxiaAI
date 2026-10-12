import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";
import { dispatchAppointmentWebhook, sendSmsConfirmation } from "@/lib/notifications";

const simulateSchema = z.object({
  callerText: z.string().trim().min(1),
  callerNumber: z.string().default("+1 (415) 329-8812"),
  callerName: z.string().optional(),
  history: z.array(
    z.object({
      sender: z.enum(["caller", "agent", "user", "ai"]),
      text: z.string(),
    })
  ).default([]),
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

  const knowledgeDocs = await db.knowledgeDocument.findMany({
    where: { organizationId: session.organizationId, enabled: true },
  });

  const kbText = knowledgeDocs
    .map((d) => `[${d.category}] ${d.title}: ${d.content}`)
    .join("\n");

  const businessName = agentConfig?.businessName || session.organization.name;
  const officeHours = agentConfig?.officeHours || "Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM";
  const address = agentConfig?.businessAddress || "742 Evergreen Terrace, Suite 200, San Francisco, CA";
  const agentName = agentConfig?.displayName?.split(" ")[0] || "Sarah";

  const lower = body.callerText.toLowerCase();

  // Check if GEMINI_API_KEY is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const basePrompt = agentConfig?.systemPrompt || `You are ${agentName}, the AI receptionist at ${businessName}. Hours: ${officeHours}. Address: ${address}.`;
      const systemInstruction = `${basePrompt}

CLINIC KNOWLEDGE BASE & POLICIES:
${kbText}

Instructions:
- Keep answers concise and friendly for telephone conversations (1-3 sentences).
- Accurately reference the knowledge base for insurance, parking, emergency care, pricing, and services.`;
      const contents = [
        ...body.history.map((h) => ({
          role: h.sender === "caller" || h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        { role: "user", parts: [{ text: body.callerText }] },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiReply) {
          return Response.json({
            reply: geminiReply,
            intent: "conversational_ai",
          });
        }
      }
    } catch (err) {
      console.warn("Gemini call failed, falling back to rule engine:", err);
    }
  }

  // Intelligent Contextual Voice Orchestrator
  let reply = "";
  let bookedAppointment = null;
  let intent = "general_inquiry";

  if (
    lower.includes("appointment") ||
    lower.includes("book") ||
    lower.includes("schedule") ||
    lower.includes("cleaning") ||
    lower.includes("visit") ||
    lower.includes("exam") ||
    lower.includes("toothache")
  ) {
    intent = "appointment_booking";

    // Extract potential time or day
    if (lower.includes("tomorrow") || lower.includes("tuesday") || lower.includes("wednesday") || lower.includes("today")) {
      const customerName = body.callerName || "Eleanor Vance";
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 1);
      const dateStr = appointmentDate.toISOString().split("T")[0];
      const timeSlot = lower.includes("afternoon") ? "2:00 PM" : "10:30 AM";

      const createdApt = await db.appointment.create({
        data: {
          organizationId: session.organizationId,
          customerName,
          phoneNumber: body.callerNumber,
          service: lower.includes("toothache") ? "Emergency Toothache Exam" : "Routine Dental Cleaning & Exam",
          provider: "Dr. Sarah Smith",
          date: dateStr,
          time: timeSlot,
          status: AppointmentStatus.CONFIRMED,
          notes: `Autonomously booked via live voice call (${customerName})`,
          bookedBy: `AI Receptionist (${agentName})`,
        },
      });

      bookedAppointment = createdApt;

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

      reply = `Wonderful! I have reserved ${dateStr} at ${timeSlot} for your visit with Dr. Smith. I've sent a confirmation text to ${body.callerNumber}. Is there anything else I can help you with today?`;
    } else {
      reply = `I would love to help you schedule an appointment at ${businessName}! We have openings tomorrow at 10:30 AM or Thursday at 2:00 PM. Which of those times works best for you?`;
    }
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
  } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("morning")) {
    intent = "greeting";
    reply = `Good day! Thank you for calling ${businessName}. This is ${agentName}, your AI receptionist. How can I assist you today?`;
  } else {
    // Check Knowledge Base docs for matching topic
    const matchedDoc = knowledgeDocs.find((doc) => {
      const keywords = (doc.title + " " + doc.category).toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      return keywords.some((k) => lower.includes(k));
    });

    if (matchedDoc) {
      intent = "knowledge_base_match";
      reply = `${matchedDoc.content} Would you like to schedule an appointment regarding this?`;
    } else {
      reply = `Thank you for asking. As the front desk receptionist for ${businessName}, I can assist with scheduling visits, checking insurance coverage, or answering office questions. How may I help you?`;
    }
  }

  return Response.json({
    reply,
    intent,
    appointment: bookedAppointment,
  });
}
