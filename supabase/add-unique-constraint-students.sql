-- Add unique constraint to ensure one student record per profile
-- This ensures data integrity: each profile can only have one student record

-- Check if constraint already exists
DO $$
BEGIN
    -- Add unique constraint on students.profile_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'students_profile_id_key'
    ) THEN
        ALTER TABLE students 
        ADD CONSTRAINT students_profile_id_key UNIQUE (profile_id);
        
        RAISE NOTICE 'Unique constraint added to students.profile_id';
    ELSE
        RAISE NOTICE 'Unique constraint already exists on students.profile_id';
    END IF;
END $$;

-- Verify the constraint was added
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

