# Blog Page Structure and Features

This document explains the complete structure and features of the blog system.

## 📁 File Structure

```
src/app/blog/
├── layout.tsx          # Blog layout with metadata
├── page.tsx            # Main blog listing page (client component)
├── [id]/
│   └── page.tsx        # Individual blog post page (server component)
└── submit/
    ├── layout.tsx      # Submit page layout
    └── page.tsx        # Blog submission form (client component)
```

---

## 🎯 Main Blog Page (`src/app/blog/page.tsx`)

### Structure Overview

**Type**: Client Component (`'use client'`)  
**Purpose**: Display blog posts, categories, and featured content

### Key Features

#### 1. **Categories System**
- 11 categories available:
  - All (📚)
  - Student Essays (✍️)
  - Community Stories (🤝)
  - Bitcoin in Africa (🌍)
  - Technical Deep Dives (💻)
  - Lightning Experiments (⚡)
  - Ideas for the Future (🔮)
  - Beginner Lessons (📖)
  - Reflections & Opinions (💭)
  - Builder Showcases (🛠️)
  - Graduation Projects (🎓)

- **Filtering**: Click category to filter posts
- **Post Count**: Shows number of posts per category

#### 2. **Blog of the Month Section**
- Featured prominently at top
- Special styling with orange/cyan gradient
- Shows:
  - Star icon (⭐)
  - "BLOG OF THE MONTH" badge
  - Title
  - Excerpt
  - Author info with avatar
  - "Read Article →" button

#### 3. **Featured Articles Section**
- Displays 3 featured posts
- Grid layout (responsive: 1/2/3 columns)
- Each card shows:
  - Graduate badge (🎓) if applicable
  - Category badge
  - Emoji icon
  - Title
  - Excerpt
  - Author name, country
  - Read time
  - Date
  - Sats amount (⚡ X sats)

#### 4. **All Posts Grid**
- Filterable by category
- Shows all posts or filtered posts
- Each card displays:
  - Graduate badge (if applicable)
  - Category badge
  - Emoji icon
  - Title
  - Excerpt
  - Author avatar, name, country, role
  - Date, read time
  - Sats amount

#### 5. **Write for Us CTA**
- Call-to-action section
- Link to `/blog/submit`
- Encourages graduates/mentors/community to submit

#### 6. **Submission Guidelines**
- Explains what content is published:
  - Student Essays
  - Use Cases & Stories
  - Technical & Development
  - Vision & Ideas

### Data Structure

**Blog Post Object:**
```typescript
{
  id: number;
  title: string;
  author: string;
  authorRole: string;        // e.g., "Graduate, Cohort 1"
  country: string;
  date: string;             // e.g., "March 15, 2025"
  category: string;          // Category ID
  excerpt: string;
  readTime: string;          // e.g., "6 min read"
  image: string;             // Emoji icon
  isGraduate: boolean;
  sats: string;              // e.g., "5,000"
}
```

**Current Data:**
- `featuredPosts`: Array of 3 featured posts
- `blogPosts`: Array of all blog posts (currently 6 posts)
- `blogOfTheMonth`: Single featured post object
- All data is **hardcoded** in the component (not from database)

---

## 📄 Individual Blog Post Page (`src/app/blog/[id]/page.tsx`)

### Structure Overview

**Type**: Server Component (async)  
**Purpose**: Display individual blog post content

### Key Features

#### 1. **Article Header**
- Back button to blog listing
- Category badge
- "Written by Academy Graduate" badge
- Emoji icon
- Title (large, bold)
- Author info:
  - Avatar (emoji)
  - Author name
  - Country • Role
- Date
- Read time

#### 2. **Sats Tipping Section**
- "Support the Author" section
- "⚡ Tip 1,000 sats" button
- Note about Lightning Network
- **Status**: UI placeholder (needs Lightning integration)

#### 3. **Article Content**
- Markdown-style content (currently plain text)
- Displayed in styled prose container
- Uses `whitespace-pre-line` for line breaks
- Supports markdown headers (##)

#### 4. **Author Profile Section**
- Author avatar
- Author name
- Graduate badge
- Author role
- Bio description
- "Follow on Nostr" link

#### 5. **Share Section**
- Share buttons:
  - Share on X (Twitter)
  - Share on Nostr
  - Copy Link
- **Status**: Buttons exist but functionality not implemented

#### 6. **CTA to Write**
- Encourages other graduates to submit
- Link to `/blog/submit`

### Data Structure

**Blog Post Detail Object:**
```typescript
{
  id: number;
  title: string;
  author: string;
  authorRole: string;
  date: string;
  category: string;
  readTime: string;
  image: string;           // Emoji
  content: string;          // Full article content (markdown-style)
}
```

**Current Data:**
- Posts stored in `blogPosts` Record (object with numeric keys)
- Currently only 3 posts defined (IDs: 1, 2, 3)
- **Not connected to database** - all hardcoded

---

## 📝 Blog Submission Page (`src/app/blog/submit/page.tsx`)

### Structure Overview

**Type**: Client Component (`'use client'`)  
**Purpose**: Allow users to submit blog posts

### Form Fields

#### Author Information
- Full Name (required)
- Email (required)
- Cohort (required) - e.g., "Cohort 1 - January 2025"
- Short Bio (optional) - 1-2 sentences

#### Blog Post Details
- Title (required)
- Category (required) - Dropdown:
  - Use Cases
  - Development
  - Community
  - Technology
  - Education
  - Other
- Content (required) - Large textarea
  - Word count display
  - Placeholder: "minimum 500 words, maximum 2000 words"

### Current Implementation

**Status**: Form exists but **not connected to backend**
- Currently uses placeholder Google Forms URL
- Shows alert on submit
- Resets form after "submission"
- **Needs**: Backend API endpoint to save submissions

---

## 🎨 Design Features

### Color Scheme
- **Cyan** (`#22d3ee`) - Primary accent for blog cards
- **Orange** (`#f97316`) - Secondary accent for badges/CTAs
- **Purple** (`#a855f7`) - Used for guidelines section
- **Dark Background** - Black with transparency (`bg-black/95`, `bg-black/80`)

### Animations
- Uses `AnimatedSection` component with:
  - `slideUp`
  - `slideLeft`
  - `slideRight`

### Responsive Design
- Grid layouts: `sm:grid-cols-2 lg:grid-cols-3`
- Text sizes: `text-4xl sm:text-5xl lg:text-6xl`
- Padding: `px-4 sm:px-6 lg:px-8`

---

## 🔧 Current Limitations & Missing Features

### ❌ Not Implemented

1. **Database Integration**
   - All blog posts are hardcoded
   - No database table for blog posts
   - No API endpoints for CRUD operations

2. **Lightning Tipping**
   - Tipping button exists but doesn't work
   - Needs Lightning Network integration
   - Needs LNURL or Lightning invoice generation

3. **Share Functionality**
   - Share buttons exist but don't work
   - Needs social media API integration
   - Copy link needs clipboard API

4. **Blog Submission**
   - Form doesn't save to database
   - No admin review system
   - No email notifications

5. **Content Management**
   - No admin interface to:
     - Approve/reject submissions
     - Edit published posts
     - Set "Blog of the Month"
     - Manage categories

6. **Markdown Rendering**
   - Content is plain text, not rendered markdown
   - No syntax highlighting for code
   - No image support

7. **Search Functionality**
   - No search bar
   - No tag system
   - No full-text search

8. **Comments System**
   - No comments on blog posts
   - No discussion threads

9. **Author Profiles**
   - Author info is hardcoded
   - No link to author's other posts
   - No author bio page

10. **SEO**
    - Basic metadata exists
    - No structured data (Article schema)
    - No sitemap entries for blog posts

---

## 📊 Suggested Database Schema

### `blog_posts` Table
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT NOT NULL,              -- Fallback if author deleted
  author_role TEXT,                       -- e.g., "Graduate, Cohort 1"
  author_country TEXT,
  author_bio TEXT,
  category TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  read_time INTEGER,                      -- Minutes
  image_emoji TEXT,                       -- Emoji icon
  is_featured BOOLEAN DEFAULT FALSE,
  is_blog_of_month BOOLEAN DEFAULT FALSE,
  sats_amount INTEGER DEFAULT 0,         -- Sats earned from tips
  status TEXT DEFAULT 'draft',           -- draft, pending, published, rejected
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `blog_submissions` Table
```sql
CREATE TABLE blog_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  cohort TEXT,
  author_bio TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',          -- pending, approved, rejected
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `blog_tips` Table (for Lightning tips)
```sql
CREATE TABLE blog_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id),
  tipper_email TEXT,                     -- Optional
  amount_sats INTEGER NOT NULL,
  lightning_invoice TEXT,
  lightning_preimage TEXT,
  status TEXT DEFAULT 'pending',         -- pending, paid, failed
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Recommended Next Steps

### Phase 1: Database & API
1. Create `blog_posts` table
2. Create `blog_submissions` table
3. Create API endpoints:
   - `GET /api/blog` - List all published posts
   - `GET /api/blog/[id]` - Get single post
   - `POST /api/blog/submit` - Submit new post
   - `GET /api/admin/blog` - Admin: List all posts (including drafts)
   - `POST /api/admin/blog/approve` - Approve submission
   - `POST /api/admin/blog/reject` - Reject submission

### Phase 2: Content Management
1. Migrate hardcoded posts to database
2. Add admin interface for:
   - Reviewing submissions
   - Editing posts
   - Setting featured posts
   - Setting "Blog of the Month"

### Phase 3: Enhanced Features
1. Markdown rendering (use `react-markdown` or similar)
2. Image upload support
3. Search functionality
4. Author profile pages
5. Related posts suggestions

### Phase 4: Lightning Integration
1. Integrate Lightning wallet
2. Generate Lightning invoices for tips
3. Track tip payments
4. Display tip totals on posts

### Phase 5: Social Features
1. Share functionality (Twitter, Nostr, etc.)
2. Comments system (optional)
3. Like/bookmark posts
4. Newsletter subscription

---

## 📝 Current Data Locations

### Blog Listing Page (`page.tsx`)
- `categories` - Array of category objects (lines 7-19)
- `featuredPosts` - Array of 3 featured posts (lines 21-64)
- `blogPosts` - Array of all posts (lines 66-151)
- `blogOfTheMonth` - Single featured post (lines 153-158)

### Blog Post Page (`[id]/page.tsx`)
- `blogPosts` - Record/object with post IDs as keys (lines 37-138)
- Currently only 3 posts defined (IDs: 1, 2, 3)

---

## 🎯 Key Components Used

1. **AnimatedSection** - For scroll animations
2. **Link** - Next.js Link component for navigation
3. **useState** - For category filtering and form state
4. **Metadata API** - For SEO (in `[id]/page.tsx`)

---

## 💡 Notes

- Blog posts use emoji icons instead of images
- Sats amounts are displayed but appear to be mock data
- All posts are marked as "Graduate" posts
- Categories match between listing and submission pages
- Form validation is basic (required fields only)
- No authentication check for submission (anyone can submit)
