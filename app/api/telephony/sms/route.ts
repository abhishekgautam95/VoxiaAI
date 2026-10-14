import { db } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  let fromNumber = "";
  let bodyText = "";

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      fromNumber = (formData.get("From") as string) || "";
      bodyText = (formData.get("Body") as string) || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      fromNumber = json.From || "";
      bodyText = json.Body || "";
    }
  } catch {
    // fallback
  }

  fromNumber = fromNumber.trim();
  const cleanDigits = fromNumber.replace(/\D/g, "");
  const last10 = cleanDigits.slice(-10);

  // Search for the latest appointment associated with this caller's phone number
  const appointment = await db.appointment.findFirst({
    where: {
      OR: [
        { phoneNumber: fromNumber },
        ...(last10.length >= 7 ? [{ phoneNumber: { contains: last10 } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { organization: true },
  });

  const org =
    appointment?.organization ||
    (await db.organization.findFirst({ where: { slug: "apex-health-dental" } })) ||
    (await db.organization.findFirst());

  const orgName = org?.name || "Apex Health & Dental";
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
        organizationId: appointment.organizationId,
        action: "APPOINTMENT_UPDATED",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: {
          action: "SMS_CONFIRMATION",
          from: fromNumber,
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
        organizationId: appointment.organizationId,
        action: "APPOINTMENT_UPDATED",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: {
          action: "SMS_RESCHEDULE_REQUEST",
          from: fromNumber,
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
        organizationId: appointment.organizationId,
        action: "APPOINTMENT_CANCELLED",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: {
          action: "SMS_CANCELLATION",
          from: fromNumber,
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
  <Message>${messageReply}</Message>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
