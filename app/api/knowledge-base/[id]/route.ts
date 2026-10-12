import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AuditAction } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.knowledgeDocument.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const updated = await db.knowledgeDocument.update({
      where: { id },
      data: {
        ...(typeof body.enabled === "boolean" ? { enabled: body.enabled } : {}),
        ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
        ...(typeof body.category === "string" ? { category: body.category.trim() } : {}),
        ...(typeof body.content === "string" ? { content: body.content.trim() } : {}),
      },
    });

    await db.auditLog.create({
      data: {
        organizationId: session.organizationId,
        actorUserId: session.userId,
        action: AuditAction.KNOWLEDGE_BASE_UPDATED,
        entityType: "KnowledgeDocument",
        entityId: id,
        metadata: {
          action: "UPDATED",
          title: updated.title,
        },
      },
    });

    return Response.json({ document: updated });
  } catch {
    return Response.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.knowledgeDocument.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  await db.knowledgeDocument.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      organizationId: session.organizationId,
      actorUserId: session.userId,
      action: AuditAction.KNOWLEDGE_BASE_UPDATED,
      entityType: "KnowledgeDocument",
      entityId: id,
      metadata: {
        action: "DELETED",
        title: existing.title,
      },
    },
  });

  return Response.json({ success: true, message: "Document deleted" });
}
