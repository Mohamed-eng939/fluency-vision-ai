-- Lets the sales-agent panel show which tester a lead's completed test is
-- assigned to. Agents cannot read assessor profiles directly (RLS), so this
-- SECURITY DEFINER function returns ONLY the assigned tester's display name,
-- scoped to the caller's own leads (or any lead, for admins).
CREATE OR REPLACE FUNCTION public.agent_lead_assessors()
RETURNS TABLE (lead_id uuid, assessor_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.id, ap.full_name
  FROM leads l
  JOIN assessment_sessions s ON s.id = l.session_id
  JOIN profiles ap ON ap.id = s.assigned_assessor
  WHERE l.agent_id = auth.uid()
     OR EXISTS (SELECT 1 FROM profiles me WHERE me.id = auth.uid() AND me.role = 'admin');
$$;

REVOKE ALL ON FUNCTION public.agent_lead_assessors() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.agent_lead_assessors() TO authenticated;
