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

// Sales-agent lead links. The per-lead `token` is an unguessable bearer
// capability, so this endpoint is intentionally public (verify_jwt = false):
//   action "resolve" — look up a lead by token and return minimal prefill
//     (name / phone) for the student's sign-up form. No PII beyond that.
//   action "claim"   — the now-signed-in student attaches their account to the
//     lead (student_user_id + status 'account_created'). Requires a valid JWT.
// All writes use the service role; the token (and, for claim, the JWT) are the
// authorization.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { action, token } = await req.json();
    if (!token || typeof token !== "string") return json({ ok: false, error: "token required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { data: lead } = await admin
      .from("leads")
      .select("id, name, phone, status, student_user_id, organization_id")
      .eq("token", token)
      .maybeSingle();
    if (!lead) return json({ ok: false, error: "This link is not valid." }, 404);

    if (action === "resolve") {
      return json({ ok: true, lead: { name: lead.name ?? "", phone: lead.phone ?? "" } });
    }

    if (action === "claim") {
      const authHeader = req.headers.get("Authorization") ?? "";
      const jwt = authHeader.replace("Bearer ", "");
      if (!jwt) return json({ ok: false, error: "Sign in first" }, 401);
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user } } = await userClient.auth.getUser(jwt);
      if (!user) return json({ ok: false, error: "Sign in first" }, 401);

      // Attach the student to the lead (first claim wins; don't override a
      // different already-claimed student).
      if (lead.student_user_id && lead.student_user_id !== user.id) {
        return json({ ok: true, already: true });
      }
      const nextStatus =
        lead.status === "new" || lead.status === "link_sent" ? "account_created" : lead.status;
      await admin
        .from("leads")
        .update({ student_user_id: user.id, status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", lead.id);
      return json({ ok: true });
    }

    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
