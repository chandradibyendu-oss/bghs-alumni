# Multi-Day Program Schedule System

## Overview

The Program Schedule System allows event organizers to create detailed day-wise schedules for single-day or multi-day events. Each day can have multiple activities with specific times.

## Data Structure

### Database Storage (JSONB in `events.metadata`)

```json
{
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
          },
          {
            "time": "11:00 AM",
            "description": "Keynote Address"
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
          },
          {
            "time": "10:00 AM",
            "description": "Panel Discussion"
          }
        ]
      }
    ]
  }
}
```

## Features

### 1. **Automatic Day Generation**
- Automatically creates schedule days based on `start_date` and `end_date`
- Single-day events: 1 day
- Multi-day events: Multiple days (e.g., Jan 10-11 = 2 days)

### 2. **Flexible Day Labels**
- Default: "Day 1", "Day 2", etc.
- Customizable: "January 10, 2026", "Saturday - Day 1", etc.
- Auto-generates from date if not customized

### 3. **Activity Management**
- Add unlimited activities per day
- Each activity has:
  - **Time**: e.g., "9:00 AM", "10:30 AM"
  - **Description**: Activity name/details
- Remove activities easily
- Reorder by editing

### 4. **User Interface**

#### Admin Forms (Create/Edit Event)
- **ProgramScheduleEditor Component**: Visual editor for creating schedules
- Located after "Date & Time" section
- Auto-populates days when dates are set
- "Refresh Days" button to regenerate days if dates change

#### Event Detail Page
- **Day-wise Display**: Each day shown in a separate card
- **Day Header**: Shows day label and date with gradient background
- **Activity List**: Time and description for each activity
- **Responsive Design**: Works on mobile and desktop
- **Backward Compatible**: Supports old flat array format

## Usage

### Creating a Program Schedule

1. **Set Event Dates**
   - Start Date: First day of event
   - End Date: Last day of event (same as start for single-day)

2. **Program Schedule Section Appears**
   - Days are automatically generated
   - Each day has a header with date

3. **Add Activities**
   - Click "Add Activity" for each day
   - Enter time (e.g., "9:00 AM")
   - Enter activity description
   - Add multiple activities per day

4. **Customize Day Labels** (Optional)
   - Click on day label to edit
   - Change to custom text like "Day 1 - Registration Day"

5. **Save Event**
   - Schedule is saved in `metadata.program_schedule.days`

### Example: 2-Day Event

**Day 1 - January 10, 2026:**
- 9:00 AM - Registration & Welcome Tea
- 10:00 AM - Opening Ceremony
- 11:00 AM - Keynote Address
- 12:30 PM - Lunch Break
- 2:00 PM - Panel Discussion
- 4:00 PM - Cultural Program
- 7:00 PM - Dinner & Networking

**Day 2 - January 11, 2026:**
- 9:00 AM - Breakfast & Networking
- 10:00 AM - Alumni Awards Ceremony
- 12:00 PM - Closing Remarks
- 1:00 PM - Group Photo Session

## Display on Event Page

### Visual Design

- **Day Cards**: Each day in a white card with gradient header
- **Header**: Primary color gradient with day label and date
- **Activities**: Clean list with clock icon, time, and description
- **Hover Effects**: Subtle background change on hover
- **Mobile Responsive**: Stacks nicely on small screens

### Backward Compatibility

The system supports three schedule formats:

1. **New Format** (Recommended):
   ```json
   { "program_schedule": { "days": [...] } }
   ```

2. **Legacy Flat Array**:
   ```json
   { "program_schedule": [{ "time": "...", "description": "..." }] }
   ```

3. **Alternative Format**:
   ```json
   { "schedule": [{ "t": "...", "d": "..." }] }
   ```

## Best Practices

### Time Format
- Use consistent format: "9:00 AM", "10:30 AM", "2:00 PM"
- 12-hour format recommended for readability
- Include AM/PM for clarity

### Activity Descriptions
- Be concise but descriptive
- Include location if different from main venue
- Add speaker names if applicable
- Use consistent formatting

### Day Labels
- Keep labels clear and descriptive
- Include date for multi-day events
- Use consistent naming (e.g., "Day 1", "Day 2" or "Saturday", "Sunday")

## Technical Details

### Component: `ProgramScheduleEditor`

**Props:**
- `startDate`: Event start date (YYYY-MM-DD)
- `endDate`: Event end date (YYYY-MM-DD)
- `value`: Current schedule array
- `onChange`: Callback when schedule changes

**Features:**
- Auto-generates days from date range
- Validates date inputs
- Handles empty states gracefully
- Responsive design

### Event Detail Page Display

**Location**: `app/events/[id]/page.tsx`

**Features:**
- Reads from `event.metadata.program_schedule.days`
- Falls back to legacy formats
- Shows placeholder if no schedule
- Mobile-optimized layout

## Migration from Old Format

If you have existing events with flat schedule arrays:

```json
// Old format
{
  "program_schedule": [
    { "time": "9:00 AM", "description": "Activity 1" }
  ]
}

// New format (auto-converted on display)
{
  "program_schedule": {
    "days": [
      {
        "date": "2026-01-10",
        "dayLabel": "Day 1",
        "activities": [
          { "time": "9:00 AM", "description": "Activity 1" }
        ]
      }
    ]
  }
}
```

The display component automatically handles both formats.

## Future Enhancements

Potential improvements:
- Drag-and-drop reordering of activities
- Activity duration fields
- Speaker assignments per activity
- Location/venue per activity
- Break/lunch indicators
- Export schedule as PDF
- Add to calendar integration




