-- AI Recruitment Platform — Schema inicial (Proyecto 2)
-- Ejecutar en Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('recruiter', 'hiring_manager', 'admin', 'candidate');
CREATE TYPE pipeline_stage AS ENUM (
  'applied', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected'
);
CREATE TYPE job_status AS ENUM ('draft', 'open', 'closed');

-- Perfiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'candidate',
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vacantes
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  department TEXT,
  seniority_level TEXT,
  status job_status NOT NULL DEFAULT 'draft',
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Candidatos
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  cv_url TEXT,
  cv_text TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  experience_years NUMERIC,
  seniority TEXT,
  ai_summary TEXT,
  ai_classification JSONB,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  ai_risk_level TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aplicaciones (matching vacante-candidato)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  stage pipeline_stage NOT NULL DEFAULT 'applied',
  score NUMERIC,
  ranking_position INTEGER,
  match_percentage NUMERIC,
  ai_next_step TEXT,
  ai_analysis JSONB,
  approved_by UUID REFERENCES profiles(id),
  stage_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Entrevistas
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  interviewer_id UUID REFERENCES profiles(id),
  meeting_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auditoría IA (observabilidad + tokens)
CREATE TABLE IF NOT EXISTS ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  model_version TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Historial de etapas
CREATE TABLE IF NOT EXISTS stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_stage pipeline_stage,
  to_stage pipeline_stage NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  auto_moved BOOLEAN NOT NULL DEFAULT FALSE,
  n8n_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_score ON applications(score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_ai_audit_entity ON ai_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- Trigger: crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidate')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: updated_at en jobs
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('recruiter', 'hiring_manager', 'admin'))
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Jobs policies
CREATE POLICY "Anyone authenticated can view open jobs" ON jobs FOR SELECT USING (
  status = 'open' OR recruiter_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('hiring_manager', 'admin'))
);
CREATE POLICY "Recruiters can manage jobs" ON jobs FOR ALL USING (
  recruiter_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'recruiter'))
);

-- Candidates policies
CREATE POLICY "Staff can manage candidates" ON candidates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('recruiter', 'hiring_manager', 'admin'))
);
CREATE POLICY "Candidates can view own record" ON candidates FOR SELECT USING (
  email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Applications policies
CREATE POLICY "Staff can manage applications" ON applications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('recruiter', 'hiring_manager', 'admin'))
);
CREATE POLICY "Candidates can view own applications" ON applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidates c
    JOIN profiles p ON p.email = c.email
    WHERE c.id = applications.candidate_id AND p.id = auth.uid()
  )
);
CREATE POLICY "Candidates can create applications" ON applications FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM candidates c
    JOIN profiles p ON p.email = c.email
    WHERE c.id = candidate_id AND p.id = auth.uid()
  )
);

-- Interviews policies
CREATE POLICY "Staff can manage interviews" ON interviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('recruiter', 'hiring_manager', 'admin'))
);

-- AI audit policies
CREATE POLICY "Staff can view ai logs" ON ai_audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('recruiter', 'hiring_manager', 'admin'))
);

-- Stage history policies
CREATE POLICY "Staff can view stage history" ON stage_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('recruiter', 'hiring_manager', 'admin'))
);
CREATE POLICY "Staff can insert stage history" ON stage_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('recruiter', 'hiring_manager', 'admin'))
);

-- Storage bucket para CVs (ejecutar aparte si es necesario)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', false);
