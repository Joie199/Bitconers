-- Create Chapter 2 Assignment: "Money Under Pressure"
-- This assignment requires instructor review (text submission)

INSERT INTO assignments (
  id,
  title,
  description,
  chapter_number,
  chapter_slug,
  question,
  search_address,
  correct_answer,
  answer_type,
  points,
  status,
  cohort_id,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-4222-8222-222222222222', -- Deterministic UUID for Chapter 2 assignment
  'Assignment: Money Under Pressure',
  'Reflect on your experiences or observations of traditional money systems failing. Write about how you saw old money fail.',
  2,
  'the-journey-of-money',
  'Write about how you saw old money fail.',
  NULL,
  'INSTRUCTOR_REVIEW', -- Special value indicating this requires manual review
  'text',
  10,
  'active',
  NULL, -- Available to all cohorts
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  question = EXCLUDED.question,
  updated_at = NOW();

