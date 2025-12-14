-- Add preferred_language column to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS preferred_language TEXT;

COMMENT ON COLUMN applications.preferred_language IS 'Preferred language of the applicant (e.g., english, tigrigna)';
