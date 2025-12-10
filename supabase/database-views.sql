-- Useful Database Views for Pan-Africa Bitcoin Academy
-- Run this AFTER running schema.sql
-- These views simplify common queries

-- ============================================
-- 1. STUDENT SUMMARY VIEW
-- ============================================
-- Combines student data with profile information
CREATE OR REPLACE VIEW student_summary AS
SELECT 
  s.id,
  s.profile_id,
  p.name,
  p.email,
  p.student_id,
  p.status as profile_status,
  p.photo_url,
  s.progress_percent,
  s.assignments_completed,
  s.projects_completed,
  s.live_sessions_attended,
  s.created_at,
  s.updated_at
FROM students s
JOIN profiles p ON s.profile_id = p.id;

-- ============================================
-- 2. COHORT ENROLLMENT SUMMARY
-- ============================================
-- Shows cohort details with enrollment count
CREATE OR REPLACE VIEW cohort_enrollment_summary AS
SELECT 
  c.id,
  c.name,
  c.start_date,
  c.end_date,
  c.status,
  c.sessions,
  c.level,
  c.seats_total,
  COUNT(ce.id) as enrolled_count,
  (c.seats_total - COUNT(ce.id)) as available_seats,
  c.created_at,
  c.updated_at
FROM cohorts c
LEFT JOIN cohort_enrollment ce ON c.id = ce.cohort_id
GROUP BY c.id, c.name, c.start_date, c.end_date, c.status, c.sessions, c.level, c.seats_total, c.created_at, c.updated_at;

-- ============================================
-- 3. STUDENT REWARDS SUMMARY
-- ============================================
-- Aggregates sats rewards per student
CREATE OR REPLACE VIEW student_rewards_summary AS
SELECT 
  p.id as student_id,
  p.name,
  p.email,
  p.student_id,
  COALESCE(SUM(sr.amount_paid), 0) as total_paid,
  COALESCE(SUM(sr.amount_pending), 0) as total_pending,
  COUNT(sr.id) as reward_count
FROM profiles p
LEFT JOIN sats_rewards sr ON p.id = sr.student_id
GROUP BY p.id, p.name, p.email, p.student_id;

-- ============================================
-- 4. UPCOMING EVENTS VIEW
-- ============================================
-- Shows only future events, ordered by start time
CREATE OR REPLACE VIEW upcoming_events AS
SELECT 
  id,
  name,
  type,
  start_time,
  end_time,
  description,
  link,
  recording_url,
  created_at
FROM events
WHERE start_time > NOW()
ORDER BY start_time ASC;

-- ============================================
-- 5. STUDENT ACHIEVEMENTS SUMMARY
-- ============================================
-- Aggregates achievements per student
CREATE OR REPLACE VIEW student_achievements_summary AS
SELECT 
  p.id as student_id,
  p.name,
  p.email,
  p.student_id,
  COUNT(a.id) as achievement_count,
  COALESCE(SUM(a.points), 0) as total_points,
  ARRAY_AGG(a.badge_name) FILTER (WHERE a.badge_name IS NOT NULL) as badges
FROM profiles p
LEFT JOIN achievements a ON p.id = a.student_id
GROUP BY p.id, p.name, p.email, p.student_id;

-- ============================================
-- 6. APPLICATION SUMMARY
-- ============================================
-- Shows applications with cohort information
CREATE OR REPLACE VIEW application_summary AS
SELECT 
  a.id,
  a.first_name,
  a.last_name,
  a.email,
  a.phone,
  a.country,
  a.city,
  a.experience_level,
  a.status,
  a.preferred_cohort_id,
  c.name as cohort_name,
  c.level as cohort_level,
  a.created_at
FROM applications a
LEFT JOIN cohorts c ON a.preferred_cohort_id = c.id
ORDER BY a.created_at DESC;

-- ============================================
-- Grant access to views (if needed)
-- ============================================
-- These views inherit RLS policies from underlying tables
-- You may need to grant SELECT permissions if using service role

