# Contact Fields Migration Guide

## Overview
This migration updates the database schema to properly support the "either email OR phone" business requirement for user registration and login.

## Problem
- **Current State**: Email is NOT NULL, phone is nullable
- **Business Requirement**: Users can register with either email OR phone (or both)
- **Issue**: Database constraint doesn't match business logic

## Solution: Option 1 - Flexible Contact Fields

### Database Changes
1. **Make email nullable**: `ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL`
2. **Add constraint**: Ensure at least one contact method is provided
3. **Maintain data integrity**: Prevent users with no contact information

### Migration Scripts
- `update-contact-fields-constraints.sql` - Apply the changes
- `rollback-contact-fields-constraints.sql` - Revert if needed

## Implementation Steps

### 1. Run the Migration
```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f update-contact-fields-constraints.sql
```

### 2. Verify Changes
The migration script includes verification queries that will show:
- All profiles with their contact methods
- Constraint information
- Data integrity check

### 3. Test the Application
- Register with email only
- Register with phone only  
- Register with both
- Login with email
- Login with phone

## Expected Results

### Before Migration
```
email: NOT NULL
phone: nullable
Constraint: None
Result: Users must have email (doesn't match business logic)
```

### After Migration
```
email: nullable
phone: nullable
Constraint: check_email_or_phone (email IS NOT NULL OR phone IS NOT NULL)
Result: Users must have at least one contact method (matches business logic)
```

## Data Scenarios

| Email | Phone | Valid | Description |
|-------|-------|-------|-------------|
| ✅ | ✅ | Yes | User has both (preferred) |
| ✅ | ❌ | Yes | Email-only user |
| ❌ | ✅ | Yes | Phone-only user |
| ❌ | ❌ | No | Invalid (blocked by constraint) |

## Application Code Impact

### Already Compatible
- ✅ Registration API (`/api/auth/register`)
- ✅ Login API (`/api/auth/login-lookup`)
- ✅ Forgot Password API (`/api/auth/forgot-password`)
- ✅ All UI components

### No Changes Needed
The application code already handles nullable email properly because:
- Registration validates "at least one contact method"
- Login lookup works with either email or phone
- All APIs check for both fields appropriately

## Rollback Plan

If issues arise, run the rollback script:
```bash
psql -h your-db-host -U postgres -d postgres -f rollback-contact-fields-constraints.sql
```

**Note**: Rollback will fail if any profiles have NULL email values.

## Benefits

1. **Data Integrity**: Database enforces business rules
2. **User Experience**: Supports users with only phone or only email
3. **Flexibility**: Accommodates various user scenarios
4. **Future-Proof**: Handles edge cases gracefully
5. **Consistency**: Database schema matches application logic

## Monitoring

After migration, monitor:
- User registration success rates
- Login success rates
- Any constraint violation errors
- Data quality in profiles table

## Questions?

This migration aligns your database schema with your business requirements while maintaining data integrity and user experience.
