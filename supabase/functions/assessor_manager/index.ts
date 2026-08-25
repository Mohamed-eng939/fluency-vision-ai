import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// DEPRECATED / RETIRED.
// This underscore-named function was an unauthenticated duplicate of the
// canonical `assessor-manager` (hyphen, verify_jwt=true). It has been retired
// to remove the duplication and close the unauthenticated access hole.
// All callers use `assessor-manager`. This stub only returns 410 Gone.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return new Response(
    JSON.stringify({
      error: "Gone",
      message: "assessor_manager has been retired. Use assessor-manager instead.",
    }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
