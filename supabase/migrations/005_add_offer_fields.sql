ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_counter_amount NUMERIC;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_counter_position TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_counter_start_date TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_counter_notes TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_status TEXT DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS candidate_signed_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_pdf_url TEXT;

CREATE POLICY "Candidates can accept own offers" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM candidates c WHERE c.id = candidate_id AND c.user_id = auth.uid())
);
