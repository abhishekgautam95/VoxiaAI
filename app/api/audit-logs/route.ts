import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AuditAction } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = parseInt(searchParams.get("limit") || "50", 10);
  const offsetParam = parseInt(searchParams.get("offset") || "0", 10);
  const actionParam = searchParams.get("action");
  const entityTypeParam = searchParams.get("entityType");

  const limit = Math.min(Math.max(isNaN(limitParam) ? 50 : limitParam, 1), 100);
  const offset = Math.max(isNaN(offsetParam) ? 0 : offsetParam, 0);

  const whereClause: {
    organizationId: string;
    action?: AuditAction;
    entityType?: string;
  } = {
    organizationId: session.organizationId,
  };

  if (actionParam && Object.values(AuditAction).includes(actionParam as AuditAction)) {
    whereClause.action = actionParam as AuditAction;
  }

  if (entityTypeParam && entityTypeParam.trim().length > 0) {
    whereClause.entityType = entityTypeParam.trim();
  }

  try {
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where: whereClause,
        include: {
          actorUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.auditLog.count({
        where: whereClause,
      }),
    ]);

    return Response.json({
      logs,
      total,
      hasMore: offset + logs.length < total,
      limit,
      offset,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to retrieve audit logs";
    return Response.json({ error: msg }, { status: 500 });
  }
}
