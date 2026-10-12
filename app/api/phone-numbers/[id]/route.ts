import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { PhoneNumberStatus } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  label: z.string().trim().min(1).max(80).optional(),
  assignedAgent: z.string().trim().min(1).max(80).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: z.infer<typeof updateSchema>;
  try {
    body = updateSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid update payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  const existing = await db.phoneNumber.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    return Response.json({ error: "Phone number not found" }, { status: 404 });
  }

  const updatedNumber = await db.phoneNumber.update({
    where: { id },
    data: {
      ...(body.label ? { label: body.label } : {}),
      ...(body.assignedAgent ? { assignedAgent: body.assignedAgent } : {}),
      ...(body.status ? { status: body.status as PhoneNumberStatus } : {}),
    },
  });

  recordAuditLog({
    organizationId: session.organizationId,
    actorUserId: session.userId,
    action: "PHONE_PROVISIONED",
    entityType: "PhoneNumber",
    entityId: id,
    metadata: {
      action: "UPDATED",
      number: updatedNumber.number,
      status: updatedNumber.status,
      label: updatedNumber.label,
    },
  }).catch(() => {});

  return Response.json({ phoneNumber: updatedNumber, message: "Phone line settings updated!" });
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

  const existing = await db.phoneNumber.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    return Response.json({ error: "Phone number not found" }, { status: 404 });
  }

  await db.phoneNumber.delete({ where: { id } });

  recordAuditLog({
    organizationId: session.organizationId,
    actorUserId: session.userId,
    action: "PHONE_PROVISIONED",
    entityType: "PhoneNumber",
    entityId: id,
    metadata: {
      action: "RELEASED",
      releasedNumber: existing.number,
    },
  }).catch(() => {});

  return Response.json({ message: `Line ${existing.number} released successfully.` });
}
