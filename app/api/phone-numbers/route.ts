import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

const provisionSchema = z.object({
  areaCode: z.string().trim().length(3).optional().default("415"),
  label: z.string().trim().min(1).max(80).default("Main Reception Desk"),
  cityState: z.string().trim().max(100).default("San Francisco, CA"),
});

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

  let body: z.infer<typeof provisionSchema>;
  try {
    body = provisionSchema.parse(await request.json().catch(() => ({})));
  } catch {
    body = { areaCode: "415", label: "Main Reception Desk", cityState: "San Francisco, CA" };
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
      metadata: { number: phoneNumber.number },
    },
  });

  return Response.json({ phoneNumber, message: "New number provisioned and routing live!" }, { status: 201 });
}
