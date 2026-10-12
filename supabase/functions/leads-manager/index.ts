import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();

// Find the first column whose header matches any of the given needles.
function pickCol(headers: string[], needles: string[], exclude: string[] = []): number {
  for (let i = 0; i < headers.length; i++) {
    const h = norm(headers[i]);
    if (!h) continue;
    if (exclude.some((e) => h.includes(e))) continue;
    if (needles.some((n) => h.includes(n))) return i;
  }
  return -1;
}

function pickCols(headers: string[], needles: string[], exclude: string[] = []): number[] {
  const out: number[] = [];
  for (let i = 0; i < headers.length; i++) {
    const h = norm(headers[i]);
    if (!h) continue;
    if (exclude.some((e) => h.includes(e))) continue;
    if (needles.some((n) => h.includes(n))) out.push(i);
  }
  return out;
}

// Sales-agent lead import. Parses an uploaded xlsx/csv (base64) with flexible
// column matching and bulk-inserts the caller's leads. Agent/admin only; writes
// use the service role with agent_id pinned to the caller so RLS still scopes
// each agent to their own leads.
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
    if (!profile || !["agent", "admin"].includes(profile.role)) {
      return json({ error: "Sales Agent or admin role required" }, 403);
    }

    const { base64 } = await req.json();
    if (!base64 || typeof base64 !== "string") return json({ error: "base64 file content required" }, 400);

    // Decode base64 → bytes → workbook.
    const bin = atob(base64.includes(",") ? base64.split(",")[1] : base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const wb = XLSX.read(bytes, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, blankrows: false, defval: "" });
    if (!matrix.length) return json({ error: "The sheet appears to be empty" }, 400);

    const headers = (matrix[0] as unknown[]).map((h) => String(h ?? ""));
    const nameC = pickCol(headers, ["name"], ["user", "nation"]);
    const phoneCs = pickCols(headers, ["phone", "mobile", "whats", "tel", "number", "contact"]);
    const natC = pickCol(headers, ["nation", "country"]);
    const notesC = pickCol(headers, ["note", "comment", "remark"]);
    const sourceC = pickCol(headers, ["source", "channel", "campaign", "origin"]);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Tenant org: caller's own, else the single default org (Upedia).
    let orgId: string | null = profile.organization_id ?? null;
    if (!orgId) {
      const { data: firstOrg } = await admin.from("organizations").select("id").limit(1).maybeSingle();
      orgId = firstOrg?.id ?? null;
    }

    // Existing phones for this agent — skip duplicates on re-upload.
    const { data: existing } = await admin.from("leads").select("phone").eq("agent_id", user.id);
    const seen = new Set((existing ?? []).map((r: any) => String(r.phone ?? "").replace(/\D/g, "")).filter(Boolean));

    const at = (row: unknown[], i: number) => (i >= 0 ? String(row[i] ?? "").trim() : "");
    const toInsert: any[] = [];
    let skipped = 0;
    for (let r = 1; r < matrix.length; r++) {
      const row = matrix[r] as unknown[];
      if (!row || row.every((c) => String(c ?? "").trim() === "")) continue;
      const name = at(row, nameC);
      const phone = phoneCs.length ? at(row, phoneCs[0]) : "";
      const phone2 = phoneCs.length > 1 ? at(row, phoneCs[1]) : "";
      if (!name && !phone) { skipped++; continue; }
      const phoneKey = phone.replace(/\D/g, "");
      if (phoneKey && seen.has(phoneKey)) { skipped++; continue; }
      if (phoneKey) seen.add(phoneKey);
      toInsert.push({
        agent_id: user.id,
        organization_id: orgId,
        name: name || null,
        phone: phone || null,
        phone2: phone2 || null,
        nationality: at(row, natC) || null,
        notes: at(row, notesC) || null,
        source: at(row, sourceC) || "import",
        status: "new",
        token: crypto.randomUUID(),
        raw: headers.reduce((acc: Record<string, unknown>, h, i) => {
          if (h) acc[h] = row[i] ?? null;
          return acc;
        }, {}),
      });
    }

    if (!toInsert.length) return json({ inserted: 0, skipped, message: "No new leads found to import." });

    const { data: inserted, error } = await admin.from("leads").insert(toInsert).select("id");
    if (error) return json({ error: error.message }, 500);
    return json({ inserted: inserted?.length ?? 0, skipped });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
