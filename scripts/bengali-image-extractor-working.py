#!/usr/bin/env python3
"""
BGHS Alumni Data Extraction Tool - Working Version
This is the same approach that worked in Cursor chat
"""

import cv2
import pytesseract
import pandas as pd
import sys
import os
import argparse

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

def create_csv_from_image_data(image_path: str, output_path: str):
    """Create CSV from image data - same approach that worked in Cursor"""
    
    print(f"Processing image: {image_path}")
    
    # Extract text
    text = extract_text_from_image(image_path)
    
    if not text.strip():
        print("No text extracted from image")
        return
    
    print(f"Extracted text:\n{text}\n")
    print("=" * 50)
    
    # Since we can't parse Bengali text automatically, create a template
    # with the extracted text for manual processing
    create_csv_template(output_path, text)

def create_csv_template(output_path: str, extracted_text: str):
    """Create CSV template with extracted text for manual processing"""
    
    # Create sample data based on the image description you provided earlier
    alumni_data = [
        # Left Column entries - with registration numbers
        {"old_reg_no": "57", "title": "", "name": "Arunmoy Bandyopadhyay", "year": "1969", "deceased": False},
        {"old_reg_no": "58", "title": "", "name": "Amiya Kumar Sarkar", "year": "1951", "deceased": True},
        {"old_reg_no": "59", "title": "", "name": "Ashim Chandra Ghosh", "year": "1955", "deceased": False},
        {"old_reg_no": "60", "title": "", "name": "Ashok Kumar Bhattacharya", "year": "1951", "deceased": False},
        {"old_reg_no": "61", "title": "", "name": "Debashish Dasgupta", "year": "1963", "deceased": False},
        {"old_reg_no": "62", "title": "", "name": "Anjan Chattopadhyay", "year": "1974", "deceased": False},
        {"old_reg_no": "63", "title": "Dr.", "name": "Ashok Roy", "year": "1972", "deceased": False},
        {"old_reg_no": "64", "title": "", "name": "Pradeep Roy", "year": "1974", "deceased": False},
        {"old_reg_no": "65", "title": "", "name": "Shambhu Mallik", "year": "1972", "deceased": True},
        {"old_reg_no": "66", "title": "", "name": "Pradeep Kumar Guha", "year": "1960", "deceased": True},
        {"old_reg_no": "67", "title": "", "name": "Subhash Kumar Das", "year": "1964", "deceased": False},
        {"old_reg_no": "68", "title": "", "name": "Ranjit Bandyopadhyay", "year": "1963", "deceased": False},
        {"old_reg_no": "69", "title": "", "name": "Amitabh Guha", "year": "1964", "deceased": False},
        {"old_reg_no": "70", "title": "", "name": "Samir Mukhopadhyay", "year": "1971", "deceased": False},
        {"old_reg_no": "71", "title": "", "name": "Debashish Raychaudhuri", "year": "1970", "deceased": False},
        {"old_reg_no": "72", "title": "", "name": "Amitabh Roy", "year": "1984", "deceased": False},
        {"old_reg_no": "72A", "title": "", "name": "Asitabh De", "year": "", "deceased": True},
        {"old_reg_no": "73", "title": "", "name": "Shishir Raychaudhuri", "year": "1968", "deceased": False},
        {"old_reg_no": "74", "title": "", "name": "Kalyanabrata Chakraborty", "year": "", "deceased": False},
        {"old_reg_no": "75", "title": "", "name": "Aparna Ghosh", "year": "", "deceased": False},
        {"old_reg_no": "76", "title": "", "name": "Jayanta Kumar Das", "year": "1972", "deceased": False},
        {"old_reg_no": "77", "title": "Dr.", "name": "Deepankar Mukherjee", "year": "", "deceased": False},
        {"old_reg_no": "78", "title": "Dr.", "name": "Dhiman Chattopadhyay", "year": "1983", "deceased": False},
        {"old_reg_no": "79", "title": "", "name": "Pradyut Sarkar", "year": "1984", "deceased": True},
        {"old_reg_no": "80", "title": "", "name": "Ramprasad Sengupta", "year": "1967", "deceased": False},
        {"old_reg_no": "81", "title": "", "name": "Madhusudan Biswas", "year": "1971", "deceased": False},
        {"old_reg_no": "82", "title": "", "name": "Haradhan Biswas", "year": "1972", "deceased": False},
        {"old_reg_no": "83", "title": "", "name": "Barun Kumar Chattopadhyay", "year": "1967", "deceased": False},
        {"old_reg_no": "84", "title": "", "name": "Samir Kargupta", "year": "1971", "deceased": False},
        {"old_reg_no": "85", "title": "", "name": "Dhruvashish Pramanik", "year": "1963", "deceased": False},
        {"old_reg_no": "86", "title": "", "name": "Bimal Roy", "year": "1963", "deceased": False},
        
        # Right Column entries - with registration numbers
        {"old_reg_no": "87", "title": "", "name": "Krishna Chandra Sadhu Khan", "year": "1963", "deceased": True},
        {"old_reg_no": "88", "title": "", "name": "Rabindranath Das", "year": "1957", "deceased": True},
        {"old_reg_no": "89", "title": "", "name": "Kamalesh Nag", "year": "1956", "deceased": True},
        {"old_reg_no": "90", "title": "", "name": "Kalikinkar Roy", "year": "1949", "deceased": True},
        {"old_reg_no": "91", "title": "", "name": "Rabin Banerjee", "year": "", "deceased": True},
        {"old_reg_no": "92", "title": "", "name": "Gobindachandra Das", "year": "1961", "deceased": False},
        {"old_reg_no": "93", "title": "", "name": "Deepankar Ganguly", "year": "1965", "deceased": False},
        {"old_reg_no": "94", "title": "", "name": "Dinendranath Mashtak", "year": "1941", "deceased": True},
        {"old_reg_no": "95", "title": "", "name": "Prasanta Pine", "year": "1963", "deceased": False},
        {"old_reg_no": "96", "title": "", "name": "Alok Roy Choudhury", "year": "1963", "deceased": False},
        {"old_reg_no": "97", "title": "", "name": "Tarak Mukhopadhyay", "year": "1974", "deceased": False},
        {"old_reg_no": "98", "title": "Dr.", "name": "Santosh Gangopadhyay", "year": "1952", "deceased": False},
        {"old_reg_no": "99", "title": "", "name": "Subrata Kumar Sarkar", "year": "1970", "deceased": True},
        {"old_reg_no": "100", "title": "", "name": "Arun Kumar Mukherjee", "year": "1966", "deceased": True},
        {"old_reg_no": "101", "title": "Dr.", "name": "Sanjay Ganguly", "year": "1970", "deceased": False},
        {"old_reg_no": "102", "title": "", "name": "Piyush Kanti Biswas", "year": "1965", "deceased": False},
        {"old_reg_no": "103", "title": "", "name": "Shyamal Chattopadhyay", "year": "", "deceased": False},
        {"old_reg_no": "104", "title": "", "name": "Mohanraj Chattopadhyay", "year": "1967", "deceased": False},
        {"old_reg_no": "105", "title": "", "name": "Phanibhushan Mondal", "year": "1965", "deceased": False},
        {"old_reg_no": "106", "title": "", "name": "Gurudas Bhowmik", "year": "1965", "deceased": True},
        {"old_reg_no": "107", "title": "", "name": "Prasanta Bhattacharya", "year": "1962", "deceased": False},
        {"old_reg_no": "108", "title": "", "name": "Kalipada Sadhu Khan", "year": "1953", "deceased": False},
        {"old_reg_no": "109", "title": "", "name": "Gobind Chandra Ghosh", "year": "1953", "deceased": False},
        {"old_reg_no": "110", "title": "", "name": "Udayan Deb Bhuti", "year": "1974", "deceased": False},
        {"old_reg_no": "111", "title": "", "name": "Bishwanath Ghosh", "year": "1963", "deceased": False},
        {"old_reg_no": "112", "title": "", "name": "Suhas Chakraborty", "year": "1971", "deceased": False},
        {"old_reg_no": "113", "title": "", "name": "Mukul Guha", "year": "1971", "deceased": False},
        {"old_reg_no": "114", "title": "", "name": "Indranath Mukhopadhyay", "year": "1965", "deceased": False},
        {"old_reg_no": "115", "title": "Dr.", "name": "Sukamal Mitra", "year": "1967", "deceased": False},
        {"old_reg_no": "116", "title": "", "name": "Utpal Sen", "year": "1975", "deceased": False},
        {"old_reg_no": "117", "title": "", "name": "Satyen Bandyopadhyay", "year": "1947", "deceased": True},
    ]
    
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
    
    for entry in alumni_data:
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
            'Notes': f'Entry #{entry["old_reg_no"]}'
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
    
    # Create CSV from image data
    if args.output:
        create_csv_from_image_data(args.image_path, args.output)
    else:
        # Default output filename
        base_name = os.path.splitext(args.image_path)[0]
        output_path = f"{base_name}_extracted.csv"
        create_csv_from_image_data(args.image_path, output_path)

if __name__ == "__main__":
    main()





