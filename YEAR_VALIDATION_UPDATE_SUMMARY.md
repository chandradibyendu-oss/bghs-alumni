# Year Validation Update - Lowered Minimum Year

## ✅ **API Changes Completed**

### **Updated Validations**:

1. **Year of Leaving** (Line 525-526):
   - **Before**: `>= 1950`
   - **After**: `>= 1900` ✅

2. **Start Year** (Line 531-532):
   - **Before**: `>= 1950`
   - **After**: `>= 1900` ✅

3. **Placeholder Year** (Line 493):
   - **Before**: `1950`
   - **After**: `1900` ✅

## 📋 **Your Failing Records - Now Fixed**

These 3 records will now pass validation:

1. **Entry 90**: Year **1949** ✅ (was failing, now passes)
2. **Entry 94**: Year **1941** ✅ (was failing, now passes)
3. **Entry 117**: Year **1947** ✅ (was failing, now passes)

## 🔧 **Database Constraint Update Required**

### **SQL Script Created**: `update-year-validation-constraint.sql`

This script:
- ✅ Drops existing constraint first (fixes "already exists" error)
- ✅ Recreates constraint with 1900 minimum
- ✅ Updates both `year_of_leaving` and `start_year` constraints

### **To Run**:

Execute the SQL script `update-year-validation-constraint.sql` in your database. It handles the constraint drop/recreate properly.

**Note**: The script uses `DROP CONSTRAINT IF EXISTS` to avoid the "already exists" error you encountered.

## 🎯 **After Updates**

### **API Validation**:
- Minimum year: **1900** ✅
- Maximum year: **Current year** ✅

### **Database Constraint**:
- Minimum year: **1900** ✅ (after running SQL script)
- Maximum year: **Current year** ✅

## 📝 **Next Steps**

1. ✅ **API Updated** - Already done
2. ⏳ **Run SQL Script** - Execute `update-year-validation-constraint.sql`
3. 🔄 **Restart Dev Server** - To load API changes
4. ✅ **Upload CSV** - All 3 records should now pass

All changes complete! The 3 failing records will now be accepted.



