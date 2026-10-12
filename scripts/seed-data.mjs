import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const mockCallsData = [
  {
    callId: "CALL-9021",
    callerNumber: "+1 (415) 329-8812",
    callerName: "Eleanor Vance",
    durationSeconds: 134,
    durationFormatted: "2m 14s",
    status: "APPOINTMENT_BOOKED",
    aiSummary: "Caller requested a routine dental cleaning appointment. AI receptionist checked availability, confirmed insurance coverage (Delta Dental PPO), and booked Tuesday Oct 14 at 10:30 AM with Dr. Smith.",
    keyTakeaways: [
      "Appointment booked: Tue Oct 14, 10:30 AM with Dr. Smith",
      "Insurance verified: Delta Dental PPO — in-network",
      "Patient prefers morning slots for future bookings"
    ],
    sentiment: "Positive",
    audioDurationSec: 134,
    transcripts: [
      { role: "AI", text: "Good morning! Thank you for calling Apex Health & Dental. This is Sarah, your AI receptionist. How can I help you today?", timestamp: "0:00" },
      { role: "USER", text: "Hi, I'd like to book a dental cleaning appointment please.", timestamp: "0:05" },
      { role: "AI", text: "I'd be happy to help you schedule a cleaning! May I have your name and the best phone number to reach you?", timestamp: "0:09" },
      { role: "USER", text: "Sure, it's Eleanor Vance, and this number is fine.", timestamp: "0:14" },
      { role: "AI", text: "Thank you, Eleanor! Do you have a preferred day and time? I have availability next Tuesday morning at 10:30 AM with Dr. Smith.", timestamp: "0:18" },
      { role: "USER", text: "Tuesday at 10:30 works perfectly!", timestamp: "0:28" },
      { role: "AI", text: "Wonderful! Before I confirm, could you let me know your insurance provider?", timestamp: "0:32" },
      { role: "USER", text: "I have Delta Dental PPO.", timestamp: "0:37" },
      { role: "AI", text: "Great news — Delta Dental PPO is in our network! I've booked your cleaning for Tuesday, October 14th at 10:30 AM with Dr. Smith. You'll receive a confirmation text shortly.", timestamp: "0:40" },
      { role: "USER", text: "No, that's all. Thank you so much!", timestamp: "0:55" },
      { role: "AI", text: "You're welcome, Eleanor! Have a wonderful day. Goodbye!", timestamp: "0:59" }
    ]
  },
  {
    callId: "CALL-9020",
    callerNumber: "+1 (510) 902-1144",
    callerName: "Marcus Sterling",
    durationSeconds: 105,
    durationFormatted: "1m 45s",
    status: "COMPLETED",
    aiSummary: "Caller inquired about insurance network compatibility. AI receptionist confirmed Delta Dental PPO is accepted and provided office hours and website link for further details.",
    keyTakeaways: [
      "Inquiry resolved: Delta Dental PPO accepted",
      "Provided office hours: Mon–Fri 8 AM – 6 PM",
      "No follow-up action required"
    ],
    sentiment: "Neutral",
    audioDurationSec: 105,
    transcripts: [
      { role: "AI", text: "Good morning! Apex Health & Dental, Sarah speaking. How may I assist you?", timestamp: "0:00" },
      { role: "USER", text: "Hi, I just want to check if you take Delta Dental PPO before I schedule anything.", timestamp: "0:04" },
      { role: "AI", text: "Yes, we certainly do! Delta Dental PPO is fully in-network here at Apex Health. We also accept Cigna, MetLife, and Aetna.", timestamp: "0:09" },
      { role: "USER", text: "Awesome. What are your opening hours on weekdays?", timestamp: "0:16" },
      { role: "AI", text: "We are open Monday through Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM.", timestamp: "0:20" },
      { role: "USER", text: "Great, thanks for the info. I'll check my schedule and call back.", timestamp: "0:28" },
      { role: "AI", text: "Anytime! You can also book 24/7 on our website at apexhealth.io. Have a wonderful day!", timestamp: "0:32" }
    ]
  },
  {
    callId: "CALL-9019",
    callerNumber: "+1 (650) 419-7703",
    callerName: "Unknown Caller",
    durationSeconds: 18,
    durationFormatted: "0m 18s",
    status: "MISSED",
    aiSummary: "Caller disconnected after initial greeting before stating inquiry. Sent automatic follow-up SMS with booking link.",
    keyTakeaways: [
      "Call abandoned after 18 seconds",
      "Automated callback SMS dispatched",
      "Flagged for receptionist queue review"
    ],
    sentiment: "Neutral",
    audioDurationSec: 18,
    transcripts: [
      { role: "AI", text: "Thank you for calling Apex Health & Dental. This is Sarah, how may I help you today?", timestamp: "0:00" },
      { role: "USER", text: "[Caller hung up]", timestamp: "0:08" }
    ]
  },
  {
    callId: "CALL-9018",
    callerNumber: "+1 (415) 778-3319",
    callerName: "David Zhao",
    durationSeconds: 192,
    durationFormatted: "3m 12s",
    status: "APPOINTMENT_BOOKED",
    aiSummary: "Patient requested urgent appointment for toothache. AI receptionist identified high urgency, checked same-day cancellations, and booked emergency exam for 2:30 PM with Dr. Patel.",
    keyTakeaways: [
      "Emergency appointment booked: Today at 2:30 PM with Dr. Patel",
      "Symptom: Lower right molar pain, started 2 days ago",
      "Advised: Avoid extreme hot/cold beverages until visit"
    ],
    sentiment: "Relieved",
    audioDurationSec: 192,
    transcripts: [
      { role: "AI", text: "Apex Health & Dental, Sarah speaking. How can I help you today?", timestamp: "0:00" },
      { role: "USER", text: "Hi, I have a really bad toothache on my lower right side. Do you have anything available today?", timestamp: "0:04" },
      { role: "AI", text: "I'm so sorry to hear you're in pain. We keep emergency slots reserved daily. Let me check immediately for today.", timestamp: "0:11" },
      { role: "AI", text: "I have an emergency exam slot today at 2:30 PM with Dr. Patel. May I have your name to secure this for you?", timestamp: "0:17" },
      { role: "USER", text: "Yes please, David Zhao.", timestamp: "0:24" },
      { role: "AI", text: "You're booked for 2:30 PM today, David. Please arrive 10 minutes early so we can take an X-ray right away.", timestamp: "0:28" }
    ]
  }
];

const mockAppointmentsData = [
  {
    customerName: "Eleanor Vance",
    phoneNumber: "+1 (415) 329-8812",
    email: "eleanor.vance@gmail.com",
    service: "Routine Cleaning & Hygiene Exam",
    provider: "Dr. Sarah Smith",
    date: "2026-10-14",
    time: "10:30 AM",
    status: "CONFIRMED",
    notes: "New patient. Delta Dental PPO verified.",
    bookedBy: "AI Receptionist (CALL-9021)"
  },
  {
    customerName: "David Zhao",
    phoneNumber: "+1 (415) 778-3319",
    email: "david.zhao@outlook.com",
    service: "Emergency Toothache Exam & X-Ray",
    provider: "Dr. Raj Patel",
    date: "2026-10-13",
    time: "2:30 PM",
    status: "CONFIRMED",
    notes: "Urgent lower right molar sensitivity.",
    bookedBy: "AI Receptionist (CALL-9018)"
  },
  {
    customerName: "Samantha Miller",
    phoneNumber: "+1 (415) 882-9901",
    email: "smiller@techcorp.io",
    service: "Teeth Whitening Consultation",
    provider: "Dr. Sarah Smith",
    date: "2026-10-15",
    time: "11:00 AM",
    status: "CONFIRMED",
    notes: "Inquired about Zoom in-office whitening procedure.",
    bookedBy: "AI Receptionist"
  },
  {
    customerName: "Carlos Mendez",
    phoneNumber: "+1 (650) 412-8874",
    email: "carlos.m@bayarea.net",
    service: "Crown Placement (Second Visit)",
    provider: "Dr. Raj Patel",
    date: "2026-10-12",
    time: "9:00 AM",
    status: "COMPLETED",
    notes: "Permanent porcelain crown seated successfully.",
    bookedBy: "Front Desk Staff"
  },
  {
    customerName: "Emily Jenkins",
    phoneNumber: "+1 (510) 663-1288",
    email: "emily.j@berkeley.edu",
    service: "Pediatric Dental Checkup",
    provider: "Dr. Sarah Smith",
    date: "2026-10-11",
    time: "3:30 PM",
    status: "COMPLETED",
    notes: "Checkup for two children (ages 6 and 8). Fluoride treatment completed.",
    bookedBy: "AI Receptionist"
  },
  {
    customerName: "Robert Kowalski",
    phoneNumber: "+1 (415) 551-9032",
    email: "robert.k@gmail.com",
    service: "Invisalign Progress Scan",
    provider: "Dr. Raj Patel",
    date: "2026-10-09",
    time: "1:15 PM",
    status: "CANCELLED",
    notes: "Patient caught flu; requested reschedule to late October.",
    bookedBy: "AI Receptionist"
  }
];

async function main() {
  console.log("🌱 Starting full database seed for VoxiaAI...");

  const orgSlug = process.env.ORGANIZATION_SLUG || "apex-health-dental";
  const orgName = process.env.ORGANIZATION_NAME || "Apex Health & Dental";
  const adminEmail = (process.env.ADMIN_EMAIL || "demo.owner@voxia.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "VoxiaDemo!2026";
  const adminName = process.env.ADMIN_NAME || "Demo Owner";

  // 1. Organization
  const org = await db.organization.upsert({
    where: { slug: orgSlug },
    update: { name: orgName, timezone: "America/Los_Angeles" },
    create: {
      name: orgName,
      slug: orgSlug,
      timezone: "America/Los_Angeles"
    }
  });
  console.log(`✅ Organization: ${org.name} (${org.id})`);

  // 2. User
  const passwordHash = await hash(adminPassword, 12);
  const user = await db.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash
    }
  });
  console.log(`✅ User: ${user.email} (${user.id})`);

  // 3. Membership
  await db.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id
      }
    },
    update: { role: "OWNER" },
    create: {
      organizationId: org.id,
      userId: user.id,
      role: "OWNER"
    }
  });

  // 4. AgentConfig
  const systemPrompt = `You are Sarah, an expert, professional, warm, and highly capable AI Receptionist for Apex Health & Dental located in San Francisco, CA.
Your primary objectives are:
1. Greet callers warmly, stating the clinic name clearly.
2. Coordinate appointment bookings for dental cleanings, exams, toothaches, whitening, and Invisalign.
3. Check patient returning status and verify insurance (Delta Dental PPO, MetLife, Cigna, Guardian are in-network).
4. Answer questions about office hours (Mon-Fri 8am-6pm, Sat 9am-2pm) and location (742 Evergreen Terrace, Suite 200, SF).
5. For emergencies, offer same-day priority triage with Dr. Patel.
Speak concisely, naturally, with friendly empathy. Always confirm key appointment details before concluding.`;

  await db.agentConfig.upsert({
    where: { organizationId: org.id },
    update: {
      displayName: "Sarah (AI Receptionist)",
      businessName: org.name,
      businessType: "Dental Clinic",
      businessAddress: "742 Evergreen Terrace, Suite 200, San Francisco, CA",
      officeHours: "Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM",
      phoneNumber: "+1 (415) 800-4291",
      systemPrompt,
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      voiceName: "Rachel (Warm & Natural)",
      primaryLanguage: "en-US",
      latencyMode: "ultra_low",
      tone: "warm",
      interruptible: true,
      deployedAt: new Date()
    },
    create: {
      organizationId: org.id,
      displayName: "Sarah (AI Receptionist)",
      businessName: org.name,
      businessType: "Dental Clinic",
      businessAddress: "742 Evergreen Terrace, Suite 200, San Francisco, CA",
      officeHours: "Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM",
      phoneNumber: "+1 (415) 800-4291",
      systemPrompt,
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      voiceName: "Rachel (Warm & Natural)",
      primaryLanguage: "en-US",
      latencyMode: "ultra_low",
      tone: "warm",
      interruptible: true,
      deployedAt: new Date()
    }
  });
  console.log(`✅ AgentConfig deployed.`);

  // 5. Phone Number
  await db.phoneNumber.upsert({
    where: {
      organizationId_number: {
        organizationId: org.id,
        number: "+1 (415) 800-4291"
      }
    },
    update: { status: "ACTIVE" },
    create: {
      organizationId: org.id,
      number: "+1 (415) 800-4291",
      label: "Main Reception Desk",
      cityState: "San Francisco, CA",
      assignedAgent: "Sarah (AI Receptionist)",
      status: "ACTIVE",
      provider: "Twilio"
    }
  });
  console.log(`✅ Phone Number configured.`);

  // 6. Integrations
  await db.integrationConfig.upsert({
    where: {
      organizationId_provider: {
        organizationId: org.id,
        provider: "TWILIO"
      }
    },
    update: { enabled: true },
    create: {
      organizationId: org.id,
      provider: "TWILIO",
      enabled: true,
      config: { status: "connected", trunkSid: "TK993a4012bc" }
    }
  });

  await db.integrationConfig.upsert({
    where: {
      organizationId_provider: {
        organizationId: org.id,
        provider: "GOOGLE_CALENDAR"
      }
    },
    update: { enabled: true },
    create: {
      organizationId: org.id,
      provider: "GOOGLE_CALENDAR",
      enabled: true,
      config: { calendarId: "primary", conflictAvoidance: true }
    }
  });
  console.log(`✅ Integrations configured.`);

  // 7. Seed Calls & Transcripts
  for (const callData of mockCallsData) {
    const { transcripts, ...recordData } = callData;
    const callRecord = await db.callRecord.upsert({
      where: { callId: recordData.callId },
      update: {
        ...recordData,
        organizationId: org.id
      },
      create: {
        ...recordData,
        organizationId: org.id
      }
    });

    // Delete existing transcripts for clean seed
    await db.callTranscript.deleteMany({
      where: { callRecordId: callRecord.id }
    });

    let seq = 0;
    for (const t of transcripts) {
      await db.callTranscript.create({
        data: {
          callRecordId: callRecord.id,
          role: t.role,
          text: t.text,
          timestamp: t.timestamp,
          sequence: seq++
        }
      });
    }
  }
  console.log(`✅ ${mockCallsData.length} Call Records & transcripts seeded.`);

  // 8. Seed Appointments
  for (const apt of mockAppointmentsData) {
    await db.appointment.create({
      data: {
        organizationId: org.id,
        ...apt
      }
    });
  }
  console.log(`✅ ${mockAppointmentsData.length} Appointments seeded.`);

  // 9. Audit Logs
  await db.auditLog.create({
    data: {
      organizationId: org.id,
      actorUserId: user.id,
      action: "AUTHENTICATED",
      entityType: "system",
      metadata: { note: "Initial workspace seed completed successfully" }
    }
  });

  console.log("🎉 Database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
