-- Create Chapter 7 Assignment: "Build a Block (Conceptual)"
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
  '77777777-7777-4777-8777-777777777777', -- Deterministic UUID for Chapter 7 assignment
  'Assignment: Build a Block (Conceptual)',
  'Demonstrate your understanding of blockchain structure and block creation. Conceptually explain how a block is built, including transactions, hash, and linking to previous block.',
  7,
  'blockchain-basics',
  'Conceptually explain how a block is built, including transactions, hash, and linking to previous block.',
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

