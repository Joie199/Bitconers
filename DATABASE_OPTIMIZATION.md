# Database Optimization Guide

## Overview
The database has been optimized to simplify user registration and profile management.

## Key Changes

### 1. Simplified Profiles Table
- **Removed**: `student_id` column (no longer needed)
- **Added**: `password_hash` column (for basic auth - use Supabase Auth in production)
- **Uses**: Profile `id` (UUID) as the primary identifier

### 2. Registration Flow
- Users sign up with: **name, email, password**
- Profile is created immediately
- **No student record** is created automatically
- Student record is created only when user applies and gets accepted

### 3. Profile Image Storage
- Images are stored in **Supabase Storage** bucket: `profile_img`
- Images are uploaded via `/api/profile/upload-image`
- Public URLs are stored in `profiles.photo_url`

## Setup Steps

### Step 1: Run Schema Updates
Run `supabase/schema-optimized.sql` in your Supabase SQL Editor to:
- Remove `student_id` column
- Add `password_hash` column
- Update indexes

### Step 2: Create Storage Bucket
In Supabase Dashboard > Storage:

1. Create a new bucket named `profile_img`
2. Make it **public** (for public read access)
3. Set up storage policies:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile_img');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile_img' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile_img'
);
```

### Step 3: Update Application Code
The following files have been updated:
- `src/app/api/profile/register/route.ts` - Simplified registration
- `src/app/api/profile/upload-image/route.ts` - Image upload handler
- `src/app/api/profile/check-student/route.ts` - Check if user is student
- `src/components/StudentDashboard.tsx` - Profile modal with Apply button

## User Flow

### New User Registration
1. User signs up with name, email, password
2. Profile is created in `profiles` table
3. User can view profile but sees "Apply Now" button
4. User applies through `/apply` page
5. When accepted, student record is created in `students` table
6. "Apply Now" button disappears

### Profile Image Upload
1. User clicks on profile picture in profile modal
2. Selects image file
3. Image is converted to base64
4. Uploaded to Supabase Storage via `/api/profile/upload-image`
5. Public URL is returned and stored in `profiles.photo_url`
6. Image displays immediately

## API Endpoints

### POST `/api/profile/register`
Register a new user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "profileId": "uuid-here"
}
```

### POST `/api/profile/upload-image`
Upload profile image to Supabase Storage.

**Request:**
```json
{
  "email": "john@example.com",
  "imageData": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "photoUrl": "https://..."
}
```

### POST `/api/profile/check-student`
Check if a user is registered as a student.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "isStudent": false,
  "profileId": "uuid-here"
}
```

## Migration Notes

### Existing Data
If you have existing profiles with `student_id`:
1. The column will be dropped (data will be lost)
2. Use profile `id` instead going forward
3. Update any code referencing `student_id`

### Password Storage
⚠️ **Important**: The current implementation stores passwords in plain text (prefixed with "hashed_"). 

**For production**, you should:
1. Use **Supabase Auth** instead of custom password storage
2. Or use proper password hashing (bcrypt, argon2, etc.)
3. Never store plain text passwords

## Testing

1. **Test Registration:**
   - Sign up a new user
   - Verify profile is created
   - Check that no student record exists

2. **Test Profile View:**
   - Open profile modal
   - Verify "Apply Now" button shows for non-students
   - Verify button disappears after applying

3. **Test Image Upload:**
   - Upload a profile image
   - Verify it appears in Supabase Storage
   - Verify URL is saved in profile

4. **Test Student Check:**
   - Call `/api/profile/check-student`
   - Verify correct `isStudent` status

