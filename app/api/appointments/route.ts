import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { dispatchAppointmentWebhook, sendSmsConfirmation } from "@/lib/notifications";
import { syncAppointmentToDoctorGoogleCalendar } from "@/lib/calendar/google-sync";

const appointmentCreateSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  phoneNumber: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  service: z.string().trim().min(1).max(120),
  provider: z.string().trim().max(120).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().trim().min(1).max(30),
  notes: z.string().max(1000).optional(),
  bookedBy: z.string().max(80).optional(),
});

export class SlotConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlotConflictError";
  }
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.toUpperCase();
  const search = searchParams.get("search")?.trim();

  const whereClause: Prisma.AppointmentWhereInput = {
    organizationId: session.organizationId,
  };

  if (statusParam && statusParam in AppointmentStatus) {
    whereClause.status = statusParam as AppointmentStatus;
  }

  if (search) {
    whereClause.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { phoneNumber: { contains: search } },
      { service: { contains: search, mode: "insensitive" } },
    ];
  }

  const appointments = await db.appointment.findMany({
    where: whereClause,
    orderBy: [
      { date: "desc" },
      { time: "asc" },
    ],
  });

  return Response.json({ appointments });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof appointmentCreateSchema>;
  try {
    body = appointmentCreateSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid appointment payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  let appointment;
  try {
    // Atomic Serializable Transaction to prevent concurrent double-booking race conditions
    appointment = await db.$transaction(
      async (tx) => {
        const existingConflict = await tx.appointment.findFirst({
          where: {
            organizationId: session.organizationId,
            date: body.date,
            time: body.time,
            status: AppointmentStatus.CONFIRMED,
          },
        });

        if (existingConflict) {
          throw new SlotConflictError(
            `Slot ${body.time} on ${body.date} is already reserved for another appointment. Please pick an available time.`
          );
        }

        const created = await tx.appointment.create({
          data: {
            organizationId: session.organizationId,
            customerName: body.customerName,
            phoneNumber: body.phoneNumber,
            email: body.email || null,
            service: body.service,
            provider: body.provider || "Dr. Sarah Smith",
            date: body.date,
            time: body.time,
            status: AppointmentStatus.CONFIRMED,
            notes: body.notes || null,
            bookedBy: body.bookedBy || "Staff Operator",
          },
        });

        await tx.auditLog.create({
          data: {
            organizationId: session.organizationId,
            actorUserId: session.userId,
            action: "APPOINTMENT_CREATED",
            entityType: "Appointment",
            entityId: created.id,
            metadata: {
              customer: created.customerName,
              date: created.date,
              time: created.time,
            },
          },
        });

        return created;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (err: unknown) {
    if (err instanceof SlotConflictError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2034" || err.code === "P2002")
    ) {
      return Response.json(
        {
          error: `Slot ${body.time} on ${body.date} was concurrently reserved. Please select another time.`,
        },
        { status: 409 }
      );
    }
    throw err;
  }

  // Asynchronously sync to Google Calendar (with 15-minute slot buffer), webhook, and SMS
  syncAppointmentToDoctorGoogleCalendar(session.organizationId, {
    appointmentId: appointment.id,
    customerName: appointment.customerName,
    phoneNumber: appointment.phoneNumber,
    email: appointment.email,
    service: appointment.service,
    providerName: appointment.provider,
    date: appointment.date,
    time: appointment.time,
    notes: appointment.notes,
  }).catch(() => {});

  dispatchAppointmentWebhook(session.organizationId, {
    id: appointment.id,
    customerName: appointment.customerName,
    phoneNumber: appointment.phoneNumber,
    service: appointment.service,
    date: appointment.date,
    time: appointment.time,
    provider: appointment.provider,
  }).catch(() => {});

  sendSmsConfirmation(session.organizationId, {
    id: appointment.id,
    customerName: appointment.customerName,
    phoneNumber: appointment.phoneNumber,
    service: appointment.service,
    date: appointment.date,
    time: appointment.time,
    provider: appointment.provider,
  }).catch(() => {});

  return Response.json(
    { appointment, message: "Appointment confirmed successfully!" },
    { status: 201 }
  );
}
