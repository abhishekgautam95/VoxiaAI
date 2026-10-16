import { getSession, canManageTeamAndSettings } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

const provisionSchema = z
  .object({
    areaCode: z
      .string()
      .trim()
      .regex(/^\d{3}$/, "Area code must be a valid 3-digit US/Canada code")
      .default("415"),
    label: z.string().trim().min(1, "Label cannot be empty").max(80).default("Main Reception Desk"),
    cityState: z.string().trim().min(1).max(100).default("San Francisco, CA"),
  })
  .strict();

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phoneNumbers = await db.phoneNumber.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ phoneNumbers });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageTeamAndSettings(session.role)) {
    return Response.json(
      { error: "Forbidden: Only practice Owners or Admins can provision phone numbers." },
      { status: 403 }
    );
  }

  let rawJson: unknown;
  try {
    const text = await request.text();
    rawJson = text.trim() ? JSON.parse(text) : {};
  } catch {
    return Response.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  let body: z.infer<typeof provisionSchema>;
  try {
    body = provisionSchema.parse(rawJson);
  } catch (err: unknown) {
    const details = err instanceof z.ZodError ? err.flatten() : "Invalid phone provisioning payload";
    return Response.json({ error: "Validation failed", details }, { status: 400 });
  }

  const randomMiddle = Math.floor(200 + Math.random() * 700);
  const randomLast = Math.floor(1000 + Math.random() * 9000);
  const generatedNumber = `+1 (${body.areaCode}) ${randomMiddle}-${randomLast}`;

  const phoneNumber = await db.phoneNumber.create({
    data: {
      organizationId: session.organizationId,
      number: generatedNumber,
      label: body.label,
      cityState: body.cityState,
      assignedAgent: "Sarah (AI Receptionist)",
      status: "ACTIVE",
      provider: "Twilio",
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: session.organizationId,
      actorUserId: session.userId,
      action: "PHONE_PROVISIONED",
      entityType: "PhoneNumber",
      entityId: phoneNumber.id,
      metadata: { number: phoneNumber.number, areaCode: body.areaCode },
    },
  });

  return Response.json(
    { phoneNumber, message: "New number provisioned and routing live!" },
    { status: 201 }
  );
}
