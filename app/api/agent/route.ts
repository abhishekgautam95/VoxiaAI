import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

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

  const updatedAgent = await db.agentConfig.upsert({
    where: { organizationId: session.organizationId },
    update: {
      ...body,
      deployedAt: new Date(),
    },
    create: {
      organizationId: session.organizationId,
      ...body,
      deployedAt: new Date(),
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
