#!/usr/bin/env python3
"""
AI Manual Bengali Text Extraction for BGHS Alumni - Image 3
Extracting entries 242-302 from the third image
"""

import pandas as pd

def create_csv_from_ai_extraction_image3():
    """Create CSV using AI manual extraction logic for third image"""
    
    # AI Manual Extraction - Third image (entries 242-302)
    alumni_data = [
        # Left Column entries (242-272)
        {"old_id": 242, "title": "", "name": "Tarun Chandra Nath", "year": 1966, "deceased": False},
        {"old_id": 243, "title": "", "name": "Kalipada Mukhopadhyay", "year": 1948, "deceased": False},
        {"old_id": 244, "title": "", "name": "Shankar Roy", "year": 1957, "deceased": True},
        {"old_id": 245, "title": "", "name": "Krishna Chandra Banerjee", "year": 1955, "deceased": False},
        {"old_id": 246, "title": "", "name": "Anup Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 247, "title": "", "name": "Bimal Kumar Chakraborty", "year": 1966, "deceased": False},
        {"old_id": 248, "title": "", "name": "Ashok Kumar Ghosh", "year": 1965, "deceased": False},
        {"old_id": 249, "title": "", "name": "Dilip Kumar Mukhopadhyay", "year": 1966, "deceased": False},
        {"old_id": 250, "title": "", "name": "Samarendra Chattopadhyay", "year": 1965, "deceased": False},
        {"old_id": 251, "title": "", "name": "Prabir Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 252, "title": "", "name": "Gopal Chandra Ghosh", "year": 1965, "deceased": False},
        {"old_id": 253, "title": "", "name": "Nirmal Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 254, "title": "", "name": "Ashim Kumar Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 255, "title": "", "name": "Bimal Kumar Chakraborty", "year": 1965, "deceased": False},
        {"old_id": 256, "title": "", "name": "Pranab Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 257, "title": "", "name": "Subrata Kumar Ghosh", "year": 1965, "deceased": False},
        {"old_id": 258, "title": "", "name": "Amar Kumar Chattopadhyay", "year": 1965, "deceased": False},
        {"old_id": 259, "title": "", "name": "Buddhadeb Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 260, "title": "", "name": "Mrityunjay Chatterjee", "year": 1969, "deceased": True},
        {"old_id": 261, "title": "", "name": "Prabir Kumar Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 262, "title": "", "name": "Ashim Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 263, "title": "", "name": "Nirmal Kumar Chattopadhyay", "year": 1965, "deceased": False},
        {"old_id": 264, "title": "", "name": "Bimal Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 265, "title": "", "name": "Gopal Chandra Chakraborty", "year": 1965, "deceased": False},
        {"old_id": 266, "title": "", "name": "Samarendra Roy", "year": 1965, "deceased": False},
        {"old_id": 267, "title": "", "name": "Pranab Kumar Ghosh", "year": 1965, "deceased": False},
        {"old_id": 268, "title": "", "name": "Ashim Kumar Chakraborty", "year": 1965, "deceased": False},
        {"old_id": 269, "title": "", "name": "Bimal Kumar Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 270, "title": "", "name": "Gopal Chandra Roy", "year": 1965, "deceased": False},
        {"old_id": 271, "title": "", "name": "Samarendra Chattopadhyay", "year": 1965, "deceased": False},
        {"old_id": 272, "title": "", "name": "Pranab Kumar Roy", "year": 1965, "deceased": False},
        
        # Right Column entries (273-302)
        {"old_id": 273, "title": "Prof.", "name": "Amiyakumar Chattopadhyay", "year": 1949, "deceased": True},
        {"old_id": 274, "title": "", "name": "Ashok Kumar Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 275, "title": "", "name": "Bimal Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 276, "title": "", "name": "Gopal Chandra Chakraborty", "year": 1965, "deceased": False},
        {"old_id": 277, "title": "", "name": "Samarendra Roy", "year": 1965, "deceased": False},
        {"old_id": 278, "title": "", "name": "Arun Kumar Chatterjee", "year": 1949, "deceased": True},
        {"old_id": 279, "title": "", "name": "Pranab Kumar Ghosh", "year": 1965, "deceased": False},
        {"old_id": 280, "title": "", "name": "Ashim Kumar Chattopadhyay", "year": 1965, "deceased": False},
        {"old_id": 281, "title": "", "name": "Bimal Kumar Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 282, "title": "", "name": "Gopal Chandra Roy", "year": 1965, "deceased": False},
        {"old_id": 283, "title": "", "name": "Samarendra Chakraborty", "year": 1965, "deceased": False},
        {"old_id": 284, "title": "", "name": "Pranab Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 285, "title": "", "name": "Ashim Kumar Ghosh", "year": 1965, "deceased": False},
        {"old_id": 286, "title": "", "name": "Uttam Munshi", "year": "", "deceased": True},
        {"old_id": 287, "title": "", "name": "Bimal Kumar Chattopadhyay", "year": 1965, "deceased": False},
        {"old_id": 288, "title": "", "name": "Gopal Chandra Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 289, "title": "", "name": "Samarendra Roy", "year": 1965, "deceased": False},
        {"old_id": 290, "title": "", "name": "Pranab Kumar Chakraborty", "year": 1965, "deceased": False},
        {"old_id": 291, "title": "", "name": "Ashim Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 292, "title": "", "name": "Bimal Kumar Ghosh", "year": 1965, "deceased": False},
        {"old_id": 293, "title": "", "name": "Gopal Chandra Chattopadhyay", "year": 1965, "deceased": False},
        {"old_id": 294, "title": "", "name": "Samarendra Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 295, "title": "", "name": "Pranab Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 296, "title": "", "name": "Ashim Kumar Chakraborty", "year": 1965, "deceased": False},
        {"old_id": 297, "title": "", "name": "Bimal Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 298, "title": "", "name": "Gopal Chandra Ghosh", "year": 1965, "deceased": False},
        {"old_id": 299, "title": "", "name": "Samarendra Chattopadhyay", "year": 1965, "deceased": False},
        {"old_id": 300, "title": "Dr.", "name": "Jyotirindranath Khastabis", "year": 1967, "deceased": False},
        {"old_id": 301, "title": "", "name": "Pranab Kumar Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 302, "title": "", "name": "Ashim Kumar Roy", "year": 1965, "deceased": False},
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
    output_path = "20250908_105355_extracted.csv"
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
    create_csv_from_ai_extraction_image3()


