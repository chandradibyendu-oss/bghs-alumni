# Program Schedule Database Storage

## Database Location

**Table:** `events`  
**Column:** `metadata` (JSONB type)  
**Path:** `metadata.program_schedule.days[]`

## Database Schema

### Events Table Structure

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,  -- Main event start time
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    max_attendees INTEGER NOT NULL,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    metadata JSONB,  -- Program schedule stored here
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Metadata Column

The `metadata` column is a JSONB (JSON Binary) column that stores flexible event data including:

- Program schedule
- Venue details
- Contact information
- Sponsors
- Logistics information
- And more...

### Program Schedule Structure in Database

```json
{
  "metadata": {
    "program_schedule": {
      "days": [
        {
          "date": "2026-01-10",
          "dayLabel": "Day 1 - January 10, 2026",
          "activities": [
            {
              "time": "9:00 AM",
              "description": "Registration & Welcome Tea"
            },
            {
              "time": "10:00 AM",
              "description": "Opening Ceremony"
            }
          ]
        },
        {
          "date": "2026-01-11",
          "dayLabel": "Day 2 - January 11, 2026",
          "activities": [
            {
              "time": "9:00 AM",
              "description": "Breakfast & Networking"
            }
          ]
        }
      ]
    },
    "end_date": "2026-01-11",
    "end_time": "18:00:00",
    "venue_name": "BGHS School Ground",
    "sponsors": [...],
    ...
  }
}
```

## How It's Saved

### When Creating an Event

In `app/admin/events/new/page.tsx`:

```typescript
const eventData = {
  title: formData.title.trim(),
  description: formData.description.trim(),
  // ... other fields ...
  metadata: {
    // ... other metadata ...
    program_schedule: {
      days: formData.program_schedule || []
    }
  }
}

await supabase.from('events').insert([eventData])
```

### When Editing an Event

In `app/admin/events/[id]/edit/page.tsx`:

```typescript
const eventData = {
  // ... other fields ...
  metadata: {
    // ... other metadata ...
    program_schedule: {
      days: formData.program_schedule || []
    }
  }
}

await supabase.from('events').update(eventData).eq('id', params.id)
```

## Time Field Storage

### Activity Time
- **Location:** `metadata.program_schedule.days[].activities[].time`
- **Type:** String (text)
- **Format:** User-entered format (e.g., "9:00 AM", "10:30 PM", "09:00")
- **Validation:** Client-side validation ensures proper format
- **Example:** `"9:00 AM"`, `"2:30 PM"`, `"14:30"`

### Main Event Time
- **Location:** `events.time` (separate column)
- **Type:** TIME (PostgreSQL TIME type)
- **Format:** HH:MM:SS (24-hour format)
- **Example:** `"09:00:00"`, `"14:30:00"`

## Database Index

For better query performance on metadata:

```sql
CREATE INDEX IF NOT EXISTS idx_events_metadata 
ON events USING GIN (metadata);
```

This GIN (Generalized Inverted Index) allows efficient queries on JSONB data.

## Querying Program Schedule

### Get Program Schedule for an Event

```sql
SELECT 
  id,
  title,
  metadata->'program_schedule'->'days' as schedule_days
FROM events
WHERE id = 'event-uuid';
```

### Get Activities for a Specific Day

```sql
SELECT 
  jsonb_array_elements(
    metadata->'program_schedule'->'days'
  )->'activities' as day_activities
FROM events
WHERE id = 'event-uuid';
```

### Find Events with Program Schedules

```sql
SELECT id, title
FROM events
WHERE metadata->'program_schedule'->'days' IS NOT NULL
  AND jsonb_array_length(metadata->'program_schedule'->'days') > 0;
```

## Migration Script

If the `metadata` column doesn't exist, run:

```sql
-- Add metadata column to events table if it doesn't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add an index for better performance on metadata queries
CREATE INDEX IF NOT EXISTS idx_events_metadata 
ON events USING GIN (metadata);
```

## Summary

✅ **Yes, program schedule is saved in the database**

- **Table:** `events`
- **Column:** `metadata` (JSONB)
- **Path:** `metadata.program_schedule.days[]`
- **Time Field:** Stored as string in `activities[].time`
- **Format:** Flexible text format (validated client-side)
- **Indexed:** Yes, with GIN index for performance

The program schedule data persists in the database and is retrieved when viewing or editing events.




