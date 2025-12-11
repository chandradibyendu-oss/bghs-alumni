# Dashboard Cards and Permission Requirements

This document lists all cards visible on the Admin Dashboard and the permissions required to see each card.

## Cards Visible to Super Admin (All Permissions)

A Super Admin has all permissions enabled, so they can see **ALL** cards listed below.

---

## Permission-Based Cards

### 1. User Management
- **Card Name**: User Management
- **Route**: `/admin/users`
- **Required Permissions**: 
  - `can_manage_users` **OR**
  - `can_access_admin`
- **Description**: Add, edit, and manage alumni profiles

---

### 2. Payment Settings
- **Card Name**: Payment Settings
- **Route**: `/admin/payments`
- **Required Permissions**: 
  - `can_manage_users` **OR**
  - `can_access_admin`
- **Note**: Nested inside `canManageUsers` check
- **Description**: Configure payment amounts and categories

---

### 3. Payment Queue
- **Card Name**: Payment Queue
- **Route**: `/admin/payment-queue`
- **Required Permissions**: 
  - `can_manage_users` **OR**
  - `can_access_admin`
- **Note**: Nested inside `canManageUsers` check
- **Description**: View queued payment emails (testing)

---

### 4. Alumni Migration
- **Card Name**: Alumni Migration
- **Route**: `/admin/alumni-migration`
- **Required Permissions**: 
  - `can_manage_users` **OR**
  - `can_access_admin`
- **Note**: Nested inside `canManageUsers` check
- **Description**: Upload Excel files to migrate alumni data

---

### 5. Notices Management
- **Card Name**: Notices Management
- **Route**: `/admin/notices/new` and `/admin/notices`
- **Required Permissions**: 
  - `can_manage_users` **OR**
  - `can_access_admin`
- **Note**: Nested inside `canManageUsers` check
- **Description**: Create and manage notices and announcements

---

### 6. Export Alumni Data
- **Card Name**: Export Alumni Data
- **Route**: `/api/admin/alumni-export` (API endpoint)
- **Required Permissions**: 
  - `can_manage_users` **OR**
  - `can_access_admin`
- **Note**: Nested inside `canManageUsers` check
- **Description**: Download all alumni in migration template format (CSV)

---

### 7. Role Management
- **Card Name**: Role Management
- **Route**: `/admin/roles-simple`
- **Required Permissions**: 
  - `can_manage_roles` **OR**
  - `can_access_admin`
- **Description**: Create, edit, and manage user roles and permissions

---

### 8. Take Attendance
- **Card Name**: Take Attendance
- **Route**: `/admin/events/attendance`
- **Required Permissions**: 
  - `can_manage_events` **OR**
  - `can_access_admin`
- **Description**: Quick attendance capture for events

---

### 9. Blog Management
- **Card Name**: Blog Management
- **Route**: `/admin/blog`
- **Required Permissions**: 
  - `can_create_blog` **OR**
  - `can_moderate_blog` **OR**
  - `can_access_admin`
- **Description**: Create, edit, and moderate blog posts

---

### 10. Committee Management
- **Card Name**: Committee Management
- **Route**: `/admin/committee`
- **Required Permissions**: 
  - `can_manage_events` **OR**
  - `can_access_admin` **OR**
  - Role: `content_moderator` (legacy check)
- **Description**: Manage advisory and executive committee members

---

## Always Visible Cards (No Permission Check)

These cards are visible to **all authenticated users**, regardless of permissions:

### 11. Events
- **Card Name**: Events
- **Route**: `/events`
- **Required Permissions**: None (always visible)
- **Description**: View and register for upcoming events

---

### 12. Directory
- **Card Name**: Directory
- **Route**: `/directory`
- **Required Permissions**: None (always visible)
- **Description**: Connect with fellow alumni

---

### 13. Blog
- **Card Name**: Blog
- **Route**: `/blog`
- **Required Permissions**: None (always visible)
- **Description**: Read latest news and stories

---

### 14. My Payments
- **Card Name**: My Payments
- **Route**: `/profile/payments`
- **Required Permissions**: None (always visible)
- **Description**: View payment history and receipts

---

## Summary for Super Admin

A **Super Admin** can see **ALL 14 cards** because they have:
- ✅ `can_manage_users`
- ✅ `can_manage_roles`
- ✅ `can_manage_events`
- ✅ `can_create_blog`
- ✅ `can_moderate_blog`
- ✅ `can_access_admin` (which grants access to all admin features)

---

## Permission Groups

To see specific card groups, a role needs:

### User Management Group (Cards 1-6)
- Requires: `can_manage_users` OR `can_access_admin`
- Cards included:
  1. User Management
  2. Payment Settings
  3. Payment Queue
  4. Alumni Migration
  5. Notices Management
  6. Export Alumni Data

### Role Management (Card 7)
- Requires: `can_manage_roles` OR `can_access_admin`

### Event Management Group (Cards 8, 10)
- Requires: `can_manage_events` OR `can_access_admin`
- Cards included:
  8. Take Attendance
  10. Committee Management (also allows `content_moderator` role)

### Blog Management (Card 9)
- Requires: `can_create_blog` OR `can_moderate_blog` OR `can_access_admin`

### Public Cards (Cards 11-14)
- No permissions required (visible to all authenticated users)

---

## Notes

1. **`can_access_admin`** is a special permission that grants access to all admin features. If a user has this permission, they will see all permission-based cards.

2. **Committee Management** has a legacy check for `content_moderator` role in addition to permission checks. This should be updated to use permissions only.

3. Cards 2-6 are nested inside the `canManageUsers` check, meaning they all require the same permission as User Management.

4. The dashboard uses permission-based checks (not role-based) for most cards, allowing custom roles with appropriate permissions to see the relevant cards.


