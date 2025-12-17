# Blog Student Tracking Implementation

This document explains how the blog system tracks and displays acknowledgments for academy students.

## ✅ Implementation Summary

The blog system now automatically:
1. **Tracks** if a blog post author is a student of the academy
2. **Displays** acknowledgment badges on blog listings and individual posts
3. **Shows** cohort information for academy students

## 🔍 How It Works

### 1. Student Detection

When a blog post is submitted or published, the system checks if the author's `profile_id` exists in the `students` table:

```typescript
// Check if author is a student
const { data: student } = await supabaseAdmin
  .from('students')
  .select('profile_id')
  .eq('profile_id', authorId)
  .maybeSingle();

if (student) {
  isAcademyStudent = true;
  // Get cohort information...
}
```

### 2. Database Relationship

- `blog_posts.author_id` → References `profiles(id)`
- `students.profile_id` → References `profiles(id)`
- If `author_id` exists in `students.profile_id`, the author is an academy student

### 3. API Updates

#### Blog Submission (`POST /api/blog/submit`)
- Checks if submitting author is a student
- Returns `isAcademyStudent` and `cohort` in response
- Auto-fills cohort from student's profile if not provided

#### Blog Listing (`GET /api/blog`)
- Batch checks all authors against `students` table
- Returns `isAcademyStudent: true/false` for each post
- Efficiently queries all student IDs at once

#### Blog Post Detail (`GET /api/blog/[id]`)
- Checks if author is a student
- Fetches cohort information
- Returns `isAcademyStudent` and `studentCohort`

#### Admin Approval (`POST /api/admin/blog/approve`)
- Checks student status when approving submissions
- Preserves student information in published post

### 4. UI Updates

#### Blog Listing Page (`/blog`)
- Shows **"🎓 Academy Student"** badge on posts by students
- Badge appears in top-right corner of post cards
- Only shows if `post.isAcademyStudent === true`

#### Individual Blog Post Page (`/blog/[id]`)
- Shows **"🎓 Academy Student • [Cohort Name]"** badge in header
- Shows cohort name if available
- Displays in author profile section as well

## 📊 Data Flow

```
1. User submits blog post
   ↓
2. API checks: Is author email in profiles table?
   ↓
3. If yes: Check if profile.id exists in students table
   ↓
4. If student: Fetch cohort information
   ↓
5. Store author_id in blog_submissions/blog_posts
   ↓
6. When displaying: Check students table again
   ↓
7. Show acknowledgment badge if isAcademyStudent === true
```

## 🎨 Badge Display

### Blog Listing Cards
```tsx
{post.isAcademyStudent && (
  <div className="absolute -top-2 -right-2 rounded-full border border-cyan-400/30 bg-cyan-500/20 px-2 py-1 text-[10px] font-bold text-cyan-300">
    🎓 Academy Student
  </div>
)}
```

### Blog Post Header
```tsx
{post.isAcademyStudent && (
  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
    🎓 Academy Student
    {post.studentCohort && ` • ${post.studentCohort}`}
  </span>
)}
```

## 🔧 Database Optimization

Added index for faster student lookups:
```sql
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_student 
ON blog_posts(author_id) 
WHERE author_id IS NOT NULL;
```

## 📝 Example Response

### Blog Listing API Response
```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "My Bitcoin Journey",
      "author": "John Doe",
      "isAcademyStudent": true,
      "isGraduate": false,
      ...
    }
  ]
}
```

### Blog Post Detail API Response
```json
{
  "post": {
    "id": "uuid",
    "title": "My Bitcoin Journey",
    "author": "John Doe",
    "isAcademyStudent": true,
    "studentCohort": "Cohort 1",
    ...
  }
}
```

## ✅ Benefits

1. **Automatic Recognition**: Students are automatically recognized when they submit blog posts
2. **Visual Acknowledgment**: Clear badges show academy affiliation
3. **Cohort Display**: Shows which cohort the student belongs to
4. **Database Integrity**: Uses existing relationships (profiles → students)
5. **Performance**: Efficient batch queries for student status

## 🚀 Future Enhancements

- [ ] Add student ID display (e.g., "Student ID: 1/1/2025")
- [ ] Show graduation status badge
- [ ] Link to student profile page
- [ ] Filter blog posts by "Academy Students Only"
- [ ] Show student achievements/rankings

## 📚 Related Files

- `src/app/api/blog/submit/route.ts` - Student detection on submission
- `src/app/api/blog/route.ts` - Batch student status check
- `src/app/api/blog/[id]/route.ts` - Individual post student status
- `src/app/api/admin/blog/approve/route.ts` - Student status on approval
- `src/app/blog/page.tsx` - Badge display in listing
- `src/app/blog/[id]/page.tsx` - Badge display on post page
- `supabase/blog-add-student-tracking.sql` - Database index

---

**Status**: ✅ Fully implemented and working
