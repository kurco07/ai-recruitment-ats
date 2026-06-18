ALTER TABLE applications ADD COLUMN IF NOT EXISTS salary_offered NUMERIC;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE stage_history ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE stage_history ADD COLUMN IF NOT EXISTS rejection_type TEXT;
