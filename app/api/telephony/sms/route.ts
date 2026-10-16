import { db } from "@/lib/db";
import { AppointmentStatus, IntegrationProvider } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";
import {
  escapeXml,
  extractLast10Digits,
  verifyTwilioSignature,
} from "@/lib/telephony/security";

export async function POST(request: Request) {
  const rawParams: Record<string, string> = {};
  let fromNumber = "";
  let toNumber = "";
  let bodyText = "";

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (typeof value === "string") rawParams[key] = value;
      });
      fromNumber = rawParams.From || "";
      toNumber = rawParams.To || "";
      bodyText = rawParams.Body || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      for (const [k, v] of Object.entries(json || {})) {
        if (typeof v === "string") rawParams[k] = v;
      }
      fromNumber = rawParams.From || "";
      toNumber = rawParams.To || "";
      bodyText = rawParams.Body || "";
    }
  } catch {
    return Response.json({ error: "Invalid SMS payload" }, { status: 400 });
  }

  fromNumber = fromNumber.trim();
  toNumber = toNumber.trim();

  if (!fromNumber || !toNumber) {
    return Response.json(
      { error: "Missing required SMS routing parameters (From, To)" },
      { status: 400 }
    );
  }

  // 1. Resolve target organization strictly from the verified destination number (`To`)
  const toLast10 = extractLast10Digits(toNumber);
  const matchedPhone = await db.phoneNumber.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { number: toNumber },
        ...(toLast10.length === 10 ? [{ number: { contains: toLast10 } }] : []),
      ],
    },
    include: { organization: true },
  });

  if (!matchedPhone?.organization) {
    const unmappedTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>This number is not currently linked to an active clinic scheduling line.</Message>
</Response>`;
    return new Response(unmappedTwiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const org = matchedPhone.organization;

  // 2. Verify X-Twilio-Signature
  const twilioIntegration = await db.integrationConfig.findUnique({
    where: {
      organizationId_provider: {
        organizationId: org.id,
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

  // 3. Scope appointment lookup strictly to `organizationId: org.id` and caller's phone number
  const fromLast10 = extractLast10Digits(fromNumber);
  const appointment = await db.appointment.findFirst({
    where: {
      organizationId: org.id,
      OR: [
        { phoneNumber: fromNumber },
        ...(fromLast10.length === 10 ? [{ phoneNumber: { contains: fromLast10 } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const orgName = org.name;
  const upperBody = bodyText.trim().toUpperCase();

  let messageReply = "";

  if (appointment) {
    if (
      upperBody === "C" ||
      upperBody.startsWith("CONFIRM") ||
      upperBody === "YES" ||
      upperBody === "Y"
    ) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CONFIRMED,
          notes: `${appointment.notes || ""} | Confirmed via 2-way SMS`.trim(),
        },
      });

      recordAuditLog({
        organizationId: org.id,
        action: "APPOINTMENT_UPDATED",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: {
          action: "SMS_CONFIRMATION",
          from: fromNumber,
          to: toNumber,
          smsBody: bodyText,
        },
      }).catch(() => {});

      messageReply = `${orgName}: Thank you! Your appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} is confirmed. Reply CANCEL if you need to cancel.`;
    } else if (
      upperBody === "R" ||
      upperBody.startsWith("RESCHEDULE") ||
      upperBody.includes("CHANGE")
    ) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.PENDING,
          notes: `${appointment.notes || ""} | Reschedule requested via 2-way SMS`.trim(),
        },
      });

      recordAuditLog({
        organizationId: org.id,
        action: "APPOINTMENT_UPDATED",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: {
          action: "SMS_RESCHEDULE_REQUEST",
          from: fromNumber,
          to: toNumber,
          smsBody: bodyText,
        },
      }).catch(() => {});

      messageReply = `${orgName}: We have noted your request to reschedule your visit. Our front desk staff will call or text you shortly with alternative openings.`;
    } else if (upperBody === "CANCEL" || upperBody.startsWith("CANCEL")) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CANCELLED,
          notes: `${appointment.notes || ""} | Cancelled via 2-way SMS`.trim(),
        },
      });

      recordAuditLog({
        organizationId: org.id,
        action: "APPOINTMENT_CANCELLED",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: {
          action: "SMS_CANCELLATION",
          from: fromNumber,
          to: toNumber,
          smsBody: bodyText,
        },
      }).catch(() => {});

      messageReply = `${orgName}: Your appointment on ${appointment.date} has been cancelled. Please visit our website or call us when you are ready to rebook.`;
    } else {
      messageReply = `${orgName}: Thank you for your message. Reply C to confirm your appointment, R to reschedule, CANCEL to cancel, or call our office directly for urgent assistance.`;
    }
  } else {
    messageReply = `Thank you for contacting ${orgName}. To book or manage an appointment with our team, please visit our online scheduling portal or call our front desk directly.`;
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(messageReply)}</Message>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
