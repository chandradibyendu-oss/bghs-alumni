# BGHS Alumni Website - Roles and Permissions Reference

This document provides a comprehensive reference of all user roles and their associated permissions in the BGHS Alumni Website system.

**Last Updated**: Based on current implementation as of latest codebase review

---

## Table of Contents

1. [Permission Categories](#permission-categories)
2. [Role Definitions](#role-definitions)
3. [Permission Matrix](#permission-matrix)
4. [Role Comparison](#role-comparison)

---

## Permission Categories

### Basic Access Permissions
- `can_view_landing` - Can view the homepage/landing page
- `can_view_directory` - Can view the alumni directory
- `can_edit_profile` - Can edit own profile information
- `can_access_premium` - Can access premium features
- `can_download_directory` - Can download the alumni directory

### Event Permissions
- `can_view_events` - Can view upcoming and past events
- `can_register_events` - Can register for events
- `can_create_events` - Can create new events
- `can_manage_events` - Can edit and manage existing events
- `can_send_notifications` - Can send event notifications

### Blog/Content Permissions
- `can_view_blog` - Can view published blog posts
- `can_comment_blog` - Can comment on blog posts
- `can_create_blog` - Can create new blog posts (requires moderation)
- `can_edit_blog` - Can edit blog posts (own posts or all if moderator)
- `can_delete_blog` - Can delete blog posts (admin only)
- `can_moderate_blog` - Can approve/reject blog posts for publication
- `can_publish_blog` - Can publish blog posts directly without moderation
- `can_upload_media` - Can upload images and media files

### Comment Moderation Permissions
- `can_moderate_comments` - Can approve/reject/delete comments
- `can_edit_public_content` - Can edit public-facing content

### Donation Permissions
- `can_view_donations` - Can view donation records and reports
- `can_manage_campaigns` - Can create and manage donation campaigns
- `can_generate_reports` - Can generate donation and system reports

### Administrative Permissions
- `can_manage_users` - Can add, edit, and manage user accounts
- `can_manage_roles` - Can create, edit, and manage roles and permissions
- `can_access_admin` - Can access the admin panel
- `can_view_analytics` - Can view website analytics and statistics

---

## Role Definitions

### 1. Public
**Description**: Unauthenticated users (visitors not logged in)

**Permissions**:
- ✅ `can_view_landing`
- ✅ `can_view_public_events`
- ✅ `can_view_public_blog`

**Use Case**: Default permissions for anyone visiting the website without logging in.

---

### 2. Alumni Member
**Description**: Basic alumni member (standard registered user)

**Permissions**:
- ✅ `can_view_landing`
- ✅ `can_view_directory`
- ✅ `can_edit_profile`
- ✅ `can_view_events`
- ✅ `can_register_events`
- ✅ `can_view_blog`
- ✅ `can_comment_blog`

**Use Case**: Default role for all approved alumni members. Can participate in the community but cannot create content or manage events.

---

### 3. Alumni Premium
**Description**: Premium alumni member (enhanced features)

**Permissions**: 
All Alumni Member permissions, plus:
- ✅ `can_access_premium`
- ✅ `can_download_directory`

**Use Case**: Alumni who have paid for or earned premium membership. Get additional benefits like directory downloads and premium features.

---

### 4. Content Creator
**Description**: Can create blog posts but requires moderation

**Permissions**:
- ✅ All Alumni Member permissions, plus:
- ✅ `can_create_blog`
- ✅ `can_edit_blog`
- ✅ `can_upload_media`

**Cannot**:
- ❌ `can_publish_blog` - Posts require moderator approval
- ❌ `can_moderate_blog` - Cannot approve other posts

**Use Case**: Alumni who want to contribute blog content. Their posts go through a moderation workflow before being published.

---

### 5. Content Moderator
**Description**: Can moderate content and comments

**Permissions**:
- ✅ All Alumni Member permissions, plus:
- ✅ `can_moderate_comments`
- ✅ `can_edit_public_content`
- ✅ `can_moderate_blog` - Can approve/reject blog posts
- ✅ `can_publish_blog` - Can publish blog posts

**Use Case**: Community members who review and moderate content, comments, and blog posts.

---

### 6. Blog Moderator
**Description**: Specialized role for blog content moderation

**Permissions**:
- ✅ All Alumni Member permissions, plus:
- ✅ `can_create_blog`
- ✅ `can_edit_blog`
- ✅ `can_moderate_blog` - Can approve/reject blog posts
- ✅ `can_publish_blog` - Can publish blog posts directly
- ✅ `can_moderate_comments`
- ✅ `can_upload_media`
- ✅ `can_access_admin` - Can access blog management admin panel

**Cannot**:
- ❌ `can_delete_blog` - Only admins can delete

**Use Case**: Dedicated content reviewers who focus specifically on blog moderation. Can create, edit, approve, and publish blog posts.

---

### 7. Event Manager
**Description**: Can create and manage events

**Permissions**:
- ✅ All Alumni Member permissions, plus:
- ✅ `can_create_events`
- ✅ `can_manage_events`
- ✅ `can_send_notifications`

**Use Case**: Alumni who organize and manage events, reunions, and gatherings. Can create events and notify attendees.

---

### 8. Donation Manager
**Description**: Can manage donation campaigns and view reports

**Permissions**:
- ✅ All Alumni Member permissions, plus:
- ✅ `can_view_donations`
- ✅ `can_manage_campaigns`
- ✅ `can_generate_reports`

**Use Case**: Alumni responsible for managing donation campaigns, tracking donations, and generating financial reports.

---

### 9. Super Administrator
**Description**: Full system access with all permissions

**Permissions**: **ALL PERMISSIONS** including:
- ✅ All basic access permissions
- ✅ All event permissions
- ✅ All blog/content permissions
- ✅ All comment moderation permissions
- ✅ All donation permissions
- ✅ All administrative permissions:
  - ✅ `can_manage_users`
  - ✅ `can_manage_roles`
  - ✅ `can_access_admin`
  - ✅ `can_view_analytics`
  - ✅ `can_delete_blog` (unique to super admin)

**Use Case**: System administrators who need full control over the platform. Can manage users, roles, content, events, donations, and view analytics.

---

## Permission Matrix

| Permission | Public | Alumni Member | Alumni Premium | Content Creator | Content Moderator | Blog Moderator | Event Manager | Donation Manager | Super Admin |
|------------|:------:|:-------------:|:--------------:|:---------------:|:-----------------:|:--------------:|:-------------:|:----------------:|:-----------:|
| **Basic Access** |
| `can_view_landing` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `can_view_directory` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `can_edit_profile` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `can_access_premium` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `can_download_directory` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Events** |
| `can_view_events` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `can_register_events` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `can_create_events` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `can_manage_events` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `can_send_notifications` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Blog/Content** |
| `can_view_blog` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `can_comment_blog` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `can_create_blog` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `can_edit_blog` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `can_moderate_blog` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `can_publish_blog` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `can_delete_blog` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `can_upload_media` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Moderation** |
| `can_moderate_comments` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `can_edit_public_content` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Donations** |
| `can_view_donations` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `can_manage_campaigns` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `can_generate_reports` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Administration** |
| `can_manage_users` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `can_manage_roles` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `can_access_admin` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `can_view_analytics` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Role Comparison

### Content-Related Roles

| Feature | Content Creator | Content Moderator | Blog Moderator | Super Admin |
|---------|:---------------:|:-----------------:|:--------------:|:-----------:|
| Create Blog Posts | ✅ | ❌ | ✅ | ✅ |
| Edit Blog Posts | ✅ | ❌ | ✅ | ✅ |
| Moderate Blog Posts | ❌ | ✅ | ✅ | ✅ |
| Publish Directly | ❌ | ✅ | ✅ | ✅ |
| Delete Blog Posts | ❌ | ❌ | ❌ | ✅ |
| Moderate Comments | ❌ | ✅ | ✅ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ | ✅ |

### Event-Related Roles

| Feature | Alumni Member | Event Manager | Super Admin |
|---------|:-------------:|:-------------:|:-----------:|
| View Events | ✅ | ✅ | ✅ |
| Register for Events | ✅ | ✅ | ✅ |
| Create Events | ❌ | ✅ | ✅ |
| Manage Events | ❌ | ✅ | ✅ |
| Send Notifications | ❌ | ✅ | ✅ |

### Administrative Roles

| Feature | Blog Moderator | Event Manager | Donation Manager | Super Admin |
|---------|:--------------:|:-------------:|:----------------:|:-----------:|
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Manage Roles | ❌ | ❌ | ❌ | ✅ |
| Access Admin Panel | ✅ | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ❌ | ✅ |

---

## Important Notes

### Current Implementation Limitation
⚠️ **Important**: Currently, each user can only have **ONE role** at a time. The system uses a single `role` column in the `profiles` table. 

While the database schema includes infrastructure for multiple roles (`user_role_assignments` table), the application code currently only supports single-role assignment.

### Role Hierarchy
The roles are not hierarchical - they are flat permission sets. However, Super Administrator includes all permissions from other roles.

### Permission Inheritance
- Users inherit ALL permissions from their assigned role
- If a permission is not explicitly granted to a role, it defaults to `false`
- Permission checks use OR logic: `hasPermission() || can_access_admin` (admin bypass)

### Blog Moderation Workflow
1. **Content Creator**: Creates blog → Status: `pending_review`
2. **Blog Moderator/Content Moderator**: Reviews → Can approve or reject
3. **Approved**: Status: `published` → Visible on public site
4. **Rejected**: Status: `rejected` → Not visible, with notes

### Special Permissions
- `can_access_admin` - Grants access to admin panel regardless of other permissions
- `can_delete_blog` - Only Super Admin has this permission
- `can_publish_blog` - Allows publishing without moderation workflow

---

## Quick Reference by Use Case

### I want to...
- **Contribute blog posts**: Assign `content_creator` role
- **Review and approve blog posts**: Assign `blog_moderator` or `content_moderator` role
- **Organize events**: Assign `event_manager` role
- **Manage donations**: Assign `donation_manager` role
- **Have full system access**: Assign `super_admin` role (use carefully!)
- **Premium directory access**: Assign `alumni_premium` role

---

*This document reflects the current implementation as of the latest codebase review. For questions or updates, please refer to the development team.*





