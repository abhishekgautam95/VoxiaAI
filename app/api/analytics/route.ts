import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { CallStatus } from "@prisma/client";
import {
  MetricCardData,
  HourlyCallVolume,
  CallIntentDistribution,
} from "@/components/dashboard/analytics/types";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "30d";
  const customStart = searchParams.get("start");
  const customEnd = searchParams.get("end");

  const now = new Date();
  let fromDate = new Date();

  if (range === "7d") {
    fromDate.setDate(now.getDate() - 7);
  } else if (range === "month") {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === "custom" && customStart) {
    fromDate = new Date(customStart);
  } else {
    fromDate.setDate(now.getDate() - 30);
  }

  const toDate =
    range === "custom" && customEnd ? new Date(customEnd + "T23:59:59") : now;

  const [calls, appointments] = await Promise.all([
    db.callRecord.findMany({
      where: {
        organizationId: session.organizationId,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        id: true,
        durationSeconds: true,
        status: true,
        sentiment: true,
        aiSummary: true,
        createdAt: true,
      },
    }),
    db.appointment.findMany({
      where: {
        organizationId: session.organizationId,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        id: true,
        service: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  // Compute strictly from persisted database measurements
  const totalCallsCount = calls.length;
  const resolvedCallsCount = calls.filter((c) => c.status !== CallStatus.MISSED).length;
  const deflectionRateNum =
    totalCallsCount > 0 ? (resolvedCallsCount / totalCallsCount) * 100 : 0;

  const totalDurationSec = calls.reduce((sum, c) => sum + (c.durationSeconds || 0), 0);
  const avgDurationSec =
    totalCallsCount > 0 ? Math.round(totalDurationSec / totalCallsCount) : 0;
  const ahtMins = Math.floor(avgDurationSec / 60);
  const ahtSecs = avgDurationSec % 60;

  const activeBookings = appointments.filter((a) => a.status !== "CANCELLED");
  const totalBookings = activeBookings.length;

  // Clearly labeled financial estimates derived from persisted counts
  const estimatedTicketUsd = 200;
  const estimatedHourlyWageUsd = 30;
  const estimatedRevenueNum = totalBookings * estimatedTicketUsd;
  const actualCallHours = totalDurationSec / 3600;
  const estimatedLaborSavedDollars = Math.round(actualCallHours * estimatedHourlyWageUsd);

  const metrics: MetricCardData[] = [
    {
      id: "labor-cost-saved",
      title: "Est. Labor Cost Saved",
      value: `$${estimatedLaborSavedDollars.toLocaleString()}`,
      change: `${totalCallsCount} calls`,
      changeDirection: "up",
      comparisonLabel: "measured in period",
      subtext: `${actualCallHours.toFixed(1)} call hours @ $${estimatedHourlyWageUsd}/hr est. wage`,
      microDetail: `Computed from ${totalCallsCount} persisted call records`,
      accentColor: "emerald",
    },
    {
      id: "revenue-generated",
      title: "Est. Booking Value",
      value: `$${estimatedRevenueNum.toLocaleString()}`,
      change: `${totalBookings} booked`,
      changeDirection: "up",
      comparisonLabel: "confirmed appointments",
      subtext: `From ${totalBookings} persisted appointments`,
      microDetail: `Estimated at $${estimatedTicketUsd} avg. visit value`,
      accentColor: "cyan",
    },
    {
      id: "deflection-rate",
      title: "Call Resolution Rate",
      value: `${deflectionRateNum.toFixed(1)}%`,
      change: `${resolvedCallsCount}/${totalCallsCount}`,
      changeDirection: "up",
      comparisonLabel: "resolved vs total",
      subtext: "Persisted calls completed without missed status",
      microDetail: `${resolvedCallsCount} completed / ${totalCallsCount} total inbound`,
      accentColor: "indigo",
    },
    {
      id: "avg-handling-time",
      title: "Avg Call Handling Time (AHT)",
      value: `${ahtMins}m ${ahtSecs.toString().padStart(2, "0")}s`,
      change: `${totalDurationSec}s total`,
      changeDirection: "down",
      comparisonLabel: "measured duration",
      subtext: `Averaged across ${totalCallsCount} recorded calls`,
      microDetail: "Measured directly from CallRecord.durationSeconds",
      accentColor: "violet",
    },
  ];

  // Bucket persisted calls by hour of day (8 AM - 5 PM)
  const hourLabels = [
    { label: "8 AM", hour24: 8 },
    { label: "9 AM", hour24: 9 },
    { label: "10 AM", hour24: 10 },
    { label: "11 AM", hour24: 11 },
    { label: "12 PM", hour24: 12 },
    { label: "1 PM", hour24: 13 },
    { label: "2 PM", hour24: 14 },
    { label: "3 PM", hour24: 15 },
    { label: "4 PM", hour24: 16 },
    { label: "5 PM", hour24: 17 },
  ];

  const hourlyVolumes: HourlyCallVolume[] = hourLabels.map(({ label, hour24 }) => {
    const callsInHour = calls.filter((c) => new Date(c.createdAt).getHours() === hour24);
    const total = callsInHour.length;
    const resolved = callsInHour.filter((c) => c.status !== CallStatus.MISSED).length;
    const deflectionPercent = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return {
      hour: label,
      totalCalls: total,
      aiResolved: resolved,
      deflectionPercent,
    };
  });

  // Classify persisted calls by summary keywords
  let bookingIntentCount = 0;
  let insuranceIntentCount = 0;
  let hoursIntentCount = 0;
  let pricingIntentCount = 0;
  let escalationIntentCount = 0;

  for (const c of calls) {
    const summary = (c.aiSummary || "").toLowerCase();
    if (c.status === CallStatus.APPOINTMENT_BOOKED || summary.includes("book") || summary.includes("appointment") || summary.includes("schedule")) {
      bookingIntentCount++;
    } else if (summary.includes("insurance") || summary.includes("delta") || summary.includes("coverage")) {
      insuranceIntentCount++;
    } else if (summary.includes("hour") || summary.includes("direction") || summary.includes("location") || summary.includes("address")) {
      hoursIntentCount++;
    } else if (summary.includes("price") || summary.includes("cost") || summary.includes("whiten") || summary.includes("implant")) {
      pricingIntentCount++;
    } else {
      escalationIntentCount++;
    }
  }

  const pct = (count: number) =>
    totalCallsCount > 0 ? Math.round((count / totalCallsCount) * 100) : 0;

  const intentDistribution: CallIntentDistribution[] = [
    {
      category: "Appointment Booking & Rescheduling",
      count: bookingIntentCount,
      percentage: pct(bookingIntentCount),
      color: "from-cyan-500 to-indigo-500",
      description: "Direct patient scheduling, cancellations, and slot adjustments.",
    },
    {
      category: "Insurance & Coverage Verification",
      count: insuranceIntentCount,
      percentage: pct(insuranceIntentCount),
      color: "from-emerald-500 to-teal-500",
      description: "In-network PPO confirmations, copay queries, and billing FAQ.",
    },
    {
      category: "Clinic Hours & Location Directions",
      count: hoursIntentCount,
      percentage: pct(hoursIntentCount),
      color: "from-amber-500 to-orange-500",
      description: "Parking instructions, address clarification, and holiday hours.",
    },
    {
      category: "Service Pricing & Treatment Queries",
      count: pricingIntentCount,
      percentage: pct(pricingIntentCount),
      color: "from-violet-500 to-purple-500",
      description: "Teeth whitening packages, crowns, implants, and exams.",
    },
    {
      category: "General Inquiries & Escalations",
      count: escalationIntentCount,
      percentage: pct(escalationIntentCount),
      color: "from-rose-500 to-pink-500",
      description: "Other reception inquiries and staff transfers.",
    },
  ];

  return Response.json({
    range,
    totalInquiries: totalCallsCount,
    persistedCounts: {
      calls: totalCallsCount,
      resolvedCalls: resolvedCallsCount,
      appointmentsBooked: totalBookings,
      totalDurationSeconds: totalDurationSec,
    },
    estimates: {
      assumedValuePerBookingUsd: estimatedTicketUsd,
      assumedFrontDeskHourlyWageUsd: estimatedHourlyWageUsd,
      estimatedBookingRevenueUsd: estimatedRevenueNum,
      estimatedLaborSavedUsd: estimatedLaborSavedDollars,
    },
    metrics,
    hourlyVolumes,
    intentDistribution,
  });
}
