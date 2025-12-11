# Student Enrollment Guide

## Overview

When students are enrolled in cohorts, they **must** have a corresponding record in the `students` table. This guide explains how the enrollment system ensures this.

## Enrollment Flow - Three Required Components

When a student is enrolled in a cohort, **three things must happen**:

1. **`profiles.cohort_id`** → Set to the cohort's ID (reflects which cohort the student is in)
2. **`cohort_enrollment`** → Record created (many-to-many relationship)
3. **`students` table** → Record created (for academic progress tracking)

### 1. **During Enrollment** (`/api/students/enroll`)

When enrolling a student in a cohort, the system automatically does all three:
- ✅ **Step 1:** Sets `cohort_id` in `profiles` table (reflects which cohort the student is in)
- ✅ **Step 2:** Creates record in `cohort_enrollment` table (many-to-many relationship)
- ✅ **Step 3:** Creates student record in `students` table (if it doesn't exist)
- ✅ Updates the profile status to "Active"

**The enrollment API ensures all three are set correctly!**

**Usage:**
```typescript
POST /api/students/enroll
{
  "profileId": "uuid",  // or use "email" instead
  "email": "student@example.com",
  "cohortId": "uuid"  // The cohort ID the student is enrolling in
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student enrolled successfully",
  "details": {
    "profileId": "uuid",
    "cohortId": "uuid",
    "cohortName": "Cohort 1",
    "studentId": "uuid",
    "profileCohortIdSet": true,  // Confirms cohort_id was set in profiles
    "enrollmentRecordCreated": true,  // True if new enrollment was created
    "studentRecordExists": false  // True if student record already existed
  }
}
```

### 2. **When Fetching User Data** (`/api/profile/user-data`)

The user-data endpoint automatically checks if an enrolled user has a student record and creates one if missing.

### 3. **Manual Creation** (`/api/students/ensure-student-record`)

Use this endpoint to ensure a student record exists for a profile:

```typescript
POST /api/students/ensure-student-record
{
  "profileId": "uuid",  // or use "email" instead
  "email": "student@example.com"
}
```

## Database Migration

If you have existing enrolled students with inconsistent data, run the migration:

```sql
-- Run: supabase/ensure-enrolled-students-have-records.sql
```

This will:
- **Step 1:** Create student records for profiles enrolled via `cohort_enrollment` but missing student records
- **Step 2:** Create student records for profiles with `cohort_id` set but missing student records
- **Step 3:** Create `cohort_enrollment` records for profiles with `cohort_id` but no enrollment record
- Initialize all with default values (0 progress, 0 assignments, etc.)

**This ensures all three components are in sync!**

## Enrollment Flow

### Recommended Flow:

1. **User applies** → Creates application record
2. **Admin accepts application** → Call `/api/students/enroll`
   - This creates student record automatically
   - Enrolls in cohort
   - Updates profile status

### Example Enrollment Code:

```typescript
// Enroll a student after accepting their application
const enrollStudent = async (email: string, cohortId: string) => {
  const response = await fetch('/api/students/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      cohortId,
    }),
  });

  const data = await response.json();
  if (data.success) {
    console.log('Student enrolled successfully!');
    console.log('Student ID:', data.studentId);
  }
};
```

## Verification

To check if all enrolled students have all three components:

```sql
-- Check consistency: profiles with cohort_id should have enrollment and student records
SELECT 
  p.id,
  p.email,
  p.cohort_id as profile_cohort_id,
  ce.cohort_id as enrollment_cohort_id,
  s.id as student_record_id,
  CASE 
    WHEN p.cohort_id IS NOT NULL AND ce.id IS NULL THEN 'Missing enrollment record'
    WHEN p.cohort_id IS NOT NULL AND s.id IS NULL THEN 'Missing student record'
    WHEN ce.id IS NOT NULL AND s.id IS NULL THEN 'Missing student record'
    WHEN ce.id IS NOT NULL AND p.cohort_id IS NULL THEN 'Missing profile cohort_id'
    ELSE 'OK'
  END as status
FROM profiles p
LEFT JOIN cohort_enrollment ce ON p.id = ce.student_id
LEFT JOIN students s ON p.id = s.profile_id
WHERE p.cohort_id IS NOT NULL OR ce.id IS NOT NULL;
```

**All enrolled students should show "OK" status!**

## Important Notes

- ✅ Student records are **automatically created** during enrollment
- ✅ The system **checks and creates** student records when fetching user data
- ✅ All enrolled students **should** have student records
- ✅ Student records track: progress, assignments, projects, live sessions

## Troubleshooting

### Issue: Student enrolled but no student record

**Solution 1:** Call the ensure endpoint:
```typescript
POST /api/students/ensure-student-record
{ "email": "student@example.com" }
```

**Solution 2:** Re-enroll the student:
```typescript
POST /api/students/enroll
{ "email": "student@example.com", "cohortId": "..." }
```

**Solution 3:** Run the SQL migration:
```sql
-- Run supabase/ensure-enrolled-students-have-records.sql
```

