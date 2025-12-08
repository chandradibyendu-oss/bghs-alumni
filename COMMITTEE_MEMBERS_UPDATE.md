# Committee Members System - Updated Design

## Important Change: All Members Must Be From Profiles Table

Based on your requirement, **ALL committee members (both Advisory and Executive) must be existing alumni in the `profiles` table**. This ensures:

1. **Data Consistency**: Member information comes from a single source of truth
2. **Profile Linking**: Committee members can be linked to their full alumni profiles
3. **No Duplicate Data**: No need to maintain separate member information
4. **Better Integration**: Committee members are part of the alumni network

## Updated Schema Changes

### Key Changes:

1. **`profile_id` is now REQUIRED (NOT NULL)**
   - All committee members must have a profile
   - Foreign key constraint ensures data integrity

2. **Removed Standalone Fields**
   - Removed: `full_name`, `email`, `phone`, `photo_url`, `bio`
   - All member information now comes from `profiles` table

3. **History Tracking**
   - `committee_history` table stores snapshot of profile data at time of tenure
   - Includes `profile_id` reference for linking

## Updated Admin Interface

### Changes:

1. **Profile Selection is Required**
   - Form only shows profile selection dropdown
   - No manual entry of name, email, phone, photo, or bio
   - Selected profile information is displayed for confirmation

2. **Data Display**
   - All member information pulled from linked profile
   - Shows profile photo, name, email, bio from profiles table
   - Links to full profile page

## Updated Public Display

### Changes:

1. **Profile-Based Display**
   - All member cards show data from profiles table
   - Photo from `profiles.avatar_url`
   - Name from `profiles.full_name`
   - Contact info from `profiles.email` and `profiles.phone`
   - Bio from `profiles.bio`
   - Links to full profile page

2. **Automatic Updates**
   - If a member updates their profile, committee display updates automatically
   - No need to manually update committee member information

## Migration Notes

If you have existing committee members with standalone data:

1. **Before Running New Schema:**
   - Identify which profiles correspond to existing committee members
   - Note their profile IDs

2. **Migration Script:**
   ```sql
   -- Example: Link existing committee member to profile
   UPDATE committee_members
   SET profile_id = 'profile-uuid-here'
   WHERE full_name = 'Member Name';
   ```

3. **After Migration:**
   - Remove standalone fields (they're no longer needed)
   - All data will come from profiles table

## Benefits of This Approach

1. **Single Source of Truth**: Member info in one place
2. **Automatic Updates**: Profile changes reflect in committee display
3. **Better Integration**: Committee members are part of alumni directory
4. **Consistency**: No duplicate or conflicting information
5. **Easier Management**: Update profile once, reflected everywhere

## Workflow

1. **Add Committee Member:**
   - Admin selects alumni from profiles dropdown
   - Assigns committee type (advisory/executive)
   - Assigns position (if executive)
   - Sets tenure dates

2. **Member Updates Profile:**
   - Member updates their profile information
   - Committee display automatically shows updated info

3. **End Tenure:**
   - Admin sets end_date
   - System archives current profile snapshot to history
   - Member remains in profiles, just not in current committee

## Database Setup

Run the updated schema:
```sql
-- Copy contents of committee-members-schema.sql into Supabase SQL Editor
```

The schema now enforces that `profile_id` is NOT NULL, ensuring all members come from profiles table.


