-- Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'assessor', 'learner');
CREATE TYPE public.assessment_status AS ENUM ('in_progress', 'completed', 'under_review', 'approved', 'rejected');
CREATE TYPE public.cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE public.prompt_type AS ENUM ('speaking', 'read_aloud', 'conversation');

-- Organizations table for multi-tenancy
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  api_key UUID DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  username TEXT UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  country_of_citizenship TEXT,
  country_of_residence TEXT,
  first_language TEXT,
  target_language TEXT DEFAULT 'English',
  current_cefr_level public.cefr_level,
  test_reason TEXT,
  role public.user_role DEFAULT 'learner',
  is_active BOOLEAN DEFAULT true,
  last_assessment_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prompts library
CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  type public.prompt_type NOT NULL,
  cefr_level public.cefr_level NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  instructions TEXT,
  expected_duration INTEGER, -- in seconds
  audio_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assessment sessions
CREATE TABLE public.assessment_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  session_type TEXT DEFAULT 'full_assessment',
  status public.assessment_status DEFAULT 'in_progress',
  overall_cefr_level public.cefr_level,
  overall_score DECIMAL(4,2),
  fluency_score DECIMAL(4,2),
  pronunciation_score DECIMAL(4,2),
  grammar_score DECIMAL(4,2),
  vocabulary_score DECIMAL(4,2),
  coherence_score DECIMAL(4,2),
  student_info JSONB,
  metadata JSONB DEFAULT '{}',
  assigned_assessor UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  has_score_override BOOLEAN DEFAULT false,
  override_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual assessment responses
CREATE TABLE public.assessment_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id),
  organization_id UUID REFERENCES public.organizations(id),
  prompt_order INTEGER NOT NULL,
  user_response TEXT,
  transcript TEXT,
  audio_url TEXT,
  audio_duration DECIMAL(10,2),
  cefr_level public.cefr_level,
  overall_score DECIMAL(4,2),
  fluency_score DECIMAL(4,2),
  pronunciation_score DECIMAL(4,2),
  grammar_score DECIMAL(4,2),
  vocabulary_score DECIMAL(4,2),
  coherence_score DECIMAL(4,2),
  detailed_feedback JSONB,
  mistakes_analysis JSONB,
  is_final BOOLEAN DEFAULT false,
  processing_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assessor reviews and overrides
CREATE TABLE public.assessor_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id),
  assessor_id UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  review_status TEXT DEFAULT 'pending',
  override_scores JSONB,
  assessor_feedback TEXT,
  recommendation TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API keys for external integrations
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  key_name TEXT NOT NULL,
  api_key UUID DEFAULT gen_random_uuid(),
  permissions JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training data accumulation
CREATE TABLE public.training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID REFERENCES public.assessment_responses(id),
  organization_id UUID REFERENCES public.organizations(id),
  prompt_text TEXT,
  user_response TEXT,
  transcript TEXT,
  scores JSONB,
  assessor_feedback TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_data ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_organization()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_assessor()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role IN ('admin', 'assessor') FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.same_organization(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p1.organization_id = p2.organization_id
  FROM public.profiles p1, public.profiles p2
  WHERE p1.id = auth.uid() AND p2.id = _user_id
  AND p1.organization_id IS NOT NULL;
$$;

-- RLS Policies for Organizations
CREATE POLICY "Admins can view all organizations" ON public.organizations
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING (id = public.get_current_user_organization());

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Assessors can view same organization profiles" ON public.profiles
  FOR SELECT USING (
    public.get_current_user_role() = 'assessor' 
    AND organization_id = public.get_current_user_organization()
  );

-- RLS Policies for Prompts
CREATE POLICY "Users can view active prompts" ON public.prompts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all prompts" ON public.prompts
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for Assessment Sessions
CREATE POLICY "Users can view their own sessions" ON public.assessment_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Assessors can view assigned sessions" ON public.assessment_sessions
  FOR SELECT USING (
    assigned_assessor = auth.uid() 
    OR (public.get_current_user_role() = 'assessor' 
        AND organization_id = public.get_current_user_organization())
  );

CREATE POLICY "Admins can view all sessions" ON public.assessment_sessions
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for Assessment Responses
CREATE POLICY "Users can access their responses" ON public.assessment_responses
  FOR ALL USING (
    session_id IN (
      SELECT id FROM public.assessment_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Assessors can view organization responses" ON public.assessment_responses
  FOR SELECT USING (
    public.is_admin_or_assessor() 
    AND organization_id = public.get_current_user_organization()
  );

-- RLS Policies for Assessor Reviews
CREATE POLICY "Assessors can manage their reviews" ON public.assessor_reviews
  FOR ALL USING (assessor_id = auth.uid());

CREATE POLICY "Admins can view all reviews" ON public.assessor_reviews
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for API Keys
CREATE POLICY "Admins can manage api keys" ON public.api_keys
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for Training Data
CREATE POLICY "Admins can manage training data" ON public.training_data
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create indexes for performance
CREATE INDEX idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_sessions_user_id ON public.assessment_sessions(user_id);
CREATE INDEX idx_sessions_status ON public.assessment_sessions(status);
CREATE INDEX idx_sessions_assessor ON public.assessment_sessions(assigned_assessor);
CREATE INDEX idx_responses_session ON public.assessment_responses(session_id);
CREATE INDEX idx_responses_prompt ON public.assessment_responses(prompt_id);
CREATE INDEX idx_reviews_session ON public.assessor_reviews(session_id);
CREATE INDEX idx_reviews_assessor ON public.assessor_reviews(assessor_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON public.prompts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.assessment_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON public.assessment_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.assessor_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'learner'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();