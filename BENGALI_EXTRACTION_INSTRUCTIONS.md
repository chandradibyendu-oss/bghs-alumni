# Bengali Alumni Data Extraction Instructions

## 📋 Standard Instruction Template

**Copy and paste this template each time you have a new Bengali image to process:**

---

### Task: Extract Alumni Data from Bengali Image

**Instructions:**

1. **Extract all alumni entries from the attached Bengali text image**

2. **Create CSV file named:** `[START-END].csv` (e.g., `180-210.csv` for entries 180-210)

3. **Use the EXACT format matching:** `57-86.csv`, `87-117.csv`, `118-148.csv`, or `149-179.csv`

4. **CSV Format Requirements:**
   - **Headers:** Use the extended template format with these columns:
     ```
     Old Registration Number,Registration Number,Email,Phone,Title Prefix,First Name,Middle Name,Last Name,Last Class,Year of Leaving,Start Class,Start Year,Batch Year,Profession,Company,Location,Bio,LinkedIn URL,Website URL,Role,Is Deceased,Deceased Year,Notes
     ```
   
   - **Old Registration Number:** The serial number from the image (e.g., 180, 181, 182...)
   
   - **Registration Number:** Format `BGHSA-2025-00XXX` where XXX = Old Registration Number + 2
     - Example: Entry 180 → `BGHSA-2025-00182` (180 + 2 = 182)
     - Continue the sequence from the last uploaded file
   
   - **Email:** Format `BGHSA[8-digit-number]@alumnibghs.org`
     - Example: Entry 180 → `BGHSA202500182@alumnibghs.org`
     - Use the same number as Registration Number without dashes and zeros
   
   - **Name Parsing:**
     - Extract Bengali names and transliterate to English
     - Parse into First Name, Middle Name, Last Name
     - Handle compound surnames (e.g., "Ghosh Dastidar" goes in Last Name field)
     - If no middle name, leave Middle Name field empty
   
   - **Title Prefix:**
     - Extract "ডাঃ" or "ডঃ" → "Dr."
     - Extract "অধ্যাঃ" or "Prof." → "Prof."
     - Leave empty if no title
     - Set Profession field: "Doctor" for Dr., "Professor" for Prof.
   
   - **Year of Leaving:**
     - Extract year from parentheses in Bengali numerals
     - Convert Bengali numerals to English (০-৯ → 0-9)
     - Set Batch Year = Year of Leaving
     - If year is missing, leave both fields empty and add note
   
   - **Last Class:** Always set to `12` (assuming they completed school)
   
   - **Is Deceased:**
     - Look for "(প্রয়াত)" or "(প্রয়াত)" marker
     - Set `Is Deceased` = `TRUE` if marked as deceased
     - Set `Is Deceased` = `FALSE` if not marked
   
   - **Notes:** Include entry number and any special notes (e.g., "Entry #: 180; Deceased; Title: Dr.")
   
   - **All other fields:** Leave empty (Phone, Start Class, Start Year, Company, Location, Bio, LinkedIn URL, Website URL, Deceased Year)
   
   - **Role:** Always set to `alumni_member`

5. **Extraction Checklist:**
   - ✅ Extract ALL entries from the image (no placeholders)
   - ✅ Correctly transliterate Bengali names to English
   - ✅ Parse names into First/Middle/Last correctly
   - ✅ Extract and convert Bengali year numerals to English
   - ✅ Mark deceased status accurately
   - ✅ Include professional titles (Dr./Prof.)
   - ✅ Use consistent registration number and email format
   - ✅ Follow the exact CSV column structure

6. **Quality Requirements:**
   - Do NOT use placeholder names like "Name180" or "Surname180"
   - Extract actual transliterated names from Bengali text
   - Verify all years are correctly converted from Bengali numerals
   - Ensure deceased status matches the image markers
   - Match the format exactly to previous successful extractions (57-86.csv, 87-117.csv, etc.)

---

## 📝 Example Usage

**You would paste this along with your image:**

```
Extract alumni data from the attached Bengali text image following the standard 
Bengali Alumni Data Extraction Instructions. Create 180-210.csv with all entries 
extracted and formatted correctly.
```

---

## 🔍 What I Will Do

When you provide this instruction template along with your Bengali image, I will:

1. ✅ Read the Bengali text from the image
2. ✅ Extract ALL entries with their serial numbers
3. ✅ Transliterate Bengali names to proper English
4. ✅ Parse names into First/Middle/Last name fields
5. ✅ Convert Bengali year numerals to English years
6. ✅ Identify deceased status from "(প্রয়াত)" markers
7. ✅ Extract professional titles (ডাঃ/Dr., অধ্যাঃ/Prof.)
8. ✅ Generate registration numbers in correct sequence
9. ✅ Generate email addresses in correct format
10. ✅ Create CSV file matching the exact format of previous files
11. ✅ Include all required fields with proper formatting

---

## 📚 Reference Files

- **Format Template:** `57-86.csv`, `87-117.csv`, `118-148.csv`, `149-179.csv`
- **Last Entry:** Check the last uploaded CSV to continue the sequence
- **Column Headers:** Use the extended template format

---

## ⚠️ Important Notes

1. **Continue Registration Sequence:** Check the last CSV file to know where to continue numbering
   - Example: If last file ended at 179 with `BGHSA-2025-00181`, new file starting at 180 should use `BGHSA-2025-00182`

2. **Name Accuracy:** 
   - Read Bengali text carefully
   - Use standard transliteration (not phonetic guesses)
   - Handle compound names correctly

3. **Year Conversion:** 
   - Bengali numerals: ০(0), ১(1), ২(2), ৩(3), ৪(4), ৫(5), ৬(6), ৭(7), ৮(8), ৯(9)
   - Convert accurately (e.g., ১৯৬৯ → 1969)

4. **Deceased Status:** 
   - Only mark as TRUE if "(প্রয়াত)" or "(প্রয়াত)" is present in the image
   - Double-check before marking

---

## ✅ Success Criteria

A successful extraction will have:
- ✅ All entries extracted (no placeholders)
- ✅ Names correctly transliterated from Bengali
- ✅ Years correctly converted from Bengali numerals  
- ✅ Deceased status accurately marked
- ✅ Registration numbers in correct sequence
- ✅ Email addresses in correct format
- ✅ CSV format matches previous files exactly
- ✅ Ready to upload via migration API





