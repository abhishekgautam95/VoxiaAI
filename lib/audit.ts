import { db } from "@/lib/db";
import { AuditAction, Prisma } from "@prisma/client";

export interface RecordAuditParams {
  organizationId: string;
  actorUserId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | Prisma.InputJsonValue;
}

/**
 * Safely writes an immutable audit record to the PostgreSQL database.
 * Wrapped in try/catch to ensure audit logging never interrupts core business transactions.
 */
export async function recordAuditLog({
  organizationId,
  actorUserId,
  action,
  entityType,
  entityId,
  metadata = {},
}: RecordAuditParams) {
  try {
    return await db.auditLog.create({
      data: {
        organizationId,
        actorUserId: actorUserId || null,
        action,
        entityType,
        entityId: entityId || null,
        metadata: (metadata as Prisma.InputJsonValue) || {},
      },
    });
  } catch (error) {
    console.error("Failed to persist audit log entry:", error);
    return null;
  }
}
