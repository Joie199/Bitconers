# 📚 Pan-Africa Bitcoin Academy - GitHub Documentation Guide

This guide provides comprehensive documentation for developers, contributors, and maintainers working with the Pan-Africa Bitcoin Academy codebase.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Supabase Account** for database access
- **GitHub Account** for repository access

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Joie199/pan-africa-bitcoin-academy.git
   cd pan-africa-bitcoin-academy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   - Copy `.env.template` to `.env.local`
   - Fill in your Supabase credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
pan-africa-bitcoin-academy/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── chapters/          # Learning chapters
│   │   ├── apply/             # Student application
│   │   ├── mentorship/        # Mentorship program
│   │   └── ...
│   ├── components/            # React components
│   ├── content/               # Content files (chapters, exam questions)
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility functions
├── public/                     # Static assets
├── supabase/                   # Database migrations
└── README.md                   # Main project documentation
```

---

## 🗄️ Database Schema

### Core Tables

- **`profiles`** - User profiles and authentication
- **`students`** - Student academic data and progress
- **`chapters`** - Chapter content and metadata
- **`chapter_progress`** - Student chapter completion tracking
- **`sats_rewards`** - Bitcoin rewards system
- **`mentors`** - Mentor profiles
- **`mentorship_applications`** - Mentorship applications
- **`student_testimonials`** - Student testimonials
- **`sponsorships`** - Student sponsorship tracking
- **`exam_results`** - Final exam results
- **`exam_access`** - Exam access control
- **`admins`** - Admin user accounts
- **`cohorts`** - Learning cohorts
- **`events`** - Calendar events and live sessions
- **`blog_posts`** - Blog posts

### Database Migrations

All SQL migration files are in the `supabase/` directory:

- `schema.sql` - Main database schema
- `add-exam-tables.sql` - Exam system tables
- `add-mentors-table.sql` - Mentors table
- `add-testimonials-table.sql` - Testimonials table
- `add-sponsorships-table.sql` - Sponsorships table
- `add-cohort-id-to-events.sql` - Events cohort linking

**To apply migrations:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from the migration file
3. Run the query

---

## 🔧 Development Workflow

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write code following TypeScript best practices
   - Use Tailwind CSS for styling
   - Follow existing code patterns

3. **Test Your Changes**
   ```bash
   npm run build    # Check for build errors
   npm run dev      # Test locally
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Add description and request review

### Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any` when possible
- **React**: Use functional components with hooks
- **Styling**: Use Tailwind CSS utility classes
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Add comments for complex logic

---

## 🎓 Key Features Documentation

### Chapter System

- **Location**: `src/app/chapters/[slug]/page.tsx`
- **Content**: `src/content/chaptersContent.ts`
- **Progress Tracking**: `src/app/chapters/[slug]/ChapterCompletionTracker.tsx`
- **Navigation**: `src/app/chapters/[slug]/NextChapterButton.tsx`

**Features:**
- 4-minute reading timer for chapter completion
- Confirmation dialog when navigating before completion
- Progress tracking in `chapter_progress` table
- Chapter locking system (must complete previous chapters)

### Exam System

- **Location**: `src/app/exam/page.tsx`
- **Questions**: `src/content/examQuestions.ts`
- **API Routes**: `src/app/api/exam/`

**Features:**
- 50 multiple-choice questions
- Access control (Chapter 21 completion or admin grant)
- Scoring and results storage
- Admin exam management interface

### Mentorship System

- **Application Page**: `src/app/mentorship/page.tsx`
- **Database**: `mentors` and `mentorship_applications` tables
- **API**: `src/app/api/mentorship/` and `src/app/api/mentors/`

**Features:**
- Application form with role selection
- Admin approval workflow
- Automatic mentor profile creation on approval
- Dynamic mentor display on home, mentorship, and developer pages

### Sponsorship System

- **Page**: `src/app/sponsor/page.tsx`
- **Database**: `sponsorships` table
- **API**: `src/app/api/sponsor/`

**Features:**
- General or student-specific sponsorship
- Student selection interface
- Bitcoin payment integration (Lightning & On-chain)
- Sponsorship tracking and management

---

## 🔐 Authentication & Authorization

### Student Authentication

- **Hook**: `src/hooks/useAuth.ts`
- **API**: `src/app/api/profile/`
- **Session Management**: `src/lib/session.ts`

**Flow:**
1. Student registers via `/apply` page
2. Admin approves application
3. Student sets password
4. Student logs in via Navbar

### Admin Authentication

- **Hook**: `src/hooks/useSession.ts`
- **API**: `src/app/api/admin/`
- **Session Management**: `src/lib/adminSession.ts`

**Flow:**
1. Admin logs in via `/admin` page
2. Session stored in cookies
3. Admin badge displayed on all pages
4. Admin can bypass chapter/exam restrictions

---

## 📊 Database-Driven Features

### Dynamic Content

The following sections fetch data from the database:

- **Home Page Impact Stats**: Students trained, sats rewarded, countries represented
- **Mentors Display**: Home page, mentorship page, developer hub page
- **Student Testimonials**: Impact page
- **Sats Reward Economy**: Impact page (Sats Earned, Spent, Circulated)
- **Sponsorships**: Sponsor page with student selection

### API Endpoints

All API routes are in `src/app/api/`:

- `/api/mentors` - Fetch active mentors
- `/api/impact/metrics` - Impact statistics
- `/api/impact/sats-stats` - Sats reward statistics
- `/api/impact/testimonials` - Student testimonials
- `/api/sponsor/students` - Students available for sponsorship
- `/api/chapters/unlock-status` - Chapter access status
- `/api/exam/check-access` - Exam access check

---

## 🚢 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Go to Vercel Dashboard
   - Import GitHub repository
   - Vercel auto-detects Next.js

2. **Environment Variables**
   - Add all environment variables from `.env.local`
   - Set in Vercel Dashboard → Settings → Environment Variables

3. **Deploy**
   - Vercel auto-deploys on push to `main` branch
   - Preview deployments for pull requests

### Database Setup

1. **Supabase Project**
   - Create project at supabase.com
   - Run all SQL migrations from `supabase/` directory
   - Configure RLS policies

2. **Storage**
   - Set up Supabase Storage buckets for:
     - Profile images
     - Certificate images
     - Blog post images

---

## 🧪 Testing

### Build Testing

```bash
npm run build    # Test production build
```

### Local Testing

```bash
npm run dev      # Start development server
```

### Database Testing

- Use Supabase SQL Editor for query testing
- Check RLS policies in Supabase Dashboard
- Test API endpoints via browser or Postman

---

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript errors: `npm run build`
   - Verify all imports are correct
   - Check for missing dependencies

2. **Database Connection**
   - Verify environment variables are set
   - Check Supabase project is active
   - Verify service role key has correct permissions

3. **Authentication Issues**
   - Clear browser cookies
   - Check session expiration settings
   - Verify password hashing is working

4. **Image Loading**
   - Verify images are in `public/images/` directory
   - Check image paths in code match file structure
   - Ensure Next.js Image component is used correctly

---

## 📝 Contributing

### How to Contribute

1. **Fork the Repository**
   - Click "Fork" on GitHub
   - Clone your fork locally

2. **Make Changes**
   - Follow the development workflow above
   - Write clear commit messages
   - Test your changes thoroughly

3. **Submit Pull Request**
   - Push to your fork
   - Create PR with detailed description
   - Wait for review and feedback

### Contribution Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation if needed
- Test all changes before submitting
- Be respectful in discussions

---

## 📚 Additional Resources

### External Links

- **Website**: https://panafricanbitcoin.com
- **GitHub Repository**: https://github.com/Joie199/pan-africa-bitcoin-academy
- **Discord**: https://discord.gg/4G4TUAP7
- **Nostr**: https://jumble.social/users/npub1q659nzy6j3mn8nr8ljznzumplesd40276tefj6gjz72npmqqg5cqmh70vv

### Documentation Files

- `README.md` - Main project overview
- `STEP_BY_STEP_GUIDE.md` - This file (GitHub documentation)
- `supabase/schema.sql` - Database schema reference

---

## 🔄 Version Control

### Git Workflow

- **Main Branch**: Production-ready code
- **Feature Branches**: New features and improvements
- **Commit Messages**: Use descriptive, clear messages
- **Pull Requests**: Required for all changes

### Important Commands

```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/name

# Switch branches
git checkout branch-name
```

---

## 🎯 Project Goals

Pan-African Bitcoin Academy is an open-source Bitcoin education infrastructure that teaches Bitcoin from first principles and builds long-term technical and contributor capacity in underserved communities.

### Mission

- Provide free, high-quality Bitcoin education
- Build technical capacity in African communities
- Foster Bitcoin developer talent
- Create sustainable Bitcoin education infrastructure

---

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our community for discussions
- **Email**: Contact through website contact form

---

**Last Updated**: January 2025

**Maintained by**: Pan-Africa Bitcoin Academy Team
