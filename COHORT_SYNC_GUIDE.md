# Cohort Sync Guide - Updating Students Table from Cohort Enrollment

## Overview
The `cohort_enrollment` table is the **source of truth** for student enrollments. The `students.cohort_id` column should be synced from `cohort_enrollment` to ensure consistency.

## Database Structure

### Source of Truth
- **`cohort_enrollment` table** - Contains the actual enrollment records
  - `cohort_id` - The cohort the student is enrolled in
  - `student_id` - References `profiles.id`
  - `enrolled_at` - When the enrollment was created

### Synced Column
- **`students.cohort_id`** - Should match the cohort from `cohort_enrollment`
  - Updated from `cohort_enrollment` table
  - Used for quick lookups and display

## Migration

### Run the Migration
```sql
-- Run: supabase/update-students-cohort-from-enrollment.sql
```

This migration will:
1. ✅ Ensure `cohort_id` column exists in `students` table
2. ✅ Update `students.cohort_id` from `cohort_enrollment` records
3. ✅ Handle multiple enrollments (uses most recent)
4. ✅ Sync all existing records

## How It Works

### Relationship
```
cohort_enrollment.student_id → profiles.id
students.profile_id → profiles.id
```

So to update: `students.profile_id = cohort_enrollment.student_id`

### Update Logic
1. For each student record, find matching enrollment in `cohort_enrollment`
2. Update `students.cohort_id` with `cohort_enrollment.cohort_id`
3. If multiple enrollments exist, use the most recent one (by `enrolled_at`)

## API Implementation

The Student Database API (`/api/admin/students/progress`) now:
- ✅ Fetches cohort from `cohort_enrollment` first (source of truth)
- ✅ Falls back to `students.cohort_id` if no enrollment record exists
- ✅ Displays the correct cohort in the admin dashboard

## Keeping Data in Sync

### Automatic Sync
The `students.cohort_id` is updated:
- ✅ When application is approved (via approve API)
- ✅ When student is enrolled (via enroll API)
- ✅ When migration is run

### Manual Sync
If you need to sync manually, run:
```sql
UPDATE students s
SET cohort_id = ce.cohort_id
FROM cohort_enrollment ce
WHERE s.profile_id = ce.student_id
  AND (s.cohort_id IS NULL OR s.cohort_id != ce.cohort_id);
```

## Best Practices

1. **Always use `cohort_enrollment` as source of truth** when checking enrollments
2. **Keep `students.cohort_id` synced** for quick lookups
3. **Run the migration** after any bulk enrollment changes
4. **The API prioritizes `cohort_enrollment`** over `students.cohort_id`

## Verification

To verify the sync worked:
```sql
-- Check students with mismatched cohort
SELECT 
  s.id,
  s.profile_id,
  s.cohort_id as students_cohort,
  ce.cohort_id as enrollment_cohort,
  ce.enrolled_at
FROM students s
LEFT JOIN cohort_enrollment ce ON s.profile_id = ce.student_id
WHERE s.cohort_id IS DISTINCT FROM ce.cohort_id
  AND ce.cohort_id IS NOT NULL;
```

All records should show matching cohort IDs after running the migration.
