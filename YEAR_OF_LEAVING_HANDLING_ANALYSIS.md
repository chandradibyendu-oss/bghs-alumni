# Year of Leaving - Handling Missing Data

## ⚠️ **Current Behavior**

### **Validation Check** (line 390-392):

```typescript
if (!normalized.year_of_leaving) {
  throw new Error('Year of leaving is required')
}
```

**Result**: If "Year of Leaving" is empty or missing in CSV, the record **FAILS** with error: `"Year of leaving is required"`

## 📋 **Problem in Your CSV**

Your `57-86.csv` has **3 entries** with missing Year of Leaving:
- **Row 18**: Entry #72 ka (Asitabh Dey) - Empty year  
- **Row 20**: Entry #74 (Kalyanabrata Chakraborty) - Empty year
- **Row 21**: Entry #75 (Apurba Ghosh) - Empty year

**Current Result**: These 3 records will **FAIL** during migration.

## 🔍 **Why It's Required**

1. **Database Schema**: `year_of_leaving` is `NOT NULL` (required field)
2. **Business Logic**: Used for batch grouping and filtering
3. **Data Integrity**: Essential for alumni directory functionality

## 🎯 **Solution Options**

### **Option 1: Use Batch Year as Fallback** ✅ Recommended

If Year of Leaving is missing, use Batch Year if available.

**Logic**:
1. Check if `Year of Leaving` is provided → use it
2. If missing, check if `Batch Year` is provided → use that
3. If both missing, use a placeholder (e.g., 1900) or skip with warning

### **Option 2: Use Estimated Year Based on Other Data**

Estimate year from available information:
- If `Start Year` and `Last Class` available → calculate estimated leaving year
- If only `Last Class` available → use a reasonable default based on class

### **Option 3: Use Placeholder Year**

Use a special placeholder year (e.g., `1900` or `9999`) to indicate unknown:
- Records can still be imported
- Can be filtered/updated later
- Maintains data structure

### **Option 4: Skip with Better Error Messages**

Keep validation, but provide detailed error reporting:
- List all records with missing years
- Allow partial import (skip problematic records)
- Provide summary report

## 💡 **Recommended: Smart Fallback Logic**

Implement a fallback strategy:

```typescript
// Priority order:
1. Use "Year of Leaving" if provided
2. Use "Batch Year" if available (often same as year of leaving)
3. Use "Start Year + Last Class" estimate if available
4. Use placeholder year (1900) or throw descriptive error
```

This balances data completeness with practical needs for historical records.



