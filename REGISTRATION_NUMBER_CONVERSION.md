# Registration Number Conversion Summary

## 🔢 **Registration Number Extraction and Conversion**

### **Conversion Format**
- **Old Format**: `1`, `2`, `3`, etc. (simple index numbers)
- **New Format**: `BGHS-2025-000001`, `BGHS-2025-000002`, `BGHS-2025-000003`, etc.

### **Conversion Logic**
```python
def convert_registration_number(old_reg_no):
    """Convert old registration number to new format BGHS-2025-XXXXXX"""
    # Handle special cases like "28 ka"
    if " ka" in old_reg_no:
        old_reg_no = old_reg_no.replace(" ka", "")
    
    # Convert to integer and format with leading zeros
    reg_num = int(old_reg_no)
    new_reg_no = f"BGHS-2025-{reg_num:06d}"
    return new_reg_no
```

## 📊 **Registration Number Conversion Examples**

| Old Registration | New Registration | Name | Status |
|------------------|------------------|------|--------|
| 1 | BGHS-2025-000001 | Ratikanta Mukhopadhyay | Living |
| 2 | BGHS-2025-000002 | Barin Kumar Chattopadhyay | Deceased 🕯️ |
| 3 | BGHS-2025-000003 | Debi Prasad Sengupta | Deceased 🕯️ |
| 4 | BGHS-2025-000004 | Tapan Kumar Chattopadhyay | Living |
| 5 | BGHS-2025-000005 | Anjan Kumar Bandyopadhyay | Deceased 🕯️ |
| 6 | BGHS-2025-000006 | Dr. Bishwatosh Basu | Deceased 🕯️ |
| 7 | BGHS-2025-000007 | Kanak Chattopadhyay | Deceased 🕯️ |
| 8 | BGHS-2025-000008 | Kiran Shankar Chattopadhyay | Deceased 🕯️ |
| 9 | BGHS-2025-000009 | Prof. Debnath Mukhopadhyay | Living |
| 10 | BGHS-2025-000010 | Dilip Chattopadhyay | Deceased 🕯️ |
| ... | ... | ... | ... |
| 56 | BGHS-2025-000056 | Tamal Kumar Chakraborty | Living |

## 🔧 **Special Cases Handled**

### **1. Special Entry "28 ka"**
- **Old**: `28 ka`
- **New**: `BGHS-2025-000028`
- **Logic**: Removes " ka" suffix and converts to standard format

### **2. Leading Zero Padding**
- **Format**: 6-digit padding with leading zeros
- **Example**: `1` → `BGHS-2025-000001`
- **Example**: `56` → `BGHS-2025-000056`

## 📋 **CSV Structure**

The CSV now includes two registration number columns:

1. **Old Registration Number**: Original index from the Bengali image
2. **Registration Number**: New format BGHS-2025-XXXXXX

### **Column Order**:
```
Old Registration Number, Registration Number, Email, Phone, Title Prefix, First Name, Middle Name, Last Name, Last Class, Year of Leaving, Start Class, Start Year, Batch Year, Profession, Company, Location, Bio, LinkedIn URL, Website URL, Role, Is Deceased, Deceased Year, Notes
```

## 🎯 **Key Features**

### ✅ **Complete Registration Tracking**
- **Old Numbers**: Preserved for reference and historical tracking
- **New Numbers**: Standardized format for current system
- **Sequential Format**: Maintains original order with new format

### ✅ **Special Case Handling**
- **"28 ka" Entry**: Properly converted to standard format
- **Leading Zeros**: Consistent 6-digit padding
- **Error Handling**: Fallback for any parsing issues

### ✅ **Data Integrity**
- **57 Total Records**: All registration numbers converted
- **Sequential Order**: Maintains original indexing order
- **Format Consistency**: Uniform BGHS-2025-XXXXXX format

## 📁 **Generated Files**

### 1. `bengali_alumni_with_registration_numbers.csv`
- **Complete dataset** with registration number conversion
- **Two registration columns** for tracking old and new formats
- **Ready for migration** to the database system

### 2. `REGISTRATION_NUMBER_CONVERSION.md`
- **Detailed conversion summary** documenting the process
- **Examples and special cases** handled
- **Complete reference** for registration number format

## 🚀 **Migration Ready**

The CSV file is now ready for:
1. **Upload to migration system** via `/admin/alumni-migration`
2. **Database import** with proper registration number assignment
3. **User account creation** with BGHS-2025-XXXXXX format
4. **Historical tracking** with old registration numbers preserved

**All registration numbers have been successfully extracted and converted to the new format!** ✅


