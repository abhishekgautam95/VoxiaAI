import { db } from "@/lib/db";
import { IntegrationProvider } from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";

const OAUTH_STATE_SECRET =
  process.env.GOOGLE_CLIENT_SECRET ||
  process.env.DATABASE_URL ||
  "voxia-google-oauth-state-secret";

export interface CalendarBookingInput {
  appointmentId: string;
  customerName: string;
  phoneNumber: string;
  email?: string | null;
  service: string;
  providerName?: string | null;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "10:30 AM"
  notes?: string | null;
}

interface StoredGoogleConfig {
  accountEmail?: string;
  calendarId?: string;
  calendarName?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  bufferMinutes?: number;
  appointmentDurationMinutes?: number;
}

export function signOAuthState(payload: { organizationId: string; userId: string }): string {
  const data = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 10 * 60 * 1000 })
  ).toString("base64url");
  const sig = createHmac("sha256", OAUTH_STATE_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyOAuthState(
  stateParam: string | null | undefined
): { organizationId: string; userId: string } | null {
  if (!stateParam) return null;
  const parts = stateParam.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = createHmac("sha256", OAUTH_STATE_SECRET).update(data).digest("base64url");

  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) return null;
    if (!parsed.organizationId || !parsed.userId) return null;
    return { organizationId: parsed.organizationId, userId: parsed.userId };
  } catch {
    return null;
  }
}

export function computeSlotWithBuffer(
  dateStr: string,
  timeStr: string,
  durationMinutes = 45,
  bufferMinutes = 15
): { startIso: string; treatmentEndIso: string; bufferedEndIso: string; totalBlockedMinutes: number } {
  const [year, month, day] = dateStr.split("-").map(Number);
  let hours = 9;
  let minutes = 0;

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
  }

  const startMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const treatmentEndMs = startMs + durationMinutes * 60_000;
  const bufferedEndMs = treatmentEndMs + bufferMinutes * 60_000;

  const pad = (n: number) => String(n).padStart(2, "0");
  const toLocalIso = (ms: number) => {
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(
      d.getUTCHours()
    )}:${pad(d.getUTCMinutes())}:00`;
  };

  return {
    startIso: toLocalIso(startMs),
    treatmentEndIso: toLocalIso(treatmentEndMs),
    bufferedEndIso: toLocalIso(bufferedEndMs),
    totalBlockedMinutes: durationMinutes + bufferMinutes,
  };
}

async function getValidAccessToken(
  integrationId: string,
  config: StoredGoogleConfig
): Promise<string | null> {
  if (config.accessToken && config.expiresAt && Date.now() < config.expiresAt - 60_000) {
    return config.accessToken;
  }

  if (!config.refreshToken || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return null;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  const newExpiresAt = Date.now() + data.expires_in * 1000;

  await db.integrationConfig.update({
    where: { id: integrationId },
    data: {
      config: {
        ...config,
        accessToken: data.access_token,
        expiresAt: newExpiresAt,
      },
    },
  });

  return data.access_token;
}

export async function syncAppointmentToDoctorGoogleCalendar(
  organizationId: string,
  booking: CalendarBookingInput
): Promise<{ synced: boolean; googleEventId?: string; htmlLink?: string; reason?: string }> {
  try {
    const [org, integration] = await Promise.all([
      db.organization.findUnique({ where: { id: organizationId } }),
      db.integrationConfig.findUnique({
        where: {
          organizationId_provider: {
            organizationId,
            provider: IntegrationProvider.GOOGLE_CALENDAR,
          },
        },
      }),
    ]);

    if (!integration || !integration.enabled) {
      return { synced: false, reason: "Google Calendar integration not enabled" };
    }

    const config = (integration.config || {}) as StoredGoogleConfig;
    const accessToken = await getValidAccessToken(integration.id, config);
    if (!accessToken) {
      return { synced: false, reason: "OAuth2 token not configured or expired" };
    }

    const timeZone = org?.timezone || "America/Los_Angeles";
    const durationMinutes = Number(config.appointmentDurationMinutes ?? 45);
    const bufferMinutes = Number(config.bufferMinutes ?? 15);

    const { startIso, treatmentEndIso, bufferedEndIso } = computeSlotWithBuffer(
      booking.date,
      booking.time,
      durationMinutes,
      bufferMinutes
    );

    const calendarId = encodeURIComponent(config.calendarId || "primary");
    const eventPayload = {
      summary: `[VoxiaAI] ${booking.service} — ${booking.customerName} (+${bufferMinutes}m Buffer)`,
      description: [
        `Patient Name: ${booking.customerName}`,
        `Phone: ${booking.phoneNumber}`,
        `Service: ${booking.service}`,
        `Provider: ${booking.providerName}`,
        `Scheduled Time: ${booking.time} (${durationMinutes}m procedure + ${bufferMinutes}m sterilization buffer)`,
        `Notes: ${booking.notes || "Booked via VoxiaAI Autonomous Receptionist"}`,
        `VoxiaAI Appointment ID: ${booking.appointmentId}`,
      ].join("\n"),
      start: {
        dateTime: startIso,
        timeZone,
      },
      end: {
        dateTime: bufferedEndIso,
        timeZone,
      },
      attendees: booking.email ? [{ email: booking.email, displayName: booking.customerName }] : [],
      transparency: "opaque",
      extendedProperties: {
        private: {
          voxiaAppointmentId: booking.appointmentId,
          treatmentEnd: treatmentEndIso,
          bufferMinutes: String(bufferMinutes),
        },
      },
    };

    const createRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      return { synced: false, reason: errText };
    }

    const created = (await createRes.json()) as { id: string; htmlLink: string };
    return {
      synced: true,
      googleEventId: created.id,
      htmlLink: created.htmlLink,
    };
  } catch (err: unknown) {
    return {
      synced: false,
      reason: err instanceof Error ? err.message : "Calendar sync exception",
    };
  }
}
