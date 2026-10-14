import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

const switchOrgSchema = z.object({
  organizationId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof switchOrgSchema>;
  try {
    body = switchOrgSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  let targetOrg = null;

  if (body.organizationId && !body.organizationId.startsWith("org-")) {
    targetOrg = await db.organization.findUnique({
      where: { id: body.organizationId },
    });
  }

  if (!targetOrg && body.slug) {
    targetOrg = await db.organization.findUnique({
      where: { slug: body.slug },
    });
  }

  // If still not found, search by name
  if (!targetOrg && body.name) {
    targetOrg = await db.organization.findFirst({
      where: { name: { equals: body.name, mode: "insensitive" } },
    });
  }

  // If organization does not exist yet (e.g. Metro Urgent Care or Harbor View Law Group from preset menu), create and seed it
  if (!targetOrg) {
    const orgName = body.name || "Specialty Practice Group";
    const generatedSlug = (
      body.slug ||
      orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );

    targetOrg = await db.organization.upsert({
      where: { slug: generatedSlug },
      update: {},
      create: {
        name: orgName,
        slug: generatedSlug,
        timezone: "America/Los_Angeles",
      },
    });

    // Create default agent config for the newly created organization
    await db.agentConfig.upsert({
      where: { organizationId: targetOrg.id },
      update: {},
      create: {
        organizationId: targetOrg.id,
        businessName: targetOrg.name,
        businessType: "Medical Practice",
        phoneNumber: body.phone || "+1 (415) 800-4291",
        displayName: "Sarah (AI Receptionist)",
      },
    });

    // Provision a default demo phone line
    const defaultNumber = body.phone || `+1 (415) 800-${Math.floor(1000 + Math.random() * 9000)}`;
    await db.phoneNumber.upsert({
      where: {
        organizationId_number: {
          organizationId: targetOrg.id,
          number: defaultNumber,
        },
      },
      update: {},
      create: {
        organizationId: targetOrg.id,
        number: defaultNumber,
        label: `${targetOrg.name} Reception Line`,
        status: "ACTIVE",
      },
    });
  }

  // Ensure current user has a Membership in this organization
  await db.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: targetOrg.id,
        userId: session.userId,
      },
    },
    update: {},
    create: {
      userId: session.userId,
      organizationId: targetOrg.id,
      role: "OWNER",
    },
  });

  // Switch the active organization on the user's Session
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
    },
  });
}
