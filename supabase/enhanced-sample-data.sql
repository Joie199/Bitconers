-- Enhanced Sample Data for Pan-Africa Bitcoin Academy
-- Run this AFTER running schema.sql
-- This provides comprehensive test data for development

-- ============================================
-- 1. COHORTS - More realistic data
-- ============================================
INSERT INTO cohorts (name, start_date, end_date, status, sessions, level, seats_total)
VALUES 
  ('Cohort 1 - Beginner', '2025-02-01', '2025-05-01', 'Upcoming', 12, 'Beginner', 30),
  ('Cohort 2 - Intermediate', '2025-03-15', '2025-06-15', 'Upcoming', 16, 'Intermediate', 25),
  ('Cohort 3 - Advanced', '2025-04-01', '2025-07-01', 'Upcoming', 20, 'Advanced', 20),
  ('Cohort 4 - Beginner', '2025-06-01', '2025-09-01', 'Upcoming', 12, 'Beginner', 30),
  ('Cohort 5 - Intermediate', '2025-07-15', '2025-10-15', 'Upcoming', 16, 'Intermediate', 25)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. EVENTS - Comprehensive calendar events
-- ============================================
INSERT INTO events (name, type, start_time, end_time, description, link, recording_url)
VALUES 
  -- Live Classes
  ('Introduction to Bitcoin', 'live-class', '2025-02-01 10:00:00+00', '2025-02-01 12:00:00+00', 'First class introducing Bitcoin fundamentals, history, and why it matters', 'https://meet.example.com/intro', NULL),
  ('Bitcoin Security Best Practices', 'live-class', '2025-02-08 10:00:00+00', '2025-02-08 12:00:00+00', 'Learn how to secure your Bitcoin: wallets, keys, and self-custody', 'https://meet.example.com/security', NULL),
  ('Understanding UTXOs', 'live-class', '2025-02-15 10:00:00+00', '2025-02-15 12:00:00+00', 'Deep dive into Unspent Transaction Outputs', 'https://meet.example.com/utxo', NULL),
  ('Lightning Network Basics', 'live-class', '2025-02-22 10:00:00+00', '2025-02-22 12:00:00+00', 'Introduction to Lightning Network for fast, cheap transactions', 'https://meet.example.com/lightning', NULL),
  
  -- Workshops
  ('UTXO Deep Dive Workshop', 'workshop', '2025-02-08 14:00:00+00', '2025-02-08 16:00:00+00', 'Hands-on workshop: Understanding UTXOs in detail', 'https://meet.example.com/utxo-workshop', NULL),
  ('Wallet Setup Workshop', 'workshop', '2025-02-15 14:00:00+00', '2025-02-15 16:00:00+00', 'Practical session: Setting up and securing your Bitcoin wallet', 'https://meet.example.com/wallet-setup', NULL),
  
  -- Deadlines
  ('Assignment 1 Deadline', 'deadline', '2025-02-15 23:59:59+00', '2025-02-15 23:59:59+00', 'Submit your first assignment on Bitcoin basics', NULL, NULL),
  ('Assignment 2 Deadline', 'deadline', '2025-02-22 23:59:59+00', '2025-02-22 23:59:59+00', 'Submit your second assignment on UTXOs', NULL, NULL),
  ('Project Proposal Deadline', 'deadline', '2025-03-01 23:59:59+00', '2025-03-01 23:59:59+00', 'Submit your final project proposal', NULL, NULL),
  
  -- Community Events
  ('Community Office Hours', 'community', '2025-02-25 18:00:00+00', '2025-02-25 19:00:00+00', 'Open Q&A session with mentors', 'https://meet.example.com/office-hours', NULL),
  ('Bitcoin Developer Meetup', 'community', '2025-03-05 18:00:00+00', '2025-03-05 20:00:00+00', 'Monthly meetup for Bitcoin developers', 'https://meet.example.com/dev-meetup', NULL),
  
  -- Quizzes
  ('Bitcoin Basics Quiz', 'quiz', '2025-02-10 10:00:00+00', '2025-02-10 11:00:00+00', 'Test your understanding of Bitcoin fundamentals', 'https://quiz.example.com/basics', NULL),
  ('UTXO Quiz', 'quiz', '2025-02-17 10:00:00+00', '2025-02-17 11:00:00+00', 'Quiz on UTXO concepts', 'https://quiz.example.com/utxo', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. DEVELOPER RESOURCES
-- ============================================
INSERT INTO developer_resources (title, url, category, level, description)
VALUES 
  ('Bitcoin Core Documentation', 'https://bitcoincore.org/en/documentation/', 'Documentation', 'Beginner', 'Official Bitcoin Core documentation and guides'),
  ('Mastering Bitcoin Book', 'https://github.com/bitcoinbook/bitcoinbook', 'Book', 'Intermediate', 'Comprehensive book on Bitcoin by Andreas M. Antonopoulos'),
  ('Bitcoin Developer Guide', 'https://bitcoin.org/en/developer-guide', 'Documentation', 'Beginner', 'Official Bitcoin developer guide'),
  ('Bitcoin Script', 'https://en.bitcoin.it/wiki/Script', 'Documentation', 'Advanced', 'Bitcoin Script language reference'),
  ('Lightning Network Specification', 'https://github.com/lightning/bolts', 'Specification', 'Advanced', 'Lightning Network BOLT specifications'),
  ('Bitcoin Improvement Proposals', 'https://github.com/bitcoin/bips', 'Specification', 'Advanced', 'Bitcoin Improvement Proposals (BIPs)'),
  ('Sparrow Wallet', 'https://sparrowwallet.com/', 'Tool', 'Beginner', 'Educational Bitcoin wallet for understanding UTXOs'),
  ('Mempool.space', 'https://mempool.space/', 'Tool', 'Beginner', 'Bitcoin block explorer and mempool visualizer'),
  ('Bitcoin CLI Reference', 'https://bitcoin.org/en/developer-reference#bitcoin-core-apis', 'Documentation', 'Intermediate', 'Bitcoin Core RPC API reference')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. DEVELOPER EVENTS
-- ============================================
INSERT INTO developer_events (name, type, start_time, end_time, location, link, description)
VALUES 
  ('Bitcoin Core Dev Meeting', 'meeting', '2025-03-01 14:00:00+00', '2025-03-01 16:00:00+00', 'Online', 'https://bitcoincore.org/en/meetings/', 'Monthly Bitcoin Core developer meeting'),
  ('Lightning Hack Day', 'hackathon', '2025-03-15 09:00:00+00', '2025-03-15 18:00:00+00', 'Online', 'https://lightning.network/hackday', 'Build Lightning Network applications'),
  ('Bitcoin Developer Workshop', 'workshop', '2025-04-01 10:00:00+00', '2025-04-01 17:00:00+00', 'Online', 'https://bitcoin.dev/workshop', 'Hands-on Bitcoin development workshop'),
  ('African Bitcoin Developer Summit', 'conference', '2025-05-10 09:00:00+00', '2025-05-12 18:00:00+00', 'Kampala, Uganda', 'https://africabitcoin.dev/summit', 'Annual summit for African Bitcoin developers')
ON CONFLICT DO NOTHING;

-- ============================================
-- Note: Profiles, students, and rewards will be created
-- through the application when users sign up
-- ============================================

-- ============================================
-- 5. SAMPLE PROFILES (Optional - for testing)
-- ============================================
-- Uncomment below if you want to create test profiles
/*
DO $$
DECLARE
  cohort1_id UUID;
  profile1_id UUID;
  profile2_id UUID;
BEGIN
  -- Get cohort ID
  SELECT id INTO cohort1_id FROM cohorts WHERE name = 'Cohort 1 - Beginner' LIMIT 1;
  
  -- Create test profiles
  INSERT INTO profiles (name, email, student_id, status, cohort_id)
  VALUES 
    ('John Doe', 'john.doe@example.com', '1/1/2025', 'Active', cohort1_id),
    ('Jane Smith', 'jane.smith@example.com', '1/2/2025', 'Active', cohort1_id)
  RETURNING id INTO profile1_id, profile2_id;
  
  -- Create student records
  INSERT INTO students (profile_id, progress_percent, assignments_completed)
  VALUES 
    (profile1_id, 45, 3),
    (profile2_id, 60, 5);
  
  -- Create sats rewards
  INSERT INTO sats_rewards (student_id, amount_paid, amount_pending, reason)
  VALUES 
    (profile1_id, 5000, 2000, 'Completed Assignment 1'),
    (profile2_id, 8000, 3000, 'Completed Assignment 2');
  
  -- Create achievements
  INSERT INTO achievements (student_id, badge_name, points, description)
  VALUES 
    (profile1_id, 'First Steps', 100, 'Completed first assignment'),
    (profile2_id, 'Quick Learner', 200, 'Completed 5 assignments');
END $$;
*/

