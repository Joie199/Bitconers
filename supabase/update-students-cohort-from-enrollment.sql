-- Update students.cohort_id from cohort_enrollment table
-- This ensures students table reflects the actual enrollment status from cohort_enrollment
-- cohort_enrollment is the source of truth for student enrollments

-- First, ensure cohort_id column exists in students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;

-- Update students.cohort_id based on cohort_enrollment
-- Join: students.profile_id = cohort_enrollment.student_id
-- This syncs the cohort_id in students table with the enrollment records
UPDATE students s
SET cohort_id = ce.cohort_id
FROM cohort_enrollment ce
WHERE s.profile_id = ce.student_id
  AND (s.cohort_id IS NULL OR s.cohort_id != ce.cohort_id);

-- If a student is enrolled in multiple cohorts, use the most recent enrollment
-- (This handles edge cases where a student might be in multiple cohorts)
UPDATE students s
SET cohort_id = (
  SELECT ce.cohort_id
  FROM cohort_enrollment ce
  WHERE ce.student_id = s.profile_id
  ORDER BY ce.enrolled_at DESC
  LIMIT 1
)
WHERE s.profile_id IN (
  SELECT student_id
  FROM cohort_enrollment
)
AND s.cohort_id IS NULL;

-- Update comment to clarify that cohort_enrollment is the source of truth
COMMENT ON COLUMN students.cohort_id IS 'Enrolled cohort - synced from cohort_enrollment table (cohort_enrollment is source of truth)';

-- Create a function to automatically sync students.cohort_id when cohort_enrollment changes
CREATE OR REPLACE FUNCTION sync_student_cohort()
RETURNS TRIGGER AS $$
BEGIN
  -- Update students.cohort_id when enrollment is created or updated
  UPDATE students
  SET cohort_id = NEW.cohort_id
  WHERE profile_id = NEW.student_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync on cohort_enrollment insert/update
DROP TRIGGER IF EXISTS trigger_sync_student_cohort ON cohort_enrollment;
CREATE TRIGGER trigger_sync_student_cohort
  AFTER INSERT OR UPDATE ON cohort_enrollment
  FOR EACH ROW
  EXECUTE FUNCTION sync_student_cohort();

-- Also sync when enrollment is deleted (set to NULL)
CREATE OR REPLACE FUNCTION sync_student_cohort_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if student has any other enrollments
  IF NOT EXISTS (
    SELECT 1 FROM cohort_enrollment 
    WHERE student_id = OLD.student_id
  ) THEN
    -- No more enrollments, set cohort_id to NULL
    UPDATE students
    SET cohort_id = NULL
    WHERE profile_id = OLD.student_id;
  ELSE
    -- Has other enrollments, use the most recent one
    UPDATE students
    SET cohort_id = (
      SELECT cohort_id
      FROM cohort_enrollment
      WHERE student_id = OLD.student_id
      ORDER BY enrolled_at DESC
      LIMIT 1
    )
    WHERE profile_id = OLD.student_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync on cohort_enrollment delete
DROP TRIGGER IF EXISTS trigger_sync_student_cohort_on_delete ON cohort_enrollment;
CREATE TRIGGER trigger_sync_student_cohort_on_delete
  AFTER DELETE ON cohort_enrollment
  FOR EACH ROW
  EXECUTE FUNCTION sync_student_cohort_on_delete();
