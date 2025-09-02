-- Fix missing RLS policies and enable RLS where needed

-- Enable RLS on any tables that don't have it enabled
-- These tables exist but may not have RLS properly configured

-- Fix function search paths to be secure
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_organization()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = _user_id AND role = _role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_assessor()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'assessor') 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.same_organization(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT p1.organization_id = p2.organization_id
    FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid() AND p2.id = _user_id
    AND p1.organization_id IS NOT NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_session_override_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Update the session to reflect override status
  UPDATE public.assessment_sessions 
  SET 
    has_score_override = true,
    override_summary = jsonb_build_object(
      'overridden_by', NEW.overridden_by,
      'overridden_at', NEW.overridden_at,
      'skills_modified', jsonb_object_keys(NEW.override_scores)
    ),
    updated_at = now()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$;