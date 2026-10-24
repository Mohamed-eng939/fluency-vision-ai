import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Partner-facing SaaS API (API-key authenticated, NOT a Supabase JWT). A partner's
// backend calls this to mint a one-time branded assessment link for a candidate,
// and later to poll the reviewed result. Metered against the org's quota.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // --- API-key authentication -> organization ---
    const authHeader = req.headers.get("Authorization") || "";
    const apiKey = req.headers.get("x-api-key") || (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "");
    if (!apiKey) return json({ error: "Missing API key. Send it as 'Authorization: Bearer <key>' or 'x-api-key'." }, 401);

    const keyHash = await sha256Hex(apiKey);
    const { data: keyRow } = await admin
      .from("api_keys")
      .select("id, organization_id, is_active, expires_at, usage_count")
      .eq("key_hash", keyHash)
      .maybeSingle();
    if (!keyRow || !keyRow.is_active) return json({ error: "Invalid or revoked API key" }, 401);
    if (keyRow.expires_at && new Date(keyRow.expires_at) < new Date()) return json({ error: "API key expired" }, 401);

    const { data: org } = await admin
      .from("organizations")
      .select("id, name, branding, status, assessment_quota, assessments_used")
      .eq("id", keyRow.organization_id)
      .single();
    if (!org) return json({ error: "Organization not found" }, 404);
    if (org.status === "suspended") return json({ error: "This organization is suspended." }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "create") {
      if (org.assessment_quota > 0 && org.assessments_used >= org.assessment_quota) {
        return json({ error: "Assessment quota exceeded for this plan." }, 402);
      }
      const candidate = body.candidate || {};
      // A candidate is identified by `code` (the partner's own student code).
      // `external_id` stays as a backward-compatible alias — either one works for
      // the later `result` lookup. `code` and `name` are the only required fields.
      const code = candidate.code ?? candidate.external_id ?? body.external_id ?? null;
      const name = candidate.name ?? null;
      if (!code || !name) {
        return json({ error: "candidate.code and candidate.name are required." }, 400);
      }
      // Optional age: when the partner sends it, the test skips the age question
      // and uses this age to pick the track (kids / teens / adults). When it is
      // omitted, the candidate is asked for their age at the start of the test.
      const ageNum = Number(candidate.age);
      const candidate_age = Number.isFinite(ageNum) && ageNum > 0 ? Math.floor(ageNum) : null;

      const token = randomToken();
      const expiresInHours = Number(body.expires_in_hours) > 0 ? Number(body.expires_in_hours) : 168; // default 7 days
      const expires_at = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();

      const { data: invite, error } = await admin
        .from("assessment_invites")
        .insert({
          organization_id: org.id,
          token,
          external_id: candidate.external_id ?? code,
          candidate_code: code,
          candidate_name: name,
          candidate_email: candidate.email ?? null,
          candidate_age,
          test_type: body.test_type || "speaking",
          webhook_url: body.webhook_url ?? null,
          redirect_url: body.redirect_url ?? null,
          expires_at,
          created_by: keyRow.id,
        })
        .select("token, external_id, candidate_code, candidate_age, expires_at, status")
        .single();
      if (error) return json({ error: error.message }, 500);

      // Meter usage (issued link = consumed assessment).
      await admin.from("organizations").update({ assessments_used: (org.assessments_used || 0) + 1 }).eq("id", org.id);
      await admin.from("api_keys").update({ usage_count: (keyRow.usage_count || 0) + 1, last_used_at: new Date().toISOString() }).eq("id", keyRow.id);

      const base = Deno.env.get("APP_URL") || "https://english-placement-test.lovable.app";
      return json({
        // Full-page link (shows a welcome card, then the test).
        link: `${base}/t/${token}`,
        // Chromeless, login-free link for embedding in an <iframe> inside the
        // partner's own app (the candidate is already signed in there).
        embed_link: `${base}/embed/${token}`,
        token: invite.token,
        code: invite.candidate_code,
        external_id: invite.external_id,
        age: invite.candidate_age,
        status: invite.status,
        expires_at: invite.expires_at,
      });
    }

    if (action === "result") {
      const { external_id, token, code } = body;
      const ref = external_id ?? code ?? null;
      if (!ref && !token) return json({ error: "Provide code (or external_id) or token" }, 400);
      // Look up the invite safely (no string interpolation into filters): by token,
      // else by external_id, falling back to candidate_code.
      const base = () => admin.from("assessment_invites").select("*").eq("organization_id", org.id).order("created_at", { ascending: false }).limit(1);
      let invite: any = null;
      if (token) {
        ({ data: invite } = await base().eq("token", token).maybeSingle());
      } else {
        ({ data: invite } = await base().eq("external_id", ref).maybeSingle());
        if (!invite) ({ data: invite } = await base().eq("candidate_code", ref).maybeSingle());
      }
      if (!invite) return json({ error: "No invite found for that reference" }, 404);

      if (!invite.session_id) {
        return json({ external_id: invite.external_id, status: invite.status }); // issued / opened
      }
      const { data: session } = await admin
        .from("assessment_sessions")
        .select("id, status, overall_cefr_level, overall_score, program, program_subtrack, upedia_level, reviewed_at")
        .eq("id", invite.session_id)
        .single();
      const finalized = session && (session.status === "approved" || session.status === "rejected");
      if (!finalized) {
        return json({ external_id: invite.external_id, status: "in_review" });
      }
      const { data: reviews } = await admin
        .from("assessor_reviews")
        .select("review_status, assessor_feedback, recommendation, override_scores")
        .eq("session_id", session.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const review = reviews?.[0];
      const os = (review?.override_scores as any) || {};
      return json({
        external_id: invite.external_id,
        status: "completed",
        // Echo who this result belongs to so the partner can match it to their
        // own student record by `code` (or `external_id`).
        candidate: {
          name: invite.candidate_name ?? null,
          code: invite.candidate_code ?? invite.external_id ?? null,
          external_id: invite.external_id ?? null,
          age: invite.candidate_age ?? null,
        },
        result: {
          // Human-reviewed CEFR level (falls back to the assessor's final level).
          cefr: session.overall_cefr_level || os.final_cefr_level || null,
          overall_score: session.overall_score ?? null,
          criteria: {
            grammar: os.grammar_cefr ?? null,
            fluency: os.fluency_cefr ?? null,
            vocabulary: os.vocabulary_cefr ?? null,
          },
          // Upedia program placement decided by the assessor at review time —
          // this is what Upedia enrols the student into.
          upedia: {
            program: session.program ?? null,
            subtrack: session.program_subtrack ?? null,
            level: session.upedia_level ?? null,
          },
          decision: review?.review_status ?? session.status ?? null,
          is_overridden: os.is_overridden ?? null,
          feedback: review?.assessor_feedback ?? null,
          recommendation: review?.recommendation ?? null,
          reviewed_at: session.reviewed_at ?? null,
        },
      });
    }

    return json({ error: "Unknown action. Use 'create' or 'result'." }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
