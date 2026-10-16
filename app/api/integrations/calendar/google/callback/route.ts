import { getSession, canManageTeamAndSettings } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { signOAuthState, verifyOAuthState } from "@/lib/calendar/google-sync";
import { IntegrationProvider } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Initiate OAuth2 flow (?action=authorize)
  if (searchParams.get("action") === "authorize") {
    const session = await getSession();
    if (!session) {
      return Response.redirect(`${appUrl}/login`);
    }

    if (!canManageTeamAndSettings(session.role)) {
      return Response.json(
        { error: "Forbidden: Only Owners or Admins can authorize calendar integrations." },
        { status: 403 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return Response.redirect(
        `${appUrl}/dashboard/settings?tab=integrations&calendar_error=google_client_id_not_configured`
      );
    }

    const state = signOAuthState({
      organizationId: session.organizationId,
      userId: session.userId,
    });

    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${appUrl}/api/integrations/calendar/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
      scope: [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    });

    return Response.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  }

  // 2. OAuth2 Callback Handler (?code=...&state=...)
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError || !code || !stateParam) {
    return Response.redirect(
      `${appUrl}/dashboard/settings?tab=integrations&calendar_error=${encodeURIComponent(
        oauthError || "missing_code"
      )}`
    );
  }

  const verifiedState = verifyOAuthState(stateParam);
  if (!verifiedState) {
    return Response.redirect(
      `${appUrl}/dashboard/settings?tab=integrations&calendar_error=invalid_csrf_state`
    );
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${appUrl}/api/integrations/calendar/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return Response.redirect(
      `${appUrl}/dashboard/settings?tab=integrations&calendar_error=token_exchange_failed`
    );
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = (await profileRes.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
  };

  const existingConfig = await db.integrationConfig.findUnique({
    where: {
      organizationId_provider: {
        organizationId: verifiedState.organizationId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    },
  });
  const prevJson = (existingConfig?.config as Record<string, unknown>) || {};

  const updated = await db.integrationConfig.upsert({
    where: {
      organizationId_provider: {
        organizationId: verifiedState.organizationId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    },
    create: {
      organizationId: verifiedState.organizationId,
      provider: IntegrationProvider.GOOGLE_CALENDAR,
      enabled: true,
      config: {
        accountEmail: profile.email || "doctor@clinic.com",
        calendarId: "primary",
        calendarName: `${profile.name || "Doctor"}'s Primary Calendar`,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        expiresAt: Date.now() + tokens.expires_in * 1000,
        bufferMinutes: 15,
        appointmentDurationMinutes: 45,
        connectedAt: new Date().toISOString(),
        syncStatus: "ACTIVE_2WAY",
      },
    },
    update: {
      enabled: true,
      config: {
        ...prevJson,
        accountEmail: profile.email || (prevJson.accountEmail as string),
        calendarId: "primary",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || (prevJson.refreshToken as string),
        expiresAt: Date.now() + tokens.expires_in * 1000,
        bufferMinutes: Number(prevJson.bufferMinutes ?? 15),
        appointmentDurationMinutes: Number(prevJson.appointmentDurationMinutes ?? 45),
        connectedAt: new Date().toISOString(),
        syncStatus: "ACTIVE_2WAY",
      },
    },
  });

  await recordAuditLog({
    organizationId: verifiedState.organizationId,
    actorUserId: verifiedState.userId,
    action: "INTEGRATION_UPDATED",
    entityType: "IntegrationConfig",
    entityId: updated.id,
    metadata: {
      provider: "GOOGLE_CALENDAR",
      accountEmail: profile.email,
      bufferMinutes: 15,
      syncStatus: "ACTIVE_2WAY",
    },
  });

  return Response.redirect(
    `${appUrl}/dashboard/settings?tab=integrations&calendar_connected=true`
  );
}
