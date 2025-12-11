# Database Connection Verification

## ✅ Connections Are Set Up

### 1. **Supabase Client Connection**
- ✅ `src/lib/supabase.ts` - Connects to Supabase using environment variables
- ✅ `supabaseAdmin` - Used for server-side operations (enrollment API)
- ✅ Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

### 2. **Database Relationships (Foreign Keys)**

All relationships are properly defined in `supabase/schema.sql`:

```
profiles.cohort_id → cohorts.id
cohort_enrollment.cohort_id → cohorts.id
cohort_enrollment.student_id → profiles.id
students.profile_id → profiles.id (UNIQUE)
```

### 3. **Enrollment API Database Operations**

The `/api/students/enroll` endpoint connects to the database and:

1. ✅ **Queries `profiles` table** - Gets profile by email/ID
2. ✅ **Queries `cohorts` table** - Verifies cohort exists
3. ✅ **Updates `profiles` table** - Sets `cohort_id` and status
4. ✅ **Inserts into `cohort_enrollment`** - Creates enrollment record
5. ✅ **Inserts into `students`** - Creates student record

## Verification Steps

### Step 1: Check Environment Variables

Make sure these are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Run Verification SQL

Run `supabase/verify-database-connections.sql` in Supabase SQL Editor to:
- Check all foreign key constraints exist
- Verify unique constraints
- Check data consistency

### Step 3: Test the Connection

Test the enrollment API:
```bash
POST /api/students/enroll
{
  "email": "test@example.com",
  "cohortId": "cohort-uuid"
}
```

If it works, the database connection is working! ✅

## Database Schema Summary

### Tables and Their Connections:

1. **`profiles`** (User accounts)
   - `cohort_id` → Links to `cohorts.id`
   - Referenced by: `cohort_enrollment.student_id`, `students.profile_id`

2. **`cohorts`** (Course cohorts)
   - Referenced by: `profiles.cohort_id`, `cohort_enrollment.cohort_id`

3. **`cohort_enrollment`** (Many-to-many: students ↔ cohorts)
   - `cohort_id` → `cohorts.id`
   - `student_id` → `profiles.id`
   - UNIQUE constraint on (cohort_id, student_id)

4. **`students`** (Academic progress)
   - `profile_id` → `profiles.id` (UNIQUE - one student record per profile)

## Important Notes

- ✅ All foreign keys have `ON DELETE CASCADE` for data integrity
- ✅ `students.profile_id` is UNIQUE (one student record per profile)
- ✅ `cohort_enrollment` has UNIQUE constraint (prevents duplicate enrollments)
- ✅ The enrollment API uses `supabaseAdmin` for full database access

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Check `.env.local` file exists
- Verify all three environment variables are set

### Issue: "Foreign key constraint violation"
- Make sure the referenced record exists (e.g., cohort exists before enrolling)
- Check the UUIDs are correct

### Issue: "Unique constraint violation"
- `students.profile_id` - Student record already exists for this profile
- `cohort_enrollment` - Student already enrolled in this cohort

## Next Steps

1. ✅ Run `supabase/add-unique-constraint-students.sql` (if not already run)
2. ✅ Run `supabase/verify-database-connections.sql` to check everything
3. ✅ Test enrollment with a real user and cohort
4. ✅ Verify data appears correctly in all three places



