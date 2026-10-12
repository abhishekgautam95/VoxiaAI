import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { IntegrationProvider } from "@prisma/client";

const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  "rachel-natural": "21m00Tcm4TlvDq8ikWAM",
  "guy-professional": "ErXwobaYiN019PkySvjV",
  "adam-confident": "pNInz6obpgDQGcFmaJgB",
  "bella-expressive": "EXAVITQu4vr4xnSDxMaL",
  "antoni-polished": "nPczCjzI2devNBz1zQrb",
  "eleven_multilingual_v2": "21m00Tcm4TlvDq8ikWAM",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { text, voiceId, stability, similarity } = body;

    if (!text || typeof text !== "string") {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    // Resolve voice ID
    const targetVoiceId =
      ELEVENLABS_VOICE_MAP[voiceId || ""] ||
      voiceId ||
      "21m00Tcm4TlvDq8ikWAM";

    // 1. Check environment variable
    let apiKey = process.env.ELEVENLABS_API_KEY;

    // 2. Check organization database integrations
    if (!apiKey) {
      const integration = await db.integrationConfig.findUnique({
        where: {
          organizationId_provider: {
            organizationId: session.organizationId,
            provider: IntegrationProvider.ELEVENLABS,
          },
        },
      });

      if (integration?.enabled && integration.config) {
        const conf = integration.config as Record<string, unknown>;
        if (typeof conf.apiKey === "string" && conf.apiKey.trim()) {
          apiKey = conf.apiKey.trim();
        }
      }
    }

    if (!apiKey) {
      return Response.json({
        fallback: true,
        message:
          "ElevenLabs API key not configured. Falling back to browser speech synthesis.",
      });
    }

    // Call ElevenLabs TTS API
    const elevenLabsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?optimize_streaming_latency=3`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: typeof stability === "number" ? stability : 0.75,
            similarity_boost: typeof similarity === "number" ? similarity : 0.85,
          },
        }),
      }
    );

    if (!elevenLabsRes.ok) {
      const errText = await elevenLabsRes.text().catch(() => "");
      return Response.json({
        fallback: true,
        error: `ElevenLabs API error: ${elevenLabsRes.status}`,
        details: errText,
      });
    }

    const audioArrayBuffer = await elevenLabsRes.arrayBuffer();

    return new Response(audioArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "TTS Generation error";
    return Response.json({ fallback: true, error: msg });
  }
}
