#!/usr/bin/env python3
"""
Bengali Image Text Extractor for BGHS Alumni Migration
Extracts Bengali text from images and converts to English CSV format
"""

import cv2
import pytesseract
import pandas as pd
import numpy as np
import re
import sys
import os
from typing import List, Dict, Tuple
import argparse

# Bengali to English transliteration mapping
BENGALI_TO_ENGLISH = {
    # Common Bengali characters
    'অ': 'A', 'আ': 'Aa', 'ই': 'I', 'ঈ': 'Ii', 'উ': 'U', 'ঊ': 'Uu',
    'এ': 'E', 'ঐ': 'Ai', 'ও': 'O', 'ঔ': 'Au',
    'ক': 'K', 'খ': 'Kh', 'গ': 'G', 'ঘ': 'Gh', 'ঙ': 'Ng',
    'চ': 'Ch', 'ছ': 'Chh', 'জ': 'J', 'ঝ': 'Jh', 'ঞ': 'Ny',
    'ট': 'T', 'ঠ': 'Th', 'ড': 'D', 'ঢ': 'Dh', 'ণ': 'N',
    'ত': 'T', 'থ': 'Th', 'দ': 'D', 'ধ': 'Dh', 'ন': 'N',
    'প': 'P', 'ফ': 'Ph', 'ব': 'B', 'ভ': 'Bh', 'ম': 'M',
    'য': 'Y', 'র': 'R', 'ল': 'L', 'শ': 'Sh', 'ষ': 'Sh',
    'স': 'S', 'হ': 'H', 'ড়': 'R', 'ঢ়': 'Rh',
    
    # Common Bengali names and titles
    'ডক্টর': 'Dr.', 'ডা': 'Dr.', 'প্রফেসর': 'Prof.', 'প্রফ': 'Prof.',
    'অধ্যাপক': 'Prof.', 'শ্রী': 'Shri', 'শ্রীমতি': 'Smt.', 'শ্রীমতী': 'Smt.',
    'মিস্টার': 'Mr.', 'মিস': 'Ms.', 'কুমার': 'Kumar', 'চন্দ্র': 'Chandra',
    'প্রসাদ': 'Prasad', 'কান্ত': 'Kanta', 'শঙ্কর': 'Shankar',
    
    # Common Bengali surnames
    'চট্টোপাধ্যায়': 'Chattopadhyay', 'মুখোপাধ্যায়': 'Mukherjee',
    'বন্দ্যোপাধ্যায়': 'Bandyopadhyay', 'ভট্টাচার্য': 'Bhattacharya',
    'চক্রবর্তী': 'Chakraborty', 'গাঙ্গুলী': 'Ganguly',
    'রায়': 'Roy', 'সেন': 'Sen', 'ঘোষ': 'Ghosh', 'দাস': 'Das',
    'বসু': 'Basu', 'মজুমদার': 'Mazumdar', 'সিংহ': 'Singh',
    'মিত্র': 'Mitra', 'গুপ্ত': 'Gupta', 'সরকার': 'Sarkar',
    
    # Numbers
    '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5',
    '৬': '6', '৭': '7', '৮': '8', '৯': '9', '০': '0',
    
    # Common words
    'মৃত': 'Deceased', 'মারা': 'Deceased', 'মৃতু': 'Deceased',
    'বছর': 'Year', 'শ্রেণী': 'Class', 'পাস': 'Pass', 'পাস আউট': 'Pass Out'
}

# Professional titles mapping
TITLE_MAPPING = {
    'ডক্টর': 'Dr.', 'ডা': 'Dr.', 'প্রফেসর': 'Prof.', 'প্রফ': 'Prof.',
    'অধ্যাপক': 'Prof.', 'শ্রী': 'Shri', 'শ্রীমতি': 'Smt.', 'শ্রীমতী': 'Smt.',
    'মিস্টার': 'Mr.', 'মিস': 'Ms.'
}

def transliterate_bengali_to_english(text: str) -> str:
    """Convert Bengali text to English transliteration"""
    result = ""
    for char in text:
        if char in BENGALI_TO_ENGLISH:
            result += BENGALI_TO_ENGLISH[char]
        else:
            result += char
    return result.strip()

def extract_text_from_image(image_path: str) -> str:
    """Extract text from image using OCR"""
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Preprocess image for better OCR
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Apply denoising
        denoised = cv2.fastNlMeansDenoising(thresh)
        
        # Try Bengali first, fallback to English if not available
        try:
            custom_config = r'--oem 3 --psm 6 -l ben'
            text = pytesseract.image_to_string(denoised, config=custom_config)
        except Exception as e:
            print(f"Bengali OCR failed, falling back to English: {e}")
            custom_config = r'--oem 3 --psm 6 -l eng'
            text = pytesseract.image_to_string(denoised, config=custom_config)
        
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return ""

def parse_alumni_data(text: str) -> List[Dict[str, str]]:
    """Parse extracted text to extract alumni information"""
    alumni_records = []
    
    # Split text into lines
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Skip header lines
        if any(keyword in line.lower() for keyword in ['নাম', 'name', 'শ্রেণী', 'class', 'বছর', 'year']):
            continue
            
        # Extract information from each line
        record = parse_alumni_line(line)
        if record:
            alumni_records.append(record)
    
    return alumni_records

def parse_alumni_line(line: str) -> Dict[str, str]:
    """Parse a single line to extract alumni information"""
    # Initialize record with default values
    record = {
        'title_prefix': '',
        'first_name': '',
        'middle_name': '',
        'last_name': '',
        'last_class': '',
        'year_of_leaving': '',
        'is_deceased': 'false',
        'deceased_year': ''
    }
    
    # Check for deceased status
    if any(keyword in line for keyword in ['মৃত', 'মারা', 'মৃতু']):
        record['is_deceased'] = 'true'
        # Try to extract deceased year
        year_match = re.search(r'(\d{4})', line)
        if year_match:
            record['deceased_year'] = year_match.group(1)
    
    # Extract year of leaving
    year_match = re.search(r'(\d{4})', line)
    if year_match:
        record['year_of_leaving'] = year_match.group(1)
    
    # Extract class information
    class_match = re.search(r'(\d{1,2})', line)
    if class_match:
        record['last_class'] = class_match.group(1)
    
    # Extract title prefix
    for bengali_title, english_title in TITLE_MAPPING.items():
        if bengali_title in line:
            record['title_prefix'] = english_title
            break
    
    # Extract name parts
    # Remove title, year, class, and deceased status from line
    clean_line = line
    for bengali_title in TITLE_MAPPING.keys():
        clean_line = clean_line.replace(bengali_title, '')
    clean_line = re.sub(r'\d{4}', '', clean_line)  # Remove years
    clean_line = re.sub(r'\d{1,2}', '', clean_line)  # Remove class numbers
    clean_line = re.sub(r'মৃত|মারা|মৃতু', '', clean_line)  # Remove deceased keywords
    clean_line = clean_line.strip()
    
    # Split name into parts
    name_parts = clean_line.split()
    if len(name_parts) >= 2:
        record['first_name'] = name_parts[0]
        record['last_name'] = name_parts[-1]
        if len(name_parts) > 2:
            record['middle_name'] = ' '.join(name_parts[1:-1])
    
    return record

def get_company_field(title_prefix: str, is_deceased: bool) -> str:
    """Determine appropriate company field based on title and status"""
    if is_deceased:
        return "Deceased"  # More appropriate than "Retired" for deceased members
    
    if title_prefix in ["Dr.", "Prof."]:
        # Medical or academic professionals
        if title_prefix == "Dr.":
            return "Medical Practice"  # Default for doctors
        else:
            return "Academic Institution"  # Default for professors
    
    # For other cases, leave empty to be filled later
    return ""

def generate_csv(alumni_records: List[Dict[str, str]], output_path: str):
    """Generate CSV file from alumni records"""
    # Create DataFrame with proper column order
    df = pd.DataFrame(alumni_records)
    
    # Add missing columns with default values
    required_columns = [
        'Email', 'Phone', 'Title Prefix', 'First Name', 'Middle Name', 'Last Name',
        'Last Class', 'Year of Leaving', 'Start Class', 'Start Year', 'Batch Year',
        'Profession', 'Company', 'Location', 'Bio', 'LinkedIn URL', 'Website URL',
        'Role', 'Is Deceased', 'Deceased Year', 'Notes'
    ]
    
    for col in required_columns:
        if col not in df.columns:
            df[col] = ''
    
    # Set default values
    df['Role'] = 'alumni_member'
    df['Profession'] = 'Alumni'
    df['Location'] = 'Kolkata'
    df['Bio'] = 'BGHS Alumni'
    
    # Apply improved company field logic
    for idx, row in df.iterrows():
        title_prefix = row.get('Title Prefix', '')
        is_deceased = row.get('Is Deceased', '').lower() in ['true', '1', 'yes', 'মৃত', 'মারা', 'মৃতু']
        df.at[idx, 'Company'] = get_company_field(title_prefix, is_deceased)
    
    # Generate email addresses
    for idx, row in df.iterrows():
        if not row['Email']:
            first_name = row['First Name'].lower() if row['First Name'] else 'alumni'
            last_name = row['Last Name'].lower() if row['Last Name'] else 'member'
            df.at[idx, 'Email'] = f"{first_name}.{last_name}@bghs-alumni.com"
    
    # Reorder columns
    df = df[required_columns]
    
    # Save to CSV
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"CSV file saved to: {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Extract Bengali text from alumni images and convert to CSV')
    parser.add_argument('image_path', help='Path to the Bengali image file')
    parser.add_argument('-o', '--output', help='Output CSV file path', default='extracted_alumni.csv')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.image_path):
        print(f"Error: Image file not found: {args.image_path}")
        sys.exit(1)
    
    print(f"Processing image: {args.image_path}")
    
    # Extract text from image
    extracted_text = extract_text_from_image(args.image_path)
    
    if args.debug:
        print("Extracted text:")
        print(extracted_text)
        print("\n" + "="*50 + "\n")
    
    if not extracted_text:
        print("No text extracted from image")
        sys.exit(1)
    
    # Parse alumni data
    alumni_records = parse_alumni_data(extracted_text)
    
    if args.debug:
        print("Parsed alumni records:")
        for record in alumni_records:
            print(record)
        print("\n" + "="*50 + "\n")
    
    if not alumni_records:
        print("No alumni records found in the extracted text")
        sys.exit(1)
    
    # Generate CSV
    generate_csv(alumni_records, args.output)
    
    print(f"Successfully processed {len(alumni_records)} alumni records")

if __name__ == "__main__":
    main()
