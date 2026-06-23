-- 1. Add user_id column to candidates
ALTER TABLE candidates ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Backfill: link existing candidates to their auth users via email match
UPDATE candidates c
SET user_id = p.id
FROM profiles p
WHERE c.email = p.email AND c.user_id IS NULL;

-- 3. Index for fast lookups
CREATE INDEX idx_candidates_user_id ON candidates(user_id);

-- 4. Rewrite RLS policies to use user_id instead of email join
DROP POLICY IF EXISTS "Candidates can view own record" ON candidates;
CREATE POLICY "Candidates can view own record" ON candidates
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can view own applications" ON applications;
CREATE POLICY "Candidates can view own applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM candidates c
      WHERE c.id = applications.candidate_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Candidates can create applications" ON applications;
CREATE POLICY "Candidates can create applications" ON applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates c
      WHERE c.id = candidate_id AND c.user_id = auth.uid()
    )
  );
