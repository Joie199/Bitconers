# Database Relationships Summary

This document verifies all database relationships and columns are properly set up.

## ✅ All Foreign Key Relationships

### 1. **profiles → cohorts**
- **Column:** `profiles.cohort_id`
- **References:** `cohorts.id`
- **Purpose:** Links a user profile to their enrolled cohort
- **Status:** ✅ EXISTS (line 35 in schema.sql)

### 2. **cohort_enrollment → cohorts**
- **Column:** `cohort_enrollment.cohort_id`
- **References:** `cohorts(id) ON DELETE CASCADE`
- **Purpose:** Many-to-many relationship: which cohorts have which students
- **Status:** ✅ EXISTS (line 43 in schema.sql)

### 3. **cohort_enrollment → profiles**
- **Column:** `cohort_enrollment.student_id`
- **References:** `profiles(id) ON DELETE CASCADE`
- **Purpose:** Many-to-many relationship: which students are in which cohorts
- **Status:** ✅ EXISTS (line 44 in schema.sql)
- **Constraint:** `UNIQUE(cohort_id, student_id)` - prevents duplicate enrollments

### 4. **students → profiles**
- **Column:** `students.profile_id`
- **References:** `profiles(id) ON DELETE CASCADE`
- **Purpose:** Links student academic data to user profile
- **Status:** ✅ EXISTS (line 52 in schema.sql)
- **Constraint:** `UNIQUE` - one student record per profile

### 5. **events → cohorts** ⭐ **NEWLY ADDED**
- **Column:** `events.cohort_id`
- **References:** `cohorts(id) ON DELETE SET NULL`
- **Purpose:** If NULL, event is for everyone. If set, event is only for that specific cohort.
- **Status:** ✅ EXISTS (line 71 in schema.sql)
- **Index:** `idx_events_cohort_id` (line 143)

### 6. **sats_rewards → profiles**
- **Column:** `sats_rewards.student_id`
- **References:** `profiles(id) ON DELETE CASCADE`
- **Purpose:** Links rewards to student profile
- **Status:** ✅ EXISTS (line 79 in schema.sql)

### 7. **achievements → profiles**
- **Column:** `achievements.student_id`
- **References:** `profiles(id) ON DELETE CASCADE`
- **Purpose:** Links achievements to student profile
- **Status:** ✅ EXISTS (line 90 in schema.sql)

### 8. **applications → cohorts**
- **Column:** `applications.preferred_cohort_id`
- **References:** `cohorts(id)`
- **Purpose:** Links application to preferred cohort
- **Status:** ✅ EXISTS (line 131 in schema.sql)

## ✅ All Unique Constraints

1. **profiles.student_id** - UNIQUE (line 24)
2. **profiles.email** - UNIQUE (line 26)
3. **cohort_enrollment(cohort_id, student_id)** - UNIQUE (line 46)
4. **students.profile_id** - UNIQUE (line 52)

## ✅ All Indexes

1. `idx_profiles_email` - profiles(email)
2. `idx_profiles_student_id` - profiles(student_id)
3. `idx_cohort_enrollment_cohort` - cohort_enrollment(cohort_id)
4. `idx_cohort_enrollment_student` - cohort_enrollment(student_id)
5. `idx_students_profile` - students(profile_id)
6. `idx_events_start_time` - events(start_time)
7. `idx_events_cohort_id` - events(cohort_id) ⭐ **NEWLY ADDED**
8. `idx_sats_rewards_student` - sats_rewards(student_id)
9. `idx_achievements_student` - achievements(student_id)

## 📋 Events Table Structure

```sql
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT, -- live-class, assignment, community, workshop, deadline, quiz, cohort
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  link TEXT,
  recording_url TEXT,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL, -- ⭐ NEW COLUMN
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Data Flow

### Student Enrollment Flow:
1. User registers → `profiles` table (status: 'New')
2. User enrolls in cohort → 
   - `profiles.cohort_id` is set
   - `profiles.status` → 'Active'
   - Record added to `cohort_enrollment`
   - Record created in `students` table (if doesn't exist)

### Event Display Flow:
1. User logs in → Check `profiles.cohort_id`
2. Fetch events:
   - If `cohort_id` exists: Show events where `events.cohort_id IS NULL` OR `events.cohort_id = user.cohort_id`
   - If `cohort_id` is NULL: Show only events where `events.cohort_id IS NULL`

## ✅ Verification Checklist

- [x] `events.cohort_id` column added to schema.sql
- [x] `events.cohort_id` foreign key to `cohorts.id` created
- [x] `idx_events_cohort_id` index created
- [x] `profiles.cohort_id` relationship exists
- [x] `cohort_enrollment` relationships exist
- [x] `students.profile_id` UNIQUE constraint exists
- [x] All other relationships verified

## 🚀 Next Steps

1. **Run the migration** (if database already exists):
   ```sql
   -- Run: supabase/add-cohort-id-to-events.sql
   ```

2. **Verify in Supabase**:
   - Go to Table Editor → `events` table
   - Confirm `cohort_id` column exists
   - Check foreign key relationship

3. **Test Event Creation**:
   - Use `/api/events/create` endpoint
   - Set `for_all: true` or `cohort_id: "uuid"`
   - Verify events appear correctly in calendar

## 📝 Migration Files

- ✅ `add-cohort-id-to-events.sql` - Adds cohort_id column to events
- ✅ `add-unique-constraint-students.sql` - Ensures one student per profile
- ✅ `ensure-enrolled-students-have-records.sql` - Fixes existing data
- ✅ `verify-all-relationships.sql` - Verification script



