-- Add preferred_language column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS preferred_language TEXT;

COMMENT ON COLUMN students.preferred_language IS 'Preferred language of the student (copied from application on approval)';
