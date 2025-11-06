#!/usr/bin/env python3
"""
Real BGHS Alumni Data Extraction Tool
Actually extracts data from the image OCR text
"""

import cv2
import pytesseract
import pandas as pd
import sys
import os
import argparse
import re

def extract_text_from_image(image_path: str) -> str:
    """Extract text from image using English OCR"""
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Use English OCR (no Bengali language pack needed)
        text = pytesseract.image_to_string(image, config='--oem 3 --psm 6 -l eng')
        return text
        
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return ""

def parse_ocr_text_to_alumni_data(ocr_text: str) -> list:
    """Parse OCR text to extract alumni data"""
    
    print(f"🔍 Parsing OCR text...")
    print(f"OCR Text length: {len(ocr_text)} characters")
    
    # Split into lines
    lines = ocr_text.split('\n')
    alumni_records = []
    
    # Look for patterns in the OCR text
    for line_num, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        print(f"Line {line_num + 1}: {line}")
        
        # Try to extract registration numbers and names
        # Look for patterns like "57)", "58)", etc.
        reg_match = re.search(r'(\d+[A]?)\)', line)
        if reg_match:
            reg_no = reg_match.group(1)
            print(f"  Found registration number: {reg_no}")
            
            # Extract the rest of the line after the registration number
            remaining = line[reg_match.end():].strip()
            print(f"  Remaining text: {remaining}")
            
            # Try to extract year (4 digits)
            year_match = re.search(r'(\d{4})', remaining)
            year = year_match.group(1) if year_match else ""
            
            # Try to extract name (everything before the year)
            name_text = remaining
            if year_match:
                name_text = remaining[:year_match.start()].strip()
            
            # Clean up the name
            name = name_text.replace('(', '').replace(')', '').strip()
            
            print(f"  Extracted - Reg: {reg_no}, Name: {name}, Year: {year}")
            
            # Determine if deceased (look for common deceased indicators)
            is_deceased = any(indicator in line.lower() for indicator in ['deceased', 'মৃত', 'dead', 'passed'])
            
            # Determine title
            title = ""
            if 'dr.' in line.lower() or 'doctor' in line.lower():
                title = "Dr."
            elif 'prof.' in line.lower() or 'professor' in line.lower():
                title = "Prof."
            
            alumni_records.append({
                'old_reg_no': reg_no,
                'title': title,
                'name': name,
                'year': year,
                'deceased': is_deceased,
                'raw_line': line
            })
    
    print(f"📊 Extracted {len(alumni_records)} alumni records")
    return alumni_records

def create_csv_from_extracted_data(alumni_records: list, output_path: str):
    """Create CSV from extracted alumni data"""
    
    if not alumni_records:
        print("❌ No alumni records extracted from image")
        return
    
    def convert_registration_number(old_reg_no):
        """Convert old registration number to new format BGHSA-2025-XXXXX"""
        try:
            # Handle special case like "72A"
            if "A" in old_reg_no:
                old_reg_no = old_reg_no.replace("A", "")
            
            # Convert to integer and format with leading zeros (5 digits)
            reg_num = int(old_reg_no)
            new_reg_no = f"BGHSA-2025-{reg_num:05d}"
            return new_reg_no
        except:
            # Fallback for any parsing issues
            return f"BGHSA-2025-{old_reg_no.zfill(5)}"
    
    def get_company_field(title, deceased):
        """Determine appropriate company field based on title and status"""
        if deceased:
            return "Deceased"
        
        if title in ["Dr.", "Prof."]:
            if title == "Dr.":
                return "Medical Practice"
            else:
                return "Academic Institution"
        
        return ""
    
    # Convert to CSV format
    csv_records = []
    
    for entry in alumni_records:
        # Parse name into parts
        name_parts = entry["name"].split()
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        middle_name = " ".join(name_parts[1:-1]) if len(name_parts) > 2 else ""
        
        # Generate email
        email = f"{first_name.lower()}.{last_name.lower()}@bghs-alumni.com" if first_name and last_name else "alumni.member@bghs-alumni.com"
        
        # Convert registration number
        new_reg_no = convert_registration_number(entry["old_reg_no"])
        
        # Determine company field
        company = get_company_field(entry["title"], entry["deceased"])
        
        # Create record
        record = {
            'Old Registration Number': entry["old_reg_no"],
            'Registration Number': new_reg_no,
            'Email': email,
            'Phone': '',
            'Title Prefix': entry["title"],
            'First Name': first_name,
            'Middle Name': middle_name,
            'Last Name': last_name,
            'Last Class': '12',
            'Year of Leaving': entry["year"],
            'Start Class': '',
            'Start Year': '',
            'Batch Year': entry["year"],
            'Profession': 'Alumni',
            'Company': company,
            'Location': 'Kolkata',
            'Bio': 'BGHS Alumni',
            'LinkedIn URL': '',
            'Website URL': '',
            'Role': 'alumni_member',
            'Is Deceased': 'true' if entry["deceased"] else 'false',
            'Deceased Year': '',
            'Notes': f'Extracted from image - {entry["raw_line"][:50]}...'
        }
        
        csv_records.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(csv_records)
    
    # Save to CSV
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"✅ CSV file created: {output_path}")
    print(f"📊 Total records: {len(df)}")
    print(f"🕯️ Deceased records: {len(df[df['Is Deceased'] == 'true'])}")
    print(f"👥 Living records: {len(df[df['Is Deceased'] == 'false'])}")
    print(f"👨‍⚕️ Medical professionals: {len(df[df['Company'] == 'Medical Practice'])}")
    print(f"👨‍🏫 Academic professionals: {len(df[df['Company'] == 'Academic Institution'])}")

def main():
    parser = argparse.ArgumentParser(description='Extract alumni data from images and convert to CSV')
    parser.add_argument('image_path', help='Path to the image file')
    parser.add_argument('-o', '--output', help='Output CSV file path')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.debug:
        print(f"🔍 Debug mode enabled")
        print(f"📁 Image path: {args.image_path}")
        print(f"📄 Output path: {args.output}")
    
    # Extract text from image
    print(f"📸 Extracting text from image: {args.image_path}")
    ocr_text = extract_text_from_image(args.image_path)
    
    if not ocr_text.strip():
        print("❌ No text extracted from image")
        return
    
    print(f"📝 Extracted text:\n{ocr_text}\n")
    print("=" * 50)
    
    # Parse OCR text to extract alumni data
    alumni_records = parse_ocr_text_to_alumni_data(ocr_text)
    
    # Create CSV from extracted data
    if args.output:
        create_csv_from_extracted_data(alumni_records, args.output)
    else:
        # Default output filename
        base_name = os.path.splitext(args.image_path)[0]
        output_path = f"{base_name}_extracted.csv"
        create_csv_from_extracted_data(alumni_records, output_path)

if __name__ == "__main__":
    main()


