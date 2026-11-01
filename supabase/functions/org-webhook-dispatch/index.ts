import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Drains public.webhook_deliveries: signs each pending payload and POSTs it to
// the org's webhook_url, with exponential-backoff retries. Runs on a schedule
// (pg_cron → pg_net) and/or on demand. Internal-only: guarded by a shared
// DISPATCH_SECRET header. Deploy with verify_jwt = false.
const MAX_ATTEMPTS = 6;
const BATCH = 20;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-dispatch-secret",
};

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const expected = Deno.env.get("DISPATCH_SECRET");
  if (expected && req.headers.get("x-dispatch-secret") !== expected) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: rows } = await admin
    .from("webhook_deliveries")
    .select("id, organization_id, event, event_id, payload, target_url, attempts")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(BATCH);

  let delivered = 0, failed = 0;
  for (const d of rows ?? []) {
    const { data: org } = await admin
      .from("organizations").select("webhook_secret").eq("id", d.organization_id).single();

    const ts = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify({ ...d.payload, event_id: d.event_id });
    const sig = org?.webhook_secret ? await hmacHex(org.webhook_secret, `${ts}.${body}`) : "";

    try {
      const res = await fetch(d.target_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Upedia-Event": d.event,
          "X-Upedia-Event-Id": d.event_id,
          "X-Upedia-Timestamp": ts,
          "X-Upedia-Signature": sig,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await admin.from("webhook_deliveries").update({
        status: "delivered", attempts: d.attempts + 1,
        last_status: res.status, delivered_at: new Date().toISOString(),
      }).eq("id", d.id);
      delivered++;
    } catch (e) {
      const attempts = d.attempts + 1;
      const backoffMin = Math.min(60, Math.pow(2, attempts)); // 2,4,8,… capped at 60 min
      await admin.from("webhook_deliveries").update({
        status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
        attempts, last_error: String(e),
        next_attempt_at: new Date(Date.now() + backoffMin * 60000).toISOString(),
      }).eq("id", d.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({ scanned: rows?.length ?? 0, delivered, failed }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
