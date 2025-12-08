# Committee Page Navigation Guide

## How to Navigate to Committee Pages

### Public Committee Page

**URL:** `/committee`

**Navigation Options:**

1. **Main Navigation Menu** (Desktop)
   - Located in the top navigation bar
   - Click "Committee" link between "Directory" and "Gallery"
   - Available on: Home page, About page, and other main pages

2. **Mobile Menu**
   - Click hamburger menu (☰) icon
   - Select "Committee" from the menu

3. **Footer Links**
   - Scroll to bottom of any page
   - Click "Committee" in the Quick Links section

4. **Direct URL**
   - Type in browser: `https://yourdomain.com/committee`

### Admin Committee Management Page

**URL:** `/admin/committee`

**Navigation Options:**

1. **Account Dropdown** (For Admin Users)
   - Click "Account" button in top navigation
   - Select "Committee Management" from Admin section
   - Available on: Home page, About page

2. **Mobile Menu** (For Admin Users)
   - Click hamburger menu (☰) icon
   - Scroll to Admin section
   - Select "Committee Management"

3. **Direct URL**
   - Type in browser: `https://yourdomain.com/admin/committee`
   - Note: Requires admin authentication

4. **Dashboard** (If added)
   - Navigate to `/dashboard`
   - Look for Committee Management card (if added)

## Access Requirements

### Public Committee Page (`/committee`)
- ✅ **No login required** - Public access
- Shows current Advisory and Executive Committee members
- Displays member photos, names, positions, and contact info

### Admin Committee Management (`/admin/committee`)
- 🔒 **Requires admin login**
- Required roles:
  - `super_admin`
  - `event_manager`
  - `content_moderator`
- Features:
  - Add/Edit/Delete committee members
  - Manage positions
  - Set tenure dates
  - Reorder display

## Navigation Structure

```
Main Navigation:
├── About
├── Events
├── Directory
├── Committee ← NEW
├── Gallery
└── Blog

Admin Menu (for admins):
├── Users
├── Events
├── Committee Management ← NEW
└── Blog Management
```

## Quick Access Tips

1. **Bookmark the page**: Save `/committee` to your bookmarks
2. **Use browser search**: Type "committee" in address bar if you've visited before
3. **From Directory**: Committee members are also linked from their profile pages
4. **Admin Shortcut**: If you're an admin, bookmark `/admin/committee` for quick access

## Troubleshooting

**Can't see Committee link?**
- Clear browser cache
- Make sure you're on the latest version
- Check if JavaScript is enabled

**Can't access Admin Committee?**
- Verify you're logged in
- Check your user role (must be admin)
- Contact super admin if access is needed

**Page not found?**
- Verify the route exists: `/committee` or `/admin/committee`
- Check if database schema is set up
- Ensure build completed successfully


