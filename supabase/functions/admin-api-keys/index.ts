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

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function genKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const body = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `lsk_live_${body}`;
}

// Admin-only API-key management for the SaaS path. Keys are stored HASHED
// (sha-256) with a display prefix; the plaintext is returned exactly once at
// creation and never stored. Enforcement on scoring endpoints is a later step.
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
    if (profile?.role !== "admin") return json({ error: "Admin role required" }, 403);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "list") {
      let query = admin
        .from("api_keys")
        .select("id, key_name, key_prefix, is_active, created_at, last_used_at, expires_at, usage_count, organization_id")
        .order("created_at", { ascending: false });
      if (body.organization_id) query = query.eq("organization_id", body.organization_id);
      const { data, error } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ keys: data ?? [] });
    }

    if (action === "create") {
      const name = String(body.name ?? "").trim();
      if (!name) return json({ error: "A key name is required" }, 400);

      // Use the given organization, else fall back to a shared default org.
      let org: { id: string } | null = null;
      if (body.organization_id) {
        org = { id: body.organization_id };
      } else {
        const { data: existingOrg } = await admin.from("organizations").select("id").limit(1).maybeSingle();
        if (existingOrg) {
          org = existingOrg;
        } else {
          const { data: newOrg, error: orgErr } = await admin
            .from("organizations").insert({ name: "Default Organization" }).select("id").single();
          if (orgErr) return json({ error: `Could not create default org: ${orgErr.message}` }, 500);
          org = newOrg;
        }
      }

      const secret = genKey();
      const key_hash = await sha256Hex(secret);
      const key_prefix = secret.slice(0, 16);
      const { data: inserted, error } = await admin
        .from("api_keys")
        .insert({
          organization_id: org!.id,
          key_name: name,
          key_hash,
          key_prefix,
          created_by: user.id,
          is_active: true,
        })
        .select("id, key_name, key_prefix, is_active, created_at")
        .single();
      if (error) return json({ error: error.message }, 500);
      // Return the plaintext ONCE.
      return json({ key: inserted, secret });
    }

    if (action === "revoke") {
      const id = body.id;
      if (!id) return json({ error: "id required" }, 400);
      const { error } = await admin.from("api_keys").update({ is_active: false }).eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
