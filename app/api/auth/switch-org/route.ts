import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { MembershipRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { z } from "zod";

const switchOrgSchema = z.object({
  action: z.enum(["SWITCH", "CREATE"]).default("SWITCH"),
  organizationId: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(30).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof switchOrgSchema>;
  try {
    body = switchOrgSchema.parse(await request.json());
  } catch (err: unknown) {
    const details = err instanceof z.ZodError ? err.flatten() : "Invalid payload";
    return Response.json({ error: "Invalid payload", details }, { status: 400 });
  }

  // =========================================================================
  // FLOW 1: OWNER-ONLY ORGANIZATION CREATION
  // =========================================================================
  if (body.action === "CREATE") {
    if (session.role !== MembershipRole.OWNER) {
      return Response.json(
        { error: "Forbidden: Only an organization OWNER can create a new practice workspace." },
        { status: 403 }
      );
    }

    if (!body.name) {
      return Response.json({ error: "Practice name is required to create an organization" }, { status: 400 });
    }

    const baseSlug = (
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    ).slice(0, 48);

    const existingWithSlug = await db.organization.findUnique({ where: { slug: baseSlug } });
    const uniqueSlug = existingWithSlug
      ? `${baseSlug}-${randomBytes(3).toString("hex")}`
      : baseSlug;

    const createdOrg = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: body.name!,
          slug: uniqueSlug,
          timezone: "America/Los_Angeles",
        },
      });

      await tx.membership.create({
        data: {
          userId: session.userId,
          organizationId: org.id,
          role: MembershipRole.OWNER,
        },
      });

      await tx.agentConfig.create({
        data: {
          organizationId: org.id,
          businessName: org.name,
          businessType: "Medical Practice",
          phoneNumber: body.phone || "+1 (415) 800-4291",
          displayName: "Sarah (AI Receptionist)",
        },
      });

      return org;
    });

    await db.session.update({
      where: { id: session.id },
      data: { organizationId: createdOrg.id },
    });

    await db.auditLog.create({
      data: {
        organizationId: createdOrg.id,
        actorUserId: session.userId,
        action: "AUTHENTICATED",
        entityType: "OrganizationCreated",
        entityId: createdOrg.id,
        metadata: {
          organizationName: createdOrg.name,
          slug: createdOrg.slug,
        },
      },
    });

    return Response.json(
      {
        success: true,
        message: `Created and switched to ${createdOrg.name}`,
        organization: {
          id: createdOrg.id,
          name: createdOrg.name,
          slug: createdOrg.slug,
          role: MembershipRole.OWNER,
        },
      },
      { status: 201 }
    );
  }

  // =========================================================================
  // FLOW 2: SWITCH TO AN EXISTING ORGANIZATION (REQUIRES EXISTING MEMBERSHIP)
  // =========================================================================
  if (!body.organizationId && !body.slug) {
    return Response.json(
      { error: "Specify organizationId or slug to switch organizations" },
      { status: 400 }
    );
  }

  const targetOrg = await db.organization.findFirst({
    where: {
      ...(body.organizationId ? { id: body.organizationId } : {}),
      ...(!body.organizationId && body.slug ? { slug: body.slug } : {}),
    },
  });

  if (!targetOrg) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  // Verify the logged-in user already holds a valid Membership in targetOrg
  const existingMembership = await db.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: targetOrg.id,
        userId: session.userId,
      },
    },
  });

  if (!existingMembership) {
    return Response.json(
      { error: "Forbidden: You are not a member of the requested organization." },
      { status: 403 }
    );
  }

  await db.session.update({
    where: { id: session.id },
    data: { organizationId: targetOrg.id },
  });

  await db.auditLog.create({
    data: {
      organizationId: targetOrg.id,
      actorUserId: session.userId,
      action: "AUTHENTICATED",
      entityType: "OrganizationSwitch",
      entityId: targetOrg.id,
      metadata: {
        previousOrganizationId: session.organizationId,
        newOrganizationId: targetOrg.id,
        organizationName: targetOrg.name,
        role: existingMembership.role,
      },
    },
  });

  return Response.json({
    success: true,
    message: `Switched active organization to ${targetOrg.name}`,
    organization: {
      id: targetOrg.id,
      name: targetOrg.name,
      slug: targetOrg.slug,
      role: existingMembership.role,
    },
  });
}
