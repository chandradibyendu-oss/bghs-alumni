# 🧪 Sample Users for Testing User Role System

## 📋 **Quick Setup Guide**

### **Step 1: Run the Database Setup**
First, run the `database-roles-setup.sql` script in your Supabase SQL Editor.

### **Step 2: Create Users Through Admin Panel**
Use your existing admin account to create these sample users through the admin panel at `/admin/users`.

## 👥 **Sample Users to Create**

### **1. Super Admin** (if not already exists)
- **Email**: `admin@bghs.edu.in`
- **Password**: `admin123`
- **Full Name**: `Admin User`
- **Batch Year**: `1990`
- **Role**: `super_admin`
- **Profession**: `System Administrator`
- **Company**: `BGHS Alumni Association`
- **Location**: `Kolkata, West Bengal`

### **2. Premium Alumni**
- **Email**: `premium@bghs.edu.in`
- **Password**: `premium123`
- **Full Name**: `Premium User`
- **Batch Year**: `1995`
- **Role**: `alumni_premium`
- **Profession**: `Software Engineer`
- **Company**: `Tech Corp`
- **Location**: `Bangalore, Karnataka`

### **3. Content Moderator**
- **Email**: `moderator@bghs.edu.in`
- **Password**: `moderator123`
- **Full Name**: `Moderator User`
- **Batch Year**: `1992`
- **Role**: `content_moderator`
- **Profession**: `Content Manager`
- **Company**: `Media House`
- **Location**: `Mumbai, Maharashtra`

### **4. Event Manager**
- **Email**: `events@bghs.edu.in`
- **Password**: `events123`
- **Full Name**: `Event Manager`
- **Batch Year**: `1988`
- **Role**: `event_manager`
- **Profession**: `Event Coordinator`
- **Company**: `Event Solutions`
- **Location**: `Delhi, NCR`

### **5. Content Creator**
- **Email**: `creator@bghs.edu.in`
- **Password**: `creator123`
- **Full Name**: `Content Creator`
- **Batch Year**: `1993`
- **Role**: `content_creator`
- **Profession**: `Journalist`
- **Company**: `News Daily`
- **Location**: `Chennai, Tamil Nadu`

### **6. Donation Manager**
- **Email**: `donations@bghs.edu.in`
- **Password**: `donations123`
- **Full Name**: `Donation Manager`
- **Batch Year**: `1985`
- **Role**: `donation_manager`
- **Profession**: `Fundraising Manager`
- **Company**: `Charity Foundation`
- **Location**: `Hyderabad, Telangana`

### **7. Basic Alumni Members**
- **Email**: `alumni1@bghs.edu.in`
- **Password**: `alumni123`
- **Full Name**: `Alumni One`
- **Batch Year**: `2000`
- **Role**: `alumni_member`
- **Profession**: `Teacher`
- **Company**: `Public School`
- **Location**: `Kolkata, West Bengal`

- **Email**: `alumni2@bghs.edu.in`
- **Password**: `alumni123`
- **Full Name**: `Alumni Two`
- **Batch Year**: `2005`
- **Role**: `alumni_member`
- **Profession**: `Doctor`
- **Company**: `City Hospital`
- **Location**: `Kolkata, West Bengal`

- **Email**: `alumni3@bghs.edu.in`
- **Password**: `alumni123`
- **Full Name**: `Alumni Three`
- **Batch Year**: `2010`
- **Role**: `alumni_member`
- **Profession**: `Engineer`
- **Company**: `Construction Co`
- **Location**: `Kolkata, West Bengal`

- **Email**: `alumni4@bghs.edu.in`
- **Password**: `alumni123`
- **Full Name**: `Alumni Four`
- **Batch Year**: `2015`
- **Role**: `alumni_member`
- **Profession**: `Student`
- **Company**: `University`
- **Location**: `Kolkata, West Bengal`

## 🧪 **Testing Scenarios**

### **Test Role-Based Access:**
1. **Login as different users** to test their permissions
2. **Check admin panel access** - only super_admin should access
3. **Test role switching** using the admin panel
4. **Verify permissions** for each role

### **Test User Management:**
1. **Create new users** with different roles
2. **Edit existing users** and change their roles
3. **Delete users** (be careful with this in production)
4. **Search and filter** users by various criteria

## 🔐 **Login Credentials Summary**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@bghs.edu.in` | `admin123` |
| Premium Alumni | `premium@bghs.edu.in` | `premium123` |
| Content Moderator | `moderator@bghs.edu.in` | `moderator123` |
| Event Manager | `events@bghs.edu.in` | `events123` |
| Content Creator | `creator@bghs.edu.in` | `creator123` |
| Donation Manager | `donations@bghs.edu.in` | `donations123` |
| Alumni Member 1 | `alumni1@bghs.edu.in` | `alumni123` |
| Alumni Member 2 | `alumni2@bghs.edu.in` | `alumni123` |
| Alumni Member 3 | `alumni3@bghs.edu.in` | `alumni123` |
| Alumni Member 4 | `alumni4@bghs.edu.in` | `alumni123` |

## 🚀 **Next Steps**

1. **Create these users** through your admin panel
2. **Test login** with each user
3. **Verify role permissions** work correctly
4. **Test role switching** in the admin panel
5. **Customize permissions** as needed for your specific requirements

## ⚠️ **Important Notes**

- **Change passwords** in production environment
- **Use strong passwords** for real users
- **Test thoroughly** before deploying to production
- **Backup your database** before making changes
- **Remove test users** before going live
