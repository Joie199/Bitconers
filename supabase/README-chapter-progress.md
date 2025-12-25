# Chapter Progress Tracking Setup

## Overview
This document explains how to ensure student chapter progress is properly tracked in the database.

## Database Table

The `chapter_progress` table tracks:
- Which chapters each student has unlocked
- Which chapters each student has completed
- Timestamps for when chapters were unlocked/completed

## Setup Instructions

### Step 1: Create the Chapter Progress Table

Run the migration script in your Supabase SQL Editor:

```sql
-- File: supabase/add-chapter-progress-table.sql
```

This will create:
- `chapter_progress` table with proper indexes
- RLS policies for security
- Triggers for automatic timestamp updates

### Step 2: Verify Table Exists

After running the migration, verify the table exists:

```sql
SELECT * FROM chapter_progress LIMIT 5;
```

If the table doesn't exist, you'll get an error. Run the migration script.

## How Progress is Tracked

### Automatic Tracking
1. **4-Minute Timer**: When a student views a chapter page, after 4 minutes, the chapter is automatically marked as completed
   - Component: `ChapterCompletionTracker.tsx`
   - API: `/api/chapters/mark-completed`

2. **Next Chapter Button**: When a student clicks "Next Chapter", the current chapter is marked as completed
   - Component: `NextChapterButton.tsx`
   - API: `/api/chapters/mark-completed`

### What Gets Saved

When a chapter is marked as completed:
1. **Chapter Progress Record**: 
   - `is_completed = true`
   - `completed_at = current timestamp`
   - `is_unlocked = true` (if not already)

2. **Next Chapter Unlocked**: 
   - Creates/updates progress record for next chapter
   - Sets `is_unlocked = true`

3. **Sats Reward**: 
   - Adds 200 sats to `amount_pending` in `sats_rewards` table

4. **Achievements**: 
   - Checks and unlocks any achievements based on chapter completion

## Verification

### Check if Progress is Being Saved

1. **Check Database Directly**:
   ```sql
   SELECT 
     p.name,
     p.email,
     cp.chapter_number,
     cp.is_completed,
     cp.completed_at
   FROM chapter_progress cp
   JOIN profiles p ON cp.student_id = p.id
   WHERE cp.is_completed = true
   ORDER BY cp.completed_at DESC
   LIMIT 20;
   ```

2. **Check Admin Dashboard**:
   - Go to `/admin`
   - View "Student Database" section
   - Check "Chapters" column for each student

3. **Check API Logs**:
   - Look for `[mark-completed]` log messages in server logs
   - Should see "Successfully created/updated" messages

### Troubleshooting

If progress is not being saved:

1. **Table Doesn't Exist**:
   - Error: `relation "chapter_progress" does not exist`
   - Solution: Run `supabase/add-chapter-progress-table.sql`

2. **RLS Policy Blocking**:
   - API uses `supabaseAdmin` (service role) which bypasses RLS
   - If direct client access fails, check RLS policies

3. **Student Record Missing**:
   - Error: `Student record not found`
   - Solution: Ensure student has a record in `students` table

4. **Profile Not Found**:
   - Error: `Profile not found`
   - Solution: Ensure user has a profile in `profiles` table

## API Endpoints

### POST `/api/chapters/mark-completed`
Marks a chapter as completed for a student.

**Request Body**:
```json
{
  "email": "student@example.com",
  "chapterNumber": 1,
  "chapterSlug": "the-nature-of-money"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Chapter marked as completed",
  "chapterNumber": 1,
  "completedAt": "2025-01-15T10:30:00Z",
  "newlyUnlockedAchievements": [...]
}
```

## Database Schema

```sql
CREATE TABLE chapter_progress (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  chapter_number INTEGER NOT NULL,
  chapter_slug TEXT NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, chapter_number)
);
```

## Related Files

- `src/app/api/chapters/mark-completed/route.ts` - API endpoint
- `src/app/chapters/[slug]/ChapterCompletionTracker.tsx` - Auto-tracking component
- `src/app/chapters/[slug]/NextChapterButton.tsx` - Manual completion
- `src/app/api/admin/students/progress/route.ts` - Admin progress view
- `supabase/add-chapter-progress-table.sql` - Database migration

