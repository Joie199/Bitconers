# Environment Variables Setup Instructions

## Current Status

All 12 Notion database environment variables have been added to your `.env.local` file. However, there are some duplicates that should be cleaned up.

## Required Variables (12 Databases)

Based on your Notion database names from the screenshot:

1. ✅ `NOTION_STUDENTS_DB_ID` → **Student Registered**
2. ✅ `NOTION_APPLICATIONS_DB_ID` → **Student Applications / Waiting List**
3. ✅ `NOTION_STUDENT_PROGRESS_DB_ID` → **Student progress**
4. ✅ `NOTION_COHORTS_DB_ID` → **Cohorts**
5. ✅ `NOTION_COHORT_ENROLLMENT_DB_ID` → **Cohort Enrollment**
6. ✅ `NOTION_CHAPTERS_DB_ID` → **Chapters / Curriculum**
7. ✅ `NOTION_ASSIGNMENTS_DB_ID` → **Assignments**
8. ✅ `NOTION_ASSIGNMENT_SUBMISSIONS_DB_ID` → **Assignment Submissions**
9. ✅ `NOTION_EVENTS_DB_ID` → **Events**
10. ✅ `NOTION_ATTENDANCE_DB_ID` → **Attendance**
11. ✅ `NOTION_SATS_REWARDS_DB_ID` → **Sats Rewards**
12. ✅ `NOTION_ACHIEVEMENTS_DB_ID` → **Achievements / Badges (Leaderboards system)**

## Next Steps

1. **Clean up duplicates** in `.env.local`:
   - Remove duplicate `NOTION_APPLICATIONS_DB_ID` entries (keep the one with your actual ID)
   - Remove duplicate `NOTION_COHORTS_DB_ID` entries (keep the one you want to use)

2. **Fill in all Database IDs**:
   - Open each database in Notion
   - Copy the 32-character ID from the URL
   - Paste it next to the corresponding variable in `.env.local`

3. **Verify your `.env.local` file looks like this**:
   ```env
   NOTION_API_KEY=secret_xxxxx
   NOTION_STUDENTS_DB_ID=your_32_char_id_here
   NOTION_APPLICATIONS_DB_ID=your_32_char_id_here
   NOTION_STUDENT_PROGRESS_DB_ID=your_32_char_id_here
   NOTION_COHORTS_DB_ID=your_32_char_id_here
   NOTION_COHORT_ENROLLMENT_DB_ID=your_32_char_id_here
   NOTION_CHAPTERS_DB_ID=your_32_char_id_here
   NOTION_ASSIGNMENTS_DB_ID=your_32_char_id_here
   NOTION_ASSIGNMENT_SUBMISSIONS_DB_ID=your_32_char_id_here
   NOTION_EVENTS_DB_ID=your_32_char_id_here
   NOTION_ATTENDANCE_DB_ID=your_32_char_id_here
   NOTION_SATS_REWARDS_DB_ID=your_32_char_id_here
   NOTION_ACHIEVEMENTS_DB_ID=your_32_char_id_here
   ```

4. **Share all databases with your integration**:
   - Each database must be connected to your Notion integration
   - Open each database → "..." menu → "Connections" → Add your integration

5. **Restart your dev server** after updating `.env.local`:
   ```bash
   npm run dev
   ```

## Reference Files

- `.env.local.example` - Clean template with all variables
- `env.template` - Updated with all database mappings
- `NOTION_DATABASES.md` - Complete mapping guide

