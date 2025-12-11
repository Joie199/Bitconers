-- ============================================
-- VERIFY ALL MIGRATIONS - Run this in Supabase SQL Editor
-- ============================================
-- This script checks which migrations have been applied to your database
-- Run this to see what still needs to be done

-- ============================================
-- 1. CHECK: password_hash column in profiles
-- ============================================
SELECT 
  '1. password_hash column' as migration,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'password_hash'
    ) 
    THEN '✅ APPLIED'
    ELSE '❌ NOT APPLIED - Run: add-password-hash-migration.sql'
  END as status;

-- ============================================
-- 2. CHECK: reset_token and reset_token_expiry columns in profiles
-- ============================================
SELECT 
  '2. Password reset columns' as migration,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'reset_token'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'reset_token_expiry'
    )
    THEN '✅ APPLIED'
    ELSE '❌ NOT APPLIED - Run: add-password-reset-columns.sql'
  END as status;

-- ============================================
-- 3. CHECK: cohort_id column in events table
-- ============================================
SELECT 
  '3. cohort_id column in events' as migration,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'cohort_id'
    ) 
    THEN '✅ APPLIED'
    ELSE '❌ NOT APPLIED - Run: add-cohort-id-to-events.sql'
  END as status;

-- ============================================
-- 4. CHECK: Unique constraint on students.profile_id
-- ============================================
SELECT 
  '4. Unique constraint on students.profile_id' as migration,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'students'
        AND kcu.column_name = 'profile_id'
        AND tc.constraint_type = 'UNIQUE'
    ) 
    THEN '✅ APPLIED'
    ELSE '❌ NOT APPLIED - Run: add-unique-constraint-students.sql'
  END as status;

-- ============================================
-- 5. CHECK: Data consistency (enrolled students have records)
-- ============================================
-- This checks if the data migration is needed
SELECT 
  '5. Enrolled students data consistency' as migration,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM (
        SELECT DISTINCT student_id FROM cohort_enrollment
        UNION
        SELECT id FROM profiles WHERE cohort_id IS NOT NULL
      ) enrolled
      LEFT JOIN students s ON enrolled.student_id = s.profile_id
      WHERE s.id IS NULL
    ) = 0
    THEN '✅ APPLIED (All enrolled students have records)'
    ELSE '⚠️ NEEDS RUNNING - Some enrolled students missing records. Run: ensure-enrolled-students-have-records.sql'
  END as status;

-- ============================================
-- SUMMARY: All migrations status
-- ============================================
SELECT 
  '--- SUMMARY ---' as migration,
  'Check results above' as status;

-- ============================================
-- DETAILED CHECK: Show what's missing
-- ============================================
SELECT 
  '--- DETAILED INFO ---' as info,
  'See details below' as status;

-- Show missing password_hash
SELECT 
  'Profiles without password_hash' as check_type,
  COUNT(*) as count
FROM profiles
WHERE password_hash IS NULL;

-- Show events table structure
SELECT 
  'Events table columns' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- Show students constraints
SELECT 
  'Students table constraints' as check_type,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'students'
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.column_name;

-- Show enrolled students missing records
SELECT 
  'Enrolled students missing student records' as check_type,
  COUNT(*) as count
FROM (
  SELECT DISTINCT student_id FROM cohort_enrollment
  UNION
  SELECT id FROM profiles WHERE cohort_id IS NOT NULL
) enrolled
LEFT JOIN students s ON enrolled.student_id = s.profile_id
WHERE s.id IS NULL;



