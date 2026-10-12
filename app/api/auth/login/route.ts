import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(256),
  organizationSlug: z.string().trim().min(2).max(80).optional(),
});

export async function POST(request: Request) {
  let input: z.infer<typeof loginSchema>;

  try {
    input = loginSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: {
      memberships: {
        include: { organization: true },
      },
    },
  });

  const passwordIsValid = user ? await compare(input.password, user.passwordHash) : false;
  if (!user || !passwordIsValid) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const membership = input.organizationSlug
    ? user.memberships.find((item) => item.organization.slug === input.organizationSlug)
    : user.memberships[0];

  if (!membership) {
    return Response.json({ error: "You do not have access to that organization." }, { status: 403 });
  }

  await createSession(user.id, membership.organizationId);
  await db.auditLog.create({
    data: {
      organizationId: membership.organizationId,
      actorUserId: user.id,
      action: "AUTHENTICATED",
      entityType: "session",
    },
  });

  return Response.json({
    user: { id: user.id, name: user.name, email: user.email },
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
    },
    role: membership.role,
  });
}
