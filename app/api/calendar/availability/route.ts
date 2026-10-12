import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";

const DEFAULT_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const excludeId = searchParams.get("excludeId");

  const existingAppointments = await db.appointment.findMany({
    where: {
      organizationId: session.organizationId,
      date: targetDate,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      status: {
        in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
      },
    },
    select: {
      id: true,
      time: true,
      customerName: true,
      service: true,
      status: true,
    },
  });

  const normalizeTime = (t: string) => t.replace(/^0/, "").toUpperCase().trim();

  const bookedTimeMap = new Map<string, (typeof existingAppointments)[number]>();
  for (const apt of existingAppointments) {
    bookedTimeMap.set(normalizeTime(apt.time), apt);
  }

  const slotResults = DEFAULT_SLOTS.map((time) => {
    const matched = bookedTimeMap.get(normalizeTime(time));
    return {
      time,
      available: !matched,
      bookedInfo: matched
        ? {
            appointmentId: matched.id,
            service: matched.service,
          }
        : null,
    };
  });

  return Response.json({
    date: targetDate,
    totalSlots: slotResults.length,
    availableSlotsCount: slotResults.filter((s) => s.available).length,
    slots: slotResults,
  });
}
