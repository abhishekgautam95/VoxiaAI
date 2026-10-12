import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";
import { AppointmentStatus, AuditAction } from "@prisma/client";

const updateSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED", "PENDING"]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().trim().min(1).max(30).optional(),
  notes: z.string().max(1000).optional(),
  reason: z.string().max(500).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: z.infer<typeof updateSchema>;
  try {
    body = updateSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid update payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  const existing = await db.appointment.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    return Response.json({ error: "Appointment not found" }, { status: 404 });
  }

  if (body.date || body.time) {
    const targetDate = body.date || existing.date;
    const targetTime = body.time || existing.time;
    const conflict = await db.appointment.findFirst({
      where: {
        organizationId: session.organizationId,
        id: { not: id },
        date: targetDate,
        time: targetTime,
        status: AppointmentStatus.CONFIRMED,
      },
    });

    if (conflict) {
      return Response.json(
        {
          error: `Cannot reschedule: Slot ${targetTime} on ${targetDate} is already reserved for another appointment.`,
        },
        { status: 409 }
      );
    }
  }

  const updateData: {
    status?: AppointmentStatus;
    date?: string;
    time?: string;
    notes?: string;
  } = {};

  if (body.status) {
    updateData.status = body.status as AppointmentStatus;
  }
  if (body.date) {
    updateData.date = body.date;
  }
  if (body.time) {
    updateData.time = body.time;
  }
  if (body.notes !== undefined) {
    updateData.notes = body.notes;
  }

  const updatedAppointment = await db.appointment.update({
    where: { id },
    data: updateData,
  });

  let auditAction: AuditAction = AuditAction.APPOINTMENT_UPDATED;
  if (body.status === "CANCELLED") {
    auditAction = AuditAction.APPOINTMENT_CANCELLED;
  } else if (body.date || body.time) {
    auditAction = AuditAction.APPOINTMENT_RESCHEDULED;
  }

  await db.auditLog.create({
    data: {
      organizationId: session.organizationId,
      actorUserId: session.userId,
      action: auditAction,
      entityType: "Appointment",
      entityId: id,
      metadata: {
        previousDate: existing.date,
        previousTime: existing.time,
        newDate: updatedAppointment.date,
        newTime: updatedAppointment.time,
        status: updatedAppointment.status,
        reason: body.reason,
      },
    },
  });

  return Response.json({ appointment: updatedAppointment, message: "Appointment updated successfully!" });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.appointment.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    return Response.json({ error: "Appointment not found" }, { status: 404 });
  }

  await db.appointment.delete({ where: { id } });

  return Response.json({ message: "Appointment deleted successfully" });
}
