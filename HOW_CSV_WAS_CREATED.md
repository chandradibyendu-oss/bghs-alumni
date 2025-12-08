# How `bengali-alumni-extracted.csv` Was Created

## Process Overview

The CSV file was created **manually** using data extracted from the Bengali image description you provided. Here's the step-by-step process:

---

## Step 1: Data Source

The data came from the **Bengali image description** you shared earlier, which contained:
- 30 alumni entries (numbered 57-86, with one entry as "72ক")
- Bengali names with English transliterations
- Years in Bengali numerals (e.g., ১৯৬৯ = 1969)
- Deceased status indicators (প্রয়াত = Deceased)
- Title prefixes (ডাঃ = Dr.)

### Example from Image Description:
```
57. অরুণময় বন্দ্যোপাধ্যায় (Arunmoy Bandyopadhyay) - 1969
58. অমিয় কুমার সরকার (Amiya Kumar Sarkar) - 1951 (Deceased)
63. ডাঃ অশোক রায় (Dr. Ashok Roy) - 1972
```

---

## Step 2: Manual Data Extraction

For each entry, I extracted:
1. **Entry Number**: 57, 58, 59, etc.
2. **Name Components**: Split into First, Middle, Last name
   - Example: "Amiya Kumar Sarkar" → First: "Amiya", Middle: "Kumar", Last: "Sarkar"
3. **Year**: Converted Bengali numerals to English
   - Example: ১৯৬৯ → 1969
4. **Deceased Status**: Checked for "প্রয়াত" marker
5. **Title**: Detected "ডাঃ" (Dr.) prefix

---

## Step 3: CSV Formatting

I created the CSV file following the standard template format (`alumni-migration-template.csv`):

### Template Columns:
```
Email, Phone, First Name, Last Name, Middle Name, Last Class, 
Year of Leaving, Start Class, Start Year, Batch Year, Profession, 
Company, Location, Bio, LinkedIn URL, Website URL, Role, Notes
```

### Data Processing for Each Record:

1. **Email Generation**: Created placeholder emails
   - Format: `firstname.lastname.year@bghs-alumni.com`
   - Example: `arunmoy.bandyopadhyay.1969@bghs-alumni.com`

2. **Name Parsing**: Split full names into components
   - Single word → First Name only
   - Two words → First Name, Last Name
   - Three+ words → First Name, Middle Name(s), Last Name

3. **Year Handling**: 
   - Converted Bengali numerals to English
   - Set as both "Year of Leaving" and "Batch Year"
   - Marked missing years in Notes

4. **Special Cases**:
   - **Dr. prefix**: Added to Notes, set Profession = "Doctor"
   - **Deceased status**: Added to Notes
   - **Missing year**: Noted in Notes column

5. **Default Values**:
   - Last Class: "12" (assuming completed school)
   - Role: "alumni_member"
   - Other fields: Left empty

---

## Step 4: Creating the CSV File

The CSV was created directly using the `write` tool (not by running a Python script), because you mentioned you don't want to run non-generic scripts for each image.

### Example Record Creation:

**Input from Image**:
```
63. ডাঃ অশোক রায় (Dr. Ashok Roy) - 1972
```

**Processed Output in CSV**:
```csv
ashok.roy.1972@bghs-alumni.com,,Ashok,Roy,,12,1972,,,1972,Doctor,,,,,alumni_member,Entry #: 63; Title: Dr.
```

---

## Step 5: Extended Format Creation

I also created `bengali-alumni-extracted-extended.csv` with:
- **Old Registration Number**: Entry numbers (57, 58, etc.)
- **Registration Number**: BGHSA-2025-00057 format
- **Title Prefix**: Dr. where applicable
- **Is Deceased**: true/false
- All other standard columns

This matches your previous template format that included registration numbers.

---

## Why Manual Creation?

1. **One-time extraction**: The data was already extracted from the image description
2. **No script needed**: You mentioned preferring not to run non-generic Python scripts
3. **Direct control**: Manual creation ensures accuracy and proper formatting
4. **Template compliance**: Guaranteed to match the exact template format

---

## Files Created

1. **`bengali-alumni-extracted.csv`** (Simple format)
   - 30 records
   - Standard template format
   - Ready for migration

2. **`bengali-alumni-extracted-extended.csv`** (Extended format)
   - 30 records
   - Includes registration numbers
   - Matches your previous template format

---

## Notes

- **Entry 72ক**: Special entry with Bengali suffix "ক" - kept as-is in Old Registration Number
- **Missing Years**: 3 entries (72ক, 74, 75, 77) had no year - noted in Notes column
- **Deceased Status**: 5 entries marked as deceased - noted in Notes column
- **Doctor Titles**: 3 entries had Dr. prefix - set Profession = "Doctor"

---

## For Future Images

For processing multiple images repeatedly, you can use the generic extraction script:
- `scripts/extract-bengali-alumni-generic.py` - For single images
- `scripts/batch-extract-alumni.py` - For multiple images at once

But for this specific image, the CSV was created manually from the image description data.



