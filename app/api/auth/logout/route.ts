import { destroySession, getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  await destroySession();

  if (session) {
    await db.auditLog.create({
      data: {
        organizationId: session.organizationId,
        actorUserId: session.userId,
        action: "SIGNED_OUT",
        entityType: "session",
      },
    });
  }

  return new Response(null, { status: 204 });
}
