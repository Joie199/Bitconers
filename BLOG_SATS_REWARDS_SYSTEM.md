# Blog Sats Rewards System

This document explains the automatic sats rewards system for approved blog posts.

## ✅ Overview

When a blog post is approved and published, the author automatically receives sats rewards in their pending balance. The system:

1. **Searches for the author** by email in the profiles database
2. **Awards sats** if the author exists
3. **Warns the author** if they don't have a profile (they need to sign up first)

## 💰 Reward Amount

- **Constant Amount**: 1,000 sats per approved blog post
- **Status**: Added to `amount_pending` in `sats_rewards` table
- **Reward Type**: `'blog'`

## 🔄 Flow

### 1. Blog Submission (`POST /api/blog/submit`)

When a user submits a blog post:
- System checks if their email exists in `profiles` table
- If **not found**: Returns a warning message
- If **found**: Links submission to their profile ID

**Response includes:**
```json
{
  "success": true,
  "message": "Blog post submitted successfully...",
  "profileExists": true/false,
  "warning": "Note: To receive sats rewards..." (if profile doesn't exist)
}
```

### 2. Blog Approval (`POST /api/admin/blog/approve`)

When admin approves a blog submission:

1. **Find Author by Email**
   ```typescript
   const { data: authorProfile } = await supabaseAdmin
     .from('profiles')
     .select('id')
     .eq('email', submission.author_email)
     .maybeSingle();
   ```

2. **Check if Author Exists**
   - If **not found**: Return error message asking admin to have author sign up first
   - If **found**: Proceed to award sats

3. **Award Sats**
   - Check if `sats_rewards` record exists for this student
   - If exists: Update `amount_pending` (add to existing)
   - If not exists: Create new `sats_rewards` record
   - Set `reward_type` to `'blog'`
   - Link to blog post via `related_entity_id`

**Response includes:**
```json
{
  "success": true,
  "message": "Blog post approved and published",
  "satsAwarded": true/false,
  "satsAmount": 1000,
  "satsError": null or error message
}
```

## 📊 Database Structure

### sats_rewards Table

```sql
{
  student_id: UUID (references profiles.id),
  amount_paid: INTEGER (default 0),
  amount_pending: INTEGER (default 0), -- Blog rewards added here
  reward_type: 'blog', -- New type added
  related_entity_type: 'blog',
  related_entity_id: UUID (blog_post.id),
  reason: "Blog post approved: \"{title}\"",
  status: 'pending'
}
```

## 🔧 Configuration

**File**: `src/lib/blog-rewards.ts`

```typescript
export const BLOG_POST_REWARD_SATS = 1000; // Constant amount
export const BLOG_REWARD_TYPE = 'blog';
```

## ⚠️ User Experience

### Submission Flow

1. **User submits blog post** with their email
2. **System checks** if email exists in profiles
3. **If not found**: 
   - Warning shown: "To receive sats rewards when your blog is approved, please sign up first"
   - Option to redirect to `/apply` or `/register`
4. **If found**: 
   - Submission linked to profile
   - Will receive sats automatically when approved

### Approval Flow

1. **Admin approves** blog submission
2. **System searches** for author by email
3. **If author not found**:
   - Error returned: "Author not found in database. Please ask them to sign up first."
   - Admin can contact author to sign up
4. **If author found**:
   - Sats automatically added to `amount_pending`
   - Success message returned

## 🗄️ Database Migration

Run this SQL to add 'blog' to reward_type constraint:

```sql
-- File: supabase/add-blog-reward-type.sql
ALTER TABLE sats_rewards DROP CONSTRAINT IF EXISTS sats_rewards_reward_type_check;
ALTER TABLE sats_rewards 
  ADD CONSTRAINT sats_rewards_reward_type_check 
  CHECK (reward_type IN ('assignment', 'chapter', 'discussion', 'peer_help', 'project', 'attendance', 'blog', 'other'));
```

Also update `related_entity_type`:
```sql
ALTER TABLE sats_rewards DROP CONSTRAINT IF EXISTS sats_rewards_related_entity_type_check;
ALTER TABLE sats_rewards 
  ADD CONSTRAINT sats_rewards_related_entity_type_check 
  CHECK (related_entity_type IN ('assignment', 'chapter', 'event', 'discussion', 'project', 'blog', 'other'));
```

## 📝 Example Scenarios

### Scenario 1: Author Has Profile
1. User submits blog post with email `john@example.com`
2. Email exists in `profiles` table
3. Admin approves blog post
4. System finds profile → Awards 1,000 sats to `amount_pending`
5. User sees sats in their dashboard

### Scenario 2: Author Doesn't Have Profile
1. User submits blog post with email `newuser@example.com`
2. Email **doesn't exist** in `profiles` table
3. Warning shown: "Please sign up first to receive sats rewards"
4. Admin approves blog post
5. System can't find profile → Error returned to admin
6. Admin contacts user to sign up
7. After signup, admin can manually award sats or re-approve

## 🚀 Benefits

1. **Automatic Rewards**: No manual sats entry needed
2. **Transparent**: Users know they'll receive sats when approved
3. **Linked Tracking**: Blog posts linked to sats rewards
4. **Encourages Sign-ups**: Users motivated to create profiles

## 📚 Related Files

- `src/lib/blog-rewards.ts` - Reward configuration constants
- `src/app/api/admin/blog/approve/route.ts` - Approval logic with sats awarding
- `src/app/api/blog/submit/route.ts` - Submission with profile check
- `src/app/blog/submit/page.tsx` - UI warning for non-registered users
- `supabase/add-blog-reward-type.sql` - Database migration
- `supabase/schema.sql` - Updated schema with 'blog' reward type

---

**Status**: ✅ Fully implemented and ready to use
