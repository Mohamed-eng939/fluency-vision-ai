-- Applied 2026-10-12 to rrslhxigqtfllunmowcy. Additive foundation for the
-- Upedia placement build: sales-agent role, program-levels reference, leads,
-- notifications, and assignment/placement fields on sessions.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'agent';

CREATE TABLE IF NOT EXISTS public.program_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program text NOT NULL, subtrack text, stage text,
  level_code text NOT NULL, order_index int NOT NULL DEFAULT 0, cefr_band text,
  skills jsonb NOT NULL DEFAULT '{}'::jsonb, items_label text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb, is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
ALTER TABLE public.program_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "program_levels read (authenticated)" ON public.program_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "program_levels manage (platform admin)" ON public.program_levels FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  agent_id uuid REFERENCES public.profiles(id),
  name text, phone text, phone2 text, nationality text, notes text, source text,
  status text NOT NULL DEFAULT 'new', token text UNIQUE,
  student_user_id uuid REFERENCES public.profiles(id),
  session_id uuid REFERENCES public.assessment_sessions(id), raw jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE INDEX IF NOT EXISTS leads_agent_idx ON public.leads(agent_id);
CREATE INDEX IF NOT EXISTS leads_org_idx ON public.leads(organization_id);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads platform admin" ON public.leads FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "leads org admin" ON public.leads FOR ALL USING (get_current_user_role()='admin' AND organization_id=get_current_user_organization()) WITH CHECK (get_current_user_role()='admin' AND organization_id=get_current_user_organization());
CREATE POLICY "leads own agent" ON public.leads FOR ALL USING (agent_id=auth.uid()) WITH CHECK (agent_id=auth.uid());

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL, title text, body text, data jsonb,
  read_at timestamptz, created_at timestamptz DEFAULT now());
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications read own" ON public.notifications FOR SELECT USING (user_id=auth.uid());
CREATE POLICY "notifications update own" ON public.notifications FOR UPDATE USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY "notifications platform admin" ON public.notifications FOR ALL USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS assigned_at timestamptz;
ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS program text;
ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS program_subtrack text;
ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS upedia_level text;
