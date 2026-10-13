-- Applied 2026-10-13 to rrslhxigqtfllunmowcy. Global-admin storage/database
-- consumption for the /admin dashboard. Reads the database size and the total
-- size of the audio bucket (storage.objects). SECURITY DEFINER so it can read
-- pg catalog + the storage schema; not exposed to anon/authenticated (only the
-- admin-stats edge function calls it with the service role).
CREATE OR REPLACE FUNCTION public.platform_usage()
  RETURNS jsonb
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO public, storage
AS $$
  SELECT jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'storage_bytes', COALESCE((SELECT sum((metadata->>'size')::bigint) FROM storage.objects), 0),
    'storage_objects', (SELECT count(*) FROM storage.objects),
    'sessions', (SELECT count(*) FROM public.assessment_sessions),
    'responses_with_audio', (SELECT count(*) FROM public.assessment_responses WHERE audio_url IS NOT NULL)
  );
$$;
REVOKE ALL ON FUNCTION public.platform_usage() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.platform_usage() TO service_role;
