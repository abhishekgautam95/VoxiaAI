import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import { z } from "zod";

const TIERS = [
  {
    id: "STARTER",
    name: "Clinic Starter",
    priceMonthly: 199,
    includedMinutes: 400,
    includedNumbers: 1,
    description: "Ideal for solo practitioners and boutique clinics.",
    features: [
      "1 Dedicated Carrier Line",
      "400 Minutes Monthly Answering",
      "Google Calendar 2-Way Sync",
      "Standard Voice Synthesis",
      "Email & Webhook Alerts",
    ],
  },
  {
    id: "PRO",
    name: "Practice Pro",
    priceMonthly: 499,
    includedMinutes: 1000,
    includedNumbers: 3,
    description: "The complete autonomous front desk for busy healthcare practices.",
    features: [
      "3 Dedicated Carrier Lines",
      "1,000 Minutes Monthly Answering",
      "RAG Clinic Knowledge Base (Unlimited FAQs)",
      "Conflict-Free Multi-Doctor Scheduling",
      "ElevenLabs Turbo v2.5 Voice Synthesis",
      "Instant Post-Call SMS Confirmations",
      "HIPAA Compliance Audit Trail",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Multi-Location Enterprise",
    priceMonthly: 999,
    includedMinutes: 3000,
    includedNumbers: 10,
    description: "High-volume call center and hospital group voice orchestration.",
    features: [
      "10 Dedicated Toll-Free & Local Lines",
      "3,000 Minutes Monthly Answering",
      "Custom Voice Cloning & Localization",
      "Custom EHR/EMR Integration",
      "Signed HIPAA BAA Agreement",
      "Dedicated 24/7 Priority Telecom SLA",
    ],
  },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  let subscription = await db.subscription.findUnique({
    where: { organizationId: session.organizationId },
  });

  if (!subscription) {
    subscription = await db.subscription.create({
      data: {
        organizationId: session.organizationId,
        tier: SubscriptionTier.PRO,
        status: SubscriptionStatus.ACTIVE,
        includedMinutes: 1000,
        usedMinutes: 342,
        includedNumbers: 3,
        extraMinuteRate: 0.15,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  const [invoices, phoneCount, callDurationSum] = await Promise.all([
    db.invoice.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.phoneNumber.count({
      where: { organizationId: session.organizationId },
    }),
    db.callRecord.aggregate({
      where: { organizationId: session.organizationId },
      _sum: { durationSeconds: true },
    }),
  ]);

  const realMinutesFromDb = Math.round((callDurationSum._sum.durationSeconds || 0) / 60);
  const totalUsedMinutes = Math.max(subscription.usedMinutes, realMinutesFromDb);

  const percentMinutesUsed = Math.min(
    Math.round((totalUsedMinutes / subscription.includedMinutes) * 100),
    100
  );

  return Response.json({
    subscription,
    invoices,
    usage: {
      usedMinutes: totalUsedMinutes,
      includedMinutes: subscription.includedMinutes,
      percentMinutesUsed,
      activeNumbers: phoneCount,
      includedNumbers: subscription.includedNumbers,
      extraMinuteRate: subscription.extraMinuteRate,
    },
    tiers: TIERS,
  });
}

const upgradeSchema = z.object({
  tier: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof upgradeSchema>;
  try {
    body = upgradeSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid tier payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  const targetTierConfig = TIERS.find((t) => t.id === body.tier);
  if (!targetTierConfig) {
    return Response.json({ error: "Selected tier not found" }, { status: 400 });
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const updatedSub = await db.subscription.upsert({
    where: { organizationId: session.organizationId },
    create: {
      organizationId: session.organizationId,
      tier: body.tier as SubscriptionTier,
      status: SubscriptionStatus.ACTIVE,
      includedMinutes: targetTierConfig.includedMinutes,
      includedNumbers: targetTierConfig.includedNumbers,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
    update: {
      tier: body.tier as SubscriptionTier,
      includedMinutes: targetTierConfig.includedMinutes,
      includedNumbers: targetTierConfig.includedNumbers,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const createdInvoice = await db.invoice.create({
    data: {
      organizationId: session.organizationId,
      invoiceNumber,
      amountDueCents: targetTierConfig.priceMonthly * 100,
      amountPaidCents: targetTierConfig.priceMonthly * 100,
      status: "PAID",
      periodStart,
      periodEnd,
      pdfUrl: `/invoices/${invoiceNumber}.pdf`,
    },
  });

  recordAuditLog({
    organizationId: session.organizationId,
    actorUserId: session.userId,
    action: "SUBSCRIPTION_UPDATED",
    entityType: "Subscription",
    entityId: updatedSub.id,
    metadata: {
      newTier: body.tier,
      priceMonthly: targetTierConfig.priceMonthly,
      includedMinutes: targetTierConfig.includedMinutes,
      invoiceNumber,
    },
  }).catch(() => {});

  return Response.json({
    subscription: updatedSub,
    invoice: createdInvoice,
    message: `Successfully upgraded to ${targetTierConfig.name}! All new minutes and lines are active.`,
  });
}
