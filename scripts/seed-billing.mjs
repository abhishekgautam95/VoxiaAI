import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: "apex-health-dental" },
  });

  if (!org) {
    console.error("Organization apex-health-dental not found!");
    return;
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // 1. Upsert Subscription
  const sub = await prisma.subscription.upsert({
    where: { organizationId: org.id },
    create: {
      organizationId: org.id,
      tier: "PRO",
      status: "ACTIVE",
      stripeCustomerId: "cus_vox_apex_9182",
      stripeSubscriptionId: "sub_vox_live_4491",
      includedMinutes: 1000,
      usedMinutes: 342,
      includedNumbers: 3,
      extraMinuteRate: 0.15,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
    update: {
      tier: "PRO",
      status: "ACTIVE",
      includedMinutes: 1000,
      usedMinutes: 342,
      includedNumbers: 3,
    },
  });

  // 2. Upsert Invoices
  const invoices = [
    {
      invoiceNumber: "INV-2026-1001",
      amountDueCents: 49900,
      amountPaidCents: 49900,
      status: "PAID",
      periodStart: new Date(2026, 9, 1),
      periodEnd: new Date(2026, 10, 1),
      pdfUrl: "/invoices/INV-2026-1001.pdf",
      createdAt: new Date(2026, 9, 1),
    },
    {
      invoiceNumber: "INV-2026-0901",
      amountDueCents: 52150,
      amountPaidCents: 52150,
      status: "PAID",
      periodStart: new Date(2026, 8, 1),
      periodEnd: new Date(2026, 9, 1),
      pdfUrl: "/invoices/INV-2026-0901.pdf",
      createdAt: new Date(2026, 8, 1),
    },
    {
      invoiceNumber: "INV-2026-0801",
      amountDueCents: 49900,
      amountPaidCents: 49900,
      status: "PAID",
      periodStart: new Date(2026, 7, 1),
      periodEnd: new Date(2026, 8, 1),
      pdfUrl: "/invoices/INV-2026-0801.pdf",
      createdAt: new Date(2026, 7, 1),
    },
  ];

  for (const inv of invoices) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: inv.invoiceNumber },
      create: {
        organizationId: org.id,
        invoiceNumber: inv.invoiceNumber,
        amountDueCents: inv.amountDueCents,
        amountPaidCents: inv.amountPaidCents,
        status: inv.status,
        periodStart: inv.periodStart,
        periodEnd: inv.periodEnd,
        pdfUrl: inv.pdfUrl,
        createdAt: inv.createdAt,
      },
      update: {
        amountDueCents: inv.amountDueCents,
        amountPaidCents: inv.amountPaidCents,
        status: inv.status,
      },
    });
  }

  console.log(`Seeded subscription and billing for ${org.slug}: Tier ${sub.tier}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
