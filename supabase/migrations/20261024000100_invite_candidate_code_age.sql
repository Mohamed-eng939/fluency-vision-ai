-- Applied 2026-10-24 to rrslhxigqtfllunmowcy.
-- Partner-API create body now identifies a candidate by `code` and may include
-- an optional `age`. Store both on the invite so the embedded test can skip the
-- age question when the organization already knows the candidate's age.
ALTER TABLE public.assessment_invites
  ADD COLUMN IF NOT EXISTS candidate_code text,
  ADD COLUMN IF NOT EXISTS candidate_age  int;

COMMENT ON COLUMN public.assessment_invites.candidate_code IS
  'Partner''s own student code (identifier). Alias of external_id for result lookup.';
COMMENT ON COLUMN public.assessment_invites.candidate_age IS
  'Optional candidate age supplied by the partner; when set, the test skips the age page and picks the track from it.';
