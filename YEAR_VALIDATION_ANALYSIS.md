# Year of Leaving Validation - Where It's Implemented

## 🔍 **Validation Location**

### **1. API Validation** ⚠️ **PRIMARY (Catches First)**

**File**: `app/api/admin/alumni-migration/upload/route.ts`
**Lines**: 525-526

```typescript
if (alumniRecord.year_of_leaving < 1950 || alumniRecord.year_of_leaving > new Date().getFullYear()) {
  throw new Error('Year of leaving must be between 1950 and current year')
}
```

**Status**: ✅ **Active** - This is what's causing your failures!

**Error Message**: `"Year of leaving must be between 1950 and current year"`

---

### **2. Database Constraint** ✅ **SECONDARY (Backup)**

**File**: `fix-profiles-table-structure.sql`
**Lines**: 31-32

```sql
ALTER TABLE profiles ADD CONSTRAINT chk_year_of_leaving 
    CHECK (year_of_leaving >= 1950 AND year_of_leaving <= EXTRACT(YEAR FROM NOW()));
```

**Status**: ✅ **Active** - Backup validation in database

**Note**: API validation catches it first, so database constraint is rarely triggered

---

## 📋 **Your Failing Records**

Looking at `87-117.csv`, these 3 records have years **BEFORE 1950**:

1. **Entry 90** (Row 5): 
   - Email: `BGHSA202500092@alumnibghs.org`
   - Year: **1949** ❌ (less than 1950)

2. **Entry 94** (Row 9):
   - Email: `BGHSA202500096@alumnibghs.org`
   - Year: **1941** ❌ (less than 1950)

3. **Entry 117** (Row 32):
   - Email: `BGHSA202500119@alumnibghs.org`
   - Year: **1947** ❌ (less than 1950)

**Problem**: These are legitimate historical years, but validation rejects anything before 1950.

---

## 🎯 **Solution Options**

### **Option 1: Lower Minimum Year** (Recommended)

Change minimum year from 1950 to an earlier year (e.g., 1900) to accommodate historical records.

**Pros**: 
- ✅ Handles real historical alumni data
- ✅ Simple fix

**Cons**: 
- ⚠️ Need to update both API and database

### **Option 2: Remove Minimum Year Check**

Remove the minimum year requirement entirely.

**Pros**: 
- ✅ Maximum flexibility

**Cons**: 
- ⚠️ Could allow invalid years (e.g., 1800, 500)

### **Option 3: Use Reasonable Default for Historical Records**

For years < 1950, use 1950 as minimum but log a warning.

**Pros**: 
- ✅ Maintains data integrity
- ✅ Allows import

**Cons**: 
- ⚠️ Loses historical accuracy

---

## 💡 **Recommended: Lower Minimum to 1900**

For historical alumni records, change minimum year to **1900**:
- Still prevents invalid years (too old)
- Allows legitimate historical data
- Common practice for legacy records

Would you like me to update the validation to allow years from 1900 instead of 1950?



