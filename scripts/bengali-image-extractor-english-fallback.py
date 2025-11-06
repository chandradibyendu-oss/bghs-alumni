#!/usr/bin/env python3
"""
Bengali Image Text Extractor - English OCR Fallback
Extracts text from images using English OCR when Bengali is not available
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

def extract_text_from_image(image_path: str) -> str:
    """Extract text from image using OCR"""
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Try Bengali first, fallback to English
        try:
            # Try Bengali OCR
            text = pytesseract.image_to_string(image, config='--oem 3 --psm 6 -l ben')
            if text.strip():
                print("✅ Bengali OCR successful")
                return text
        except Exception as e:
            print(f"⚠️ Bengali OCR failed: {e}")
        
        # Fallback to English OCR
        print("🔄 Trying English OCR as fallback...")
        text = pytesseract.image_to_string(image, config='--oem 3 --psm 6 -l eng')
        print("✅ English OCR successful")
        return text
        
    except Exception as e:
        print(f"❌ Error extracting text from image: {e}")
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
            
        # Look for patterns that might indicate alumni data
        # This is a simplified parser for English text
        if re.search(r'\d+', line):  # Contains numbers
            # Extract potential data
            record = {
                'old_reg_no': '',
                'title_prefix': '',
                'first_name': '',
                'middle_name': '',
                'last_name': '',
                'last_class': '12',
                'year_of_leaving': '',
                'is_deceased': 'false',
                'deceased_year': ''
            }
            
            # Try to extract year
            year_match = re.search(r'\b(19|20)\d{2}\b', line)
            if year_match:
                record['year_of_leaving'] = year_match.group()
            
            # Check for deceased indicators
            if any(keyword in line.lower() for keyword in ['deceased', 'passed', 'died', 'dead']):
                record['is_deceased'] = 'true'
            
            # Check for titles
            if 'dr.' in line.lower() or 'doctor' in line.lower():
                record['title_prefix'] = 'Dr.'
            elif 'prof.' in line.lower() or 'professor' in line.lower():
                record['title_prefix'] = 'Prof.'
            
            # Extract name (simplified)
            name_parts = re.findall(r'[A-Za-z]+', line)
            if len(name_parts) >= 2:
                record['first_name'] = name_parts[0]
                record['last_name'] = name_parts[-1]
                if len(name_parts) > 2:
                    record['middle_name'] = ' '.join(name_parts[1:-1])
            
            alumni_records.append(record)
    
    return alumni_records

def get_company_field(title_prefix: str, is_deceased: bool) -> str:
    """Determine appropriate company field based on title and status"""
    if is_deceased:
        return "Deceased"
    
    if title_prefix in ["Dr.", "Prof."]:
        if title_prefix == "Dr.":
            return "Medical Practice"
        else:
            return "Academic Institution"
    
    return ""

def generate_csv(alumni_records: List[Dict[str, str]], output_path: str):
    """Generate CSV file from alumni records"""
    if not alumni_records:
        print("⚠️ No alumni records found. Creating sample template...")
        # Create sample data
        alumni_records = [
            {
                'old_reg_no': '1',
                'title_prefix': '',
                'first_name': 'Sample',
                'middle_name': '',
                'last_name': 'Alumni',
                'last_class': '12',
                'year_of_leaving': '2000',
                'is_deceased': 'false',
                'deceased_year': ''
            }
        ]
    
    # Create DataFrame
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
        title_prefix = row.get('title_prefix', '')
        is_deceased = row.get('is_deceased', '').lower() in ['true', '1', 'yes']
        df.at[idx, 'Company'] = get_company_field(title_prefix, is_deceased)
    
    # Generate email addresses
    for idx, row in df.iterrows():
        if not row['Email']:
            first_name = row['First Name'].lower() if row['First Name'] else 'alumni'
            last_name = row['Last Name'].lower() if row['Last Name'] else 'member'
            df.at[idx, 'Email'] = f"{first_name}.{last_name}@bghs-alumni.com"
    
    # Generate registration numbers
    for idx, row in df.iterrows():
        old_reg_no = row.get('old_reg_no', str(idx + 1))
        df.at[idx, 'Registration Number'] = f"BGHSA-2025-{int(old_reg_no):05d}"
    
    # Reorder columns
    column_order = [
        'Old Registration Number', 'Registration Number', 'Email', 'Phone',
        'Title Prefix', 'First Name', 'Middle Name', 'Last Name',
        'Last Class', 'Year of Leaving', 'Start Class', 'Start Year',
        'Batch Year', 'Profession', 'Company', 'Location', 'Bio',
        'LinkedIn URL', 'Website URL', 'Role', 'Is Deceased',
        'Deceased Year', 'Notes'
    ]
    
    df = df.reindex(columns=column_order)
    
    # Save to CSV
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"✅ CSV file saved: {output_path}")
    print(f"📊 Total records: {len(df)}")

def main():
    parser = argparse.ArgumentParser(description='Extract Bengali text from alumni images and convert to CSV')
    parser.add_argument('image_path', help='Path to the Bengali image file')
    parser.add_argument('-o', '--output', help='Output CSV file path')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.debug:
        print(f"🔍 Debug mode enabled")
        print(f"📁 Image path: {args.image_path}")
        print(f"📄 Output path: {args.output}")
    
    # Extract text from image
    print(f"🖼️ Processing image: {args.image_path}")
    text = extract_text_from_image(args.image_path)
    
    if args.debug:
        print(f"📝 Extracted text:\n{text}\n")
        print("=" * 50)
    
    if not text.strip():
        print("❌ No text extracted from image")
        return
    
    # Parse alumni data
    alumni_records = parse_alumni_data(text)
    print(f"📋 Found {len(alumni_records)} potential alumni records")
    
    # Generate CSV
    if args.output:
        generate_csv(alumni_records, args.output)
    else:
        # Default output filename
        base_name = os.path.splitext(args.image_path)[0]
        output_path = f"{base_name}_extracted.csv"
        generate_csv(alumni_records, output_path)

if __name__ == "__main__":
    main()


