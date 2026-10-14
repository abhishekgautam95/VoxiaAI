import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { MembershipRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().max(120).optional(),
  role: z.nativeEnum(MembershipRole).default(MembershipRole.OPERATOR),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await db.membership.findMany({
    where: { organizationId: session.organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const members = memberships.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.createdAt,
  }));

  return Response.json({ members });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof inviteSchema>;
  try {
    body = inviteSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid team invite payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  const normalizedEmail = body.email.toLowerCase();

  // Find or create user
  let user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const tempPassword = Math.random().toString(36).slice(-8) + "!Voxia2026";
    const passwordHash = await hash(tempPassword, 10);
    const displayName = body.name?.trim() || normalizedEmail.split("@")[0];

    user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: displayName,
        passwordHash,
      },
    });
  }

  // Check if already a member of this organization
  const existingMembership = await db.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: user.id,
      },
    },
  });

  if (existingMembership) {
    return Response.json(
      { error: "This user is already a member of your practice." },
      { status: 400 }
    );
  }

  const newMembership = await db.membership.create({
    data: {
      organizationId: session.organizationId,
      userId: user.id,
      role: body.role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: session.organizationId,
      actorUserId: session.userId,
      action: "AUTHENTICATED",
      entityType: "Membership",
      entityId: newMembership.id,
      metadata: {
        action: "TEAM_MEMBER_INVITED",
        invitedEmail: normalizedEmail,
        role: body.role,
      },
    },
  });

  return Response.json(
    {
      member: {
        id: newMembership.id,
        userId: newMembership.userId,
        name: newMembership.user.name,
        email: newMembership.user.email,
        role: newMembership.role,
        joinedAt: newMembership.createdAt,
      },
      message: `Successfully invited ${normalizedEmail} as ${body.role}`,
    },
    { status: 201 }
  );
}
