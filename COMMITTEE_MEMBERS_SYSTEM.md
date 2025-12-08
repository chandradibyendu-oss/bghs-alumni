# Committee Members Management System

## Overview

This system manages Advisory Members and Executive Committee Members for the BGHS Alumni Association. It supports configurable positions, history tracking, and flexible display options.

## Architecture

### Database Schema

#### 1. `committee_position_types` Table
- Stores configurable position types (President, Vice President, Secretary, etc.)
- Admin can add/edit/remove positions
- Includes display order for sorting

#### 2. `committee_members` Table
- Stores current and past committee members
- Links to alumni profiles (optional)
- Supports both advisory and executive members
- Tracks tenure (start_date, end_date, is_current)
- Includes display order for custom sorting

#### 3. `committee_history` Table
- Automatically archives past members when tenure ends
- Maintains historical records for each year/term
- Preserves snapshot of member data at time of tenure

### Key Features

1. **Two Committee Types:**
   - **Advisory Members**: No positions, just members
   - **Executive Committee**: Members with configurable positions

2. **Configurable Positions:**
   - Admin can create/edit/delete position types
   - Positions have display order for sorting
   - Members can have positions or be general members

3. **History Tracking:**
   - Automatic archiving when member tenure ends
   - Historical records preserved by year/term
   - Can view past committees

4. **Profile Linking:**
   - Members can be linked to alumni profiles
   - If linked, displays full profile information
   - If not linked, standalone member record

5. **Display Management:**
   - Custom display order within each committee type
   - Executive members sorted by position order, then name
   - Advisory members sorted by display order, then name

## Access Control Recommendations

### **RECOMMENDATION: Make it PUBLIC**

**Reasons:**
1. **Transparency**: Committee members are public figures representing the association
2. **Trust Building**: Public visibility builds trust and accountability
3. **Common Practice**: Most alumni associations display committee publicly
4. **No Sensitive Data**: Only basic contact info (email, phone) which members can choose to share
5. **Professional Image**: Shows active, organized leadership

### **Alternative: Authorized-Only Access**

If you prefer restricted access:
- Only logged-in alumni can view
- Provides more privacy for members
- Can still show basic info (name, position) publicly
- Full details (contact info) only for members

### **Hybrid Approach (Recommended)**

1. **Public View:**
   - Names and positions visible to all
   - Photos visible to all
   - Basic bio visible to all

2. **Member-Only View:**
   - Contact information (email, phone)
   - Full bio
   - Link to full profile

**Implementation:**
- Check if user is logged in
- Show/hide contact info based on auth status
- Use privacy settings from profiles table

## Admin Interface

### Location: `/admin/committee`

**Features:**
1. **Manage Members:**
   - Add/Edit/Delete committee members
   - Link to alumni profiles
   - Set positions (for executive members)
   - Manage tenure dates
   - Reorder display

2. **Manage Positions:**
   - Create/Edit/Delete position types
   - Set display order
   - Add descriptions

3. **View History:**
   - See past committee members
   - Filter by year/term
   - View historical records

## Public Display Page

### Location: `/committee`

**Features:**
1. **Two Sections:**
   - Executive Committee (with positions)
   - Advisory Members

2. **Member Cards:**
   - Photo
   - Name and position
   - Bio (if available)
   - Contact info (based on access level)
   - Link to full profile (if linked)
   - Tenure information

3. **Responsive Design:**
   - Mobile-friendly card layout
   - Grid adapts to screen size
   - Professional appearance

## Workflow for Yearly Elections

### After Voting (Offline):

1. **End Current Tenures:**
   - Admin sets `end_date` for outgoing members
   - System automatically sets `is_current = false`
   - Historical record created automatically

2. **Add New Members:**
   - Admin adds new committee members
   - Assigns positions
   - Sets `start_date` to current date
   - Sets `is_current = true`

3. **Update Positions:**
   - If positions change, update `position_type_id`
   - Reorder display if needed

### Example Workflow:

```
Year 2024 → 2025 Transition:

1. End 2024 Tenures:
   - Select all 2024 members
   - Set end_date = "2024-12-31"
   - System archives automatically

2. Add 2025 Members:
   - Add new members with start_date = "2025-01-01"
   - Assign positions
   - Set display order

3. Result:
   - 2024 members moved to history
   - 2025 members shown as current
   - History preserved for future reference
```

## Database Setup

Run the SQL schema file:
```bash
# In Supabase SQL Editor or psql
\i committee-members-schema.sql
```

Or copy the contents of `committee-members-schema.sql` into Supabase SQL Editor.

## Navigation Updates

Add to main navigation:
- **Public**: Add "Committee" link in header/footer
- **Admin**: Add "Committee Management" in admin menu

## Future Enhancements

1. **History Viewer:**
   - Filter by year
   - Compare committees across years
   - Timeline view

2. **Election Management:**
   - Online voting system
   - Candidate profiles
   - Vote tracking

3. **Notifications:**
   - Notify members of committee changes
   - Email updates to alumni

4. **Analytics:**
   - Track committee member engagement
   - View member tenure statistics

5. **Document Management:**
   - Upload committee meeting minutes
   - Store official documents
   - Archive resolutions

## Security Considerations

1. **Admin Access:**
   - Only super_admin, event_manager, content_moderator can manage
   - Check permissions on all admin actions

2. **Public Display:**
   - Only show `is_current = true` members
   - Respect privacy settings if implemented
   - Sanitize all user inputs

3. **Data Validation:**
   - Validate email formats
   - Validate date ranges
   - Prevent duplicate positions (if needed)

## Testing Checklist

- [ ] Add executive committee member with position
- [ ] Add executive committee member without position
- [ ] Add advisory member
- [ ] Link member to alumni profile
- [ ] Create custom position
- [ ] Reorder members
- [ ] End member tenure (archive)
- [ ] View historical records
- [ ] Display on public page
- [ ] Test responsive design
- [ ] Test admin permissions

## Support

For issues or questions:
1. Check database schema is properly set up
2. Verify admin permissions
3. Check browser console for errors
4. Review Supabase logs

