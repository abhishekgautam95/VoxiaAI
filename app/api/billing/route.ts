import { getSession, canManageTeamAndSettings } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { TIER_CATALOG, stripeRequest } from "@/lib/stripe";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import { z } from "zod";

const updateTierSchema = z.object({
  tier: z.enum(["STARTER", "PRO", "ENTERPRISE"]).optional(),
  action: z.enum(["CHECKOUT", "PORTAL"]).default("CHECKOUT"),
});

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

  const actualCallMinutes = Math.ceil(
    (callDurationSum._sum.durationSeconds || 0) / 60
  );
  const usedMinutes = Math.max(subscription.usedMinutes, actualCallMinutes);

  const percentMinutesUsed = Math.min(
    100,
    Math.round((usedMinutes / Math.max(1, subscription.includedMinutes)) * 100)
  );

  return Response.json({
    subscription: {
      ...subscription,
      usedMinutes,
      activeNumbers: phoneCount,
    },
    usage: {
      usedMinutes,
      includedMinutes: subscription.includedMinutes,
      percentMinutesUsed,
      activeNumbers: phoneCount,
      includedNumbers: subscription.includedNumbers,
      extraMinuteRate: subscription.extraMinuteRate,
    },
    invoices,
    tiers: Object.values(TIER_CATALOG),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageTeamAndSettings(session.role)) {
    return Response.json(
      { error: "Forbidden: Only practice Owners or Admins can modify billing plans." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof updateTierSchema>;
  try {
    body = updateTierSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid tier payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  const targetTierKey = (body.tier || "PRO") as SubscriptionTier;
  const targetTierConfig = TIER_CATALOG[targetTierKey];
  if (!targetTierConfig) {
    return Response.json({ error: "Selected tier not found" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Live Stripe Checkout / Customer Portal flow when STRIPE_SECRET_KEY is configured
  if (process.env.STRIPE_SECRET_KEY) {
    const org = await db.organization.findUnique({
      where: { id: session.organizationId },
      include: { subscription: true },
    });

    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 });
    }

    let stripeCustomerId = org.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripeRequest<{ id: string }>("/customers", {
        email: session.user.email,
        name: org.name,
        "metadata[organizationId]": org.id,
        "metadata[organizationSlug]": org.slug,
      });
      stripeCustomerId = customer.id;

      await db.subscription.upsert({
        where: { organizationId: org.id },
        create: {
          organizationId: org.id,
          stripeCustomerId,
          tier: SubscriptionTier.PRO,
          status: SubscriptionStatus.TRIALING,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 86400 * 1000),
        },
        update: { stripeCustomerId },
      });
    }

    if (body.action === "PORTAL") {
      const portalSession = await stripeRequest<{ url: string }>("/billing_portal/sessions", {
        customer: stripeCustomerId,
        return_url: `${appUrl}/dashboard/settings?tab=billing`,
      });
      return Response.json({ checkoutUrl: portalSession.url });
    }

    const checkoutSession = await stripeRequest<{ id: string; url: string }>(
      "/checkout/sessions",
      {
        customer: stripeCustomerId,
        mode: "subscription",
        billing_address_collection: "required",
        "line_items[0][price]": targetTierConfig.stripePriceId,
        "line_items[0][quantity]": "1",
        "metadata[organizationId]": org.id,
        "metadata[tier]": targetTierConfig.id,
        "metadata[actorUserId]": session.userId,
        "subscription_data[metadata][organizationId]": org.id,
        "subscription_data[metadata][tier]": targetTierConfig.id,
        success_url: `${appUrl}/dashboard/settings?tab=billing&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/settings?tab=billing&checkout=canceled`,
      }
    );

    return Response.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      message: `Redirecting to Stripe Checkout for ${targetTierConfig.name}...`,
    });
  }

  // Sandbox / Local Dev Fallback when STRIPE_SECRET_KEY is not set
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const updatedSub = await db.subscription.upsert({
    where: { organizationId: session.organizationId },
    create: {
      organizationId: session.organizationId,
      tier: targetTierConfig.id,
      status: SubscriptionStatus.ACTIVE,
      includedMinutes: targetTierConfig.includedMinutes,
      includedNumbers: targetTierConfig.includedNumbers,
      extraMinuteRate: targetTierConfig.extraMinuteRate,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
    update: {
      tier: targetTierConfig.id,
      includedMinutes: targetTierConfig.includedMinutes,
      includedNumbers: targetTierConfig.includedNumbers,
      extraMinuteRate: targetTierConfig.extraMinuteRate,
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
      newTier: targetTierConfig.id,
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
