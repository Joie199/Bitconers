# Pre-Education Ideas Feature

This document explains the Pre-Education Ideas feature that allows prospective students to share their thoughts about Bitcoin before they start learning.

## ✅ Feature Overview

The Pre-Education Ideas feature provides a space for people who are curious about Bitcoin but haven't started learning yet to share:
- Their initial thoughts about Bitcoin
- Questions they have before learning
- Ideas or expectations about Bitcoin
- What interests them about Bitcoin

## 🎯 Purpose

1. **Capture Initial Perspectives**: Understand what people think about Bitcoin before education
2. **Community Engagement**: Allow prospective students to participate in the blog
3. **Educational Insights**: Help educators understand common misconceptions or questions
4. **Journey Tracking**: Compare pre-education ideas with post-education understanding

## 📋 Implementation Details

### 1. New Category

Added **"Pre-Education Ideas"** category (`pre-education`) to the blog system:
- Icon: 💡
- Special badge: Purple-themed "💡 Pre-Education" badge
- Lower word count requirement: 300 words (vs 500 for regular posts)

### 2. Submission Form Updates

**Category Dropdown:**
- Added "Pre-Education Ideas (Before Learning)" as the first option
- Shows helpful text when selected

**Cohort Field:**
- Made more flexible for pre-education posts
- Placeholder suggests "Prospective Student" or "Not Yet Enrolled"
- Optional for pre-education posts

**Content Field:**
- Different placeholder text for pre-education posts
- Encourages sharing thoughts, questions, and ideas
- Lower minimum word count (300 vs 500)

### 3. UI Updates

**Blog Listing Page:**
- Special purple badge "💡 Pre-Education" on pre-education posts
- Highlighted call-to-action section at top of page
- Category filter includes "Pre-Education Ideas"

**Individual Blog Post Page:**
- Purple badge in header
- Category shows as "Pre-Education Ideas"
- Author profile shows "💡 Pre-Education" badge

**Submission Page:**
- Helpful guidance text when pre-education category is selected
- Flexible cohort field for prospective students

### 4. API Updates

**Submission API (`POST /api/blog/submit`):**
- Accepts `pre-education` category
- Lower word count requirement (300 words)
- Tracks that author is not yet a student

**Blog Listing API (`GET /api/blog`):**
- Returns pre-education posts with category
- Can filter by `category=pre-education`

**Blog Post Detail API (`GET /api/blog/[id]`):**
- Returns category information
- Shows appropriate badges

## 🎨 Visual Design

### Badge Colors
- **Pre-Education**: Purple (`border-purple-400/30 bg-purple-500/20 text-purple-300`)
- **Academy Student**: Cyan (`border-cyan-400/30 bg-cyan-500/20 text-cyan-300`)
- **Graduate**: Cyan (same as student)

### Call-to-Action Section
- Purple-themed box at top of blog listing
- Encourages prospective students to share
- Direct link to submission form

## 📊 Data Structure

Pre-education posts are stored in `blog_posts` table with:
- `category`: `"pre-education"`
- `author_id`: May be null (if author not registered)
- `author_name`: Required
- `author_email`: Required
- `cohort`: Optional (can be "Prospective Student" or blank)

## 🔍 Example Use Cases

1. **Prospective Student**: "I think Bitcoin is digital gold. Is that right?"
2. **Curious Individual**: "What makes Bitcoin different from regular money?"
3. **Future Learner**: "I'm planning to enroll. Here's what I hope to learn..."
4. **Question Seeker**: "Before I start learning, I have these questions..."

## 📝 Submission Guidelines

For Pre-Education posts, we encourage:
- ✅ Sharing initial thoughts about Bitcoin
- ✅ Asking questions you have
- ✅ Expressing what interests you
- ✅ Describing expectations
- ✅ Minimum 300 words
- ✅ Maximum 2000 words

## 🚀 Benefits

1. **Inclusive**: Allows non-students to participate
2. **Educational**: Helps understand pre-education perspectives
3. **Engaging**: Encourages community participation
4. **Tracking**: Can compare before/after education views
5. **Marketing**: Shows diverse perspectives on Bitcoin

## 📚 Related Files

- `src/app/blog/page.tsx` - Category list and UI display
- `src/app/blog/submit/page.tsx` - Submission form with pre-education option
- `src/app/blog/[id]/page.tsx` - Individual post display
- `src/app/api/blog/submit/route.ts` - Submission API with word count logic
- `src/app/api/blog/route.ts` - Blog listing API
- `src/app/api/blog/[id]/route.ts` - Blog post detail API

## 🎯 Future Enhancements

- [ ] Track if pre-education authors later enroll
- [ ] Show "Before & After" comparison posts
- [ ] Pre-education post series/collection
- [ ] Featured pre-education ideas section
- [ ] Link pre-education posts to enrollment page

---

**Status**: ✅ Fully implemented and ready to use
