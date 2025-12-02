# Bengali Image Text Extraction System

This system extracts Bengali text from images and converts it to English transliteration for alumni migration.

## 🚀 Setup

### Prerequisites

1. **Python 3.7+** installed on your system
2. **Tesseract OCR** with Bengali language support
3. **Required Python packages** (see requirements.txt)

### Installation

#### Windows
```bash
# Run the setup script
scripts/setup-extractor.bat
```

#### Linux/macOS
```bash
# Make the script executable
chmod +x scripts/setup-extractor.sh

# Run the setup script
./scripts/setup-extractor.sh
```

### Manual Installation

If the setup scripts don't work, install manually:

```bash
# Install Python dependencies
pip3 install -r scripts/requirements.txt

# Install Tesseract OCR (Ubuntu/Debian)
sudo apt-get install tesseract-ocr tesseract-ocr-ben

# Install Tesseract OCR (macOS)
brew install tesseract tesseract-lang

# Install Tesseract OCR (Windows)
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

## 📖 Usage

### Command Line Usage

```bash
# Basic extraction
python3 scripts/bengali-image-extractor.py image.jpg

# With custom output file
python3 scripts/bengali-image-extractor.py image.jpg -o my_alumni.csv

# With debug output
python3 scripts/bengali-image-extractor.py image.jpg --debug
```

### Web Interface Usage

1. Navigate to `/admin/image-extraction` in your browser
2. Upload a Bengali image containing alumni information
3. Click "Extract Text" to process the image
4. Review the extracted text and parsed records
5. Download the CSV file for migration

## 🎯 Supported Features

### Bengali Text Recognition
- **OCR Support**: Uses Tesseract OCR with Bengali language pack
- **Text Preprocessing**: Image enhancement for better OCR results
- **Error Handling**: Robust error handling and fallback mechanisms

### Data Extraction
- **Title Recognition**: Dr., Prof., Shri, Smt., Mr., Ms., etc.
- **Name Parsing**: First name, middle name, last name extraction
- **Year Extraction**: Batch year, year of leaving, deceased year
- **Status Detection**: Living vs deceased alumni identification
- **Class Information**: Last class attended extraction

### Output Format
- **CSV Generation**: Standard CSV format compatible with migration system
- **English Transliteration**: Bengali names converted to English
- **Structured Data**: Proper column formatting for database import

## 📋 Input Image Requirements

### Image Quality
- **Resolution**: Minimum 300 DPI recommended
- **Format**: JPEG, PNG, GIF, BMP supported
- **Size**: Maximum 10MB file size
- **Clarity**: Clear, readable text without hovering

### Content Format
- **Bengali Text**: Images should contain Bengali text
- **Structured Layout**: Names, titles, and years in readable format
- **Two Columns**: Supports two-column layout common in alumni lists
- **Consistent Format**: Similar formatting across all entries

## 🔧 Troubleshooting

### Common Issues

1. **"No text extracted"**
   - Check image quality and resolution
   - Ensure text is clear and not blurry
   - Try different image preprocessing settings

2. **"Tesseract not found"**
   - Install Tesseract OCR
   - Install Bengali language pack
   - Check PATH environment variable

3. **"Python dependencies missing"**
   - Run setup script again
   - Install requirements manually: `pip3 install -r requirements.txt`

4. **"Poor OCR accuracy"**
   - Use higher resolution images
   - Ensure good contrast between text and background
   - Try different image formats

### Debug Mode

Use `--debug` flag to see detailed extraction process:

```bash
python3 scripts/bengali-image-extractor.py image.jpg --debug
```

This will show:
- Raw extracted text
- Parsed alumni records
- Processing steps
- Error details

## 📊 Output Format

The system generates CSV files with the following columns:

```
Email,Phone,Title Prefix,First Name,Middle Name,Last Name,Last Class,Year of Leaving,Start Class,Start Year,Batch Year,Profession,Company,Location,Bio,LinkedIn URL,Website URL,Role,Is Deceased,Deceased Year,Notes
```

### Example Output

```csv
Email,Phone,Title Prefix,First Name,Middle Name,Last Name,Last Class,Year of Leaving,Start Class,Start Year,Batch Year,Profession,Company,Location,Bio,LinkedIn URL,Website URL,Role,Is Deceased,Deceased Year,Notes
ajit.mitra@bghs-alumni.com,+919876540000,Dr.,Ajit,Kumar,Mitra,12,2005,,,2005,Alumni,Retired,Kolkata,BGHS Alumni,https://linkedin.com/in/ajitmitra,,alumni_member,false,,Verified alumni
```

## 🔄 Integration with Migration System

The extracted CSV files can be directly uploaded to the alumni migration system:

1. **Extract Text**: Use this system to extract Bengali text from images
2. **Review Data**: Check the extracted data for accuracy
3. **Download CSV**: Save the CSV file locally
4. **Upload to Migration**: Use the alumni migration page to upload the CSV
5. **Import to Database**: The migration system will create user accounts

## 📝 Notes

- **Accuracy**: OCR accuracy depends on image quality and text clarity
- **Manual Review**: Always review extracted data before importing
- **Language Support**: Currently optimized for Bengali text recognition
- **Batch Processing**: Can process multiple images in sequence
- **Error Handling**: Robust error handling for production use

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run in debug mode to see detailed output
3. Ensure all dependencies are properly installed
4. Verify image quality and format
5. Check system logs for error details





