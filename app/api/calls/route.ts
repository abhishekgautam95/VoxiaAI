import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";
import { CallStatus, CallRole, Prisma } from "@prisma/client";

const transcriptItemSchema = z.object({
  role: z.enum(["AI", "USER"]),
  text: z.string().min(1),
  timestamp: z.string().default("0:00"),
});

const callCreateSchema = z.object({
  callerNumber: z.string().trim().min(3),
  callerName: z.string().trim().optional(),
  durationSeconds: z.number().int().min(0).default(0),
  durationFormatted: z.string().default("0m 0s"),
  status: z.enum(["COMPLETED", "MISSED", "APPOINTMENT_BOOKED"]).default("COMPLETED"),
  aiSummary: z.string().default(""),
  keyTakeaways: z.array(z.string()).default([]),
  sentiment: z.string().default("Positive"),
  audioDurationSec: z.number().int().min(0).default(0),
  transcripts: z.array(transcriptItemSchema).default([]),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.toUpperCase();
  const search = searchParams.get("search")?.trim();

  const whereClause: Prisma.CallRecordWhereInput = {
    organizationId: session.organizationId,
  };

  if (statusParam && statusParam in CallStatus) {
    whereClause.status = statusParam as CallStatus;
  }

  if (search) {
    whereClause.OR = [
      { callId: { contains: search, mode: "insensitive" } },
      { callerNumber: { contains: search } },
      { callerName: { contains: search, mode: "insensitive" } },
      { aiSummary: { contains: search, mode: "insensitive" } },
    ];
  }

  const calls = await db.callRecord.findMany({
    where: whereClause,
    include: {
      transcripts: {
        orderBy: { sequence: "asc" },
      },
      appointments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ calls });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof callCreateSchema>;
  try {
    body = callCreateSchema.parse(await request.json());
  } catch (err: unknown) {
    const errorDetails = err instanceof z.ZodError ? err.flatten() : "Invalid call payload";
    return Response.json({ error: "Validation failed", details: errorDetails }, { status: 400 });
  }

  const count = await db.callRecord.count({ where: { organizationId: session.organizationId } });
  const generatedCallId = `CALL-${9100 + count + 1}`;

  const call = await db.callRecord.create({
    data: {
      callId: generatedCallId,
      organizationId: session.organizationId,
      callerNumber: body.callerNumber,
      callerName: body.callerName || "Inbound Caller",
      durationSeconds: body.durationSeconds,
      durationFormatted: body.durationFormatted,
      status: body.status as CallStatus,
      aiSummary: body.aiSummary,
      keyTakeaways: body.keyTakeaways,
      sentiment: body.sentiment,
      audioDurationSec: body.audioDurationSec,
      transcripts: {
        create: body.transcripts.map((t, idx) => ({
          role: t.role as CallRole,
          text: t.text,
          timestamp: t.timestamp,
          sequence: idx,
        })),
      },
    },
    include: {
      transcripts: true,
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: session.organizationId,
      actorUserId: session.userId,
      action: "CALL_RECORDED",
      entityType: "CallRecord",
      entityId: call.id,
      metadata: {
        callId: call.callId,
        duration: call.durationFormatted,
        status: call.status,
      },
    },
  });

  return Response.json({ call, message: "Call record logged successfully" }, { status: 201 });
}
