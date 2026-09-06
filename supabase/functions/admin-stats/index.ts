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

// Admin-only live metrics for the /admin dashboard. Verifies the caller is an
// admin via their JWT, then reads aggregate data with the service role.
// Reports only real, count-based metrics + CEFR distribution — no derived
// "average score" percentage (that number is not a meaningful placement metric).
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: profile } = await userClient.from("profiles").select("role, organization_id").eq("id", user.id).single();
    if (profile?.role !== "admin") return json({ error: "Admin role required" }, 403);
    // Org-admins (a profile carrying an organization_id) see ONLY their org's
    // numbers; platform admins (organization_id NULL) see everything.
    const orgId: string | null = (profile as any)?.organization_id ?? null;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    let sessionsQ = admin.from("assessment_sessions").select("status, overall_cefr_level, created_at");
    if (orgId) sessionsQ = sessionsQ.eq("organization_id", orgId);
    const { data: sessions } = await sessionsQ;

    let usersQ = admin.from("profiles").select("*", { count: "exact", head: true });
    if (orgId) usersQ = usersQ.eq("organization_id", orgId);
    const { count: totalUsers } = await usersQ;

    let assessorsQ = admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "assessor");
    if (orgId) assessorsQ = assessorsQ.eq("organization_id", orgId);
    const { count: assessors } = await assessorsQ;

    let learnersQ = admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "learner");
    if (orgId) learnersQ = learnersQ.eq("organization_id", orgId);
    const { count: learners } = await learnersQ;

    let reviewsQ = admin.from("assessor_reviews").select("*", { count: "exact", head: true });
    if (orgId) reviewsQ = reviewsQ.eq("organization_id", orgId);
    const { count: reviews } = await reviewsQ;

    // Active prompts are the shared question bank (global) — same count for everyone.
    const { count: activePrompts } = await admin
      .from("prompts").select("*", { count: "exact", head: true }).eq("is_active", true);

    const all = sessions ?? [];
    const byStatus = (s: string) => all.filter((r: any) => r.status === s).length;
    const reviewed = all.filter((r: any) => r.status === "approved" || r.status === "rejected").length;
    const today = new Date().toISOString().slice(0, 10);
    const activeToday = all.filter((r: any) => (r.created_at || "").slice(0, 10) === today).length;
    const cefr: Record<string, number> = {};
    for (const s of all) {
      const lvl = (s as any).overall_cefr_level;
      if (lvl) cefr[lvl] = (cefr[lvl] || 0) + 1;
    }

    return json({
      stats: {
        total_sessions: all.length,
        in_progress: byStatus("in_progress"),
        awaiting_review: byStatus("completed"),
        under_review: byStatus("under_review"),
        reviewed,
        total_users: totalUsers || 0,
        learners: learners || 0,
        assessors: assessors || 0,
        reviews: reviews || 0,
        active_prompts: activePrompts || 0,
        active_today: activeToday,
        cefr_distribution: cefr,
      },
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
