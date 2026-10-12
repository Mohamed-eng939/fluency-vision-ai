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

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SKILLS: [string, string][] = [
  ["listening", "Listening"],
  ["reading", "Reading"],
  ["speaking", "Speaking"],
  ["vocabulary", "Vocabulary"],
  ["grammar", "Grammar"],
];

// Build a simple, email-safe HTML rendering of the performance report.
function reportHtml(r: any, brandName: string): string {
  const h = r.header || {};
  const skills = SKILLS.filter(([k]) => r.skills?.[k])
    .map(([k, label]) => `<p><strong>${label}:</strong> ${esc(r.skills[k])}</p>`).join("");
  const items = Array.isArray(r.items) && r.items.length
    ? `<h3>${esc(r.itemsLabel || "Objectives")}</h3><ul>${r.items.map((it: string) => `<li>${esc(it)}</li>`).join("")}</ul>`
    : "";
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0f172a">
    <h2 style="text-align:center">${esc(brandName)} — Performance Report</h2>
    <p style="text-align:right;color:#64748b;font-size:12px">Date: ${esc(h.date)}</p>
    <table style="width:100%;font-size:14px"><tr>
      <td>Name: ${esc(h.name)}</td><td>Age: ${esc(h.age)}</td></tr><tr>
      <td>Nationality: ${esc(h.nationality)}</td><td>Program: ${esc(h.track)}</td></tr><tr>
      <td>Residency: ${esc(h.residency)}</td><td>Suggested Level: ${esc(r.levelCode)}</td></tr><tr>
      <td>Occupation: ${esc(h.occupation)}</td><td>Suggested Band: ${esc(r.band)}</td></tr>
    </table>
    <h3>Goals</h3><p>${esc(r.goals)}</p>
    <h3>Feedback</h3><p>${esc(r.feedback)}</p>
    ${skills ? `<h3>Current Skills</h3>${skills}` : ""}
    ${items}
    <h3>Other Programs</h3><p>${esc(r.otherPrograms)}</p>
    <p style="margin-top:24px">Signature: _______________________</p>
  </div>`;
}

// Student-facing report fetch + email. Authorizes the caller against the
// session: the student owner, a tester/admin in the org (or the assigned
// tester), the platform admin, or the sales agent whose lead points at this
// session. All reads use the service role after the check passes.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser(jwt);
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: profile } = await userClient
      .from("profiles").select("role, organization_id").eq("id", user.id).single();

    const { action, session_id } = await req.json();
    if (!session_id) return json({ error: "session_id required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { data: session } = await admin
      .from("assessment_sessions")
      .select("id, user_id, organization_id, assigned_assessor, overall_cefr_level, program, program_subtrack, upedia_level, student_info, profiles:user_id(full_name, email)")
      .eq("id", session_id)
      .single();
    if (!session) return json({ error: "Session not found" }, 404);

    const role = profile?.role;
    const org = (profile as any)?.organization_id ?? null;
    let authorized =
      session.user_id === user.id ||
      (role === "admin" && (org === null || org === session.organization_id)) ||
      (role === "assessor" && (session.assigned_assessor === user.id || (org && org === session.organization_id)));
    if (!authorized && role === "agent") {
      const { data: lead } = await admin
        .from("leads").select("id").eq("session_id", session_id).eq("agent_id", user.id).maybeSingle();
      authorized = !!lead;
    }
    if (!authorized) return json({ error: "You do not have access to this report" }, 403);

    const { data: review } = await admin
      .from("assessor_reviews")
      .select("report, review_status, reviewed_at")
      .eq("session_id", session_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const report = review?.report ?? null;
    const profileRel = (session as any).profiles;
    const studentInfo = (session as any).student_info || {};
    const studentName = profileRel?.full_name || studentInfo?.name || "Student";
    const studentEmail = profileRel?.email || studentInfo?.email || null;

    if (action === "get") {
      return json({
        report,
        review_status: review?.review_status ?? null,
        reviewed_at: review?.reviewed_at ?? null,
        session: {
          overall_cefr_level: session.overall_cefr_level,
          program: session.program,
          program_subtrack: session.program_subtrack,
          upedia_level: session.upedia_level,
          student_name: studentName,
          student_email: studentEmail,
        },
      });
    }

    if (action === "email") {
      if (!report) return json({ error: "No report has been produced for this session yet" }, 400);
      if (!studentEmail) return json({ error: "No email address on file for this student" }, 400);
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (!RESEND_API_KEY) {
        return json({
          error: "Email is not configured yet. Add a RESEND_API_KEY secret (and a verified sender, RESEND_FROM) in Supabase to enable sending.",
        }, 501);
      }
      const brandName = "Upedia";
      const from = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";
      const html = `<p>Dear ${esc(studentName)},</p><p>Here is your ${esc(brandName)} placement result and performance report.</p>${reportHtml(report, brandName)}`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [studentEmail],
          subject: `Your ${brandName} Placement Report`,
          html,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return json({ error: body?.message || "Email provider error", details: body }, 502);
      return json({ success: true, id: body?.id, to: studentEmail });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
