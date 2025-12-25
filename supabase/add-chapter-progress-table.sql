-- Chapter Progress Table
-- Tracks student progress through chapters (unlocked and completed status)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chapter_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  chapter_slug TEXT NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, chapter_number) -- One progress record per student per chapter
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student ON chapter_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_chapter ON chapter_progress(chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_completed ON chapter_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_unlocked ON chapter_progress(is_unlocked);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student_chapter ON chapter_progress(student_id, chapter_number);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_chapter_progress_updated_at
  BEFORE UPDATE ON chapter_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE chapter_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapter_progress table
-- Students can view their own progress
CREATE POLICY "Students can view their own chapter progress"
  ON chapter_progress FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM profiles WHERE email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

-- Allow API (service role) to manage all chapter progress
-- Note: API endpoints use supabaseAdmin (service role) which bypasses RLS
-- This policy is for direct client access if needed
CREATE POLICY "API can manage chapter progress"
  ON chapter_progress FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE chapter_progress IS 'Tracks student progress through chapters - which chapters are unlocked and completed';
COMMENT ON COLUMN chapter_progress.student_id IS 'References profiles.id - the student who owns this progress record';
COMMENT ON COLUMN chapter_progress.chapter_number IS 'The chapter number (1-21)';
COMMENT ON COLUMN chapter_progress.chapter_slug IS 'The chapter slug for URL routing';
COMMENT ON COLUMN chapter_progress.is_unlocked IS 'Whether the student has access to this chapter';
COMMENT ON COLUMN chapter_progress.is_completed IS 'Whether the student has completed this chapter';

