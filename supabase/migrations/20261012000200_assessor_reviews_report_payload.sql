-- Applied 2026-10-12 to rrslhxigqtfllunmowcy. The student-facing performance
-- report (header + goals + feedback + snapshotted level skills/items + band +
-- other-programs) assembled by the tester at review time. Stored as a snapshot
-- so a student's report never changes if the level ladder is edited later.
ALTER TABLE public.assessor_reviews ADD COLUMN IF NOT EXISTS report jsonb;
