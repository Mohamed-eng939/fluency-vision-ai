import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Candidate-facing helper for the /t/:token landing (public; no login). Resolves
// an invite token to the tenant's branding + the candidate's details, and links
// the finished session back to the invite so the partner can retrieve the result.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "resolve") {
      const { token } = body;
      if (!token) return json({ error: "token required" }, 400);
      const { data: invite } = await admin
        .from("assessment_invites")
        .select("id, organization_id, candidate_name, candidate_email, test_type, status, expires_at, redirect_url")
        .eq("token", token)
        .maybeSingle();
      if (!invite) return json({ valid: false, reason: "not_found" });
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return json({ valid: false, reason: "expired" });
      }
      const { data: org } = await admin
        .from("organizations")
        .select("id, name, branding, status")
        .eq("id", invite.organization_id)
        .single();
      if (org?.status === "suspended") return json({ valid: false, reason: "suspended" });

      if (invite.status === "issued") {
        await admin.from("assessment_invites").update({ status: "opened", updated_at: new Date().toISOString() }).eq("id", invite.id);
      }
      return json({
        valid: true,
        already_completed: invite.status === "completed",
        organization: { id: org?.id, name: org?.name, branding: org?.branding || {} },
        candidate: { name: invite.candidate_name, email: invite.candidate_email },
        test_type: invite.test_type,
        redirect_url: invite.redirect_url,
      });
    }

    if (action === "link") {
      const { token, session_id } = body;
      if (!token || !session_id) return json({ error: "token and session_id required" }, 400);
      const { data: invite } = await admin
        .from("assessment_invites")
        .select("id, organization_id, external_id")
        .eq("token", token)
        .maybeSingle();
      if (!invite) return json({ error: "Invite not found" }, 404);

      await admin.from("assessment_invites")
        .update({ session_id, status: "completed", updated_at: new Date().toISOString() })
        .eq("id", invite.id);
      // Tag the session with the tenant so it appears under the right org.
      await admin.from("assessment_sessions")
        .update({ organization_id: invite.organization_id })
        .eq("id", session_id);
      return json({ ok: true });
    }

    return json({ error: "Unknown action. Use 'resolve' or 'link'." }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
