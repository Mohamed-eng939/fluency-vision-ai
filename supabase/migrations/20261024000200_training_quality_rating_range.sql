-- Applied 2026-10-24 to rrslhxigqtfllunmowcy.
-- The review flow stores the human CEFR level in training_data.quality_rating as
-- a CEFR ordinal via cefrToNumber() = indexOf(['Pre-A1','A1','A2','B1','B2','C1','C2'])
-- → 0..6. The old CHECK required 1..5, so any response graded Pre-A1 (0) or C2 (6)
-- made the whole batch insert fail — silently — leaving training_data empty.
-- Align the constraint with the CEFR ordinal range (and keep NULL allowed).
ALTER TABLE public.training_data
  DROP CONSTRAINT IF EXISTS training_data_quality_rating_check;
ALTER TABLE public.training_data
  ADD CONSTRAINT training_data_quality_rating_check
  CHECK (quality_rating IS NULL OR (quality_rating >= 0 AND quality_rating <= 6));
