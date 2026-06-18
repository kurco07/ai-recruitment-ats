CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_application_id ON stage_history(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
