#!/usr/bin/env python3
"""
Test script for Bengali Image Text Extraction
"""

import cv2
import pytesseract
import pandas as pd
import numpy as np
import re
import sys
import os
from typing import List, Dict, Tuple

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
    'ডক্টর': 'Dr.', 'ডাঃ': 'Dr.', 'প্রফেসর': 'Prof.', 'প্রফ': 'Prof.',
    'অধ্যাপক': 'Prof.', 'অধ্যাঃ': 'Prof.', 'শ্রী': 'Shri', 'শ্রীমতি': 'Smt.',
    'মিস্টার': 'Mr.', 'মিস': 'Ms.', 'কুমার': 'Kumar', 'চন্দ্র': 'Chandra',
    'প্রসাদ': 'Prasad', 'কান্ত': 'Kanta', 'শঙ্কর': 'Shankar',
    
    # Common Bengali surnames
    'চট্টোপাধ্যায়': 'Chattopadhyay', 'মুখোপাধ্যায়': 'Mukherjee',
    'বন্দ্যোপাধ্যায়': 'Bandyopadhyay', 'ভট্টাচার্য': 'Bhattacharya',
    'চক্রবর্তী': 'Chakraborty', 'গাঙ্গুলী': 'Ganguly',
    'রায়': 'Roy', 'সেন': 'Sen', 'ঘোষ': 'Ghosh', 'দাস': 'Das',
    'বসু': 'Basu', 'মজুমদার': 'Mazumdar', 'সিংহ': 'Singh',
    'মিত্র': 'Mitra', 'গুপ্ত': 'Gupta', 'সরকার': 'Sarkar',
    'সমাদ্দার': 'Samaddar', 'মাশ্চটক': 'Mashtak',
    
    # Numbers
    '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5',
    '৬': '6', '৭': '7', '৮': '8', '৯': '9', '০': '0',
    
    # Common words
    'মৃত': 'Deceased', 'প্রয়াত': 'Deceased', 'মারা': 'Deceased',
    'বছর': 'Year', 'শ্রেণী': 'Class', 'পাস': 'Pass'
}

# Professional titles mapping
TITLE_MAPPING = {
    'ডক্টর': 'Dr.', 'ডাঃ': 'Dr.', 'প্রফেসর': 'Prof.', 'প্রফ': 'Prof.',
    'অধ্যাপক': 'Prof.', 'অধ্যাঃ': 'Prof.', 'শ্রী': 'Shri', 'শ্রীমতি': 'Smt.',
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
        
        print(f"Image loaded successfully. Shape: {image.shape}")
        
        # Preprocess image for better OCR
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Apply denoising
        denoised = cv2.fastNlMeansDenoising(thresh)
        
        # Use pytesseract with Bengali language support
        # Note: You need to install Bengali language pack for tesseract
        custom_config = r'--oem 3 --psm 6 -l ben'
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
    print(f"Parsing line: {line}")
    
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
    if any(keyword in line for keyword in ['মৃত', 'প্রয়াত', 'মারা']):
        record['is_deceased'] = 'true'
        print(f"  -> Deceased status detected")
    
    # Extract year of leaving (4-digit year in parentheses)
    year_match = re.search(r'\((\d{4})\)', line)
    if year_match:
        record['year_of_leaving'] = year_match.group(1)
        print(f"  -> Year found: {record['year_of_leaving']}")
    
    # Extract title prefix
    for bengali_title, english_title in TITLE_MAPPING.items():
        if bengali_title in line:
            record['title_prefix'] = english_title
            print(f"  -> Title found: {english_title}")
            break
    
    # Extract name parts
    # Remove title, year, class, and deceased status from line
    clean_line = line
    
    # Remove numbering (e.g., "১।", "২৮ ক।")
    clean_line = re.sub(r'^\d+[ক-হ]?।\s*', '', clean_line)
    
    # Remove title prefixes
    for bengali_title in TITLE_MAPPING.keys():
        clean_line = clean_line.replace(bengali_title, '')
    
    # Remove years in parentheses
    clean_line = re.sub(r'\(\d{4}\)', '', clean_line)
    
    # Remove deceased keywords
    clean_line = re.sub(r'মৃত|প্রয়াত|মারা', '', clean_line)
    
    # Remove parentheses
    clean_line = clean_line.replace('(', '').replace(')', '')
    
    clean_line = clean_line.strip()
    print(f"  -> Cleaned line: {clean_line}")
    
    # Split name into parts
    name_parts = clean_line.split()
    if len(name_parts) >= 2:
        record['first_name'] = transliterate_bengali_to_english(name_parts[0])
        record['last_name'] = transliterate_bengali_to_english(name_parts[-1])
        if len(name_parts) > 2:
            record['middle_name'] = ' '.join([transliterate_bengali_to_english(part) for part in name_parts[1:-1]])
        
        print(f"  -> Name: {record['first_name']} {record['middle_name']} {record['last_name']}")
    
    return record

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
    df['Company'] = 'Retired'
    df['Location'] = 'Kolkata'
    df['Bio'] = 'BGHS Alumni'
    
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
    print(f"Total records: {len(df)}")

def main():
    # Test with the uploaded image
    image_path = "bengali_alumni_image.jpg"  # You'll need to save the image with this name
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        print("Please save the uploaded image as 'bengali_alumni_image.jpg' in the current directory")
        return
    
    print(f"Processing image: {image_path}")
    
    # Extract text from image
    extracted_text = extract_text_from_image(image_path)
    
    print("Extracted text:")
    print(extracted_text)
    print("\n" + "="*50 + "\n")
    
    if not extracted_text:
        print("No text extracted from image")
        return
    
    # Parse alumni data
    alumni_records = parse_alumni_data(extracted_text)
    
    print("Parsed alumni records:")
    for i, record in enumerate(alumni_records, 1):
        print(f"{i}. {record}")
    print("\n" + "="*50 + "\n")
    
    if not alumni_records:
        print("No alumni records found in the extracted text")
        return
    
    # Generate CSV
    output_path = "extracted_alumni_test.csv"
    generate_csv(alumni_records, output_path)
    
    print(f"Successfully processed {len(alumni_records)} alumni records")

if __name__ == "__main__":
    main()





