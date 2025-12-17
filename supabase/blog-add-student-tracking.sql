-- Add student tracking to blog_posts table
-- This adds a computed column or index to help track academy students

-- Add index for faster student lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_student 
ON blog_posts(author_id) 
WHERE author_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN blog_posts.author_id IS 'References profiles(id). If this profile exists in students table, author is an academy student.';
