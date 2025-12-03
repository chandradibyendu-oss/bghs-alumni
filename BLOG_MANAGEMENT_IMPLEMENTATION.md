# Blog Management System Implementation

## Overview
A comprehensive blog management system has been implemented with support for English and Bengali content, moderation workflow, and role-based access control.

## What Has Been Created

### 1. Database Schema Updates
**File:** `update-blog-schema.sql`
- Added Bengali text fields: `title_bengali`, `content_bengali`, `excerpt_bengali`
- Added `status` field for moderation workflow (draft, pending_review, published, rejected)
- Added moderation fields: `reviewed_by`, `reviewed_at`, `review_notes`
- Added `read_time` field
- Added `content_type` field (html, markdown, plain)
- Created `blog_images` table for inline images
- Added necessary indexes

**Action Required:** Run this SQL file in Supabase SQL Editor

### 2. Permissions & Roles
**File:** `add-blog-moderation-permissions.sql`
- Added new permissions:
  - `can_moderate_blog`: Can approve/reject blog posts
  - `can_publish_blog`: Can publish blog posts directly
  - `can_delete_blog`: Can delete blog posts
- Created `blog_moderator` role with moderation permissions
- Updated existing roles:
  - `content_moderator`: Added blog moderation permissions
  - `content_creator`: Can create blogs but needs moderation
  - `super_admin`: Has all blog permissions

**Action Required:** 
- Run this SQL file in Supabase SQL Editor
- TypeScript interface has been updated in `lib/auth-utils.ts`

### 3. Admin Blog Management Page
**File:** `app/admin/blog/page.tsx`
- Lists all blog posts with status indicators
- Status overview dashboard (Drafts, Pending Review, Published, Rejected)
- Search and filter functionality (by status, category)
- Moderation actions (Approve, Reject, Publish)
- Access control based on permissions
- Link to create new blog posts

### 4. Blog Creation Page
**File:** `app/admin/blog/new/page.tsx`
- Support for English and Bengali content
- Fields included:
  - Title (English & Bengali)
  - Excerpt (English & Bengali)
  - Content (English & Bengali)
  - Category selection
  - Tags management
  - Featured image (URL or upload)
  - Content type (HTML, Markdown, Plain Text)
  - Status (Draft, Pending Review, or Publish)
- Automatic read time calculation
- Validation for required fields
- Permission-based publish options

## Role Recommendations

### Who Should Have Access?

1. **Super Admin** ✅
   - Full access to all blog features
   - Can create, edit, delete, publish, and moderate blogs

2. **Blog Moderator** ✅ (New Role)
   - Can create blog posts
   - Can approve/reject blog posts
   - Can publish blog posts
   - Perfect for dedicated content reviewers

3. **Content Creator** ✅ (Existing Role)
   - Can create blog posts
   - Can edit their own blog posts
   - Posts require moderation before publishing
   - Great for alumni who want to contribute

4. **Content Moderator** ✅ (Existing Role)
   - Has blog moderation permissions
   - Can approve/reject content
   - Can manage comments

5. **Alumni Members**
   - Can view published blog posts
   - Can comment on blog posts
   - Cannot create or moderate

## Required Actions

### Step 1: Run Database Migrations
1. Open Supabase SQL Editor
2. Run `update-blog-schema.sql` to add new columns and tables
3. Run `add-blog-moderation-permissions.sql` to update roles

### Step 2: Assign Roles
Assign appropriate roles to users:
- Blog Moderators: Assign `blog_moderator` role
- Content Creators: Assign `content_creator` role
- Admins: Should already have `super_admin` role

### Step 3: Test the System
1. Log in as a user with blog creation permissions
2. Navigate to `/admin/blog`
3. Create a test blog post
4. Test moderation workflow

## Features Implemented

✅ **Dual Language Support**
- English and Bengali fields for title, excerpt, and content
- Optional Bengali translations

✅ **Moderation Workflow**
- Draft → Pending Review → Published/Rejected
- Review notes for rejected posts
- Tracks who reviewed and when

✅ **Rich Content Support**
- HTML, Markdown, or Plain Text
- Inline image support (structure ready)

✅ **Role-Based Access**
- Different permissions for creators, moderators, and admins
- Permission checks on all actions

✅ **User-Friendly Interface**
- Status indicators with color coding
- Search and filter capabilities
- Image preview functionality
- Tag management

## Pending Enhancements

1. **Rich Text Editor** 
   - Currently using textarea
   - Consider adding React Quill, TipTap, or similar
   - Will enhance writing experience

2. **Image Upload API**
   - Structure in place but needs implementation
   - Should follow event image upload pattern
   - Store in R2: `blog/` folder

3. **Blog Edit Page**
   - Create `/admin/blog/[id]/edit/page.tsx`
   - Similar to creation page but with existing data

4. **Public Blog Page Update**
   - Update `/app/blog/page.tsx` to fetch from database
   - Replace static data with dynamic content

5. **Blog Detail Page**
   - Create individual blog post view page
   - Show full content with Bengali toggle
   - Comments and likes functionality

## Next Steps

1. Run the SQL migrations
2. Test blog creation flow
3. Implement blog edit page
4. Update public blog page to use database
5. Add rich text editor (optional enhancement)
6. Implement image upload API for blog images

## File Structure

```
app/
├── admin/
│   └── blog/
│       ├── page.tsx           # Blog management (list, moderate)
│       ├── new/
│       │   └── page.tsx       # Create new blog
│       └── [id]/
│           └── edit/
│               └── page.tsx   # Edit blog (to be created)
└── blog/
    └── page.tsx               # Public blog listing (needs update)

lib/
└── auth-utils.ts              # Updated with blog permissions

SQL Files:
├── update-blog-schema.sql     # Database schema updates
└── add-blog-moderation-permissions.sql  # Role permissions
```

## Notes

- Bengali text fields are optional - blogs work fine with English only
- Content creators must submit posts for review (unless they're moderators/admins)
- Blog posts can be marked as "featured" to appear prominently
- Read time is automatically calculated based on word count
- Image upload currently supports URL input; file upload API pending

