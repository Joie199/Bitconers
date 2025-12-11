# Testing the Enrollment System

## Quick Test Steps

### 1. **Run the Migration (if you have existing data)**

If you have existing enrolled students, run this SQL in your Supabase SQL Editor:

```sql
-- Run: supabase/ensure-enrolled-students-have-records.sql
```

This will fix any inconsistencies in existing data.

### 2. **Test Enrollment via API**

You can test the enrollment API using curl, Postman, or your frontend:

```bash
# Example: Enroll a student
curl -X POST http://localhost:3000/api/students/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "cohortId": "your-cohort-uuid-here"
  }'
```

Or in your frontend code:
```typescript
const enrollStudent = async (email: string, cohortId: string) => {
  const response = await fetch('/api/students/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, cohortId }),
  });
  
  const data = await response.json();
  console.log('Enrollment result:', data);
};
```

### 3. **Verify the Three Components**

After enrollment, check that all three are set:

```sql
-- Check a specific student
SELECT 
  p.id,
  p.email,
  p.cohort_id as profile_cohort_id,
  c.name as cohort_name,
  ce.id as enrollment_id,
  s.id as student_record_id
FROM profiles p
LEFT JOIN cohorts c ON p.cohort_id = c.id
LEFT JOIN cohort_enrollment ce ON p.id = ce.student_id AND p.cohort_id = ce.cohort_id
LEFT JOIN students s ON p.id = s.profile_id
WHERE p.email = 'student@example.com';
```

**Expected Result:**
- ✅ `profile_cohort_id` should be set (UUID of the cohort)
- ✅ `enrollment_id` should exist (not NULL)
- ✅ `student_record_id` should exist (not NULL)

### 4. **Test via Dashboard**

1. Log in as a user
2. If they're enrolled, check the dashboard shows:
   - Welcome message with their name
   - Cohort information
   - Student progress data

## What You Need to Do

### Option A: Test with Existing Data

1. **Get a cohort ID:**
   ```sql
   SELECT id, name FROM cohorts LIMIT 1;
   ```

2. **Get a user email:**
   ```sql
   SELECT email FROM profiles LIMIT 1;
   ```

3. **Enroll them:**
   - Use the API with the email and cohort ID
   - Or run the migration if they're already enrolled

### Option B: Create New Test Data

1. **Create a cohort** (if you don't have one):
   ```sql
   INSERT INTO cohorts (name, status, level, seats_total)
   VALUES ('Test Cohort 1', 'Active', 'Beginner', 50)
   RETURNING id, name;
   ```

2. **Create a user** (via registration or directly):
   ```sql
   INSERT INTO profiles (name, email, password_hash, status)
   VALUES ('Test Student', 'test@example.com', 'hashed_password', 'New')
   RETURNING id, email;
   ```

3. **Enroll them:**
   - Use the enrollment API with the email and cohort ID

## Verification Checklist

After enrollment, verify:

- [ ] `profiles.cohort_id` is set to the cohort's UUID
- [ ] `cohort_enrollment` table has a record linking student to cohort
- [ ] `students` table has a record for the profile
- [ ] Dashboard shows the student's name and cohort
- [ ] Calendar shows cohort-specific events (if any)

## Troubleshooting

### Issue: "Profile not found"
- Make sure the email exists in the `profiles` table
- Check email is lowercase and trimmed

### Issue: "Cohort not found"
- Verify the cohort ID is correct
- Check the cohort exists in the `cohorts` table

### Issue: Enrollment succeeds but data not showing
- Check all three components are set (run verification SQL)
- Refresh the dashboard
- Check browser console for errors

## Next Steps After Testing

Once verified:
1. ✅ Commit and push changes
2. ✅ Deploy to production
3. ✅ Test in production environment
4. ✅ Monitor for any issues



