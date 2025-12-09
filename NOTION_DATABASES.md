# Notion Database Configuration Guide

This document maps all environment variables to their corresponding Notion database names.

## Environment Variables → Notion Database Names

### Core Student Management

| Env Variable | Notion Database Name | Description |
|-------------|---------------------|-------------|
| `NOTION_STUDENTS_DB_ID` | **Student Registered** | Main student database with enrollment info, progress, sats, etc. |
| `NOTION_APPLICATIONS_DB_ID` | **Student Applications / Waiting List** | Application submissions and waitlist |
| `NOTION_STUDENT_PROGRESS_DB_ID` | **Student progress** | Tracks chapter completion per student |

### Cohort Management

| Env Variable | Notion Database Name | Description |
|-------------|---------------------|-------------|
| `NOTION_COHORTS_DB_ID` | **Cohorts** | Cohort information (dates, sessions, status) |
| `NOTION_COHORT_ENROLLMENT_DB_ID` | **Cohort Enrollment** | Links students to cohorts (many-to-many relationship) |

### Curriculum & Learning

| Env Variable | Notion Database Name | Description |
|-------------|---------------------|-------------|
| `NOTION_CHAPTERS_DB_ID` | **Chapters / Curriculum** | Course chapters/curriculum content |
| `NOTION_ASSIGNMENTS_DB_ID` | **Assignments** | Assignment definitions per cohort |
| `NOTION_ASSIGNMENT_SUBMISSIONS_DB_ID` | **Assignment Submissions** | Student assignment submissions |

### Events & Attendance

| Env Variable | Notion Database Name | Description |
|-------------|---------------------|-------------|
| `NOTION_EVENTS_DB_ID` | **Events** | Live classes, workshops, deadlines |
| `NOTION_ATTENDANCE_DB_ID` | **Attendance** | Student attendance records for events |

### Rewards & Gamification

| Env Variable | Notion Database Name | Description |
|-------------|---------------------|-------------|
| `NOTION_SATS_REWARDS_DB_ID` | **Sats Rewards** | Sats rewards earned by students |
| `NOTION_ACHIEVEMENTS_DB_ID` | **Achievements / Badges (Leaderboards system)** | Student achievements and badges |
| `NOTION_PROFILE_DB_ID` | **Profiles** (optional) | Basic student profiles (if separate from applications) |

## How to Get Database IDs

1. Open each database in Notion (web browser)
2. Look at the URL - it will look like:
   ```
   https://www.notion.so/workspace/2c3f667519a1b2c3d4e5f67890abcdef?v=...
   ```
3. Copy the **32-character ID** (the part between the last `/` and the `?`)
   - Example: `2c3f667519a1b2c3d4e5f67890abcdef`
4. Add it to your `.env.local` file with the corresponding variable name

## Required Properties

Make sure each database has the exact property names as specified in the setup guide. Property names are **case-sensitive**!

## Sharing Databases with Integration

**IMPORTANT:** Each database must be shared with your Notion integration:

1. Open the database in Notion
2. Click the "..." menu (three dots) in the top right
3. Select **"Connections"** or **"Add connections"**
4. Find and select your integration (created at https://www.notion.so/my-integrations)
5. Click **"Connect"**

Repeat this for all 12 databases!

## Testing Connection

After adding all IDs to `.env.local`, restart your dev server and visit:
- `http://localhost:3000/api/notion/test` - Tests Applications DB connection

