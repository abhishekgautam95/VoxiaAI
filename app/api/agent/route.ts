import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const agentConfigSchema = z.object({
  displayName: z.string().trim().min(1).max(120),
  businessName: z.string().trim().min(1).max(120),
  businessType: z.string().trim().min(1).max(80),
  businessAddress: z.string().trim().min(1).max(250),
  officeHours: z.string().trim().min(1).max(200),
  phoneNumber: z.string().trim().min(1).max(40),
  systemPrompt: z.string().max(10000),
  voiceId: z.string().nullable().optional(),
  voiceName: z.string().nullable().optional(),
  primaryLanguage: z.string().default("en-US"),
  latencyMode: z.string().default("ultra_low"),
  tone: z.string().default("warm"),
  interruptible: z.boolean().default(true),
  configuration: z.record(z.string(), z.any()).optional().default({}),
  // Optional direct configuration fields for convenience
  voiceStability: z.number().optional(),
  clarityBoost: z.number().optional(),
  speakingRate: z.number().optional(),
  ambientNoise: z.string().optional(),
  transferKeywords: z.string().optional(),
  greetingMessage: z.string().optional(),
  selectedTemplateId: z.string().optional(),
  verbosity: z.string().optional(),
  calendarBookingEnabled: z.boolean().optional(),
  faqKnowledgeEnabled: z.boolean().optional(),
  callRecordingEnabled: z.boolean().optional(),
  smsFollowUpEnabled: z.boolean().optional(),
  isLive: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let agent = await db.agentConfig.findUnique({
    where: { organizationId: session.organizationId },
  });

  if (!agent) {
    agent = await db.agentConfig.create({
      data: {
        organizationId: session.organizationId,
        businessName: session.organization.name,
      },
    });
  }

  return Response.json({ agent });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof agentConfigSchema>;
  try {
    body = agentConfigSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid agent config payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  // Fetch existing agent to preserve existing configuration keys if needed
  const existingAgent = await db.agentConfig.findUnique({
    where: { organizationId: session.organizationId },
  });
  const existingConfig =
    existingAgent?.configuration && typeof existingAgent.configuration === "object"
      ? (existingAgent.configuration as Record<string, unknown>)
      : {};

  const mergedConfig: Record<string, unknown> = {
    ...existingConfig,
    ...(body.configuration || {}),
    ...(body.voiceStability !== undefined ? { voiceStability: body.voiceStability } : {}),
    ...(body.clarityBoost !== undefined ? { clarityBoost: body.clarityBoost } : {}),
    ...(body.speakingRate !== undefined ? { speakingRate: body.speakingRate } : {}),
    ...(body.ambientNoise !== undefined ? { ambientNoise: body.ambientNoise } : {}),
    ...(body.transferKeywords !== undefined ? { transferKeywords: body.transferKeywords } : {}),
    ...(body.greetingMessage !== undefined ? { greetingMessage: body.greetingMessage } : {}),
    ...(body.selectedTemplateId !== undefined ? { selectedTemplateId: body.selectedTemplateId } : {}),
    ...(body.verbosity !== undefined ? { verbosity: body.verbosity } : {}),
    ...(body.calendarBookingEnabled !== undefined ? { calendarBookingEnabled: body.calendarBookingEnabled } : {}),
    ...(body.faqKnowledgeEnabled !== undefined ? { faqKnowledgeEnabled: body.faqKnowledgeEnabled } : {}),
    ...(body.callRecordingEnabled !== undefined ? { callRecordingEnabled: body.callRecordingEnabled } : {}),
    ...(body.smsFollowUpEnabled !== undefined ? { smsFollowUpEnabled: body.smsFollowUpEnabled } : {}),
    ...(body.isLive !== undefined ? { isLive: body.isLive } : {}),
    ...(body.isActive !== undefined ? { isLive: body.isActive } : {}),
  };

  const coreFields = {
    displayName: body.displayName,
    businessName: body.businessName,
    businessType: body.businessType,
    businessAddress: body.businessAddress,
    officeHours: body.officeHours,
    phoneNumber: body.phoneNumber,
    systemPrompt: body.systemPrompt,
    voiceId: body.voiceId,
    voiceName: body.voiceName,
    primaryLanguage: body.primaryLanguage,
    latencyMode: body.latencyMode,
    tone: body.tone,
    interruptible: body.interruptible,
    configuration: mergedConfig as Prisma.InputJsonValue,
    deployedAt: new Date(),
  };

  const updatedAgent = await db.agentConfig.upsert({
    where: { organizationId: session.organizationId },
    update: coreFields,
    create: {
      organizationId: session.organizationId,
      ...coreFields,
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: session.organizationId,
      actorUserId: session.userId,
      action: "AGENT_CONFIG_UPDATED",
      entityType: "AgentConfig",
      entityId: updatedAgent.id,
      metadata: {
        voiceId: updatedAgent.voiceId,
        latencyMode: updatedAgent.latencyMode,
        businessType: updatedAgent.businessType,
      },
    },
  });

  return Response.json({ agent: updatedAgent, message: "Agent successfully deployed and saved!" });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const existingAgent = await db.agentConfig.findUnique({
    where: { organizationId: session.organizationId },
  });

  const existingConfig =
    existingAgent?.configuration && typeof existingAgent.configuration === "object"
      ? (existingAgent.configuration as Record<string, unknown>)
      : {};

  const liveState =
    typeof body.isLive === "boolean"
      ? body.isLive
      : typeof body.isActive === "boolean"
      ? body.isActive
      : existingConfig.isLive ?? true;

  const mergedConfig: Record<string, unknown> = {
    ...existingConfig,
    isLive: liveState,
    isActive: liveState,
  };

  const updatedAgent = await db.agentConfig.upsert({
    where: { organizationId: session.organizationId },
    update: {
      configuration: mergedConfig as Prisma.InputJsonValue,
    },
    create: {
      organizationId: session.organizationId,
      configuration: mergedConfig as Prisma.InputJsonValue,
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: session.organizationId,
      actorUserId: session.userId,
      action: "AGENT_CONFIG_UPDATED",
      entityType: "AgentConfig",
      entityId: updatedAgent.id,
      metadata: {
        isLive: liveState,
        action: liveState ? "AGENT_ACTIVATED" : "AGENT_DEACTIVATED",
      },
    },
  });

  return Response.json({
    agent: updatedAgent,
    isLive: liveState,
    message: liveState ? "Agent is now live and answering calls." : "Agent is currently offline.",
  });
}
