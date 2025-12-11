-- Verify All Database Relationships and Columns
-- Run this to check if all relationships and columns are properly set up

-- ============================================
-- 1. CHECK EVENTS TABLE COLUMNS
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- ============================================
-- 2. CHECK ALL FOREIGN KEY RELATIONSHIPS
-- ============================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('profiles', 'cohort_enrollment', 'students', 'events', 'sats_rewards', 'achievements')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 3. CHECK UNIQUE CONSTRAINTS
-- ============================================
SELECT
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('profiles', 'students', 'cohort_enrollment')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 4. VERIFY EVENTS TABLE HAS cohort_id
-- ============================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name = 'cohort_id'
    ) 
    THEN '✅ cohort_id column EXISTS in events table'
    ELSE '❌ cohort_id column MISSING in events table'
  END as events_cohort_id_status;

-- ============================================
-- 5. VERIFY STUDENTS TABLE HAS UNIQUE CONSTRAINT
-- ============================================
SELECT 
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
    THEN '✅ UNIQUE constraint EXISTS on students.profile_id'
    ELSE '❌ UNIQUE constraint MISSING on students.profile_id'
  END as students_unique_status;

-- ============================================
-- 6. VERIFY ALL KEY RELATIONSHIPS
-- ============================================
SELECT 
  'profiles.cohort_id → cohorts.id' as relationship,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'profiles' AND kcu.column_name = 'cohort_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'cohort_enrollment.cohort_id → cohorts.id',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'cohort_enrollment' AND kcu.column_name = 'cohort_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  'cohort_enrollment.student_id → profiles.id',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'cohort_enrollment' AND kcu.column_name = 'student_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  'students.profile_id → profiles.id',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'students' AND kcu.column_name = 'profile_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  'events.cohort_id → cohorts.id',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'events' AND kcu.column_name = 'cohort_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END;



