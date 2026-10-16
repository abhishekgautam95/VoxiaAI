import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const memberships = await db.membership.findMany({
    where: { userId: session.userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          timezone: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({
    user: session.user,
    organization: session.organization,
    role: session.role,
    organizations: memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
    })),
  });
}
