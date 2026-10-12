import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AuditAction } from "@prisma/client";
import { z } from "zod";

const documentCreateSchema = z.object({
  title: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(80).default("General FAQ"),
  content: z.string().trim().min(5).max(5000),
  sourceType: z.string().trim().default("FAQ"),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("query");

  const whereClause: {
    organizationId: string;
    category?: string;
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      content?: { contains: string; mode: "insensitive" };
    }>;
  } = {
    organizationId: session.organizationId,
  };

  if (category && category !== "All") {
    whereClause.category = category;
  }

  if (query && query.trim()) {
    whereClause.OR = [
      { title: { contains: query.trim(), mode: "insensitive" } },
      { content: { contains: query.trim(), mode: "insensitive" } },
    ];
  }

  const documents = await db.knowledgeDocument.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ documents });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const body = documentCreateSchema.parse(raw);

    const doc = await db.knowledgeDocument.create({
      data: {
        organizationId: session.organizationId,
        title: body.title,
        category: body.category,
        content: body.content,
        sourceType: body.sourceType,
        enabled: true,
      },
    });

    await db.auditLog.create({
      data: {
        organizationId: session.organizationId,
        actorUserId: session.userId,
        action: AuditAction.KNOWLEDGE_BASE_UPDATED,
        entityType: "KnowledgeDocument",
        entityId: doc.id,
        metadata: {
          action: "CREATED",
          title: doc.title,
          category: doc.category,
        },
      },
    });

    return Response.json({ document: doc }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof z.ZodError ? err.flatten() : "Invalid document payload";
    return Response.json({ error: msg }, { status: 400 });
  }
}
