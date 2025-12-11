# Migration API Updates - Registration Number Support

## ✅ **Changes Completed**

### **1. Updated AlumniRecord Interface**

Added two new optional fields to support registration numbers:
- `registration_id?: string` - New registration number (e.g., BGHSA-2025-00058)
- `old_registration_id?: string` - Old registration number for historical tracking

### **2. Added Field Mappings**

Extended the field mapping dictionary to recognize CSV columns:
- `'Registration Number'` → `registration_id`
- `'Old Registration Number'` → `old_registration_id`
- Also handles variations like `'RegistrationNumber'`, `'registration_number'`, etc.

### **3. Enhanced Duplicate Checking**

Now checks for existing records by:
- ✅ **Email address** (existing behavior)
- ✅ **Registration ID** (new - prevents duplicate registration numbers)

Uses `.maybeSingle()` to gracefully handle cases where no record exists.

### **4. Registration Number Storage**

Registration numbers from CSV are now:
- ✅ Extracted from CSV columns
- ✅ Included in database insert statement
- ✅ Stored in `registration_id` and `old_registration_id` columns

**Important**: Database trigger will only auto-generate registration_id if it's NULL. If provided from CSV, it will be used as-is.

### **5. Import Tracking**

Added tracking fields to identify migrated records:
- `import_source = 'admin_migration'`
- `imported_at = timestamp`

## 🎯 **How It Works Now**

### **Registration Number Flow**:

1. **CSV Parsing**: 
   - Reads "Registration Number" column → maps to `registration_id`
   - Reads "Old Registration Number" column → maps to `old_registration_id`

2. **Validation**:
   - Checks if email already exists → skip if found
   - Checks if registration_id already exists → skip if found

3. **Database Insert**:
   - If `registration_id` provided → uses CSV value
   - If `registration_id` is NULL → database trigger auto-generates
   - Stores `old_registration_id` if provided

4. **Result**:
   - ✅ CSV registration numbers are preserved
   - ✅ Database trigger respects provided values
   - ✅ Auto-generation as fallback if not provided

## 📋 **CSV Format Support**

Your CSV file format is now fully supported:

```csv
Old Registration Number,Registration Number,Email,Phone,...
57,BGHSA-2025-00058,BGHSA202500058@alumnibghs.org,,...
```

**Columns Recognized**:
- ✅ `Old Registration Number` → stored in `old_registration_id`
- ✅ `Registration Number` → stored in `registration_id`
- ✅ All standard fields (Email, Names, Years, etc.)

## ⚠️ **Important Notes**

### **Duplicate Prevention**
- System checks for duplicates by **both** email and registration_id
- If either matches an existing record, upload will fail for that record
- This prevents data conflicts

### **Registration ID Uniqueness**
- Database enforces UNIQUE constraint on `registration_id`
- If CSV contains duplicate registration numbers, insert will fail
- Each record must have a unique registration_id

### **Update Logic**
- Current implementation: **Creates new records only**
- If a record with same email or registration_id exists, it's skipped
- Update functionality can be added later if needed

## 🔍 **Testing Checklist**

Before uploading your CSV:

1. ✅ Verify all registration numbers in CSV are unique
2. ✅ Ensure no duplicates exist in database already
3. ✅ Check that registration number format matches database expectations
4. ✅ Validate email format is correct

## 📝 **Example CSV Row**

```csv
Old Registration Number,Registration Number,Email,Phone,Title Prefix,First Name,Middle Name,Last Name,Last Class,Year of Leaving,Start Class,Start Year,Batch Year,Profession,Company,Location,Bio,LinkedIn URL,Website URL,Role,Is Deceased,Deceased Year,Notes
57,BGHSA-2025-00058,BGHSA202500058@alumnibghs.org,,,Arunmoy,,Bandyopadhyay,12,1969,,,1969,,,,,,,alumni_member,FALSE,,Entry #: 57
```

**What Happens**:
- `57` → stored in `old_registration_id`
- `BGHSA-2025-00058` → stored in `registration_id`
- All other fields processed normally

## ✅ **Ready to Use**

The migration API is now ready to:
- ✅ Accept registration numbers from CSV
- ✅ Store them in database
- ✅ Check for duplicates by registration_id
- ✅ Maintain backward compatibility (auto-generates if not provided)

Your `57-86.csv` file is ready to upload!




