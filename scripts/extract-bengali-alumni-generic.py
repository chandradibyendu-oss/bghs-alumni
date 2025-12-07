#!/usr/bin/env python3
"""
Generic Bengali Alumni Image Extractor
Extracts alumni data from Bengali text images and converts to CSV format
following the standard alumni-migration-template.csv format.

This tool is designed to be reusable for processing multiple images repeatedly.
Usage: python extract-bengali-alumni-generic.py <image_path> [--output <csv_file>]
"""

import cv2
import pytesseract
import pandas as pd
import re
import sys
import os
import argparse
from typing import List, Dict, Optional
from pathlib import Path

# Bengali numeral to English mapping
BENGALI_NUMERALS = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
}

# Bengali to English transliteration for common names (partial mapping)
BENGALI_TO_ENGLISH_COMMON = {
    'ডাঃ': 'Dr.', 'ডক্টর': 'Dr.',
    'প্রয়াত': 'Deceased', 'মৃত': 'Deceased',
    'কুমার': 'Kumar', 'চন্দ্র': 'Chandra',
    'প্রসাদ': 'Prasad',
}

def convert_bengali_year(bengali_year: str) -> str:
    """Convert Bengali numerals to English year"""
    if not bengali_year:
        return ''
    result = ''
    for char in bengali_year:
        if char in BENGALI_NUMERALS:
            result += BENGALI_NUMERALS[char]
        else:
            result += char
    return result.strip()

def extract_text_from_image(image_path: str, use_bengali: bool = True) -> str:
    """Extract text from image using OCR"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Try Bengali OCR first if requested
        if use_bengali:
            try:
                text = pytesseract.image_to_string(image, config='--oem 3 --psm 6 -l ben')
                if text.strip():
                    print("✅ Bengali OCR successful")
                    return text
            except Exception as e:
                print(f"⚠️ Bengali OCR failed: {e}")
                print("🔄 Falling back to English OCR...")
        
        # Fallback to English OCR
        text = pytesseract.image_to_string(image, config='--oem 3 --psm 6 -l eng')
        print("✅ English OCR successful")
        return text
        
    except Exception as e:
        print(f"❌ Error extracting text from image: {e}")
        return ""

def parse_alumni_from_text(text: str) -> List[Dict[str, str]]:
    """
    Parse extracted text to find alumni records.
    Looks for patterns like: number. Name (Year) or number. Name (Year) (প্রয়াত)
    """
    alumni_records = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Skip header lines or non-data lines
        if len(line) < 5:
            continue
        
        # Try to extract entry number, name, and year
        # Pattern: number. Name (Year) or number. Name (Year) (প্রয়াত)
        # Pattern: number. ডাঃ Name (Year)
        
        record = {
            'raw_text': line,
            'entry_number': '',
            'name': '',
            'year': '',
            'title': '',
            'deceased': False,
        }
        
        # Extract entry number (digits or Bengali numerals at start)
        # Match digits (English or Bengali) at the start, optionally followed by Bengali characters
        entry_match = re.match(r'^[\d০-৯]+[^\s]*?[।.]?\s*', line)
        if entry_match:
            entry_num = entry_match.group().strip('।. ')
            record['entry_number'] = convert_bengali_year(entry_num) if any(c in entry_num for c in '০১২৩৪৫৬৭৮৯') else entry_num
        
        # Check for deceased indicator (প্রয়াত)
        if 'প্রয়াত' in line or 'মৃত' in line:
            record['deceased'] = True
        
        # Check for title (ডাঃ, ডক্টর)
        if 'ডাঃ' in line or 'ডক্টর' in line:
            record['title'] = 'Dr.'
        
        # Extract year - look for 4-digit year in parentheses or Bengali numerals
        year_patterns = [
            r'\((\d{4})\)',  # English year in parentheses: (1969)
            r'\(([০-৯]{4})\)',  # Bengali year in parentheses
            r'([১৯|২০][০-৯]{2})',  # Bengali year pattern
        ]
        
        for pattern in year_patterns:
            year_match = re.search(pattern, line)
            if year_match:
                year_str = year_match.group(1)
                record['year'] = convert_bengali_year(year_str) if any(c in year_str for c in '০১২৩৪৫৬৭৮৯') else year_str
                break
        
        # Extract name - everything between entry number and year
        # Remove entry number, title, year, and deceased markers
        name_line = line
        if entry_match:
            name_line = name_line[entry_match.end():]
        
        # Remove title
        name_line = re.sub(r'ডাঃ\s*|ডক্টর\s*', '', name_line)
        
        # Remove year in parentheses
        name_line = re.sub(r'\([^)]+\)', '', name_line)
        
        # Remove deceased markers
        name_line = re.sub(r'প্রয়াত|মৃত', '', name_line)
        
        # Clean up name
        name_line = name_line.strip('।. ()-')
        record['name'] = name_line.strip()
        
        # Only add if we have a name
        if record['name'] and len(record['name']) > 2:
            alumni_records.append(record)
    
    return alumni_records

def parse_name(full_name: str, title: str = '') -> Dict[str, str]:
    """Parse full name into First, Middle, Last name components"""
    name = full_name.replace('Dr.', '').replace('ডাঃ', '').strip()
    parts = name.split()
    
    if len(parts) == 0:
        return {'first_name': '', 'middle_name': '', 'last_name': ''}
    elif len(parts) == 1:
        return {'first_name': parts[0], 'middle_name': '', 'last_name': ''}
    elif len(parts) == 2:
        return {'first_name': parts[0], 'middle_name': '', 'last_name': parts[1]}
    else:
        return {
            'first_name': parts[0],
            'middle_name': ' '.join(parts[1:-1]),
            'last_name': parts[-1]
        }

def generate_email(first_name: str, last_name: str, year: str = '') -> str:
    """Generate placeholder email address"""
    if not first_name or not last_name:
        return ''
    
    first_lower = re.sub(r'[^a-zA-Z]', '', first_name.lower())
    last_lower = re.sub(r'[^a-zA-Z]', '', last_name.lower())
    
    if year:
        return f"{first_lower}.{last_lower}.{year}@bghs-alumni.com"
    else:
        return f"{first_lower}.{last_lower}@bghs-alumni.com"

def create_csv_from_records(records: List[Dict[str, str]], output_path: str, template_path: Optional[str] = None):
    """Create CSV file following the standard template format"""
    
    # Standard template columns (matching alumni-migration-template.csv)
    columns = [
        'Email', 'Phone', 'First Name', 'Last Name', 'Middle Name',
        'Last Class', 'Year of Leaving', 'Start Class', 'Start Year', 'Batch Year',
        'Profession', 'Company', 'Location', 'Bio', 'LinkedIn URL',
        'Website URL', 'Role', 'Notes'
    ]
    
    csv_rows = []
    
    for record in records:
        # Parse name
        name_parts = parse_name(record['name'], record.get('title', ''))
        
        # Generate email
        email = generate_email(name_parts['first_name'], name_parts['last_name'], record.get('year', ''))
        
        # Build notes
        notes_parts = []
        if record.get('title'):
            notes_parts.append(f"Title: {record['title']}")
        if record.get('deceased'):
            notes_parts.append("Deceased (প্রয়াত)")
        if record.get('entry_number'):
            notes_parts.append(f"Entry #: {record['entry_number']}")
        if not record.get('year'):
            notes_parts.append("Year of Leaving: Not specified")
        
        notes = '; '.join(notes_parts) if notes_parts else ''
        
        # Profession
        profession = 'Doctor' if record.get('title') == 'Dr.' else ''
        
        # Batch Year = Year of Leaving
        batch_year = record.get('year', '')
        
        # Last Class - default to 12 if year is present
        last_class = '12' if record.get('year') else ''
        
        row = {
            'Email': email,
            'Phone': '',
            'First Name': name_parts['first_name'],
            'Last Name': name_parts['last_name'],
            'Middle Name': name_parts['middle_name'],
            'Last Class': last_class,
            'Year of Leaving': record.get('year', ''),
            'Start Class': '',
            'Start Year': '',
            'Batch Year': batch_year,
            'Profession': profession,
            'Company': '',
            'Location': '',
            'Bio': '',
            'LinkedIn URL': '',
            'Website URL': '',
            'Role': 'alumni_member',
            'Notes': notes
        }
        
        csv_rows.append(row)
    
    # Create DataFrame
    df = pd.DataFrame(csv_rows, columns=columns)
    
    # Save to CSV
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"\n✅ CSV file created: {output_path}")
    print(f"📊 Total records: {len(df)}")
    print(f"📅 With Year: {len(df[df['Year of Leaving'] != ''])}")
    print(f"❓ Missing Year: {len(df[df['Year of Leaving'] == ''])}")
    print(f"🕯️ Deceased: {len([r for r in records if r.get('deceased')])}")
    print(f"👨‍⚕️ Doctors: {len([r for r in records if r.get('title') == 'Dr.'])}")

def main():
    parser = argparse.ArgumentParser(
        description='Extract alumni data from Bengali images and convert to CSV',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process single image
  python extract-bengali-alumni-generic.py image.jpg
  
  # Process image with custom output
  python extract-bengali-alumni-generic.py image.jpg -o output.csv
  
  # Process without Bengali OCR (English only)
  python extract-bengali-alumni-generic.py image.jpg --no-bengali
  
  # Debug mode
  python extract-bengali-alumni-generic.py image.jpg --debug
        """
    )
    
    parser.add_argument('image_path', help='Path to the Bengali image file')
    parser.add_argument('-o', '--output', help='Output CSV file path (default: <image_name>_alumni.csv)')
    parser.add_argument('--no-bengali', action='store_true', help='Skip Bengali OCR, use English only')
    parser.add_argument('--debug', action='store_true', help='Show extracted text for debugging')
    parser.add_argument('--template', help='Path to template CSV file (for column reference)')
    
    args = parser.parse_args()
    
    # Validate image file
    if not os.path.exists(args.image_path):
        print(f"❌ Error: Image file not found: {args.image_path}")
        sys.exit(1)
    
    print(f"🖼️ Processing image: {args.image_path}")
    
    # Extract text
    text = extract_text_from_image(args.image_path, use_bengali=not args.no_bengali)
    
    if not text.strip():
        print("❌ No text extracted from image")
        sys.exit(1)
    
    if args.debug:
        print(f"\n{'='*60}")
        print("EXTRACTED TEXT:")
        print(f"{'='*60}")
        print(text)
        print(f"{'='*60}\n")
    
    # Parse alumni records
    print("📋 Parsing alumni records...")
    records = parse_alumni_from_text(text)
    
    if args.debug:
        print(f"\n{'='*60}")
        print("PARSED RECORDS:")
        print(f"{'='*60}")
        for i, record in enumerate(records[:5], 1):  # Show first 5
            print(f"{i}. Entry: {record.get('entry_number', 'N/A')}")
            print(f"   Name: {record.get('name', 'N/A')}")
            print(f"   Year: {record.get('year', 'N/A')}")
            print(f"   Title: {record.get('title', 'N/A')}")
            print(f"   Deceased: {record.get('deceased', False)}")
            print()
        if len(records) > 5:
            print(f"... and {len(records) - 5} more records")
        print(f"{'='*60}\n")
    
    if not records:
        print("⚠️ No alumni records found in extracted text")
        print("\n💡 Tips:")
        print("   - Try using --no-bengali flag for English OCR")
        print("   - Check if the image is clear and readable")
        print("   - Use --debug to see extracted text")
        sys.exit(1)
    
    print(f"✅ Found {len(records)} alumni records")
    
    # Determine output path
    if args.output:
        output_path = args.output
    else:
        base_name = Path(args.image_path).stem
        output_path = f"{base_name}_alumni.csv"
    
    # Create CSV
    create_csv_from_records(records, output_path, args.template)
    
    print(f"\n🎉 Processing complete!")
    print(f"📁 Output file: {output_path}")
    print(f"\n💡 Next steps:")
    print(f"   1. Review the CSV file: {output_path}")
    print(f"   2. Edit/verify the extracted data if needed")
    print(f"   3. Upload to /admin/alumni-migration")

if __name__ == "__main__":
    main()

