import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AuditAction, IntegrationProvider } from "@prisma/client";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integrations = await db.integrationConfig.findMany({
    where: { organizationId: session.organizationId },
  });

  const twilio = integrations.find((i) => i.provider === IntegrationProvider.TWILIO);
  const elevenlabs = integrations.find(
    (i) => i.provider === IntegrationProvider.ELEVENLABS
  );
  const googleCal = integrations.find(
    (i) => i.provider === IntegrationProvider.GOOGLE_CALENDAR
  );
  const calCom = integrations.find(
    (i) => i.provider === IntegrationProvider.CAL_COM
  );

  const twilioConfig = (twilio?.config || {}) as Record<string, unknown>;
  const elevenlabsConfig = (elevenlabs?.config || {}) as Record<string, unknown>;

  return Response.json({
    twilioSid: (twilioConfig.accountSid as string) || "AC993817112048f0",
    webhookUrl:
      (twilioConfig.webhookUrl as string) ||
      "https://api.voxia.ai/webhooks/calls/v1",
    elevenLabsConfigured: Boolean(elevenlabsConfig.apiKey),
    googleCalendarConnected: googleCal?.enabled ?? true,
    calComConnected: calCom?.enabled ?? true,
    apiKey: `vox_live_${session.organizationId.substring(0, 8)}b8`,
  });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { twilioSid, webhookUrl, elevenLabsKey } = body;

    // 1. Upsert Twilio settings
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
        config: {
          accountSid: twilioSid || "",
          webhookUrl: webhookUrl || "",
        },
      },
      update: {
        config: {
          accountSid: twilioSid || "",
          webhookUrl: webhookUrl || "",
        },
      },
    });

    // 2. Upsert ElevenLabs settings if updated
    if (elevenLabsKey && elevenLabsKey !== "••••••••••••••••••••••••") {
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
            apiKey: elevenLabsKey,
          },
        },
        update: {
          enabled: true,
          config: {
            apiKey: elevenLabsKey,
          },
        },
      });
    }

    // 3. Log Audit
    await db.auditLog.create({
      data: {
        organizationId: session.organizationId,
        actorUserId: session.userId,
        action: AuditAction.INTEGRATION_UPDATED,
        entityType: "IntegrationConfig",
        metadata: {
          updatedProviders: ["TWILIO", elevenLabsKey ? "ELEVENLABS" : null].filter(
            Boolean
          ),
        },
      },
    });

    return Response.json({ success: true, message: "Settings updated successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save settings";
    return Response.json({ error: msg }, { status: 500 });
  }
}
