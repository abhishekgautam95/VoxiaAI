import { headers } from "next/headers";
import {
  verifyStripeWebhookSignature,
  TIER_CATALOG,
  resolveTierFromPriceId,
  mapStripeSubscriptionStatus,
} from "@/lib/stripe";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";

export const runtime = "nodejs";

interface StripeWebhookObject {
  id?: string;
  customer?: string;
  subscription?: string;
  status?: string;
  number?: string;
  amount_due?: number;
  amount_paid?: number;
  period_start?: number;
  period_end?: number;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  metadata?: Record<string, string | undefined>;
  items?: {
    data?: Array<{
      price?: { id?: string };
    }>;
  };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  const verification = verifyStripeWebhookSignature(rawBody, signature, webhookSecret);
  if (!verification.valid) {
    return Response.json({ error: verification.reason }, { status: 400 });
  }

  let event: {
    id: string;
    type: string;
    data: { object: StripeWebhookObject };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON webhook payload" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sessionObj = event.data.object;
        const organizationId = sessionObj.metadata?.organizationId;
        const actorUserId = sessionObj.metadata?.actorUserId;
        const requestedTier =
          (sessionObj.metadata?.tier as SubscriptionTier) || SubscriptionTier.PRO;
        const tierSpec = TIER_CATALOG[requestedTier] || TIER_CATALOG.PRO;

        if (organizationId) {
          const now = new Date();
          const periodEnd = new Date(now.getTime() + 30 * 86400 * 1000);

          const updatedSub = await db.subscription.upsert({
            where: { organizationId },
            create: {
              organizationId,
              stripeCustomerId: sessionObj.customer || null,
              stripeSubscriptionId: sessionObj.subscription || null,
              tier: tierSpec.id,
              status: SubscriptionStatus.ACTIVE,
              includedMinutes: tierSpec.includedMinutes,
              usedMinutes: 0,
              includedNumbers: tierSpec.includedNumbers,
              extraMinuteRate: tierSpec.extraMinuteRate,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
            update: {
              stripeCustomerId: sessionObj.customer || undefined,
              stripeSubscriptionId: sessionObj.subscription || undefined,
              tier: tierSpec.id,
              status: SubscriptionStatus.ACTIVE,
              includedMinutes: tierSpec.includedMinutes,
              includedNumbers: tierSpec.includedNumbers,
              extraMinuteRate: tierSpec.extraMinuteRate,
            },
          });

          await recordAuditLog({
            organizationId,
            actorUserId,
            action: "SUBSCRIPTION_UPDATED",
            entityType: "Subscription",
            entityId: updatedSub.id,
            metadata: {
              event: "checkout.session.completed",
              tier: tierSpec.id,
              stripeSubscriptionId: sessionObj.subscription,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subObj = event.data.object;
        const priceId = subObj.items?.data?.[0]?.price?.id;
        const tierSpec = resolveTierFromPriceId(priceId);
        const mappedStatus = mapStripeSubscriptionStatus(subObj.status);

        const existingSub = await db.subscription.findFirst({
          where: {
            OR: [
              ...(subObj.id ? [{ stripeSubscriptionId: subObj.id }] : []),
              ...(subObj.customer ? [{ stripeCustomerId: subObj.customer }] : []),
              ...(subObj.metadata?.organizationId
                ? [{ organizationId: subObj.metadata.organizationId }]
                : []),
            ],
          },
        });

        if (existingSub) {
          await db.subscription.update({
            where: { id: existingSub.id },
            data: {
              stripeSubscriptionId: subObj.id || existingSub.stripeSubscriptionId,
              tier: tierSpec.id,
              status: mappedStatus,
              includedMinutes: tierSpec.includedMinutes,
              includedNumbers: tierSpec.includedNumbers,
              extraMinuteRate: tierSpec.extraMinuteRate,
              currentPeriodStart: subObj.current_period_start
                ? new Date(subObj.current_period_start * 1000)
                : existingSub.currentPeriodStart,
              currentPeriodEnd: subObj.current_period_end
                ? new Date(subObj.current_period_end * 1000)
                : existingSub.currentPeriodEnd,
              cancelAtPeriodEnd: Boolean(subObj.cancel_at_period_end),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subObj = event.data.object;
        const existingSub = await db.subscription.findFirst({
          where: {
            OR: [
              ...(subObj.id ? [{ stripeSubscriptionId: subObj.id }] : []),
              ...(subObj.customer ? [{ stripeCustomerId: subObj.customer }] : []),
            ],
          },
        });

        if (existingSub) {
          await db.subscription.update({
            where: { id: existingSub.id },
            data: {
              status: SubscriptionStatus.CANCELED,
              cancelAtPeriodEnd: false,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invObj = event.data.object;
        if (!invObj.customer) break;

        const existingSub = await db.subscription.findFirst({
          where: { stripeCustomerId: invObj.customer },
        });

        if (existingSub) {
          const invoiceNumber =
            invObj.number || `INV-${String(invObj.id || Date.now()).slice(-8).toUpperCase()}`;
          const periodStart = invObj.period_start
            ? new Date(invObj.period_start * 1000)
            : new Date();
          const periodEnd = invObj.period_end
            ? new Date(invObj.period_end * 1000)
            : new Date();

          const createdInvoice = await db.invoice.upsert({
            where: { invoiceNumber },
            create: {
              organizationId: existingSub.organizationId,
              invoiceNumber,
              amountDueCents: Number(invObj.amount_due || 0),
              amountPaidCents: Number(invObj.amount_paid || 0),
              status: "PAID",
              periodStart,
              periodEnd,
              pdfUrl: invObj.invoice_pdf || invObj.hosted_invoice_url || null,
            },
            update: {
              amountPaidCents: Number(invObj.amount_paid || 0),
              status: "PAID",
              pdfUrl: invObj.invoice_pdf || invObj.hosted_invoice_url || null,
            },
          });

          await db.subscription.update({
            where: { id: existingSub.id },
            data: { usedMinutes: 0, status: SubscriptionStatus.ACTIVE },
          });

          await recordAuditLog({
            organizationId: existingSub.organizationId,
            action: "INVOICE_GENERATED",
            entityType: "Invoice",
            entityId: createdInvoice.id,
            metadata: {
              invoiceNumber,
              amountPaidCents: createdInvoice.amountPaidCents,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invObj = event.data.object;
        if (invObj.customer) {
          await db.subscription.updateMany({
            where: { stripeCustomerId: invObj.customer },
            data: { status: SubscriptionStatus.PAST_DUE },
          });
        }
        break;
      }
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook processing failure";
    return Response.json({ error: msg }, { status: 500 });
  }
}
