-- Blog System Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. BLOG POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,              -- Fallback if author deleted
  author_role TEXT,                       -- e.g., "Graduate, Cohort 1"
  author_country TEXT,
  author_bio TEXT,
  category TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  read_time INTEGER,                      -- Minutes (calculated from word count)
  image_emoji TEXT DEFAULT '📝',         -- Emoji icon
  is_featured BOOLEAN DEFAULT FALSE,
  is_blog_of_month BOOLEAN DEFAULT FALSE,
  sats_amount INTEGER DEFAULT 0,          -- Sats earned from tips
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. BLOG SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  cohort TEXT,
  author_bio TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,                     -- Calculated on insert
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. BLOG TIPS TABLE (for Lightning tips)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tipper_email TEXT,                     -- Optional
  amount_sats INTEGER NOT NULL,
  lightning_invoice TEXT,
  lightning_preimage TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Blog submissions indexes
CREATE INDEX IF NOT EXISTS idx_blog_submissions_status ON blog_submissions(status);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_author ON blog_submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_created ON blog_submissions(created_at DESC);

-- Blog tips indexes
CREATE INDEX IF NOT EXISTS idx_blog_tips_post ON blog_tips(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_tips_status ON blog_tips(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_blog_slug(title_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  slug := lower(title_text);
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Ensure uniqueness by appending number if needed
  WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = slug) LOOP
    slug := slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  RETURN slug;
END;
$$;

-- Function to calculate read time (average 200 words per minute)
CREATE OR REPLACE FUNCTION calculate_read_time(content_text TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  word_count INTEGER;
  read_time INTEGER;
BEGIN
  -- Count words (split by whitespace)
  word_count := array_length(string_to_array(trim(content_text), ' '), 1);
  IF word_count IS NULL THEN
    word_count := 0;
  END IF;
  
  -- Calculate read time (200 words per minute, minimum 1 minute)
  read_time := GREATEST(1, CEIL(word_count::NUMERIC / 200));
  
  RETURN read_time;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

DROP TRIGGER IF EXISTS update_blog_submissions_updated_at ON blog_submissions;
CREATE TRIGGER update_blog_submissions_updated_at
  BEFORE UPDATE ON blog_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

DROP TRIGGER IF EXISTS update_blog_tips_updated_at ON blog_tips;
CREATE TRIGGER update_blog_tips_updated_at
  BEFORE UPDATE ON blog_tips
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

-- Auto-calculate word count and read time on blog_posts insert/update
CREATE OR REPLACE FUNCTION set_blog_post_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Calculate word count
  word_count := array_length(string_to_array(trim(NEW.content), ' '), 1);
  IF word_count IS NULL THEN
    word_count := 0;
  END IF;
  
  -- Set read_time if not provided
  IF NEW.read_time IS NULL THEN
    NEW.read_time := GREATEST(1, CEIL(word_count::NUMERIC / 200));
  END IF;
  
  -- Generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_blog_slug(NEW.title);
  END IF;
  
  -- Set published_at when status changes to published
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    IF NEW.published_at IS NULL THEN
      NEW.published_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_blog_post_metadata ON blog_posts;
CREATE TRIGGER trigger_set_blog_post_metadata
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_post_metadata();

-- Auto-calculate word count on blog_submissions insert/update
CREATE OR REPLACE FUNCTION set_blog_submission_word_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Calculate word count
  word_count := array_length(string_to_array(trim(NEW.content), ' '), 1);
  IF word_count IS NULL THEN
    word_count := 0;
  END IF;
  
  NEW.word_count := word_count;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_blog_submission_word_count ON blog_submissions;
CREATE TRIGGER trigger_set_blog_submission_word_count
  BEFORE INSERT OR UPDATE ON blog_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_submission_word_count();

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tips ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access to published posts only
CREATE POLICY "Allow public read published blog posts"
ON blog_posts FOR SELECT
USING (status = 'published');

-- RLS Policies: Allow public insert on submissions
CREATE POLICY "Allow public insert blog submissions"
ON blog_submissions FOR INSERT
WITH CHECK (true);

-- RLS Policies: Allow public read own submissions
CREATE POLICY "Allow public read own blog submissions"
ON blog_submissions FOR SELECT
USING (true); -- Will be filtered by API based on email/auth

-- RLS Policies: Allow public insert tips
CREATE POLICY "Allow public insert blog tips"
ON blog_tips FOR INSERT
WITH CHECK (true);

-- RLS Policies: Allow public read tips for published posts
CREATE POLICY "Allow public read blog tips"
ON blog_tips FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM blog_posts 
    WHERE blog_posts.id = blog_tips.post_id 
    AND blog_posts.status = 'published'
  )
);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE blog_posts IS 'Published blog posts from academy graduates and community members';
COMMENT ON TABLE blog_submissions IS 'Blog post submissions awaiting review';
COMMENT ON TABLE blog_tips IS 'Lightning Network tips given to blog post authors';

COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly version of title, auto-generated if not provided';
COMMENT ON COLUMN blog_posts.read_time IS 'Estimated reading time in minutes, auto-calculated from word count';
COMMENT ON COLUMN blog_posts.sats_amount IS 'Total sats earned from tips (sum of blog_tips for this post)';
COMMENT ON COLUMN blog_submissions.word_count IS 'Word count of submission content, auto-calculated';
