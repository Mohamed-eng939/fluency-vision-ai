import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Types that should also send an email (in addition to the in-app bell).
// 'backlog' (global-admin alerts) is intentionally in-app only — no email spam.
const EMAIL_TYPES = new Set([
  "test_assigned",
  "lead_test_submitted",
  "lead_reviewed",
  "lead_account_created",
]);

// Fan a notification row out to email. Called (fire-and-forget) by the
// notifications insert trigger via pg_net. Public endpoint guarded by an
// optional shared secret (enforced only if NOTIFY_SECRET is set on the
// function). Inert — returns ok without sending — until a Resend key is
// configured, so wiring it up never errors.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { notification_id, secret } = await req.json().catch(() => ({}));
    const expected = Deno.env.get("NOTIFY_SECRET");
    if (expected && secret !== expected) return json({ error: "Forbidden" }, 403);
    if (!notification_id) return json({ error: "notification_id required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { data: n } = await admin
      .from("notifications")
      .select("id, user_id, type, title, body")
      .eq("id", notification_id)
      .maybeSingle();
    if (!n) return json({ error: "Notification not found" }, 404);
    if (!EMAIL_TYPES.has(n.type)) return json({ ok: true, skipped: "not an email type" });

    // Resolve the recipient's email (profile first, then auth).
    let to: string | null = null;
    const { data: prof } = await admin.from("profiles").select("email").eq("id", n.user_id).maybeSingle();
    to = prof?.email ?? null;
    if (!to) {
      try {
        const { data: au } = await admin.auth.admin.getUserById(n.user_id);
        to = au?.user?.email ?? null;
      } catch (_) { /* ignore */ }
    }
    if (!to) return json({ ok: true, skipped: "no recipient email" });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) return json({ ok: true, skipped: "email not configured" });
    const from = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";
    const brand = "Upedia";
    const html =
      `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a">` +
      `<h2 style="color:#0A2463">${esc(n.title || brand)}</h2>` +
      `<p>${esc(n.body || "")}</p>` +
      `<p style="color:#64748b;font-size:12px">— ${esc(brand)}</p></div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: n.title || `${brand} notification`, html }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return json({ error: body?.message || "Email provider error" }, 502);
    return json({ ok: true, id: body?.id, to });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
