# Mentor System Implementation Guide

## Overview

The mentor system automatically creates mentor profiles in the database when mentorship applications are approved. Approved mentors are then displayed on the home page.

## Database Schema

### `mentors` Table

Created via: `supabase/add-mentors-table.sql`

**Fields:**
- `id` (UUID) - Primary key
- `mentorship_application_id` (UUID) - Links to `mentorship_applications` table
- `name` (TEXT) - Mentor's name
- `role` (TEXT) - Their role/title
- `description` (TEXT) - Bio/description
- `type` (TEXT) - One of: 'Mentor', 'Volunteer', 'Guest Lecturer'
- `image_url` (TEXT) - Optional profile image URL
- `github` (TEXT) - Optional GitHub profile URL
- `twitter` (TEXT) - Optional Twitter/X profile URL
- `bio` (TEXT) - Optional longer bio
- `is_active` (BOOLEAN) - If false, mentor is hidden from public display
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Relationships:**
- `mentors.mentorship_application_id` → `mentorship_applications.id` (ON DELETE CASCADE)

**Security:**
- Public can SELECT active mentors (for display)
- Only service role can INSERT/UPDATE/DELETE

## Workflow

### 1. Application Submission
- User submits mentorship application via `/mentorship` page
- Application stored in `mentorship_applications` table with status 'Pending'

### 2. Admin Approval
- Admin reviews application in `/admin` dashboard
- Admin clicks "Approve" button
- API endpoint: `PATCH /api/admin/mentorships`
- **Automatically creates mentor record** when status changes to 'Approved'

### 3. Mentor Profile Creation
When an application is approved:
- Mentor record is created in `mentors` table
- Linked to original application via `mentorship_application_id`
- `type` is determined from `role` field:
  - Contains "volunteer" → 'Volunteer'
  - Contains "lecturer" or "guest" → 'Guest Lecturer'
  - Otherwise → 'Mentor'
- `description` is populated from `experience` or `motivation` fields
- `is_active` is set to `true`

### 4. Display on Website
- Home page (`/`) fetches active mentors from database
- Mentors displayed in "Guided by Mentors & Community Leaders" section
- Falls back to static mentors (Yohannes, Semir) if database fetch fails

## API Endpoints

### Public Endpoints

#### `GET /api/mentors`
Fetches all active mentors for public display.

**Response:**
```json
{
  "mentors": [
    {
      "id": "uuid",
      "name": "Sarah N.",
      "role": "Lightning Developer",
      "description": "Led Week 3 Lightning session...",
      "type": "Mentor",
      "image_url": null,
      "github": null,
      "twitter": null,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Admin Endpoints

#### `PATCH /api/admin/mentorships`
Updates mentorship application status and creates/updates mentor record.

**Request:**
```json
{
  "id": "application-uuid",
  "status": "Approved"
}
```

**Behavior:**
- If `status === 'Approved'`: Creates or updates mentor record
- If changing from 'Approved' to another status: Deactivates mentor (`is_active = false`)

## Frontend Implementation

### Home Page (`src/app/page.tsx`)
- Server component that fetches mentors directly from database
- Uses `getMentors()` async function
- Merges database mentors with fallback mentors (Yohannes, Semir)
- Displays mentors in card format with image, role, type badge, description, and social links

### Mentorship Page (`src/app/mentorship/page.tsx`)
- Links to home page to view mentors
- Note: Mentors are displayed on home page, not on mentorship page

## Database Migration

To set up the mentors table, run:

```sql
-- Run this in Supabase SQL Editor
\i supabase/add-mentors-table.sql
```

Or copy the contents of `supabase/add-mentors-table.sql` into Supabase SQL Editor.

## Admin Workflow

1. **View Applications**: Go to `/admin` → "Mentorships" tab
2. **Review Application**: Click on application to see details
3. **Approve**: Click "Approve" button
4. **Mentor Created**: Mentor profile automatically created and displayed on home page
5. **Reject/Deactivate**: If needed, changing status from 'Approved' deactivates the mentor

## Future Enhancements

- Admin can edit mentor profiles (image, social links, bio)
- Admin can manually add mentors without going through application process
- Mentor profiles can include more fields (location, expertise areas, etc.)
- Display mentor contributions/achievements

## Notes

- Fallback mentors (Yohannes Amanuel, Semir Omer) are always shown even if not in database
- Mentor descriptions are limited to 200 characters
- When an application is rejected after being approved, the mentor is deactivated (not deleted)
- Mentor records are linked to applications, so deleting an application will cascade delete the mentor
