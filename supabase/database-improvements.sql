-- Database Improvements and Optimizations
-- Run this AFTER running schema.sql
-- Adds additional indexes, constraints, and helpful functions

-- ============================================
-- 1. ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================

-- Index for filtering events by type
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

-- Index for filtering cohorts by status
CREATE INDEX IF NOT EXISTS idx_cohorts_status ON cohorts(status);

-- Index for filtering cohorts by level
CREATE INDEX IF NOT EXISTS idx_cohorts_level ON cohorts(level);

-- Index for applications by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Index for applications by email (for duplicate checking)
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);

-- Index for profiles by status
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Index for profiles by cohort_id
CREATE INDEX IF NOT EXISTS idx_profiles_cohort ON profiles(cohort_id);

-- Composite index for event queries (type + start_time)
CREATE INDEX IF NOT EXISTS idx_events_type_start ON events(type, start_time);

-- ============================================
-- 2. ADDITIONAL CONSTRAINTS
-- ============================================

-- Ensure progress_percent is between 0 and 100
ALTER TABLE students 
  ADD CONSTRAINT check_progress_percent 
  CHECK (progress_percent >= 0 AND progress_percent <= 100);

-- Ensure amounts are non-negative
ALTER TABLE sats_rewards 
  ADD CONSTRAINT check_amount_paid 
  CHECK (amount_paid >= 0);

ALTER TABLE sats_rewards 
  ADD CONSTRAINT check_amount_pending 
  CHECK (amount_pending >= 0);

-- Ensure seats_total is positive
ALTER TABLE cohorts 
  ADD CONSTRAINT check_seats_total 
  CHECK (seats_total >= 0);

-- Ensure sessions is non-negative
ALTER TABLE cohorts 
  ADD CONSTRAINT check_sessions 
  CHECK (sessions >= 0);

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to get available seats for a cohort
CREATE OR REPLACE FUNCTION get_cohort_available_seats(cohort_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_seats INTEGER;
  enrolled_count INTEGER;
BEGIN
  SELECT seats_total INTO total_seats
  FROM cohorts
  WHERE id = cohort_uuid;
  
  SELECT COUNT(*) INTO enrolled_count
  FROM cohort_enrollment
  WHERE cohort_id = cohort_uuid;
  
  RETURN COALESCE(total_seats, 0) - COALESCE(enrolled_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get student's total sats earned
CREATE OR REPLACE FUNCTION get_student_total_sats(student_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_sats INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount_paid), 0) INTO total_sats
  FROM sats_rewards
  WHERE student_id = student_uuid;
  
  RETURN total_sats;
END;
$$ LANGUAGE plpgsql;

-- Function to check if email exists in profiles
CREATE OR REPLACE FUNCTION profile_email_exists(email_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM profiles
  WHERE email = LOWER(TRIM(email_text));
  
  RETURN exists_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TRIGGERS FOR DATA INTEGRITY
-- ============================================

-- Trigger to automatically create student record when profile is created
-- (This is handled in the application, but can be done via trigger too)
CREATE OR REPLACE FUNCTION create_student_on_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO students (profile_id, progress_percent, assignments_completed, projects_completed, live_sessions_attended)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Uncomment to enable auto-creation of student records
-- CREATE TRIGGER trigger_create_student_on_profile
--   AFTER INSERT ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION create_student_on_profile_insert();

-- ============================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE profiles IS 'User profiles and authentication data. Each profile can have one student record.';
COMMENT ON TABLE students IS 'Academic progress data for enrolled students. Linked to profiles.';
COMMENT ON TABLE cohorts IS 'Course cohorts with different levels (Beginner, Intermediate, Advanced).';
COMMENT ON TABLE cohort_enrollment IS 'Many-to-many relationship between cohorts and students.';
COMMENT ON TABLE events IS 'Calendar events including live classes, workshops, deadlines, and community events.';
COMMENT ON TABLE sats_rewards IS 'Bitcoin rewards (in sats) for students. Tracks paid and pending amounts.';
COMMENT ON TABLE achievements IS 'Badges and achievements earned by students.';
COMMENT ON TABLE applications IS 'Student applications for cohort enrollment.';
COMMENT ON TABLE developer_resources IS 'Resources for Bitcoin developers (documentation, tools, etc.).';
COMMENT ON TABLE developer_events IS 'Developer events, meetups, and hackathons.';

COMMENT ON COLUMN profiles.student_id IS 'Format: cohort_number/roll_number/year (e.g., 1/1/2025)';
COMMENT ON COLUMN events.type IS 'Type of event: live-class, workshop, deadline, community, quiz, cohort';
COMMENT ON COLUMN cohorts.level IS 'Difficulty level: Beginner, Intermediate, Advanced';
COMMENT ON COLUMN cohorts.status IS 'Cohort status: Upcoming, Active, Completed';

