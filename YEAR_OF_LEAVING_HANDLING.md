# Year of Leaving - Current Handling vs Missing Data

## ⚠️ **Current Behavior: FAILS on Missing Data**

### **Validation Logic** (lines 390-392):

```typescript
if (!normalized.year_of_leaving) {
  throw new Error('Year of leaving is required')
}
```

**Result**: If "Year of Leaving" is empty or missing in CSV, the record will **FAIL** with error: `"Year of leaving is required"`

### **Database Schema**:

From `fix-profiles-table-structure.sql`:
- `year_of_leaving` is **NOT NULL** (required field)
- Constraint: Must be between 1950 and current year

## 📋 **Your CSV Issue**

Looking at `57-86.csv`, these entries have missing Year of Leaving:

- **Row 18**: Entry #72 ka (Asitabh Dey) - Empty year
- **Row 20**: Entry #74 (Kalyanabrata Chakraborty) - Empty year  
- **Row 21**: Entry #75 (Apurba Ghosh) - Empty year

**Current Result**: These 3 records will **FAIL** during migration.

## 🔧 **Solution Options**

### **Option 1: Make Year of Leaving Optional** (Recommended)

Allow missing years, but handle them gracefully:

**Changes Needed**:
1. Make `year_of_leaving` optional in interface
2. Remove strict validation requirement
3. Use a placeholder/default value when missing
4. Update database schema to allow NULL (or use default)

**Pros**: 
- ✅ Handles incomplete historical data
- ✅ Flexible for legacy records

**Cons**: 
- ⚠️ Requires database schema change
- ⚠️ May affect queries/filters that rely on year

### **Option 2: Use Estimated/Default Year**

When missing, use a reasonable default:

**Options**:
- Use `batch_year` if available
- Use a placeholder like `1900` or `9999`
- Use current year as default
- Calculate from other available data (e.g., Last Class + estimated age)

**Pros**: 
- ✅ No schema changes needed
- ✅ Records can still be imported

**Cons**: 
- ⚠️ Data may not be accurate
- ⚠️ Need to handle placeholder values in queries

### **Option 3: Skip Records with Missing Years**

Keep current validation, but provide better error reporting:

**Pros**: 
- ✅ Ensures data quality
- ✅ No schema changes

**Cons**: 
- ❌ Loses records with incomplete data
- ❌ Requires manual data entry later

### **Option 4: Pre-fill Missing Years Before Upload**

Fix CSV before upload by:
- Researching missing years
- Using batch year if available
- Using estimated values

**Pros**: 
- ✅ Maintains data quality
- ✅ No code changes needed

**Cons**: 
- ⚠️ Manual work required
- ⚠️ May not be possible for all records

## 🎯 **Recommended Approach**

For your use case (historical alumni data with some missing years), I recommend:

**Option 1 + Smart Defaults**:
1. Make year_of_leaving optional in validation
2. Use batch_year if available
3. Fallback to NULL (requires schema change) or placeholder year
4. Add a flag/note indicating estimated year

This balances data completeness with practical needs for historical records.

## 📝 **Implementation**

Would you like me to:
1. ✅ Update validation to allow missing years?
2. ✅ Add smart defaults (use batch_year, Last Class estimation, etc.)?
3. ✅ Update error messages to be more helpful?

Let me know which approach you prefer!


