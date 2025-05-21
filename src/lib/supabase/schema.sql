
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table to store extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  phone TEXT,
  citizenship_country TEXT,
  residence_country TEXT,
  date_of_birth DATE,
  first_language TEXT,
  test_reason TEXT,
  other_reason TEXT,
  estimated_level TEXT,
  preferred_contact TEXT,
  pronunciation_preference TEXT,
  promo_code TEXT,
  data_consent BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'learner',
  institution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create assessments table for tracking assessment sessions
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quick', 'full')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  email_results BOOLEAN DEFAULT FALSE
);

-- Create prompts table for assessment prompts
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  category TEXT,
  type TEXT NOT NULL DEFAULT 'speaking',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create audio_recordings table to store links to audio files
CREATE TABLE IF NOT EXISTS audio_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id),
  storage_path TEXT NOT NULL,
  duration NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create prompt_responses table to track user responses to prompts
CREATE TABLE IF NOT EXISTS prompt_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id),
  audio_recording_id UUID REFERENCES audio_recordings(id) ON DELETE SET NULL,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create assessment_results table for scores and feedback
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  cefr_level TEXT NOT NULL,
  total_score NUMERIC NOT NULL,
  fluency_score NUMERIC,
  grammar_score NUMERIC,
  pronunciation_score NUMERIC,
  vocabulary_score NUMERIC,
  detailed_feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create review_log table for assessor feedback and overrides
CREATE TABLE IF NOT EXISTS review_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  assessor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_cefr_level TEXT,
  override_cefr_level TEXT,
  override_reason TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create api_keys table for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  institution TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  active BOOLEAN DEFAULT TRUE
);

-- Create training_data table to accumulate feedback for ML improvement
CREATE TABLE IF NOT EXISTS training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_response_id UUID REFERENCES prompt_responses(id) ON DELETE CASCADE,
  audio_path TEXT,
  transcript TEXT,
  system_cefr_level TEXT,
  human_cefr_level TEXT,
  feature_vector JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    CASE 
      WHEN NEW.email = 'mohamed.tarek4115@gmail.com' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Assessors can view student profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'assessor')
    AND
    (role = 'learner')
  );

-- Create policies for assessments table
CREATE POLICY "Users can view their own assessments"
  ON assessments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own assessments"
  ON assessments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all assessments"
  ON assessments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Assessors can view student assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'assessor')
  );

-- Create policies for audio_recordings table
CREATE POLICY "Users can view their own audio recordings"
  ON audio_recordings FOR SELECT
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own audio recordings"
  ON audio_recordings FOR INSERT
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all audio recordings"
  ON audio_recordings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Assessors can view student audio recordings"
  ON audio_recordings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'assessor')
  );

-- Create policies for assessment_results table
CREATE POLICY "Users can view their own assessment results"
  ON assessment_results FOR SELECT
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view and modify all assessment results"
  ON assessment_results FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Assessors can view student assessment results"
  ON assessment_results FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'assessor')
  );

CREATE POLICY "Assessors can update student assessment results"
  ON assessment_results FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'assessor')
  );

-- Create policies for review_log table
CREATE POLICY "Assessors can insert reviews"
  ON review_log FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'assessor')
    AND
    assessor_id = auth.uid()
  );

CREATE POLICY "Admin can view all reviews"
  ON review_log FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Assessors can view their own reviews"
  ON review_log FOR SELECT
  USING (assessor_id = auth.uid());

CREATE POLICY "Users can view reviews for their assessments"
  ON review_log FOR SELECT
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

-- Create policies for prompt_responses table
CREATE POLICY "Users can view their own prompt responses"
  ON prompt_responses FOR SELECT
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own prompt responses"
  ON prompt_responses FOR INSERT
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all prompt responses"
  ON prompt_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Assessors can view student prompt responses"
  ON prompt_responses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'assessor')
  );

-- Create policies for prompts table
CREATE POLICY "All users can view active prompts"
  ON prompts FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage prompts"
  ON prompts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

