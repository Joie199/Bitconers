-- Migration: Ensure all enrolled students have records in students table
-- This script ensures data consistency:
-- 1. Creates student records for enrolled profiles missing them
-- 2. Ensures cohort_id in profiles matches cohort_enrollment
-- 3. Creates cohort_enrollment records for profiles with cohort_id but no enrollment

-- Step 1: Create student records for profiles enrolled in cohorts (via cohort_enrollment)
INSERT INTO students (profile_id, progress_percent, assignments_completed, projects_completed, live_sessions_attended)
SELECT DISTINCT ce.student_id, 0, 0, 0, 0
FROM cohort_enrollment ce
LEFT JOIN students s ON ce.student_id = s.profile_id
WHERE s.id IS NULL
ON CONFLICT (profile_id) DO NOTHING;

-- Step 2: Create student records for profiles with cohort_id set but no student record
INSERT INTO students (profile_id, progress_percent, assignments_completed, projects_completed, live_sessions_attended)
SELECT DISTINCT p.id, 0, 0, 0, 0
FROM profiles p
LEFT JOIN students s ON p.id = s.profile_id
WHERE p.cohort_id IS NOT NULL
  AND s.id IS NULL
ON CONFLICT (profile_id) DO NOTHING;

-- Step 3: Create cohort_enrollment records for profiles with cohort_id but no enrollment record
INSERT INTO cohort_enrollment (cohort_id, student_id)
SELECT DISTINCT p.cohort_id, p.id
FROM profiles p
LEFT JOIN cohort_enrollment ce ON p.id = ce.student_id AND p.cohort_id = ce.cohort_id
WHERE p.cohort_id IS NOT NULL
  AND ce.id IS NULL
ON CONFLICT (cohort_id, student_id) DO NOTHING;

-- Verify the results
SELECT 
  COUNT(*) as total_enrolled,
  COUNT(s.id) as with_student_records,
  COUNT(*) - COUNT(s.id) as missing_student_records
FROM (
  SELECT DISTINCT student_id FROM cohort_enrollment
  UNION
  SELECT id FROM profiles WHERE cohort_id IS NOT NULL
) enrolled
LEFT JOIN students s ON enrolled.student_id = s.profile_id;

