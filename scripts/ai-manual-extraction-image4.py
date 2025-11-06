#!/usr/bin/env python3
"""
AI Manual Bengali Text Extraction for BGHS Alumni - Image 4
Extracting entries 303-353 from the fourth image
"""

import pandas as pd

def create_csv_from_ai_extraction_image4():
    """Create CSV using AI manual extraction logic for fourth image"""
    
    # AI Manual Extraction - Fourth image (entries 303-364)
    # Using all the actual entries visible in the image
    alumni_data = [
        # Left Column entries (303-333)
        {"old_id": 303, "title": "", "name": "Abeer Chattopadhyay", "year": 1980, "deceased": False},
        {"old_id": 304, "title": "", "name": "Rathin Kumar Ghosh", "year": 1970, "deceased": False},
        {"old_id": 305, "title": "", "name": "Shobhan Banerjee", "year": 1974, "deceased": False},
        {"old_id": 306, "title": "", "name": "Samiran Chatterjee", "year": 1979, "deceased": False},
        {"old_id": 307, "title": "", "name": "Pushpendu Mitra", "year": 1979, "deceased": False},
        {"old_id": 308, "title": "", "name": "Debabrata Chatterjee", "year": "", "deceased": False},
        {"old_id": 309, "title": "", "name": "Prashant Chatterjee", "year": 1963, "deceased": False},
        {"old_id": 310, "title": "", "name": "Prabhat Chatterjee", "year": 1938, "deceased": True},
        {"old_id": 311, "title": "", "name": "Kalyan Shankar Pal", "year": 1976, "deceased": False},
        {"old_id": 312, "title": "", "name": "Subhash Mohan Roy", "year": 1967, "deceased": True},
        {"old_id": 313, "title": "", "name": "Samaresh Ghoshal", "year": 1968, "deceased": False},
        {"old_id": 314, "title": "", "name": "Kanchan Kamal Mukhopadhyay", "year": 1972, "deceased": False},
        {"old_id": 315, "title": "Dr.", "name": "Gautam Saha", "year": 1983, "deceased": False},
        {"old_id": 316, "title": "", "name": "Soumitra Chatterjee", "year": 1984, "deceased": False},
        {"old_id": 317, "title": "", "name": "Siraj Chakraborty", "year": 1982, "deceased": False},
        {"old_id": 318, "title": "", "name": "Shubhendu Chanda", "year": 1982, "deceased": False},
        {"old_id": 319, "title": "", "name": "Tushar Kanti Bose", "year": 1968, "deceased": False},
        {"old_id": 320, "title": "", "name": "Shibananda Bose", "year": 1976, "deceased": False},
        {"old_id": 321, "title": "", "name": "Saroj Ganguly", "year": 1958, "deceased": False},
        {"old_id": 322, "title": "", "name": "Ranjan Ghosh", "year": 1965, "deceased": False},
        {"old_id": 323, "title": "", "name": "Arindam Pramanik", "year": 1985, "deceased": False},
        {"old_id": 324, "title": "", "name": "Debaprasad Chakraborty", "year": 1961, "deceased": False},
        {"old_id": 325, "title": "", "name": "Satyajit Bhattacharya", "year": 1979, "deceased": False},
        {"old_id": 326, "title": "Dr.", "name": "Pranab Kumar Basu", "year": 1975, "deceased": False},
        {"old_id": 327, "title": "Dr.", "name": "Gopeshwar Mukhopadhyay", "year": 1971, "deceased": False},
        {"old_id": 328, "title": "", "name": "Milan Chourashi", "year": 1974, "deceased": False},
        {"old_id": 329, "title": "", "name": "Samar Chakraborty", "year": 1967, "deceased": False},
        {"old_id": 330, "title": "", "name": "Ramkrishna Chakraborty", "year": 1961, "deceased": False},
        {"old_id": 331, "title": "", "name": "Bhabatosh Chakraborty", "year": 1968, "deceased": False},
        {"old_id": 332, "title": "", "name": "Alo Mukhopadhyay", "year": 1979, "deceased": False},
        {"old_id": 333, "title": "", "name": "Debashish Mukhopadhyay", "year": 1986, "deceased": False},
        
        # Right Column entries (334-364)
        {"old_id": 334, "title": "", "name": "Shailendra Sadhu Khan", "year": 1944, "deceased": True},
        {"old_id": 335, "title": "", "name": "Mrinal Kanti Ghosh", "year": 1967, "deceased": False},
        {"old_id": 336, "title": "", "name": "Partha Basu", "year": 1989, "deceased": False},
        {"old_id": 337, "title": "", "name": "Jyoti Prakash Chakraborty", "year": 1988, "deceased": False},
        {"old_id": 338, "title": "", "name": "Nalini Kumar Chattopadhyay", "year": 1938, "deceased": True},
        {"old_id": 339, "title": "", "name": "Partha Ghosh Dastidar", "year": 1981, "deceased": False},
        {"old_id": 340, "title": "", "name": "Subir Kumar Roy", "year": 1979, "deceased": False},
        {"old_id": 341, "title": "", "name": "Swarup Mitra", "year": 1967, "deceased": False},
        {"old_id": 342, "title": "", "name": "Prafulla Kumar Ghosh", "year": 1967, "deceased": False},
        {"old_id": 343, "title": "Dr.", "name": "Projjwal Mukhopadhyay", "year": 1989, "deceased": False},
        {"old_id": 344, "title": "", "name": "Shambhunath Dutta", "year": 1942, "deceased": True},
        {"old_id": 345, "title": "", "name": "Arindam Adhikari", "year": 1949, "deceased": True},
        {"old_id": 346, "title": "", "name": "Angshuman Basu", "year": 1976, "deceased": False},
        {"old_id": 347, "title": "", "name": "Prashant Kumar Roy Chowdhury", "year": 1958, "deceased": True},
        {"old_id": 348, "title": "", "name": "Alok Ranjan Bandyopadhyay", "year": 1974, "deceased": False},
        {"old_id": 349, "title": "", "name": "Swapan Kumar Roy", "year": "", "deceased": False},
        {"old_id": 350, "title": "", "name": "Satyaranjan Mandal", "year": 1964, "deceased": False},
        {"old_id": 351, "title": "", "name": "Sheikh Abdul Halim", "year": 1965, "deceased": False},
        {"old_id": 352, "title": "", "name": "Debabrata Paik", "year": 1956, "deceased": False},
        {"old_id": 353, "title": "", "name": "Pintu Biswas", "year": 1983, "deceased": False},
        {"old_id": 354, "title": "", "name": "Kalyan Mandal", "year": "", "deceased": False},
        {"old_id": 355, "title": "", "name": "Atin Kumar Bhattacharya", "year": 1960, "deceased": False},
        {"old_id": 356, "title": "", "name": "Sudip Bandyopadhyay", "year": 1981, "deceased": False},
        {"old_id": 357, "title": "", "name": "Ashok Sengupta", "year": 1980, "deceased": False},
        {"old_id": 358, "title": "", "name": "Biresh Jana", "year": "", "deceased": False},
        {"old_id": 359, "title": "", "name": "Sandip Mukhopadhyay", "year": "", "deceased": False},
        {"old_id": 360, "title": "", "name": "Bivas Bhattacharya", "year": 1984, "deceased": False},
        {"old_id": 361, "title": "", "name": "Subrata Sarkar", "year": 1970, "deceased": False},
        {"old_id": 362, "title": "", "name": "Triptendu Ghosh", "year": 1985, "deceased": False},
        {"old_id": 363, "title": "", "name": "Sushim Bandyopadhyay", "year": 1964, "deceased": False},
        {"old_id": 364, "title": "", "name": "Labanya Kumar Roy", "year": 1927, "deceased": True},
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
        company = "Deceased" if entry["deceased"] else ""
        
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
    output_path = "20250908_105456_extracted.csv"
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
    create_csv_from_ai_extraction_image4()
