# Alumni Migration Template Format Guide

## 📋 Two Template Formats Available

There are **two template formats** you can use for alumni migration. Both work with the migration system.

### Format 1: Simple Template (Standard)
**File**: `alumni-migration-template.csv`

**Columns** (18 total):
```
Email, Phone, First Name, Last Name, Middle Name, Last Class, Year of Leaving, 
Start Class, Start Year, Batch Year, Profession, Company, Location, Bio, 
LinkedIn URL, Website URL, Role, Notes
```

**Used by**: The admin migration page downloads this format by default.

---

### Format 2: Extended Template (With Registration Numbers)
**File**: `alumni-data-migration-template.csv` or custom format

**Columns** (23 total):
```
Old Registration Number, Registration Number, Email, Phone, Title Prefix, 
First Name, Middle Name, Last Name, Last Class, Year of Leaving, 
Start Class, Start Year, Batch Year, Profession, Company, Location, Bio, 
LinkedIn URL, Website URL, Role, Is Deceased, Deceased Year, Notes
```

**Used by**: Your previous migrations that included registration number tracking.

---

## 🔍 Which Format to Use?

### Use **Extended Format** if:
- ✅ You want to track old registration numbers from source documents
- ✅ You want to assign new registration numbers (BGHSA-2025-XXXXX)
- ✅ You need to track Title Prefix, Is Deceased, Deceased Year separately
- ✅ You're migrating from existing records with registration numbers

### Use **Simple Format** if:
- ✅ You're starting fresh without registration numbers
- ✅ You just need the essential fields
- ✅ You prefer a cleaner, simpler template

---

## ⚙️ How Migration API Handles Formats

The migration API is **flexible** and accepts both formats:

✅ **Processed Fields**:
- Email, Phone, Names, Classes, Years
- Profession, Company, Location, Bio
- LinkedIn URL, Website URL, Role
- Notes

⚠️ **Ignored Fields** (won't cause errors, just ignored):
- Old Registration Number
- Registration Number
- Title Prefix (use "Professional Title" column instead)
- Is Deceased (not stored in database)
- Deceased Year (not stored in database)

**Note**: Registration numbers and deceased status are useful for reference/tracking but aren't stored in the database by the migration system.

---

## 📁 Your Current Files

### For Your Bengali Image Data:

1. **Simple Format**: `bengali-alumni-extracted.csv`
   - 30 records
   - Uses standard template format
   - Ready to upload

2. **Extended Format**: `bengali-alumni-extracted-extended.csv`
   - 30 records  
   - Includes registration numbers (BGHSA-2025-00057 to BGHSA-2025-00086)
   - Includes Title Prefix, Is Deceased columns
   - Matches your previous template format

**Recommendation**: Use the **extended format** (`bengali-alumni-extracted-extended.csv`) to match your previous template structure and maintain consistency.

---

## ✅ Ready to Upload

Both CSV files are ready for upload to `/admin/alumni-migration`. The migration system will:
- Process all the standard fields
- Ignore registration number columns (they won't cause errors)
- Create user accounts and profiles successfully

---

## 🔄 Converting Between Formats

If you need to convert between formats:
- **Extended → Simple**: Remove first 2 columns (Old/New Registration Number), remove Title Prefix, Is Deceased, Deceased Year columns
- **Simple → Extended**: Add registration number columns at the beginning, add missing columns

The migration system accepts either format!


