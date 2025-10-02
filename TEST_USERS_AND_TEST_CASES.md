# BGHS Alumni Website - Test Users & Test Cases Guide

## Table of Contents
1. [Test User Credentials](#test-user-credentials)
2. [Test Cases Overview](#test-cases-overview)
3. [Role-Based Access Testing](#role-based-access-testing)
4. [Privacy Settings Testing](#privacy-settings-testing)
5. [Registration ID Testing](#registration-id-testing)
6. [Directory Visibility Testing](#directory-visibility-testing)
7. [Profile Viewing Testing](#profile-viewing-testing)
8. [Admin Functions Testing](#admin-functions-testing)
9. [Test Execution Checklist](#test-execution-checklist)

---

## Test User Credentials

### 🔑 **Universal Password for All Test Users:**
**Password:** `TestPass123!`

### 👥 **Test Users List:**

| # | Role | Email | Name | Expected Registration ID | Directory Visible |
|---|------|-------|------|------------------------|-------------------|
| 1 | **Super Administrator** | `superadmin@bghs-alumni.com` | Super Administrator | BGHSA-2024-00001 | ✅ Yes |
| 2 | **Event Manager** | `eventmanager@bghs-alumni.com` | Priya Sharma | BGHSA-2024-00002 | ✅ Yes |
| 3 | **Content Creator** | `contentcreator@bghs-alumni.com` | Rahul Patel | BGHSA-2024-00003 | ✅ Yes |
| 4 | **Content Moderator** | `moderator@bghs-alumni.com` | Anjali Singh | BGHSA-2024-00004 | ✅ Yes |
| 5 | **Donation Manager** | `donationmanager@bghs-alumni.com` | Vikram Gupta | BGHSA-2024-00005 | ✅ Yes |
| 6 | **Alumni Premium** | `premiummember@bghs-alumni.com` | Sneha Joshi | BGHSA-2024-00006 | ✅ Yes |
| 7 | **Alumni Member** | `alumnimember@bghs-alumni.com` | Arjun Kumar | BGHSA-2024-00007 | ✅ Yes |
| 8 | **Pending User** | `pendinguser@bghs-alumni.com` | Rohit Verma | ❌ No ID | ❌ No |
| 9 | **Private User** | `privateuser@bghs-alumni.com` | Kavya Reddy | BGHSA-2024-00008 | ❌ No |

---

## Test Cases Overview

### 🎯 **Testing Objectives:**
1. **Role-Based Access Control (RBAC)** - Verify users can only access features based on their role
2. **Privacy Settings** - Test different privacy configurations
3. **Registration ID System** - Verify ID generation and display
4. **Directory Visibility** - Test who can see whom in the directory
5. **Profile Viewing** - Test profile access based on roles and privacy
6. **Admin Functions** - Test administrative capabilities

### 📋 **Test Environment Setup:**
1. Execute `create-test-users.sql` in Supabase SQL editor
2. Verify all 9 test users are created successfully
3. Confirm registration IDs are generated for approved users
4. Start the application: `npm run start`
5. Access: `http://localhost:3000`

---

## Role-Based Access Testing

### 🛡️ **Super Administrator Testing**

#### **Login:** `superadmin@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Access:**
- ✅ **Dashboard** - Full access to all features
- ✅ **Admin Panel** - Complete administrative access
- ✅ **User Management** - Create, edit, delete users
- ✅ **Role Management** - Create, edit, delete roles
- ✅ **Directory** - View all users (regardless of privacy)
- ✅ **Profile Viewing** - See all profile data
- ✅ **Events** - Create, edit, delete events
- ✅ **Blog** - Create, edit, delete posts
- ✅ **Donations** - Manage donation campaigns

#### **Test Steps:**
1. **Login** with super admin credentials
2. **Navigate** to Dashboard - should see all admin cards
3. **Access** User Management - should see all 9 test users
4. **Access** Role Management - should see all 8 roles
5. **View Directory** - should see 7 visible users (excluding pending and private)
6. **View Profiles** - should see full data for all users
7. **Create/Edit** any content - should have full permissions

---

### 🎪 **Event Manager Testing**

#### **Login:** `eventmanager@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Access:**
- ✅ **Dashboard** - Event management features
- ✅ **Events** - Create, edit, delete events
- ✅ **Directory** - View visible users
- ✅ **Profile Viewing** - Based on privacy settings
- ❌ **User Management** - No access
- ❌ **Role Management** - No access
- ❌ **Blog Management** - No access

#### **Test Steps:**
1. **Login** with event manager credentials
2. **Navigate** to Dashboard - should see limited admin cards
3. **Access** Events section - should have create/edit permissions
4. **Try** to access User Management - should be blocked
5. **View Directory** - should see 7 visible users
6. **View Profiles** - should see data based on privacy settings

---

### ✍️ **Content Creator Testing**

#### **Login:** `contentcreator@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Access:**
- ✅ **Dashboard** - Content creation features
- ✅ **Blog** - Create, edit blog posts
- ✅ **Directory** - View visible users
- ✅ **Profile Viewing** - Based on privacy settings
- ❌ **User Management** - No access
- ❌ **Role Management** - No access
- ❌ **Event Management** - No access

#### **Test Steps:**
1. **Login** with content creator credentials
2. **Navigate** to Dashboard - should see blog-related cards
3. **Access** Blog section - should have create/edit permissions
4. **Try** to access User Management - should be blocked
5. **View Directory** - should see 7 visible users
6. **Create** a test blog post - should work successfully

---

### 🛡️ **Content Moderator Testing**

#### **Login:** `moderator@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Access:**
- ✅ **Dashboard** - Moderation features
- ✅ **Blog** - Moderate comments, edit posts
- ✅ **Directory** - View visible users
- ✅ **Profile Viewing** - Based on privacy settings
- ❌ **User Management** - No access
- ❌ **Role Management** - No access
- ❌ **Event Management** - No access

#### **Test Steps:**
1. **Login** with moderator credentials
2. **Navigate** to Dashboard - should see moderation features
3. **Access** Blog section - should have moderation permissions
4. **Try** to access User Management - should be blocked
5. **View Directory** - should see 7 visible users
6. **Moderate** comments - should work successfully

---

### 💰 **Donation Manager Testing**

#### **Login:** `donationmanager@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Access:**
- ✅ **Dashboard** - Donation management features
- ✅ **Donations** - Manage donation campaigns
- ✅ **Directory** - View visible users
- ✅ **Profile Viewing** - Based on privacy settings
- ❌ **User Management** - No access
- ❌ **Role Management** - No access
- ❌ **Blog Management** - No access

#### **Test Steps:**
1. **Login** with donation manager credentials
2. **Navigate** to Dashboard - should see donation-related cards
3. **Access** Donations section - should have management permissions
4. **Try** to access User Management - should be blocked
5. **View Directory** - should see 7 visible users
6. **Manage** donation campaigns - should work successfully

---

### 👑 **Alumni Premium Testing**

#### **Login:** `premiummember@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Access:**
- ✅ **Dashboard** - Premium features
- ✅ **Directory** - View visible users
- ✅ **Profile Viewing** - Based on privacy settings
- ✅ **Events** - Register for events
- ✅ **Blog** - View and comment
- ❌ **Admin Functions** - No access
- ❌ **Content Creation** - No access

#### **Test Steps:**
1. **Login** with premium member credentials
2. **Navigate** to Dashboard - should see premium features
3. **Access** Directory - should see 7 visible users
4. **Try** to access Admin Panel - should be blocked
5. **View Profiles** - should see data based on privacy settings
6. **Register** for events - should work successfully

---

### 👤 **Alumni Member Testing**

#### **Login:** `alumnimember@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Access:**
- ✅ **Dashboard** - Basic features
- ✅ **Directory** - View visible users
- ✅ **Profile Viewing** - Based on privacy settings
- ✅ **Events** - Register for events
- ✅ **Blog** - View and comment
- ❌ **Admin Functions** - No access
- ❌ **Content Creation** - No access

#### **Test Steps:**
1. **Login** with alumni member credentials
2. **Navigate** to Dashboard - should see basic features
3. **Access** Directory - should see 7 visible users
4. **Try** to access Admin Panel - should be blocked
5. **View Profiles** - should see data based on privacy settings
6. **Comment** on blog posts - should work successfully

---

## Privacy Settings Testing

### 🔒 **Private User Testing**

#### **Login:** `privateuser@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Behavior:**
- ❌ **Not visible in directory** - All privacy settings are false
- ✅ **Can view directory** - Can see other users
- ✅ **Can view own profile** - Full access to own data
- ❌ **Others cannot see profile** - Privacy settings block access

#### **Test Steps:**
1. **Login** with private user credentials
2. **Navigate** to Directory - should see 6 other users (not including self)
3. **View own profile** - should see all own data
4. **Login as other user** and try to view private user's profile
5. **Verify** that private user's data is hidden from others

---

### ⏳ **Pending User Testing**

#### **Login:** `pendinguser@bghs-alumni.com` | **Password:** `TestPass123!`

#### **Expected Behavior:**
- ❌ **Not visible in directory** - Not approved yet
- ❌ **No registration ID** - Not approved yet
- ✅ **Can login** - Account exists but limited access
- ❌ **Limited functionality** - Cannot access most features

#### **Test Steps:**
1. **Login** with pending user credentials
2. **Navigate** to Directory - should not see self in directory
3. **Check profile** - should not have registration ID
4. **Try to access features** - should have limited access
5. **Login as super admin** and approve this user
6. **Verify** that user gets registration ID and becomes visible

---

## Registration ID Testing

### 🆔 **Registration ID Verification**

#### **Test Steps:**
1. **Login as Super Admin**
2. **Navigate to User Management**
3. **Verify Registration IDs:**
   - Super Admin: `BGHSA-2024-00001`
   - Event Manager: `BGHSA-2024-00002`
   - Content Creator: `BGHSA-2024-00003`
   - Content Moderator: `BGHSA-2024-00004`
   - Donation Manager: `BGHSA-2024-00005`
   - Alumni Premium: `BGHSA-2024-00006`
   - Alumni Member: `BGHSA-2024-00007`
   - Private User: `BGHSA-2024-00008`
   - Pending User: ❌ No ID (not approved)

#### **Search Testing:**
1. **In User Management search**, try searching by:
   - Full registration ID: `BGHSA-2024-00001`
   - Last 5 digits: `00001`
   - Partial ID: `2024-00001`
2. **Verify** that search returns correct user

---

## Directory Visibility Testing

### 👀 **Directory Access Testing**

#### **Test Steps for Each Role:**
1. **Login** with each test user
2. **Navigate** to Directory (`/directory`)
3. **Verify** visible users count:
   - **Super Admin**: Should see 7 users (all approved except private)
   - **Event Manager**: Should see 7 users
   - **Content Creator**: Should see 7 users
   - **Content Moderator**: Should see 7 users
   - **Donation Manager**: Should see 7 users
   - **Alumni Premium**: Should see 7 users
   - **Alumni Member**: Should see 7 users
   - **Private User**: Should see 6 users (not including self)
   - **Pending User**: Should see 7 users (not including self)

#### **Expected Visible Users:**
1. Super Administrator
2. Priya Sharma (Event Manager)
3. Rahul Patel (Content Creator)
4. Anjali Singh (Content Moderator)
5. Vikram Gupta (Donation Manager)
6. Sneha Joshi (Alumni Premium)
7. Arjun Kumar (Alumni Member)

#### **Expected Hidden Users:**
- Rohit Verma (Pending User) - Not approved
- Kavya Reddy (Private User) - Privacy settings block visibility

---

## Profile Viewing Testing

### 👤 **Profile Access Testing**

#### **Test Matrix:**

| Viewer Role | Target User | Expected Access | Reason |
|-------------|-------------|-----------------|---------|
| Super Admin | All Users | ✅ Full Data | Admin override |
| Event Manager | Public Users | ✅ Based on Privacy | Standard access |
| Event Manager | Private User | ❌ Limited Data | Privacy blocked |
| Alumni Member | Public Users | ✅ Based on Privacy | Standard access |
| Alumni Member | Private User | ❌ Limited Data | Privacy blocked |
| Any User | Self | ✅ Full Data | Own profile |

#### **Test Steps:**
1. **Login** with each test user
2. **Navigate** to Directory
3. **Click** "View Profile" for each visible user
4. **Verify** data visibility based on privacy settings
5. **Test** profile access for private user (should be limited)
6. **Test** own profile access (should be full)

---

## Admin Functions Testing

### 🛠️ **User Management Testing**

#### **Test Steps (Super Admin Only):**
1. **Login** as Super Administrator
2. **Navigate** to User Management (`/admin/users`)
3. **Verify** all 9 test users are visible
4. **Test** search functionality:
   - Search by name: "Priya"
   - Search by email: "eventmanager"
   - Search by registration ID: "00001"
5. **Test** user editing:
   - Change a user's role
   - Update user information
   - Verify changes take effect
6. **Test** user approval:
   - Approve pending user
   - Verify registration ID generation
   - Verify directory visibility

---

### 🎭 **Role Management Testing**

#### **Test Steps (Super Admin Only):**
1. **Login** as Super Administrator
2. **Navigate** to Role Management (`/admin/roles-simple`)
3. **Verify** all 8 roles are visible
4. **Test** role creation:
   - Create a new role
   - Assign permissions
   - Verify role appears in list
5. **Test** role editing:
   - Edit existing role
   - Add/remove permissions
   - Verify changes take effect
6. **Test** role assignment:
   - Assign new role to test user
   - Verify user gets new permissions
   - Test access with new role

---

## Test Execution Checklist

### ✅ **Pre-Test Setup:**
- [ ] Execute `create-test-users.sql` in Supabase
- [ ] Verify all 9 test users are created
- [ ] Confirm registration IDs are generated
- [ ] Start application: `npm run start`
- [ ] Access: `http://localhost:3000`

### ✅ **Role-Based Access Testing:**
- [ ] Super Administrator - Full access
- [ ] Event Manager - Event management only
- [ ] Content Creator - Blog management only
- [ ] Content Moderator - Comment moderation only
- [ ] Donation Manager - Donation management only
- [ ] Alumni Premium - Premium features
- [ ] Alumni Member - Basic features
- [ ] Pending User - Limited access
- [ ] Private User - Standard access

### ✅ **Privacy Settings Testing:**
- [ ] Private user not visible in directory
- [ ] Private user profile data hidden from others
- [ ] Pending user not visible until approved
- [ ] Public users visible based on settings

### ✅ **Registration ID Testing:**
- [ ] All approved users have registration IDs
- [ ] Pending user has no registration ID
- [ ] Registration ID format: BGHSA-2024-XXXXX
- [ ] Search functionality works with registration IDs

### ✅ **Directory Testing:**
- [ ] Correct number of users visible per role
- [ ] Private user not visible to others
- [ ] Pending user not visible
- [ ] Profile links work correctly

### ✅ **Profile Viewing Testing:**
- [ ] Super admin sees all data
- [ ] Other users see data based on privacy
- [ ] Private user data is hidden
- [ ] Own profile shows full data

### ✅ **Admin Functions Testing:**
- [ ] User management accessible to super admin only
- [ ] Role management accessible to super admin only
- [ ] User search works correctly
- [ ] Role creation/editing works
- [ ] User approval generates registration ID

### ✅ **Post-Test Cleanup:**
- [ ] Document any issues found
- [ ] Note any unexpected behaviors
- [ ] Verify all test users are still functional
- [ ] Clean up any test data created during testing

---

## Expected Test Results

### 🎯 **Success Criteria:**
1. **All 9 test users can login** with correct credentials
2. **Role-based access works correctly** - users only see what they should
3. **Privacy settings are respected** - private data is hidden appropriately
4. **Registration IDs are generated** for approved users only
5. **Directory shows correct users** based on visibility settings
6. **Profile viewing respects privacy** and role-based access
7. **Admin functions work correctly** for authorized users only

### 🚨 **Common Issues to Watch For:**
1. **Login failures** - Check credentials and user approval status
2. **Access denied errors** - Verify role permissions
3. **Missing registration IDs** - Check user approval status
4. **Directory visibility issues** - Check privacy settings
5. **Profile access problems** - Verify privacy and role settings

---

*This guide provides comprehensive testing scenarios for the BGHS Alumni Website role-based access control system. Use this document to systematically test all features and ensure proper functionality.*
