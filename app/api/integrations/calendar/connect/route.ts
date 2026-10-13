import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { IntegrationProvider } from "@prisma/client";
import { z } from "zod";

const connectSchema = z.object({
  provider: z.enum(["GOOGLE_CALENDAR", "CAL_COM"]),
  accountEmail: z.string().email(),
  calendarName: z.string().min(1).default("Primary Reception Schedule"),
  bufferMinutes: z.number().int().min(0).max(60).default(15),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof connectSchema>;
  try {
    body = connectSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid calendar payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  const providerEnum = body.provider as IntegrationProvider;

  const config = await db.integrationConfig.upsert({
    where: {
      organizationId_provider: {
        organizationId: session.organizationId,
        provider: providerEnum,
      },
    },
    create: {
      organizationId: session.organizationId,
      provider: providerEnum,
      enabled: true,
      config: {
        accountEmail: body.accountEmail,
        calendarName: body.calendarName,
        bufferMinutes: body.bufferMinutes,
        connectedAt: new Date().toISOString(),
        syncStatus: "ACTIVE_2WAY",
      },
    },
    update: {
      enabled: true,
      config: {
        accountEmail: body.accountEmail,
        calendarName: body.calendarName,
        bufferMinutes: body.bufferMinutes,
        connectedAt: new Date().toISOString(),
        syncStatus: "ACTIVE_2WAY",
      },
    },
  });

  recordAuditLog({
    organizationId: session.organizationId,
    actorUserId: session.userId,
    action: "INTEGRATION_UPDATED",
    entityType: "IntegrationConfig",
    entityId: config.id,
    metadata: {
      provider: body.provider,
      accountEmail: body.accountEmail,
      calendarName: body.calendarName,
      action: "CONNECTED",
    },
  }).catch(() => {});

  return Response.json({
    success: true,
    message: `${body.provider === "GOOGLE_CALENDAR" ? "Google Calendar" : "Cal.com"} connected successfully!`,
    config,
  });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (!provider || !["GOOGLE_CALENDAR", "CAL_COM"].includes(provider)) {
    return Response.json({ error: "Specify a valid calendar provider" }, { status: 400 });
  }

  await db.integrationConfig.updateMany({
    where: {
      organizationId: session.organizationId,
      provider: provider as IntegrationProvider,
    },
    data: {
      enabled: false,
      config: { syncStatus: "DISCONNECTED" },
    },
  });

  recordAuditLog({
    organizationId: session.organizationId,
    actorUserId: session.userId,
    action: "INTEGRATION_UPDATED",
    entityType: "IntegrationConfig",
    metadata: {
      provider,
      action: "DISCONNECTED",
    },
  }).catch(() => {});

  return Response.json({
    success: true,
    message: `${provider === "GOOGLE_CALENDAR" ? "Google Calendar" : "Cal.com"} disconnected.`,
  });
}
