# Event Creation Guide

## How to Create Events

### Event Visibility Options

When creating an event, you can choose:

1. **For Everyone** (`cohort_id = NULL`)
   - Visible to ALL users
   - Shows on everyone's calendar
   - Use for: General announcements, community events, public workshops

2. **For Specific Cohort** (`cohort_id = UUID`)
   - Visible ONLY to users in that cohort
   - Shows only on calendars of users in that cohort
   - Use for: Cohort-specific classes, assignments, deadlines

## Creating Events via API

### Get Available Cohorts

First, get the list of available cohorts:

```javascript
GET /api/events/cohorts

// Response:
{
  "cohorts": [
    { "id": "uuid1", "name": "Cohort 1", "status": "Active", ... },
    { "id": "uuid2", "name": "Cohort 2", "status": "Active", ... }
  ],
  "options": [
    { "id": "for_all", "name": "For Everyone", "label": "For Everyone (All Users)", "isForAll": true },
    { "id": "uuid1", "name": "Cohort 1", "isForAll": false },
    ...
  ]
}
```

### Create Event for Everyone

```javascript
POST /api/events/create
{
  "name": "Welcome Session",
  "type": "live-class",
  "start_time": "2025-01-15T19:00:00Z",
  "description": "Introduction to Bitcoin Academy",
  "link": "https://meet.example.com",
  "for_all": true  // or cohort_id: null, or cohort_id: "for_all"
}
```

### Create Event for Specific Cohort

```javascript
POST /api/events/create
{
  "name": "Cohort 1 Live Class",
  "type": "live-class",
  "start_time": "2025-01-20T18:00:00Z",
  "description": "Bitcoin Basics",
  "link": "https://meet.example.com",
  "cohort_id": "cohort-uuid-here"  // UUID from /api/events/cohorts
}
```

## Creating Events via SQL

### Event for Everyone

```sql
INSERT INTO events (name, type, start_time, description, link, cohort_id)
VALUES 
  ('Welcome Session', 'live-class', '2025-01-15 19:00:00+00', 'Introduction', 'https://meet.example.com', NULL);
```

### Event for Specific Cohort

```sql
-- First, get cohort ID
SELECT id, name FROM cohorts WHERE name = 'Cohort 1';

-- Then create event (replace UUID)
INSERT INTO events (name, type, start_time, description, link, cohort_id)
VALUES 
  ('Cohort 1 Class', 'live-class', '2025-01-20 18:00:00+00', 'Bitcoin Basics', 'https://meet.example.com', 'YOUR_COHORT_UUID');
```

## API Parameters

### Create Event API (`POST /api/events/create`)

**Required:**
- `name` (string) - Event name/title
- `start_time` (ISO string) - Event start time

**Optional:**
- `type` (string) - Event type: `live-class`, `assignment`, `community`, `workshop`, `deadline`, `quiz`, `cohort`
- `end_time` (ISO string) - Event end time
- `description` (string) - Event description
- `link` (string) - Event link/URL
- `recording_url` (string) - Recording URL (for past events)
- `cohort_id` (string | null) - Cohort UUID or `null`/`"for_all"` for everyone
- `for_all` (boolean) - Set to `true` for everyone, `false` for specific cohort

**Note:** Use either `for_all: true` OR `cohort_id: null` OR `cohort_id: "for_all"` to create events for everyone.

## Example: Complete Event Creation Flow

```javascript
// Step 1: Get available cohorts
const cohortsRes = await fetch('/api/events/cohorts');
const { options } = await cohortsRes.json();

// Step 2: User selects "For Everyone" or a specific cohort
const selectedOption = options[0]; // "For Everyone" or a cohort

// Step 3: Create event
const eventData = {
  name: "Live Class",
  type: "live-class",
  start_time: "2025-01-15T19:00:00Z",
  description: "Introduction to Bitcoin",
  link: "https://meet.example.com",
};

// If "For Everyone" selected
if (selectedOption.isForAll) {
  eventData.for_all = true;
  // or: eventData.cohort_id = null;
} else {
  eventData.cohort_id = selectedOption.id;
}

const createRes = await fetch('/api/events/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(eventData),
});

const result = await createRes.json();
console.log('Event created:', result);
```

## Database Column

The `cohort_id` column in the `events` table:
- **NULL** = Event is for everyone
- **UUID** = Event is for specific cohort (references `cohorts.id`)

## Verification

Check events and their visibility:

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
  END as visibility,
  c.name as cohort_name
FROM events e
LEFT JOIN cohorts c ON e.cohort_id = c.id
ORDER BY start_time;
```

