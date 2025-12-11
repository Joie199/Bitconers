# Calendar Events Verification Guide

## Quick Check Steps

### 1. **Check if Events Database has Data**

Open your browser console (F12) and run:
```javascript
fetch('/api/events/check')
  .then(r => r.json())
  .then(data => {
    console.log('Events in database:', data);
    console.log('Has data:', data.hasData);
    console.log('Event count:', data.count);
    if (data.events) {
      console.table(data.events);
    }
  });
```

Or visit in browser:
```
http://localhost:3000/api/events/check
```

### 2. **Check Calendar Console Logs**

1. Open browser console (F12)
2. Navigate to dashboard (where calendar is shown)
3. Look for these logs:
   - `📅 Calendar: Fetching events from: /api/events`
   - `📅 Calendar: Received events data: {...}`
   - `📅 Calendar: Transformed events: X`
   - `✅ Calendar: Events loaded successfully` (if events found)

### 3. **Verify Events API Response**

Test the events API directly:
```javascript
// Test without cohort filter
fetch('/api/events')
  .then(r => r.json())
  .then(data => {
    console.log('All events:', data);
    console.log('Events count:', data.events?.length || 0);
  });

// Test with cohort filter (if you have a cohort ID)
fetch('/api/events?cohort_id=YOUR_COHORT_ID')
  .then(r => r.json())
  .then(data => {
    console.log('Cohort events:', data);
  });
```

## Expected Results

### ✅ If Events Exist:
- `hasData: true`
- `count: > 0`
- Events appear in calendar
- Console shows: `✅ Calendar: Events loaded successfully`

### ❌ If No Events:
- `hasData: false`
- `count: 0`
- Calendar shows fallback events
- Console shows: `⚠️ Calendar: No valid events found, using fallback`

## Adding Test Events

If no events exist, add some test events:

### Via Supabase SQL Editor:
```sql
-- Add a test event for everyone
INSERT INTO events (name, type, start_time, description, link)
VALUES 
  ('Welcome Session', 'live-class', NOW() + INTERVAL '1 day', 'Introduction to Bitcoin Academy', 'https://meet.example.com'),
  ('Office Hours', 'community', NOW() + INTERVAL '2 days', 'Q&A with mentors', 'https://meet.example.com'),
  ('Assignment Due', 'deadline', NOW() + INTERVAL '3 days', 'Submit your first assignment', '#');

-- Add a cohort-specific event (replace with actual cohort ID)
INSERT INTO events (name, type, start_time, description, link, cohort_id)
VALUES 
  ('Cohort 1 Live Class', 'live-class', NOW() + INTERVAL '5 days', 'Bitcoin Basics', 'https://meet.example.com', 'YOUR_COHORT_UUID');
```

### Check After Adding:
```sql
-- Verify events were added
SELECT id, name, type, start_time, cohort_id, created_at 
FROM events 
ORDER BY start_time;
```

## Troubleshooting

### Issue: Calendar shows "Loading events..." forever
- Check browser console for errors
- Verify `/api/events` endpoint is accessible
- Check network tab for failed requests

### Issue: Calendar shows fallback events
- Check if events exist in database (use `/api/events/check`)
- Verify event dates are valid
- Check console logs for warnings

### Issue: Events not showing for specific cohort
- Verify `cohort_id` column exists in events table
- Run migration: `supabase/add-cohort-id-to-events.sql`
- Check if events have `cohort_id` set correctly

### Issue: API returns error
- Check Supabase connection
- Verify environment variables are set
- Check Supabase dashboard for table existence

## Quick Test Commands

```bash
# Check events count
curl http://localhost:3000/api/events/check

# Get all events
curl http://localhost:3000/api/events

# Get events for cohort
curl "http://localhost:3000/api/events?cohort_id=YOUR_COHORT_ID"
```

