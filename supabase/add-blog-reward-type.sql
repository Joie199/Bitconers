-- Add 'blog' to reward_type CHECK constraint in sats_rewards table
-- This allows blog posts to be tracked as a reward type

-- First, drop the existing constraint
ALTER TABLE sats_rewards DROP CONSTRAINT IF EXISTS sats_rewards_reward_type_check;

-- Add the constraint with 'blog' included
ALTER TABLE sats_rewards 
  ADD CONSTRAINT sats_rewards_reward_type_check 
  CHECK (reward_type IN ('assignment', 'chapter', 'discussion', 'peer_help', 'project', 'attendance', 'blog', 'other'));
