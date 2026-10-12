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

  const user = await prisma.user.findFirst({
    where: { email: "demo.owner@voxia.local" },
  });

  const now = new Date();

  const auditEvents = [
    {
      action: "AUTHENTICATED",
      entityType: "session",
      entityId: "sess_demo_init_01",
      metadata: { ip: "192.168.1.104", userAgent: "Mozilla/5.0 (X11; Linux x86_64)", method: "Password + Multi-factor" },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48), // 2 days ago
    },
    {
      action: "INTEGRATION_UPDATED",
      entityType: "IntegrationConfig",
      entityId: "int_twilio_01",
      metadata: { provider: "TWILIO", trunk: "SIP Trunk US-East", phoneNumbers: ["+1 (415) 800-4291"] },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 44),
    },
    {
      action: "PHONE_PROVISIONED",
      entityType: "PhoneNumber",
      entityId: "+1 (415) 800-4291",
      metadata: { carrier: "Twilio", city: "San Francisco, CA", assignedAgent: "Sarah (AI Receptionist)" },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 40),
    },
    {
      action: "AGENT_CONFIG_UPDATED",
      entityType: "AgentConfig",
      entityId: "cfg_sarah_01",
      metadata: {
        voiceId: "21m00Tcm4TlvDq8ikWAM",
        voiceName: "Rachel (Warm & Natural)",
        latencyMode: "ultra_low",
        businessType: "Dental Clinic",
        officeHours: "Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM",
      },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 36),
    },
    {
      action: "KNOWLEDGE_BASE_UPDATED",
      entityType: "KnowledgeDocument",
      entityId: "kb_doc_ins_01",
      metadata: {
        action: "INDEXED",
        title: "Dental Insurance & Delta Dental PPO Network Coverage",
        category: "Insurance",
        chunksCount: 4,
      },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
    },
    {
      action: "KNOWLEDGE_BASE_UPDATED",
      entityType: "KnowledgeDocument",
      entityId: "kb_doc_pkg_02",
      metadata: {
        action: "INDEXED",
        title: "Complimentary Patient Parking & Clinic Directions",
        category: "Directions",
        chunksCount: 2,
      },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 20),
    },
    {
      action: "APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: "apt_marcus_brody",
      metadata: {
        customer: "Marcus Brody",
        service: "Routine Dental Cleaning & Exam",
        date: "2026-10-14",
        time: "10:30 AM",
        provider: "Dr. Sarah Smith",
        bookedBy: "AI Telephony Carrier",
      },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 14),
    },
    {
      action: "APPOINTMENT_RESCHEDULED",
      entityType: "Appointment",
      entityId: "apt_marcus_brody",
      metadata: {
        previousDate: "2026-10-13",
        previousTime: "09:00 AM",
        newDate: "2026-10-14",
        newTime: "10:30 AM",
        reason: "Patient requested morning shift to accommodate work commute",
      },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
    },
    {
      action: "APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: "apt_eleanor_vance",
      metadata: {
        customer: "Eleanor Vance",
        service: "Emergency Toothache Exam",
        date: "2026-10-14",
        time: "02:00 PM",
        provider: "Dr. Sarah Smith",
        bookedBy: "AI Receptionist (Sarah)",
      },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 8),
    },
    {
      action: "INTEGRATION_UPDATED",
      entityType: "IntegrationConfig",
      entityId: "int_elevenlabs_01",
      metadata: {
        provider: "ELEVENLABS",
        model: "eleven_turbo_v2_5",
        status: "Verified & Streamable",
      },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4),
    },
    {
      action: "AUTHENTICATED",
      entityType: "session",
      entityId: "sess_demo_today",
      metadata: { ip: "127.0.0.1", userAgent: "Chrome 130.0 / Linux", method: "Session Token Verified" },
      createdAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 mins ago
    },
  ];

  for (const item of auditEvents) {
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        actorUserId: user ? user.id : null,
        action: item.action,
        entityType: item.entityType,
        entityId: item.entityId,
        metadata: item.metadata,
        createdAt: item.createdAt,
      },
    });
  }

  const count = await prisma.auditLog.count({ where: { organizationId: org.id } });
  console.log(`Seeded audit events successfully! Total audit logs for ${org.slug}: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
