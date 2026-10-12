import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: "apex-health-dental" },
  });

  if (!org) {
    console.error("Organization not found!");
    return;
  }

  const defaultDocs = [
    {
      title: "Dental Insurance & Delta Dental PPO Network Coverage",
      category: "Insurance",
      sourceType: "INSURANCE",
      content:
        "Apex Health & Dental is in-network with Delta Dental PPO, MetLife Dental, Cigna Dental, and Guardian. Patients with Delta Dental PPO receive 100% coverage for routine preventive cleanings, annual exams, and bitewing X-rays with $0 copay. Flexible FSA and HSA debit cards are also welcomed.",
    },
    {
      title: "Complimentary Patient Parking & Clinic Directions",
      category: "Directions",
      sourceType: "MANUAL",
      content:
        "Our clinic is located at 1200 Market Street, Suite 300, San Francisco. We provide a free dedicated patient parking lot directly behind the medical building, accessible via Pine Avenue. Look for the blue Apex Health banner. From Highway 101, take Exit 12B and proceed half a mile west.",
    },
    {
      title: "Same-Day Emergency Toothache & Urgent Care Protocol",
      category: "Clinical Policies",
      sourceType: "POLICY",
      content:
        "We maintain reserved emergency appointment slots every afternoon between 1:00 PM and 3:00 PM for severe toothaches, broken teeth, or acute dental trauma. For emergencies involving uncontrollable bleeding or severe facial swelling, callers should go to the nearest hospital ER.",
    },
    {
      title: "Cosmetic Teeth Whitening Packages & Pricing",
      category: "Pricing",
      sourceType: "FAQ",
      content:
        "We offer two whitening options: 1) In-Office Zoom Whitening ($450, takes 60 minutes, results last 12-18 months), and 2) Custom Take-Home Whitening Kit ($250, includes custom trays and professional bleaching gel).",
    },
    {
      title: "24-Hour Appointment Cancellation & Reschedule Terms",
      category: "Clinical Policies",
      sourceType: "POLICY",
      content:
        "Patients can reschedule or cancel visits with no fee up to 24 hours in advance by speaking with our AI receptionist or front desk staff. Late cancellations within 24 hours may incur a courtesy rebooking fee of $50.",
    },
  ];

  for (const doc of defaultDocs) {
    const existing = await prisma.knowledgeDocument.findFirst({
      where: {
        organizationId: org.id,
        title: doc.title,
      },
    });

    if (!existing) {
      await prisma.knowledgeDocument.create({
        data: {
          organizationId: org.id,
          title: doc.title,
          category: doc.category,
          sourceType: doc.sourceType,
          content: doc.content,
          enabled: true,
        },
      });
      console.log(`Created knowledge document: ${doc.title}`);
    } else {
      console.log(`Already exists: ${doc.title}`);
    }
  }

  console.log("Knowledge base seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
