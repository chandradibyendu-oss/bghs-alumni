# Permission System Redesign Proposal

## Current Problems

### 1. **Coarse-Grained Permissions**
- `can_manage_users` controls **6 different cards**:
  - User Management
  - Payment Settings
  - Payment Queue
  - Alumni Migration
  - Notices Management
  - Export Alumni Data

- `can_manage_events` controls **2 different cards**:
  - Take Attendance
  - Committee Management

### 2. **Inconsistency**
- Dashboard checks permissions
- Some admin pages still check hardcoded roles
- Notices Management uses `can_manage_content` on the page but `can_manage_users` on dashboard

### 3. **No Granular Control**
- Cannot grant access to "Export Alumni Data" without granting "User Management"
- Cannot grant "Payment Settings" without "Alumni Migration"
- All-or-nothing approach limits flexibility

---

## Proposed Solutions

### **Option 1: Feature-Based Granular Permissions (Recommended)**

Break down broad permissions into specific feature permissions. Each card/feature gets its own permission.

#### New Permission Structure:

```typescript
// User Management Group (replaces can_manage_users)
can_manage_user_profiles      // User Management card
can_manage_payment_settings    // Payment Settings card
can_view_payment_queue         // Payment Queue card
can_manage_alumni_migration    // Alumni Migration card
can_manage_notices            // Notices Management card
can_export_alumni_data        // Export Alumni Data card

// Event Management Group (replaces can_manage_events)
can_manage_events              // Event creation/editing (keep existing)
can_take_attendance           // Take Attendance card
can_manage_committee          // Committee Management card

// Keep existing granular permissions
can_manage_roles              // Role Management (already granular)
can_create_blog              // Blog Management (already granular)
can_moderate_blog            // Blog Management (already granular)
```

#### Benefits:
- ✅ Maximum flexibility - grant access to individual features
- ✅ Clear permission names that match features
- ✅ Easy to understand what each permission does
- ✅ Can create role templates (e.g., "User Admin" = all user permissions)

#### Drawbacks:
- ❌ More permissions to manage (6 new permissions)
- ❌ Need to update all admin pages
- ❌ Migration needed for existing roles

---

### **Option 2: Permission Groups with Individual Overrides (Hybrid)**

Keep permission groups but add individual feature permissions that can override.

#### Structure:

```typescript
// Group permissions (for convenience)
can_manage_users              // Grants all user-related features
can_manage_events             // Grants all event-related features

// Individual feature permissions (can override groups)
can_manage_user_profiles      // Override: User Management only
can_manage_payment_settings   // Override: Payment Settings only
can_view_payment_queue        // Override: Payment Queue only
can_manage_alumni_migration   // Override: Alumni Migration only
can_manage_notices           // Override: Notices only
can_export_alumni_data       // Override: Export only
can_take_attendance          // Override: Attendance only
can_manage_committee         // Override: Committee only
```

#### Logic:
```typescript
// Dashboard check logic
const canSeeUserManagement = 
  hasPermission(perms, 'can_manage_users') || 
  hasPermission(perms, 'can_manage_user_profiles')

const canSeePaymentSettings = 
  hasPermission(perms, 'can_manage_users') || 
  hasPermission(perms, 'can_manage_payment_settings')
```

#### Benefits:
- ✅ Backward compatible - existing roles still work
- ✅ Flexible - can grant individual features
- ✅ Can use groups for convenience or individual for precision

#### Drawbacks:
- ❌ More complex logic (OR conditions)
- ❌ Can be confusing (group + individual permissions)
- ❌ More permissions to manage

---

### **Option 3: Resource-Action Based Permissions (Advanced)**

Use a more sophisticated RBAC system with resources and actions.

#### Structure:

```typescript
// Format: can_{action}_{resource}
can_view_users
can_create_users
can_edit_users
can_delete_users
can_export_users

can_view_payments
can_configure_payments
can_view_payment_queue

can_upload_migration
can_export_migration

can_create_notices
can_edit_notices
can_delete_notices

can_take_attendance
can_manage_committee
```

#### Benefits:
- ✅ Very granular control
- ✅ Follows RBAC best practices
- ✅ Scalable for future features

#### Drawbacks:
- ❌ Major refactoring required
- ❌ More complex permission checks
- ❌ Overkill for current needs

---

### **Option 4: Card-Based Permissions (Simplest)**

Create one permission per dashboard card.

#### Structure:

```typescript
can_access_user_management
can_access_payment_settings
can_access_payment_queue
can_access_alumni_migration
can_access_notices_management
can_access_export_alumni_data
can_access_role_management
can_access_take_attendance
can_access_blog_management
can_access_committee_management
```

#### Benefits:
- ✅ Simplest to understand
- ✅ Direct mapping: 1 permission = 1 card
- ✅ Easy to implement

#### Drawbacks:
- ❌ Many permissions (10+ new permissions)
- ❌ Less semantic (doesn't describe capability)
- ❌ Harder to create logical role templates

---

## Recommendation: **Option 1 (Feature-Based Granular Permissions)**

### Why Option 1?

1. **Clear and Semantic**: Permission names describe what the user can do
2. **Flexible**: Can grant individual features or create role templates
3. **Maintainable**: Easy to understand and document
4. **Future-Proof**: Easy to add new features with new permissions

### Implementation Plan

#### Step 1: Add New Permissions to Interface

```typescript
// lib/auth-utils.ts
export interface UserPermissions {
  // ... existing permissions ...
  
  // User Management Group (granular)
  can_manage_user_profiles: boolean
  can_manage_payment_settings: boolean
  can_view_payment_queue: boolean
  can_manage_alumni_migration: boolean
  can_manage_notices: boolean
  can_export_alumni_data: boolean
  
  // Event Management Group (granular)
  can_take_attendance: boolean
  can_manage_committee: boolean
  
  // Keep for backward compatibility (deprecated)
  can_manage_users?: boolean  // Optional, for migration period
  can_manage_events?: boolean // Optional, for migration period
}
```

#### Step 2: Update Dashboard Logic

```typescript
// app/dashboard/page.tsx
const canSeeUserManagement = 
  hasPermission(perms, 'can_manage_user_profiles') || 
  hasPermission(perms, 'can_manage_users') // Backward compat

const canSeePaymentSettings = 
  hasPermission(perms, 'can_manage_payment_settings') || 
  hasPermission(perms, 'can_manage_users') // Backward compat

// ... etc for each card
```

#### Step 3: Update Admin Pages

Each admin page checks its specific permission:
- `/admin/users` → `can_manage_user_profiles`
- `/admin/payments` → `can_manage_payment_settings`
- `/admin/payment-queue` → `can_view_payment_queue`
- `/admin/alumni-migration` → `can_manage_alumni_migration`
- `/admin/notices` → `can_manage_notices`
- `/api/admin/alumni-export` → `can_export_alumni_data`
- `/admin/events/attendance` → `can_take_attendance`
- `/admin/committee` → `can_manage_committee`

#### Step 4: Migration Strategy

1. Add new permissions to `user_roles` table
2. Create migration script to map old permissions to new:
   - `can_manage_users: true` → set all 6 user permissions to true
   - `can_manage_events: true` → set `can_take_attendance` and `can_manage_committee` to true
3. Keep old permissions for backward compatibility during transition
4. Update role management UI to show both old and new permissions (with deprecation notice)
5. After migration period, remove old permissions

---

## Permission Mapping Table

| Current Permission | New Granular Permissions | Cards Affected |
|-------------------|-------------------------|----------------|
| `can_manage_users` | `can_manage_user_profiles`<br>`can_manage_payment_settings`<br>`can_view_payment_queue`<br>`can_manage_alumni_migration`<br>`can_manage_notices`<br>`can_export_alumni_data` | User Management<br>Payment Settings<br>Payment Queue<br>Alumni Migration<br>Notices Management<br>Export Alumni Data |
| `can_manage_events` | `can_manage_events` (keep)<br>`can_take_attendance`<br>`can_manage_committee` | Event Management<br>Take Attendance<br>Committee Management |
| `can_manage_roles` | `can_manage_roles` (no change) | Role Management |
| `can_create_blog` OR `can_moderate_blog` | `can_create_blog` (keep)<br>`can_moderate_blog` (keep) | Blog Management |

---

## Role Templates (Examples)

With granular permissions, you can create role templates:

### "User Admin" Role
- `can_manage_user_profiles: true`
- `can_manage_payment_settings: true`
- `can_view_payment_queue: true`
- `can_manage_alumni_migration: true`
- `can_manage_notices: true`
- `can_export_alumni_data: true`

### "Payment Admin" Role
- `can_manage_payment_settings: true`
- `can_view_payment_queue: true`

### "Data Manager" Role
- `can_manage_alumni_migration: true`
- `can_export_alumni_data: true`

### "Content Manager" Role
- `can_manage_notices: true`
- `can_create_blog: true`
- `can_moderate_blog: true`

---

## UI/UX Considerations

### Role Management Page
- Group related permissions visually
- Show permission descriptions clearly
- Allow bulk selection (e.g., "Select all User Management permissions")
- Show deprecation warnings for old permissions

### Dashboard
- Cards only show if user has specific permission
- No nested permission checks
- Clear, direct mapping

---

## Migration Checklist

- [ ] Add new permissions to `UserPermissions` interface
- [ ] Update `get_user_permissions` database function
- [ ] Add new permissions to role management UI
- [ ] Update dashboard card visibility logic
- [ ] Update all admin page permission checks
- [ ] Create migration script for existing roles
- [ ] Update API route permission checks
- [ ] Test all permission scenarios
- [ ] Document new permission structure
- [ ] Plan deprecation timeline for old permissions

---

## Alternative: Quick Fix (Minimal Changes)

If full refactoring is not feasible immediately, a **quick fix** would be:

1. Keep `can_manage_users` but add individual permissions
2. Dashboard checks: `can_manage_users OR can_manage_user_profiles`
3. Gradually migrate to granular permissions
4. Less disruptive but still provides flexibility

---

## Questions to Consider

1. **Backward Compatibility**: How long to support old permissions?
2. **Migration Timeline**: When to fully remove old permissions?
3. **Default Roles**: Should existing roles auto-migrate or require manual update?
4. **UI Complexity**: How to present 20+ permissions in role management UI?
5. **Documentation**: How to help admins understand new permission structure?


