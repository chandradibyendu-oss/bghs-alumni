# BGHS Alumni Website - User Role & Permissions Management Guide

## Table of Contents
1. [Overview](#overview)
2. [Understanding Roles and Permissions](#understanding-roles-and-permissions)
3. [Accessing Role Management](#accessing-role-management)
4. [Managing Roles](#managing-roles)
5. [Assigning Roles to Users](#assigning-roles-to-users)
6. [Permission Categories](#permission-categories)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The BGHS Alumni Website uses a comprehensive role-based access control (RBAC) system that allows administrators to manage user permissions through predefined roles. This system ensures that users only have access to the features and data they need based on their role in the alumni community.

### Key Benefits
- **Security**: Users can only access features they're authorized to use
- **Flexibility**: Roles can be customized to match your organization's needs
- **Scalability**: Easy to add new roles and permissions as the system grows
- **Audit Trail**: Track who has what permissions and when they were assigned

---

## Understanding Roles and Permissions

### What are Roles?
A **role** is a collection of permissions that define what a user can do in the system. Think of roles as job titles - each role comes with specific responsibilities and access levels.

### What are Permissions?
**Permissions** are specific actions or features that users can access. For example:
- `can_view_directory` - Allows viewing the alumni directory
- `can_create_events` - Allows creating new events
- `can_manage_users` - Allows managing user accounts

### How They Work Together
- Users are assigned **one primary role**
- Each role contains **multiple permissions**
- Permissions determine what features users can access
- Users inherit all permissions from their assigned role

---

## Accessing Role Management

### Prerequisites
- You must be logged in as a **Super Administrator**
- Your account must have the `can_manage_roles` permission

### Steps to Access
1. **Login** to the website with your super admin account
2. **Navigate** to the Dashboard (`/dashboard`)
3. **Click** on the "Role Management" card (Shield icon)
4. You'll be taken to the Role Management page (`/admin/roles-simple`)

### What You'll See
- List of all existing roles
- Number of users assigned to each role
- Number of permissions each role has
- Options to create, edit, or delete roles

---

## Managing Roles

### Viewing Existing Roles

The Role Management page displays all roles in the system:

#### Default Roles
1. **Public** - Unauthenticated users (limited access)
2. **Alumni Member** - Basic alumni member (standard access)
3. **Alumni Premium** - Premium member (enhanced features)
4. **Content Moderator** - Can moderate content and comments
5. **Event Manager** - Can create and manage events
6. **Content Creator** - Can create and edit blog posts
7. **Donation Manager** - Can manage donation campaigns
8. **Super Administrator** - Full system access

#### Role Information Displayed
- **Role Name**: The unique identifier for the role
- **Description**: What the role is for
- **User Count**: How many users have this role
- **Permission Count**: How many permissions this role has
- **Sample Permissions**: First 5 permissions shown as tags

### Creating a New Role

#### Steps to Create
1. **Click** the "Create Role" button (top right)
2. **Fill in** the role details:
   - **Role Name**: Use lowercase with underscores (e.g., `newsletter_editor`)
   - **Description**: Clear description of the role's purpose
3. **Select Permissions**: Check the boxes for permissions this role should have
4. **Click** "Create Role" to save

#### Naming Conventions
- Use lowercase letters
- Separate words with underscores
- Be descriptive but concise
- Examples: `event_coordinator`, `blog_author`, `donation_volunteer`

### Editing an Existing Role

#### Steps to Edit
1. **Find** the role you want to edit in the list
2. **Click** the Edit icon (pencil) next to the role
3. **Modify** the role details:
   - Change the name or description
   - Add or remove permissions
4. **Click** "Update Role" to save changes

#### Important Notes
- **Existing users** will automatically get the updated permissions
- **Role name changes** may affect existing user assignments
- **Permission changes** take effect immediately

### Deleting a Role

#### Steps to Delete
1. **Find** the role you want to delete
2. **Click** the Delete icon (trash) next to the role
3. **Confirm** the deletion when prompted

#### Important Considerations
- **Users with this role** will need to be reassigned
- **Deletion is permanent** - cannot be undone
- **System roles** (like `super_admin`) should not be deleted

---

## Assigning Roles to Users

### Through User Management

#### Steps to Assign
1. **Navigate** to User Management (`/admin/users`)
2. **Find** the user you want to assign a role to
3. **Click** "Edit" on the user's row
4. **Select** the new role from the dropdown
5. **Save** the changes

#### Role Assignment Rules
- Users can only have **one primary role**
- Role changes take effect **immediately**
- Users inherit **all permissions** from their new role
- **Super Administrators** can assign any role

### Bulk Role Assignment

#### For Multiple Users
1. **Go** to User Management
2. **Select** multiple users using checkboxes
3. **Choose** "Change Role" from the bulk actions
4. **Select** the new role
5. **Apply** to all selected users

---

## Permission Categories

### General Permissions
- **View Landing**: Access the main website
- **View Directory**: Browse the alumni directory
- **Edit Profile**: Modify own profile information

### Event Permissions
- **View Events**: See upcoming events
- **Register Events**: Sign up for events
- **Create Events**: Add new events to the system
- **Manage Events**: Edit and delete existing events

### Content Permissions
- **View Blog**: Read blog posts
- **Comment Blog**: Leave comments on posts
- **Create Blog**: Write new blog posts
- **Edit Blog**: Modify existing blog posts
- **Moderate Comments**: Approve/reject comments

### Administrative Permissions
- **Manage Users**: Add, edit, and remove user accounts
- **Manage Roles**: Create and modify roles and permissions
- **Access Admin**: Enter the admin panel
- **View Analytics**: See website usage statistics

---

## Best Practices

### Role Design Principles

#### 1. Principle of Least Privilege
- Give users only the permissions they need
- Start with minimal permissions and add more as needed
- Regularly review and remove unnecessary permissions

#### 2. Role Naming
- Use clear, descriptive names
- Follow consistent naming conventions
- Avoid abbreviations that might be unclear

#### 3. Permission Organization
- Group related permissions together
- Use categories to organize permissions
- Document what each permission allows

### Common Role Scenarios

#### Alumni Member (Standard)
**Purpose**: Basic access for approved alumni
**Typical Permissions**:
- View landing page
- View directory
- Edit own profile
- View events
- Register for events
- View blog
- Comment on blog

#### Event Coordinator
**Purpose**: Manage alumni events
**Typical Permissions**:
- All Alumni Member permissions
- Create events
- Manage events
- Send notifications

#### Content Manager
**Purpose**: Manage website content
**Typical Permissions**:
- All Alumni Member permissions
- Create blog posts
- Edit blog posts
- Moderate comments

#### Super Administrator
**Purpose**: Full system management
**Typical Permissions**:
- All permissions in the system
- Manage users
- Manage roles
- Access admin panel
- View analytics

### Security Considerations

#### 1. Regular Audits
- Review user roles monthly
- Remove access for inactive users
- Update roles when responsibilities change

#### 2. Access Control
- Limit super administrator accounts
- Use temporary roles for special projects
- Document role assignments and changes

#### 3. User Training
- Train users on their role responsibilities
- Provide clear guidelines on what they can/cannot do
- Establish escalation procedures for permission requests

---

## Troubleshooting

### Common Issues

#### "I can't access Role Management"
**Possible Causes**:
- Not logged in as super administrator
- Account doesn't have `can_manage_roles` permission
- Browser cache issues

**Solutions**:
- Verify you're logged in with the correct account
- Check with another super administrator
- Clear browser cache and try again

#### "Users can't see the directory"
**Possible Causes**:
- Users don't have `can_view_directory` permission
- Users are not approved (`is_approved = false`)
- Privacy settings are blocking visibility

**Solutions**:
- Check user's role and permissions
- Verify user approval status
- Review privacy settings

#### "Role changes aren't taking effect"
**Possible Causes**:
- Browser cache
- User needs to log out and back in
- Permission cache not updated

**Solutions**:
- Ask user to log out and log back in
- Clear browser cache
- Wait a few minutes for changes to propagate

### Getting Help

#### For Technical Issues
- Contact the system administrator
- Check the system logs for error messages
- Verify database connectivity

#### For Permission Questions
- Review this guide
- Check with other super administrators
- Consult the permission documentation

---

## Quick Reference

### Role Management URLs
- **Dashboard**: `/dashboard`
- **Role Management**: `/admin/roles-simple`
- **User Management**: `/admin/users`

### Key Permissions
- `can_manage_roles` - Required to access role management
- `can_manage_users` - Required to assign roles to users
- `can_access_admin` - Required to access admin features
- `can_view_directory` - Required to see alumni directory

### Default Roles
- `public` - Unauthenticated users
- `alumni_member` - Standard alumni
- `super_admin` - Full access

### Important Notes
- Users can only have one primary role
- Role changes take effect immediately
- Super administrators can manage all roles
- Deleted roles cannot be recovered

---

*This guide covers the essential features of the BGHS Alumni Website role and permissions system. For technical implementation details, please refer to the system documentation.*
