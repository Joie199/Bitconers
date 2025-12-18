-- Mentors table - stores approved mentor profiles
-- This table is linked to mentorship_applications and automatically populated when applications are approved

CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentorship_application_id UUID UNIQUE REFERENCES mentorship_applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Mentor', 'Volunteer', 'Guest Lecturer')),
  image_url TEXT,
  github TEXT,
  twitter TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mentors_application_id ON mentors(mentorship_application_id);
CREATE INDEX IF NOT EXISTS idx_mentors_type ON mentors(type);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON mentors(is_active);
CREATE INDEX IF NOT EXISTS idx_mentors_created_at ON mentors(created_at DESC);

-- Enable Row Level Security
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to SELECT active mentors (for display on website)
CREATE POLICY "Allow public to view active mentors" ON mentors
  FOR SELECT
  USING (is_active = true);

-- Policy: Block all INSERT operations from client (only service role can insert)
CREATE POLICY "Block client inserts" ON mentors
  FOR INSERT
  WITH CHECK (false);

-- Policy: Block all UPDATE operations from client (only service role can update)
CREATE POLICY "Block client updates" ON mentors
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- Policy: Block all DELETE operations from client (only service role can delete)
CREATE POLICY "Block client deletes" ON mentors
  FOR DELETE
  USING (false);

-- Add table and column comments for documentation
COMMENT ON TABLE mentors IS 'Approved mentors and volunteers - linked to mentorship_applications. Automatically created when applications are approved.';
COMMENT ON COLUMN mentors.mentorship_application_id IS 'Foreign key linking to the original mentorship application';
COMMENT ON COLUMN mentors.type IS 'Type of contributor: Mentor, Volunteer, or Guest Lecturer';
COMMENT ON COLUMN mentors.is_active IS 'If false, mentor is hidden from public display but not deleted';
COMMENT ON COLUMN mentors.description IS 'Short description/bio (typically from application experience or motivation)';
COMMENT ON COLUMN mentors.image_url IS 'Optional profile image URL';
COMMENT ON COLUMN mentors.github IS 'Optional GitHub profile URL';
COMMENT ON COLUMN mentors.twitter IS 'Optional Twitter/X profile URL';
