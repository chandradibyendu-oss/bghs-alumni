# Bengali Alumni Image Extraction Tool

This is a generic, reusable tool for extracting alumni data from Bengali text images and converting them to CSV format following the standard `alumni-migration-template.csv` format.

## Features

- ✅ **Generic & Reusable**: Works with any Bengali alumni image
- ✅ **Standard Template Format**: Outputs CSV matching `alumni-migration-template.csv`
- ✅ **Batch Processing**: Process multiple images at once
- ✅ **Bengali & English OCR**: Automatic fallback support
- ✅ **Smart Parsing**: Detects names, years, titles, deceased status
- ✅ **Ready for Migration**: Generated CSV can be directly uploaded to `/admin/alumni-migration`

## Quick Start

### Single Image Processing

```bash
# Process a single image
python scripts/extract-bengali-alumni-generic.py image.jpg

# With custom output filename
python scripts/extract-bengali-alumni-generic.py image.jpg -o output.csv

# Debug mode (see extracted text)
python scripts/extract-bengali-alumni-generic.py image.jpg --debug

# English OCR only (if Bengali OCR fails)
python scripts/extract-bengali-alumni-generic.py image.jpg --no-bengali
```

### Batch Processing

```bash
# Process multiple images and combine into one CSV
python scripts/batch-extract-alumni.py images/*.jpg --combine -o combined.csv

# Process images separately (one CSV per image)
python scripts/batch-extract-alumni.py images/*.jpg --output-dir outputs/
```

## Installation Requirements

```bash
pip install opencv-python pytesseract pandas
```

**For Bengali OCR**, you may need to install Bengali language pack for Tesseract:
- **Windows**: Download from [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki)
- **Linux**: `sudo apt-get install tesseract-ocr-ben`
- **macOS**: `brew install tesseract-lang`

## Usage Workflow

### For Single Image (Most Common)

1. **Extract data from image:**
   ```bash
   python scripts/extract-bengali-alumni-generic.py your-image.jpg
   ```

2. **Review the generated CSV:**
   - File will be named: `your-image_alumni.csv`
   - Open in Excel or text editor to verify data

3. **Edit if needed:**
   - Fill in missing information
   - Correct any parsing errors
   - Verify email addresses

4. **Upload to system:**
   - Go to `/admin/alumni-migration`
   - Upload the CSV file

### For Multiple Images (Batch Processing)

1. **Place all images in a folder:**
   ```
   images/
     ├── image1.jpg
     ├── image2.jpg
     └── image3.jpg
   ```

2. **Process all at once:**
   ```bash
   python scripts/batch-extract-alumni.py images/*.jpg --combine -o all_alumni.csv
   ```

3. **Or process separately:**
   ```bash
   python scripts/batch-extract-alumni.py images/*.jpg --output-dir outputs/
   ```

## Output Format

The tool generates CSV files following the standard template format:

| Column | Description | Required |
|--------|-------------|----------|
| Email | Auto-generated placeholder email | Yes |
| Phone | (Empty - to be filled) | Optional |
| First Name | Extracted from image | Yes |
| Last Name | Extracted from image | Yes |
| Middle Name | Extracted if available | Optional |
| Last Class | Default: 12 | Yes |
| Year of Leaving | Extracted from image | Yes* |
| Batch Year | Same as Year of Leaving | Auto |
| Profession | "Doctor" if Dr. title detected | Optional |
| Notes | Contains: Title, Deceased status, Entry #, Missing year warnings | Optional |

*Note: If year is missing, it will be noted in the Notes column.

## Troubleshooting

### No text extracted

- Try `--no-bengali` flag for English OCR
- Check image quality (should be clear and readable)
- Use `--debug` to see what OCR extracted

### Incorrect parsing

- Review the extracted text with `--debug`
- Manually edit the CSV file to correct errors
- Some names may need manual correction

### Bengali OCR not working

- Install Bengali language pack for Tesseract
- Use `--no-bengali` flag as fallback
- Consider pre-processing images (enhance contrast, remove noise)

## Examples

### Example 1: Single Image

```bash
$ python scripts/extract-bengali-alumni-generic.py alumni-page-1.jpg

🖼️ Processing image: alumni-page-1.jpg
✅ Bengali OCR successful
📋 Parsing alumni records...
✅ Found 30 alumni records

✅ CSV file created: alumni-page-1_alumni.csv
📊 Total records: 30
📅 With Year: 27
❓ Missing Year: 3
🕯️ Deceased: 5
👨‍⚕️ Doctors: 3

🎉 Processing complete!
```

### Example 2: Batch Processing

```bash
$ python scripts/batch-extract-alumni.py images/*.jpg --combine -o all_alumni.csv

📋 Found 5 image(s) to process
============================================================
Processing: images/page1.jpg
============================================================
✅ Found 30 records
...
============================================================
Combining all records...
============================================================
✅ Combined CSV created: all_alumni.csv
📊 Total records from 5 image(s): 150
```

## Tips for Best Results

1. **Image Quality**: Use clear, high-resolution images
2. **Consistent Format**: Images with similar layouts work better
3. **Review Output**: Always review generated CSV before uploading
4. **Batch Size**: Process 100-200 records at a time for migration
5. **Verify Data**: Check email addresses, years, and names

## Next Steps

After generating CSV files:

1. **Review & Edit**: Open CSV in Excel, verify and correct data
2. **Fill Missing Info**: Add phone numbers, locations, etc. if available
3. **Validate**: Ensure all required fields are filled
4. **Upload**: Use `/admin/alumni-migration` to upload and migrate

## Support

For issues or questions:
- Check the `--debug` output for detailed information
- Review extracted text to understand parsing
- Manually edit CSV if needed (the tool is meant to assist, not replace manual review)


