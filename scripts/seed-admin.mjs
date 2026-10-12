import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const requiredEnvironmentVariables = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "ORGANIZATION_NAME"];
const missingVariables = requiredEnvironmentVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
}

const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const organizationName = process.env.ORGANIZATION_NAME.trim();
const organizationSlug = (process.env.ORGANIZATION_SLUG ?? organizationName)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

if (!/^\S+@\S+\.\S+$/.test(email)) {
  throw new Error("ADMIN_EMAIL must be a valid email address.");
}

if (password.length < 12) {
  throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
}

if (organizationSlug.length < 2) {
  throw new Error("ORGANIZATION_SLUG must contain at least two letters or numbers.");
}

const db = new PrismaClient();

try {
  const passwordHash = await hash(password, 12);
  const organization = await db.organization.upsert({
    where: { slug: organizationSlug },
    update: { name: organizationName },
    create: { name: organizationName, slug: organizationSlug },
  });
  const user = await db.user.upsert({
    where: { email },
    update: { name: process.env.ADMIN_NAME?.trim() || "Workspace Owner", passwordHash },
    create: {
      email,
      name: process.env.ADMIN_NAME?.trim() || "Workspace Owner",
      passwordHash,
    },
  });

  await db.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  console.log(`Owner ${email} is ready for ${organization.name} (${organization.slug}).`);
} finally {
  await db.$disconnect();
}
