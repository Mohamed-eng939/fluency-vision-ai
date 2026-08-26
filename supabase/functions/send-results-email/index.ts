import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Assessor/admin-only: email a reviewed result to the student. The recipient
// address is resolved server-side from the session (never trusted from the
// client). Body is the message the assessor composed (already "Dear {name}…");
// no signature is added. Sends via Resend.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: profile } = await userClient.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "assessor") {
      return json({ error: "Assessor or admin role required" }, 403);
    }

    const { session_id, subject, message } = await req.json();
    if (!session_id || !message) return json({ error: "session_id and message are required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: session } = await admin
      .from("assessment_sessions")
      .select("id, student_info, profiles:user_id(full_name, email)")
      .eq("id", session_id)
      .single();
    if (!session) return json({ error: "Session not found" }, 404);

    const profileRel = (session as any).profiles;
    const studentInfo = (session as any).student_info || {};
    const to = profileRel?.email || studentInfo?.email || null;
    if (!to) return json({ error: "No email address on file for this student" }, 400);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return json({
        error: "Email is not configured yet. Add a RESEND_API_KEY secret (and a verified sender, RESEND_FROM) in Supabase to enable sending.",
      }, 501);
    }
    const from = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";
    const html = esc(String(message)).replace(/\n/g, "<br>");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: subject || "Your English Placement Assessment Results",
        html,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({ error: body?.message || "Email provider error", details: body }, 502);
    }
    return json({ success: true, id: body?.id, to });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
