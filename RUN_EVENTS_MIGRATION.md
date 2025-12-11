# ⚠️ IMPORTANT: Run Events Migration

The `cohort_id` column has been added to the **schema.sql** file and a migration script has been created, but **you need to run the migration in your Supabase database** for it to take effect.

## 📋 Steps to Add `cohort_id` Column to Events Table

### Option 1: Run the Migration Script (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Run the Migration**
   - Open the file: `supabase/add-cohort-id-to-events.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify the Column Was Added**
   - Go to "Table Editor" → `events` table
   - You should see a new column: `cohort_id` (UUID, nullable)

### Option 2: Run via Supabase CLI (If you have it set up)

```bash
supabase db push
# or
supabase migration up
```

## ✅ What the Migration Does

```sql
-- Adds cohort_id column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;

-- Creates index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_cohort_id ON events(cohort_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
```

## 🔍 Verify It Worked

After running the migration, you can verify by:

1. **Check in Table Editor:**
   - Go to Table Editor → `events` table
   - Look for `cohort_id` column

2. **Run this SQL query:**
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'events' AND column_name = 'cohort_id';
   ```
   
   Should return:
   ```
   column_name | data_type | is_nullable
   ------------|-----------|-------------
   cohort_id  | uuid      | YES
   ```

3. **Test the API:**
   - The events API should now work without the 500 error
   - Calendar should display events correctly

## 📝 Current Status

- ✅ Migration file created: `supabase/add-cohort-id-to-events.sql`
- ✅ Schema updated: `supabase/schema.sql` includes `cohort_id`
- ✅ Code updated: API handles `cohort_id` filtering
- ⚠️ **Migration NOT RUN in database yet** ← You need to do this!

## 🚨 If You Don't Run the Migration

The events API will:
- Still work (using fallback mode)
- Show all events to everyone (no cohort filtering)
- Display a warning in console about missing column

But cohort-specific event filtering won't work until you run the migration.



