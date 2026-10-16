import { getSession, canManageTeamAndSettings } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AuditAction, IntegrationProvider, Prisma } from "@prisma/client";
import { z } from "zod";

const settingsUpdateSchema = z.object({
  twilioSid: z.string().trim().max(120).optional(),
  twilioAuthToken: z.string().trim().max(200).optional(),
  fromNumber: z.string().trim().max(30).optional(),
  webhookUrl: z.string().trim().url("Webhook URL must be a valid URL").max(500).optional().or(z.literal("")),
  elevenLabsKey: z.string().trim().max(250).optional(),
});

function maskIdentifier(val: unknown): string | null {
  if (typeof val !== "string" || !val.trim()) return null;
  const trimmed = val.trim();
  if (trimmed.length <= 6) return "••••••";
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integrations = await db.integrationConfig.findMany({
    where: { organizationId: session.organizationId },
  });

  const twilio = integrations.find((i) => i.provider === IntegrationProvider.TWILIO);
  const elevenlabs = integrations.find((i) => i.provider === IntegrationProvider.ELEVENLABS);
  const googleCal = integrations.find((i) => i.provider === IntegrationProvider.GOOGLE_CALENDAR);
  const calCom = integrations.find((i) => i.provider === IntegrationProvider.CAL_COM);

  const twilioConfig = (twilio?.config || {}) as Record<string, unknown>;
  const elevenlabsConfig = (elevenlabs?.config || {}) as Record<string, unknown>;

  return Response.json({
    twilioSid: typeof twilioConfig.accountSid === "string" && twilioConfig.accountSid ? twilioConfig.accountSid : null,
    twilioSidMasked: maskIdentifier(twilioConfig.accountSid),
    twilioAuthTokenConfigured: Boolean(twilioConfig.authToken),
    fromNumber: typeof twilioConfig.fromNumber === "string" ? twilioConfig.fromNumber : null,
    webhookUrl: typeof twilioConfig.webhookUrl === "string" && twilioConfig.webhookUrl ? twilioConfig.webhookUrl : null,
    elevenLabsConfigured: Boolean(elevenlabsConfig.apiKey),
    googleCalendarConnected: Boolean(googleCal?.enabled),
    calComConnected: Boolean(calCom?.enabled),
  });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageTeamAndSettings(session.role)) {
    return Response.json(
      { error: "Forbidden: Only practice Owners or Admins can modify integration settings." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof settingsUpdateSchema>;
  try {
    body = settingsUpdateSchema.parse(await request.json());
  } catch (err: unknown) {
    const details = err instanceof z.ZodError ? err.flatten() : "Invalid settings payload";
    return Response.json({ error: "Validation failed", details }, { status: 400 });
  }

  try {
    // 1. Read existing Twilio integration config and merge fields without deleting existing secrets
    const existingTwilio = await db.integrationConfig.findUnique({
      where: {
        organizationId_provider: {
          organizationId: session.organizationId,
          provider: IntegrationProvider.TWILIO,
        },
      },
    });
    const prevTwilioConfig = (existingTwilio?.config || {}) as Record<string, unknown>;

    const mergedTwilioConfig: Record<string, unknown> = {
      ...prevTwilioConfig,
      ...(body.twilioSid !== undefined ? { accountSid: body.twilioSid } : {}),
      ...(body.webhookUrl !== undefined ? { webhookUrl: body.webhookUrl } : {}),
      ...(body.fromNumber !== undefined ? { fromNumber: body.fromNumber } : {}),
      ...(body.twilioAuthToken && !body.twilioAuthToken.includes("•")
        ? { authToken: body.twilioAuthToken }
        : {}),
    };

    await db.integrationConfig.upsert({
      where: {
        organizationId_provider: {
          organizationId: session.organizationId,
          provider: IntegrationProvider.TWILIO,
        },
      },
      create: {
        organizationId: session.organizationId,
        provider: IntegrationProvider.TWILIO,
        enabled: true,
        config: mergedTwilioConfig as Prisma.InputJsonValue,
      },
      update: {
        config: mergedTwilioConfig as Prisma.InputJsonValue,
      },
    });

    // 2. Merge ElevenLabs settings without erasing existing config keys
    const isNewElevenLabsKey =
      body.elevenLabsKey && !body.elevenLabsKey.includes("•");

    if (isNewElevenLabsKey) {
      const existingElevenLabs = await db.integrationConfig.findUnique({
        where: {
          organizationId_provider: {
            organizationId: session.organizationId,
            provider: IntegrationProvider.ELEVENLABS,
          },
        },
      });
      const prevElConfig = (existingElevenLabs?.config || {}) as Record<string, unknown>;

      await db.integrationConfig.upsert({
        where: {
          organizationId_provider: {
            organizationId: session.organizationId,
            provider: IntegrationProvider.ELEVENLABS,
          },
        },
        create: {
          organizationId: session.organizationId,
          provider: IntegrationProvider.ELEVENLABS,
          enabled: true,
          config: {
            ...prevElConfig,
            apiKey: body.elevenLabsKey,
          },
        },
        update: {
          enabled: true,
          config: {
            ...prevElConfig,
            apiKey: body.elevenLabsKey,
          },
        },
      });
    }

    await db.auditLog.create({
      data: {
        organizationId: session.organizationId,
        actorUserId: session.userId,
        action: AuditAction.INTEGRATION_UPDATED,
        entityType: "IntegrationConfig",
        metadata: {
          updatedProviders: ["TWILIO", isNewElevenLabsKey ? "ELEVENLABS" : null].filter(Boolean),
        },
      },
    });

    return Response.json({ success: true, message: "Settings updated successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save settings";
    return Response.json({ error: msg }, { status: 500 });
  }
}
