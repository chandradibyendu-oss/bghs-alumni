#!/usr/bin/env python3
"""
AI Manual Bengali Text Extraction for BGHS Alumni - Image 6
Extracting entries 427-488 from the sixth image
"""

import pandas as pd

def create_csv_from_ai_extraction_image6():
    """Create CSV using AI manual extraction logic for sixth image"""
    
    # AI Manual Extraction - Sixth image (entries 427-488)
    # Using only the actual entries visible in the image description
    alumni_data = [
        # Only the real entries from the actual image OCR
        {"old_id": 427, "title": "", "name": "Tamal De Sarkar", "year": 1979, "deceased": False},
        {"old_id": 433, "title": "", "name": "Shashank Ghosh", "year": 1978, "deceased": True},
        {"old_id": 442, "title": "Dr.", "name": "Ranjan Shukla Ghosh", "year": 1966, "deceased": False},
    ]
    
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
        
        # Convert registration number to new format
        new_reg_no = f"BGHSA-2025-{entry['old_id']:05d}"
        
        # Determine company field
        company = "Deceased" if entry["deceased"] else ("Medical Practice" if entry["title"] == "Dr." else ("Academic Institution" if entry["title"] == "Prof." else ""))
        
        # Create record
        record = {
            'Old Registration Number': entry["old_id"],
            'New Registration Number': new_reg_no,
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
            'Notes': f'AI Extracted - Entry #{entry["old_id"]}'
        }
        
        csv_records.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(csv_records)
    
    # Save to CSV with same name as image file
    output_path = "20250908_105632_extracted.csv"
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"AI Manual Extraction Complete!")
    print(f"CSV file created: {output_path}")
    print(f"Total records: {len(df)}")
    print(f"Deceased records: {len(df[df['Is Deceased'] == 'true'])}")
    print(f"Living records: {len(df[df['Is Deceased'] == 'false'])}")
    print(f"Medical professionals: {len(df[df['Company'] == 'Medical Practice'])}")
    print(f"Academic professionals: {len(df[df['Company'] == 'Academic Institution'])}")
    
    return df

if __name__ == "__main__":
    create_csv_from_ai_extraction_image6()
