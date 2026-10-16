import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";
import { AppointmentStatus, AuditAction, Prisma } from "@prisma/client";
import { SlotConflictError } from "../route";

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

  try {
    const updatedAppointment = await db.$transaction(
      async (tx) => {
        const existing = await tx.appointment.findFirst({
          where: { id, organizationId: session.organizationId },
        });

        if (!existing) {
          return null;
        }

        const targetDate = body.date || existing.date;
        const targetTime = body.time || existing.time;
        const targetStatus = (body.status as AppointmentStatus) || existing.status;

        if ((body.date || body.time || body.status === "CONFIRMED") && targetStatus === AppointmentStatus.CONFIRMED) {
          const conflict = await tx.appointment.findFirst({
            where: {
              organizationId: session.organizationId,
              id: { not: id },
              date: targetDate,
              time: targetTime,
              status: AppointmentStatus.CONFIRMED,
            },
          });

          if (conflict) {
            throw new SlotConflictError(
              `Cannot reschedule: Slot ${targetTime} on ${targetDate} is already reserved for another appointment.`
            );
          }
        }

        const updated = await tx.appointment.update({
          where: { id },
          data: {
            ...(body.status ? { status: body.status as AppointmentStatus } : {}),
            ...(body.date ? { date: body.date } : {}),
            ...(body.time ? { time: body.time } : {}),
            ...(body.notes !== undefined ? { notes: body.notes } : {}),
          },
        });

        let auditAction: AuditAction = AuditAction.APPOINTMENT_UPDATED;
        if (body.status === "CANCELLED") {
          auditAction = AuditAction.APPOINTMENT_CANCELLED;
        } else if (body.date || body.time) {
          auditAction = AuditAction.APPOINTMENT_RESCHEDULED;
        }

        await tx.auditLog.create({
          data: {
            organizationId: session.organizationId,
            actorUserId: session.userId,
            action: auditAction,
            entityType: "Appointment",
            entityId: id,
            metadata: {
              previousDate: existing.date,
              previousTime: existing.time,
              newDate: updated.date,
              newTime: updated.time,
              status: updated.status,
              reason: body.reason,
            },
          },
        });

        return updated;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    if (!updatedAppointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    return Response.json({
      appointment: updatedAppointment,
      message: "Appointment updated successfully!",
    });
  } catch (err: unknown) {
    if (err instanceof SlotConflictError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2034" || err.code === "P2002")
    ) {
      return Response.json(
        { error: "Slot conflict detected during concurrent reschedule. Please pick another time." },
        { status: 409 }
      );
    }
    throw err;
  }
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
