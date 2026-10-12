-- Applied 2026-10-12 to rrslhxigqtfllunmowcy. Trigger functions never need to be
-- callable over the REST/RPC API; revoke the default public EXECUTE grant so the
-- SECURITY DEFINER trigger functions added in this build are not exposed as
-- /rpc/ endpoints. Revoking EXECUTE does NOT affect trigger firing (triggers run
-- as the table owner regardless of role EXECUTE privileges).
REVOKE EXECUTE ON FUNCTION public.auto_assign_tester() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lead_sync_on_session() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notifications_dispatch_email() FROM anon, authenticated;
