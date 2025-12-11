-- Verify Database Connections and Relationships
-- Run this to check if all foreign keys and relationships are properly set up

-- 1. Check if foreign key constraints exist
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
    AND tc.table_name IN ('profiles', 'cohort_enrollment', 'students', 'cohorts')
ORDER BY tc.table_name, kcu.column_name;

-- 2. Check if unique constraint exists on students.profile_id
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'students'
    AND kcu.column_name = 'profile_id';

-- 3. Check if unique constraint exists on cohort_enrollment (cohort_id, student_id)
SELECT
    tc.constraint_name,
    tc.table_name,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'cohort_enrollment'
GROUP BY tc.constraint_name, tc.table_name;

-- 4. Verify data consistency: Check enrolled students
SELECT 
    p.id as profile_id,
    p.email,
    p.cohort_id as profile_cohort_id,
    c.name as cohort_name,
    ce.id as enrollment_id,
    ce.cohort_id as enrollment_cohort_id,
    s.id as student_record_id,
    CASE 
        WHEN p.cohort_id IS NOT NULL AND ce.id IS NULL THEN '❌ Missing enrollment record'
        WHEN p.cohort_id IS NOT NULL AND s.id IS NULL THEN '❌ Missing student record'
        WHEN ce.id IS NOT NULL AND s.id IS NULL THEN '❌ Missing student record'
        WHEN ce.id IS NOT NULL AND p.cohort_id IS NULL THEN '❌ Missing profile cohort_id'
        WHEN p.cohort_id IS NOT NULL AND ce.cohort_id IS NOT NULL AND p.cohort_id != ce.cohort_id THEN '❌ Mismatched cohort_id'
        ELSE '✅ OK'
    END as status
FROM profiles p
LEFT JOIN cohorts c ON p.cohort_id = c.id
LEFT JOIN cohort_enrollment ce ON p.id = ce.student_id
LEFT JOIN students s ON p.id = s.profile_id
WHERE p.cohort_id IS NOT NULL OR ce.id IS NOT NULL
ORDER BY status, p.email;

