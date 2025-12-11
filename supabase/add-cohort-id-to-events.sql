-- Add cohort_id column to events table
-- This allows events to be cohort-specific or for everyone (if null)

-- Add cohort_id column if it doesn't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_cohort_id ON events(cohort_id);

-- Add index for start_time (already used for ordering)
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

-- Add comment
COMMENT ON COLUMN events.cohort_id IS 'If NULL, event is for everyone (all users can see it). If set to a cohort UUID, event is only visible to users in that specific cohort.';

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'cohort_id';

