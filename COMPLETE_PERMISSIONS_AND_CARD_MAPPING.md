# Complete Permissions List and Dashboard Card Mapping

## Overview

This document provides the complete list of all permissions (existing + new) and how they map to dashboard cards based on **Option 1: Feature-Based Granular Permissions**.

**Total Permissions**: 35 (27 existing + 8 new)

---

## Permission Categories

### 1. General Access Permissions (5 existing)

| Permission | Description | Dashboard Card Mapping |
|-----------|-------------|----------------------|
| `can_view_landing` | View landing page | N/A (public access) |
| `can_view_directory` | View alumni directory | **Directory** card (always visible) |
| `can_edit_profile` | Edit own profile | N/A (profile page) |
| `can_access_premium` | Access premium features | N/A (not implemented) |
| `can_download_directory` | Download alumni directory | N/A (not implemented) |

---

### 2. Event Permissions (5 existing + 2 new)

| Permission | Description | Dashboard Card Mapping | Status |
|-----------|-------------|----------------------|--------|
| `can_view_events` | View events | **Events** card (always visible) | Existing |
| `can_register_events` | Register for events | **Events** card (always visible) | Existing |
| `can_create_events` | Create events | N/A (event creation page) | Existing |
| `can_manage_events` | Manage events (create/edit/delete) | N/A (event management pages) | Existing |
| `can_send_notifications` | Send event notifications | N/A (event management) | Existing |
| **`can_take_attendance`** | **Take attendance at events** | **Take Attendance** card | **NEW** |
| **`can_manage_committee`** | **Manage committee members** | **Committee Management** card | **NEW** |

---

### 3. Blog/Content Permissions (8 existing)

| Permission | Description | Dashboard Card Mapping |
|-----------|-------------|----------------------|
| `can_view_blog` | View blog posts | **Blog** card (always visible) |
| `can_comment_blog` | Comment on blog posts | **Blog** card (always visible) |
| `can_create_blog` | Create blog posts | **Blog Management** card |
| `can_edit_blog` | Edit blog posts | **Blog Management** card |
| `can_moderate_blog` | Moderate blog posts (approve/reject) | **Blog Management** card |
| `can_publish_blog` | Publish blog posts directly | **Blog Management** card |
| `can_delete_blog` | Delete blog posts | **Blog Management** card |
| `can_upload_media` | Upload images and media files | N/A (blog/media upload) |

**Blog Management Card Logic**: 
- Shows if user has: `can_create_blog` OR `can_moderate_blog` OR `can_access_admin`

---

### 4. Moderation Permissions (2 existing)

| Permission | Description | Dashboard Card Mapping |
|-----------|-------------|----------------------|
| `can_moderate_comments` | Moderate comments (approve/reject/delete) | N/A (comment moderation) |
| `can_edit_public_content` | Edit public-facing content | N/A (content editing) |

---

### 5. Donation Permissions (3 existing)

| Permission | Description | Dashboard Card Mapping |
|-----------|-------------|----------------------|
| `can_view_donations` | View donation records and reports | N/A (donation pages) |
| `can_manage_campaigns` | Create and manage donation campaigns | N/A (donation management) |
| `can_generate_reports` | Generate donation and system reports | N/A (reports page) |

---

### 6. Administrative Permissions (4 existing + 6 new)

#### Existing Administrative Permissions

| Permission | Description | Dashboard Card Mapping | Status |
|-----------|-------------|----------------------|--------|
| `can_manage_users` | Add, edit, and manage user accounts | **Deprecated** (replaced by granular permissions) | **DEPRECATED** |
| `can_manage_roles` | Create, edit, and manage roles and permissions | **Role Management** card | Existing |
| `can_manage_content` | Manage content (notices, etc.) | N/A (used in notices page) | Existing |
| `can_access_admin` | Access admin panel (grants all admin features) | **All admin cards** (bypass permission) | Existing |
| `can_view_analytics` | View website analytics and statistics | N/A (analytics page) | Existing |

#### New Granular Administrative Permissions

| Permission | Description | Dashboard Card Mapping | Replaces |
|-----------|-------------|----------------------|----------|
| **`can_manage_user_profiles`** | **Manage user profiles (add/edit/delete)** | **User Management** card | `can_manage_users` (partially) |
| **`can_manage_payment_settings`** | **Configure payment amounts and categories** | **Payment Settings** card | `can_manage_users` (partially) |
| **`can_view_payment_queue`** | **View queued payment emails** | **Payment Queue** card | `can_manage_users` (partially) |
| **`can_manage_alumni_migration`** | **Upload and manage alumni data migration** | **Alumni Migration** card | `can_manage_users` (partially) |
| **`can_manage_notices`** | **Create and manage notices/announcements** | **Notices Management** card | `can_manage_users` (partially) |
| **`can_export_alumni_data`** | **Export alumni data to CSV** | **Export Alumni Data** card | `can_manage_users` (partially) |

---

## Complete Dashboard Card Mapping

### Permission-Based Cards (10 cards)

| # | Card Name | Route | Required Permission(s) | Permission Category |
|---|----------|-------|----------------------|---------------------|
| 1 | **User Management** | `/admin/users` | `can_manage_user_profiles` OR `can_manage_users` (deprecated) OR `can_access_admin` | Admin |
| 2 | **Payment Settings** | `/admin/payments` | `can_manage_payment_settings` OR `can_manage_users` (deprecated) OR `can_access_admin` | Admin |
| 3 | **Payment Queue** | `/admin/payment-queue` | `can_view_payment_queue` OR `can_manage_users` (deprecated) OR `can_access_admin` | Admin |
| 4 | **Alumni Migration** | `/admin/alumni-migration` | `can_manage_alumni_migration` OR `can_manage_users` (deprecated) OR `can_access_admin` | Admin |
| 5 | **Notices Management** | `/admin/notices` | `can_manage_notices` OR `can_manage_users` (deprecated) OR `can_access_admin` | Admin |
| 6 | **Export Alumni Data** | `/api/admin/alumni-export` | `can_export_alumni_data` OR `can_manage_users` (deprecated) OR `can_access_admin` | Admin |
| 7 | **Role Management** | `/admin/roles-simple` | `can_manage_roles` OR `can_access_admin` | Admin |
| 8 | **Take Attendance** | `/admin/events/attendance` | `can_take_attendance` OR `can_manage_events` OR `can_access_admin` | Events |
| 9 | **Blog Management** | `/admin/blog` | `can_create_blog` OR `can_moderate_blog` OR `can_access_admin` | Content |
| 10 | **Committee Management** | `/admin/committee` | `can_manage_committee` OR `can_manage_events` OR `can_access_admin` | Events |

### Always Visible Cards (4 cards - No permission check)

| # | Card Name | Route | Permission Required |
|---|----------|-------|-------------------|
| 11 | **Events** | `/events` | None (always visible) |
| 12 | **Directory** | `/directory` | None (always visible) |
| 13 | **Blog** | `/blog` | None (always visible) |
| 14 | **My Payments** | `/profile/payments` | None (always visible) |

---

## Permission Replacement Mapping

### Old Permission → New Granular Permissions

#### `can_manage_users` (DEPRECATED) → Replaced by 6 new permissions:

```
can_manage_users (old)
    ↓
    ├── can_manage_user_profiles      → User Management card
    ├── can_manage_payment_settings    → Payment Settings card
    ├── can_view_payment_queue         → Payment Queue card
    ├── can_manage_alumni_migration    → Alumni Migration card
    ├── can_manage_notices             → Notices Management card
    └── can_export_alumni_data         → Export Alumni Data card
```

#### `can_manage_events` (KEPT) → Extended with 2 new permissions:

```
can_manage_events (kept for event creation/editing)
    ↓
    ├── can_take_attendance            → Take Attendance card
    └── can_manage_committee           → Committee Management card
```

---

## Complete Permission List (35 Total)

### By Category

#### General Access (5)
1. `can_view_landing`
2. `can_view_directory`
3. `can_edit_profile`
4. `can_access_premium`
5. `can_download_directory`

#### Events (7)
6. `can_view_events`
7. `can_register_events`
8. `can_create_events`
9. `can_manage_events` ⭐ (kept)
10. `can_send_notifications`
11. `can_take_attendance` ⭐ **NEW**
12. `can_manage_committee` ⭐ **NEW**

#### Blog/Content (8)
13. `can_view_blog`
14. `can_comment_blog`
15. `can_create_blog`
16. `can_edit_blog`
17. `can_moderate_blog`
18. `can_publish_blog`
19. `can_delete_blog`
20. `can_upload_media`

#### Moderation (2)
21. `can_moderate_comments`
22. `can_edit_public_content`

#### Donations (3)
23. `can_view_donations`
24. `can_manage_campaigns`
25. `can_generate_reports`

#### Administrative (10)
26. `can_manage_users` ⚠️ **DEPRECATED** (replaced by 6 granular permissions)
27. `can_manage_roles`
28. `can_manage_content`
29. `can_access_admin` ⭐ (special: grants all admin features)
30. `can_view_analytics`
31. `can_manage_user_profiles` ⭐ **NEW**
32. `can_manage_payment_settings` ⭐ **NEW**
33. `can_view_payment_queue` ⭐ **NEW**
34. `can_manage_alumni_migration` ⭐ **NEW**
35. `can_manage_notices` ⭐ **NEW**
36. `can_export_alumni_data` ⭐ **NEW**

**Legend:**
- ⭐ = Key permission for dashboard cards
- ⚠️ = Deprecated (kept for backward compatibility)

---

## Dashboard Card Visibility Logic

### Current Implementation (Before Refactoring)

```typescript
// OLD: One permission controls multiple cards
canManageUsers = hasPermission(perms, 'can_manage_users') || hasPermission(perms, 'can_access_admin')
// Shows: User Management, Payment Settings, Payment Queue, Alumni Migration, Notices, Export
```

### New Implementation (After Refactoring)

```typescript
// NEW: Each card has its own permission check
canSeeUserManagement = 
  hasPermission(perms, 'can_manage_user_profiles') || 
  hasPermission(perms, 'can_manage_users') || // Backward compat
  hasPermission(perms, 'can_access_admin')

canSeePaymentSettings = 
  hasPermission(perms, 'can_manage_payment_settings') || 
  hasPermission(perms, 'can_manage_users') || // Backward compat
  hasPermission(perms, 'can_access_admin')

canSeePaymentQueue = 
  hasPermission(perms, 'can_view_payment_queue') || 
  hasPermission(perms, 'can_manage_users') || // Backward compat
  hasPermission(perms, 'can_access_admin')

canSeeAlumniMigration = 
  hasPermission(perms, 'can_manage_alumni_migration') || 
  hasPermission(perms, 'can_manage_users') || // Backward compat
  hasPermission(perms, 'can_access_admin')

canSeeNotices = 
  hasPermission(perms, 'can_manage_notices') || 
  hasPermission(perms, 'can_manage_users') || // Backward compat
  hasPermission(perms, 'can_access_admin')

canSeeExport = 
  hasPermission(perms, 'can_export_alumni_data') || 
  hasPermission(perms, 'can_manage_users') || // Backward compat
  hasPermission(perms, 'can_access_admin')

canSeeTakeAttendance = 
  hasPermission(perms, 'can_take_attendance') || 
  hasPermission(perms, 'can_manage_events') || 
  hasPermission(perms, 'can_access_admin')

canSeeCommittee = 
  hasPermission(perms, 'can_manage_committee') || 
  hasPermission(perms, 'can_manage_events') || 
  hasPermission(perms, 'can_access_admin')
```

---

## Role Template Examples

### Super Admin (All Permissions)
- ✅ All 35 permissions enabled
- ✅ Sees all 14 dashboard cards

### User Admin (Full User Management)
- ✅ `can_manage_user_profiles`
- ✅ `can_manage_payment_settings`
- ✅ `can_view_payment_queue`
- ✅ `can_manage_alumni_migration`
- ✅ `can_manage_notices`
- ✅ `can_export_alumni_data`
- ✅ Sees: Cards 1-6

### Payment Admin (Payment Only)
- ✅ `can_manage_payment_settings`
- ✅ `can_view_payment_queue`
- ✅ Sees: Cards 2-3

### Data Manager (Migration & Export)
- ✅ `can_manage_alumni_migration`
- ✅ `can_export_alumni_data`
- ✅ Sees: Cards 4, 6

### Content Manager (Notices & Blog)
- ✅ `can_manage_notices`
- ✅ `can_create_blog`
- ✅ `can_moderate_blog`
- ✅ Sees: Cards 5, 9

### Event Coordinator (Events & Attendance)
- ✅ `can_manage_events`
- ✅ `can_take_attendance`
- ✅ `can_manage_committee`
- ✅ Sees: Cards 8, 10

### Committee Manager (Committee Only)
- ✅ `can_manage_committee`
- ✅ Sees: Card 10

---

## Migration Notes

### Backward Compatibility

During migration period:
- Old permission `can_manage_users` will still work (shows all 6 cards)
- New granular permissions can be used individually
- Both can coexist: `can_manage_users` OR `can_manage_user_profiles` = User Management card

### Migration Strategy

1. **Phase 1**: Add new permissions, keep old ones (current state)
2. **Phase 2**: Update dashboard to check both old and new
3. **Phase 3**: Migrate existing roles (map `can_manage_users` → 6 new permissions)
4. **Phase 4**: Deprecate old permissions (show warning in UI)
5. **Phase 5**: Remove old permissions (after migration period)

---

## Summary

- **Total Permissions**: 35
- **Existing Permissions**: 27
- **New Permissions**: 8
- **Deprecated Permissions**: 1 (`can_manage_users`)
- **Dashboard Cards**: 14 (10 permission-based + 4 always visible)
- **Special Permission**: `can_access_admin` (grants all admin features)

