# 📋 Migration Checklist

Use this checklist to track which migrations have been applied to your Supabase database.

## ✅ How to Check Migrations

1. **Run the verification script:**
   - Open `supabase/verify-all-migrations.sql` in Supabase SQL Editor
   - Copy and paste the entire file
   - Click "Run"
   - Review the results

2. **Or check manually** using the checklist below

---

## 📝 Migration Files (in order of importance)

### 1. ✅ Password Hash Migration
**File:** `supabase/add-password-hash-migration.sql`
- **What it does:** Adds `password_hash` column to `profiles` table
- **Status:** ⬜ Not checked
- **Run if:** You see "❌ NOT APPLIED" in verification script

### 2. ✅ Password Reset Columns
**File:** `supabase/add-password-reset-columns.sql`
- **What it does:** Adds `reset_token` and `reset_token_expiry` columns to `profiles` table
- **Status:** ⬜ Not checked
- **Run if:** You see "❌ NOT APPLIED" in verification script

### 3. ✅ Events Cohort ID Column
**File:** `supabase/add-cohort-id-to-events.sql`
- **What it does:** Adds `cohort_id` column to `events` table for cohort filtering
- **Status:** ⬜ Not checked
- **Run if:** You see "❌ NOT APPLIED" in verification script
- **⚠️ IMPORTANT:** This fixes the 500 error in events API

### 4. ✅ Unique Constraint on Students
**File:** `supabase/add-unique-constraint-students.sql`
- **What it does:** Ensures one student record per profile (data integrity)
- **Status:** ⬜ Not checked
- **Run if:** You see "❌ NOT APPLIED" in verification script

### 5. ✅ Enrolled Students Data Consistency
**File:** `supabase/ensure-enrolled-students-have-records.sql`
- **What it does:** Creates missing student records for enrolled users
- **Status:** ⬜ Not checked
- **Run if:** You see "⚠️ NEEDS RUNNING" in verification script
- **Note:** This is a data migration, safe to run multiple times

---

## 🚀 Quick Start

1. **Run verification:**
   ```sql
   -- Copy contents of supabase/verify-all-migrations.sql
   -- Paste into Supabase SQL Editor and run
   ```

2. **Apply missing migrations:**
   - For each "❌ NOT APPLIED" result, run the corresponding migration file
   - Copy the migration file contents
   - Paste into Supabase SQL Editor
   - Run it

3. **Re-verify:**
   - Run the verification script again
   - All should show "✅ APPLIED"

---

## 📊 Migration Order

You can run migrations in any order (they're idempotent), but recommended order:

1. `add-password-hash-migration.sql` (if not done)
2. `add-password-reset-columns.sql` (if not done)
3. `add-cohort-id-to-events.sql` ⚠️ **Fixes 500 error**
4. `add-unique-constraint-students.sql` (if not done)
5. `ensure-enrolled-students-have-records.sql` (data fix, run anytime)

---

## ✅ Verification

After running migrations, verify:

```sql
-- Check events table has cohort_id
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'cohort_id';
-- Should return: cohort_id

-- Check profiles has password_hash
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'password_hash';
-- Should return: password_hash

-- Check students unique constraint
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'students' AND constraint_type = 'UNIQUE';
-- Should return: students_profile_id_key
```

---

## 🆘 Troubleshooting

**Q: Migration says "already exists"**
- ✅ That's fine! The migration uses `IF NOT EXISTS` so it's safe to run again

**Q: Getting errors?**
- Check if the table exists first
- Make sure you're running in the correct database
- Check Supabase logs for detailed error messages

**Q: Not sure if migration ran?**
- Run the verification script: `supabase/verify-all-migrations.sql`
- It will tell you exactly what's applied and what's not



