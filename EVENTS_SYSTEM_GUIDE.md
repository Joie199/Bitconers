# Events System Guide

## How Events Work

### Event Visibility Rules

1. **Events for Everyone** (`cohort_id = NULL`)
   - Visible to ALL users
   - Shows on everyone's calendar
   - Use for: General announcements, community events, public workshops

2. **Events for Specific Cohort** (`cohort_id = UUID`)
   - Visible ONLY to users in that cohort
   - Shows only on calendars of users in that cohort
   - Use for: Cohort-specific classes, assignments, deadlines

### How Filtering Works

When a user views the calendar:
- **If user has a cohort**: Sees events for everyone + events for their cohort
- **If user has no cohort**: Sees only events for everyone

## Creating Events

### Method 1: Via API

```typescript
// Create event for everyone
POST /api/events/create
{
  "name": "Welcome Session",
  "type": "live-class",
  "start_time": "2025-01-15T19:00:00Z",
  "description": "Introduction to Bitcoin Academy",
  "link": "https://meet.example.com",
  "cohort_id": null  // null = for everyone
}

// Create event for specific cohort
POST /api/events/create
{
  "name": "Cohort 1 Live Class",
  "type": "live-class",
  "start_time": "2025-01-20T18:00:00Z",
  "description": "Bitcoin Basics",
  "link": "https://meet.example.com",
  "cohort_id": "cohort-uuid-here"  // UUID = for specific cohort
}
```

### Method 2: Via Supabase SQL

```sql
-- Event for everyone
INSERT INTO events (name, type, start_time, description, link, cohort_id)
VALUES 
  ('Welcome Session', 'live-class', '2025-01-15 19:00:00+00', 'Introduction', 'https://meet.example.com', NULL);

-- Event for specific cohort
INSERT INTO events (name, type, start_time, description, link, cohort_id)
VALUES 
  ('Cohort 1 Class', 'live-class', '2025-01-20 18:00:00+00', 'Bitcoin Basics', 'https://meet.example.com', 'YOUR_COHORT_UUID');
```

## Event Types

- `live-class` - Live classes/sessions
- `assignment` - Assignments
- `community` - Community events
- `workshop` - Workshops
- `deadline` - Deadlines
- `quiz` - Quizzes
- `cohort` - Cohort-specific events

## Database Setup

### Step 1: Run Migration

Run this in Supabase SQL Editor:
```sql
-- Run: supabase/add-cohort-id-to-events.sql
```

This adds the `cohort_id` column to the events table.

### Step 2: Verify Column Exists

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'cohort_id';
```

## Testing Events

### Test 1: Check Events in Database

```sql
SELECT 
  id,
  name,
  type,
  start_time,
  cohort_id,
  CASE 
    WHEN cohort_id IS NULL THEN 'For Everyone'
    ELSE 'For Specific Cohort'
  END as visibility
FROM events
ORDER BY start_time;
```

### Test 2: Test API Filtering

```javascript
// Get events for everyone
fetch('/api/events')
  .then(r => r.json())
  .then(data => console.log('Events for everyone:', data));

// Get events for a specific cohort
fetch('/api/events?cohort_id=YOUR_COHORT_UUID')
  .then(r => r.json())
  .then(data => console.log('Events for cohort:', data));
```

### Test 3: Verify Calendar Display

1. Log in as user with cohort → Should see: events for everyone + cohort events
2. Log in as user without cohort → Should see: only events for everyone
3. Check browser console for calendar logs

## Example Events

### For Everyone (Public Events)
```sql
INSERT INTO events (name, type, start_time, description, link, cohort_id)
VALUES 
  ('Bitcoin Academy Welcome', 'community', NOW() + INTERVAL '1 day', 'Welcome all new students', 'https://meet.example.com', NULL),
  ('Office Hours', 'community', NOW() + INTERVAL '3 days', 'Open Q&A session', 'https://meet.example.com', NULL),
  ('Public Workshop', 'workshop', NOW() + INTERVAL '7 days', 'Bitcoin Basics Workshop', 'https://meet.example.com', NULL);
```

### For Specific Cohort
```sql
-- First, get a cohort ID
SELECT id, name FROM cohorts LIMIT 1;

-- Then create cohort-specific event (replace UUID)
INSERT INTO events (name, type, start_time, description, link, cohort_id)
VALUES 
  ('Cohort 1 Live Class', 'live-class', NOW() + INTERVAL '2 days', 'Introduction to Bitcoin', 'https://meet.example.com', 'YOUR_COHORT_UUID'),
  ('Cohort 1 Assignment Due', 'deadline', NOW() + INTERVAL '5 days', 'Submit Assignment 1', '#', 'YOUR_COHORT_UUID');
```

## Verification Checklist

- [ ] `cohort_id` column exists in events table
- [ ] Can create events for everyone (cohort_id = NULL)
- [ ] Can create events for specific cohort (cohort_id = UUID)
- [ ] Calendar shows events for everyone to all users
- [ ] Calendar shows cohort events only to users in that cohort
- [ ] Users without cohort see only events for everyone

