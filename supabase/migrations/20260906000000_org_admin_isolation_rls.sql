-- Org-admin isolation (two-tier admin model).
--   Platform admin     = role 'admin' AND organization_id IS NULL  -> manages ALL tenants
--   Organization admin = role 'admin' AND organization_id = <org>  -> scoped to own org only
-- No-op for existing users (all have organization_id NULL -> platform admins).
-- Applied to project rrslhxigqtfllunmowcy on 2026-09-06.

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_current_user_role() = 'admin'
     AND public.get_current_user_organization() IS NULL;
$$;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM anon, authenticated;

-- ---------- assessment_sessions ----------
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.assessment_sessions;
CREATE POLICY "Platform admins manage all sessions" ON public.assessment_sessions
  FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Org admins manage org sessions" ON public.assessment_sessions
  FOR ALL
  USING (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization())
  WITH CHECK (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization());

-- ---------- assessor_reviews ----------
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.assessor_reviews;
CREATE POLICY "Platform admins manage all reviews" ON public.assessor_reviews
  FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Org admins manage org reviews" ON public.assessor_reviews
  FOR ALL
  USING (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization())
  WITH CHECK (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization());

-- ---------- profiles ----------
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Platform admins view all profiles" ON public.profiles
  FOR SELECT USING (public.is_platform_admin());
CREATE POLICY "Org admins view org profiles" ON public.profiles
  FOR SELECT USING (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization());

-- ---------- organizations (create/update/delete: platform only; own-org view kept) ----------
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can view all organizations" ON public.organizations;
CREATE POLICY "Platform admins manage organizations" ON public.organizations
  FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
-- (existing "Users can view their organization" already lets an org-admin read their own org row)

-- ---------- assessment_invites ----------
DROP POLICY IF EXISTS "Admins manage invites" ON public.assessment_invites;
CREATE POLICY "Platform admins manage all invites" ON public.assessment_invites
  FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Org admins manage org invites" ON public.assessment_invites
  FOR ALL
  USING (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization())
  WITH CHECK (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization());

-- ---------- prompts (shared active bank stays viewable; management scoped) ----------
DROP POLICY IF EXISTS "Admins can manage all prompts" ON public.prompts;
CREATE POLICY "Platform admins manage all prompts" ON public.prompts
  FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Org admins manage org prompts" ON public.prompts
  FOR ALL
  USING (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization())
  WITH CHECK (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization());

-- ---------- training_data ----------
DROP POLICY IF EXISTS "Admins can manage training data" ON public.training_data;
CREATE POLICY "Platform admins manage all training data" ON public.training_data
  FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Org admins manage org training data" ON public.training_data
  FOR ALL
  USING (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization())
  WITH CHECK (get_current_user_role() = 'admin' AND organization_id = get_current_user_organization());

-- ---------- api_keys (sensitive: platform-only via PostgREST; org-admins manage via edge fn) ----------
DROP POLICY IF EXISTS "Admins can manage api keys" ON public.api_keys;
CREATE POLICY "Platform admins manage all api keys" ON public.api_keys
  FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
