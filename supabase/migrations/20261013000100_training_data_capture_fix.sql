-- Applied 2026-10-13 to rrslhxigqtfllunmowcy. THE ML FLYWHEEL FIX.
-- training_data had RLS enabled with only admin policies, so the tester's
-- review flow (which runs as role 'assessor') was silently blocked from
-- inserting the human-vs-system labels — the table stayed empty despite reviews.
-- This lets Testers APPEND training rows (the learning signal) while still NOT
-- granting them read access (no SELECT policy for assessors — the dataset stays
-- admin/service-role only, protecting PII).
CREATE POLICY "Assessors can insert training data"
  ON public.training_data
  FOR INSERT
  WITH CHECK (public.is_admin_or_assessor());

-- Model-readiness metrics for the global-admin dashboard: how many labelled
-- examples exist, how often the human overrode the system (the valuable signal),
-- and human↔system agreement. SECURITY DEFINER; surfaced only through the
-- admin-stats edge function (service role), never to clients.
CREATE OR REPLACE FUNCTION public.ml_readiness()
  RETURNS jsonb
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO public
AS $$
  SELECT jsonb_build_object(
    'rows', (SELECT count(*) FROM public.training_data),
    'tests', (SELECT count(DISTINCT ar.session_id)
                FROM public.training_data td
                JOIN public.assessment_responses ar ON ar.id = td.response_id),
    'comparable', (SELECT count(*) FROM public.training_data
                     WHERE scores->>'system_cefr' IS NOT NULL AND scores->>'human_cefr' IS NOT NULL),
    'agree', (SELECT count(*) FROM public.training_data
                WHERE scores->>'system_cefr' IS NOT NULL
                  AND scores->>'system_cefr' = scores->>'human_cefr'),
    'overridden', (SELECT count(*) FROM public.training_data WHERE scores->>'is_overridden' = 'true'),
    -- LLM rubric-rater (rubric-rater edge fn) vs human agreement — the dial that
    -- tracks how close the AI second opinion is to the tester's decision.
    'llm_comparable', (SELECT count(*) FROM public.training_data
                         WHERE scores->>'llm_cefr' IS NOT NULL AND scores->>'human_cefr' IS NOT NULL),
    'llm_agree', (SELECT count(*) FROM public.training_data
                    WHERE scores->>'llm_cefr' IS NOT NULL
                      AND scores->>'llm_cefr' = scores->>'human_cefr')
  );
$$;
REVOKE ALL ON FUNCTION public.ml_readiness() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ml_readiness() TO service_role;
