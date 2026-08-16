import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Whisper Large v3 via the Hugging Face Inference API. Both are overridable by
// env in case HF changes the serverless routing (e.g. the router URL form).
const HF_MODEL = Deno.env.get("WHISPER_MODEL") || "openai/whisper-large-v3";
const HF_ENDPOINT =
  Deno.env.get("WHISPER_ENDPOINT") ||
  `https://api-inference.huggingface.co/models/${HF_MODEL}`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = Deno.env.get("HF_TOKEN");
  if (!token) {
    return json(
      { error: "HF_TOKEN secret is not configured for this function.", transcription_failed: true },
      500,
    );
  }

  let audioB64: string | undefined;
  let mime = "audio/webm";
  try {
    const body = await req.json();
    audioB64 = body.audio;
    if (typeof body.mime === "string" && body.mime) mime = body.mime;
  } catch {
    return json({ error: "Expected JSON { audio: base64, mime }", transcription_failed: true }, 400);
  }
  if (!audioB64) {
    return json({ error: "No audio provided", transcription_failed: true }, 400);
  }

  // Decode base64 → bytes
  let bytes: Uint8Array;
  try {
    const binary = atob(audioB64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch {
    return json({ error: "Invalid base64 audio", transcription_failed: true }, 400);
  }

  // Call HF, retrying while the model cold-starts (503 with estimated_time).
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await fetch(HF_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": mime,
          "x-wait-for-model": "true",
        },
        body: bytes,
      });

      if (resp.status === 503 && attempt < maxAttempts) {
        const info = await resp.json().catch(() => ({} as any));
        const wait = Math.min(Number(info.estimated_time) || 8, 20);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }

      if (!resp.ok) {
        const detail = await resp.text().catch(() => "");
        return json(
          { error: `Whisper API ${resp.status}: ${detail.slice(0, 300)}`, transcription_failed: true },
          502,
        );
      }

      const data = await resp.json().catch(() => ({} as any));
      const transcript = typeof data.text === "string" ? data.text.trim() : "";
      return json({ transcript, model: HF_MODEL });
    } catch (e) {
      if (attempt >= maxAttempts) {
        return json({ error: `Request failed: ${String(e)}`, transcription_failed: true }, 500);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return json({ error: "Model is still loading — please retry.", transcription_failed: true }, 503);
});
