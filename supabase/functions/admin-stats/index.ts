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
    const { data: profile } = await userClient.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return json({ error: "Admin role required" }, 403);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: sessions } = await admin
      .from("assessment_sessions")
      .select("status, overall_score, overall_cefr_level, created_at");
    const { count: totalUsers } = await admin.from("profiles").select("*", { count: "exact", head: true });
    const { count: assessors } = await admin
      .from("profiles").select("*", { count: "exact", head: true }).eq("role", "assessor");
    const { count: reviews } = await admin.from("assessor_reviews").select("*", { count: "exact", head: true });

    const all = sessions ?? [];
    const total = all.length;
    const completed = all.filter((s: any) => s.status === "completed").length;
    const scored = all.filter((s: any) => typeof s.overall_score === "number" && s.overall_score > 0);
    const avg = scored.length ? scored.reduce((a: number, s: any) => a + s.overall_score, 0) / scored.length : 0;
    const today = new Date().toISOString().slice(0, 10);
    const activeToday = all.filter((s: any) => (s.created_at || "").slice(0, 10) === today).length;
    const cefr: Record<string, number> = {};
    for (const s of all) {
      if (s.overall_cefr_level) cefr[s.overall_cefr_level] = (cefr[s.overall_cefr_level] || 0) + 1;
    }

    return json({
      stats: {
        total_sessions: total,
        completed_sessions: completed,
        completion_rate: total ? Math.round((completed / total) * 100) : 0,
        average_score: Math.round(avg * 100) / 100,
        total_users: totalUsers || 0,
        assessors: assessors || 0,
        reviews: reviews || 0,
        active_today: activeToday,
        cefr_distribution: cefr,
      },
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
