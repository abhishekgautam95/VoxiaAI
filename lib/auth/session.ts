import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { MembershipRole } from "@prisma/client";

const SESSION_COOKIE = "voxia_session";
const DEFAULT_SESSION_TTL_DAYS = 14;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionTtlDays() {
  const configuredValue = Number(process.env.SESSION_TTL_DAYS);
  return Number.isInteger(configuredValue) && configuredValue > 0 && configuredValue <= 90
    ? configuredValue
    : DEFAULT_SESSION_TTL_DAYS;
}

function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export function canManageTeamAndSettings(role: MembershipRole): boolean {
  return role === MembershipRole.OWNER || role === MembershipRole.ADMIN;
}

export function canAssignRole(actorRole: MembershipRole, targetRole: MembershipRole): boolean {
  if (actorRole === MembershipRole.OWNER) {
    return true;
  }
  if (actorRole === MembershipRole.ADMIN) {
    // Admins cannot grant OWNER privileges (prevents privilege escalation)
    return targetRole !== MembershipRole.OWNER;
  }
  return false;
}

export async function createSession(userId: string, organizationId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionTtlDays());

  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      organizationId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: { select: { id: true, email: true, name: true } },
      organization: { select: { id: true, name: true, slug: true, timezone: true } },
    },
  });

  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  // Verify the active organization membership still exists
  const membership = await db.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: session.userId,
      },
    },
    select: { id: true, role: true },
  });

  if (!membership) {
    // Stale or revoked membership -> invalidate session immediately
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return {
    ...session,
    role: membership.role,
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
