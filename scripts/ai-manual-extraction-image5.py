#!/usr/bin/env python3
"""
AI Manual Bengali Text Extraction for BGHS Alumni - Image 5
Extracting entries 365-426 from the fifth image
"""

import pandas as pd

def create_csv_from_ai_extraction_image5():
    """Create CSV using AI manual extraction logic for fifth image"""
    
    # AI Manual Extraction - Fifth image (entries 365-426)
    alumni_data = [
        # Left Column entries (365-395)
        {"old_id": 365, "title": "", "name": "Nripendranath Pal", "year": 1930, "deceased": True},
        {"old_id": 366, "title": "Moh.", "name": "Golam Naxband", "year": "", "deceased": False},
        {"old_id": 367, "title": "", "name": "Pachugopal Chattopadhyay", "year": 1956, "deceased": False},
        {"old_id": 368, "title": "", "name": "Uttam Bandyopadhyay", "year": 1972, "deceased": False},
        {"old_id": 369, "title": "", "name": "Kaushik Ghosh", "year": 1985, "deceased": False},
        {"old_id": 370, "title": "Dr.", "name": "Hirak Jyoti Sanyal", "year": 1990, "deceased": False},
        {"old_id": 371, "title": "", "name": "Ashim Kumar Mandal", "year": 1985, "deceased": False},
        {"old_id": 372, "title": "", "name": "Tapas Kumar Mandal", "year": 1987, "deceased": False},
        {"old_id": 373, "title": "", "name": "Barun Kanti Das", "year": 1987, "deceased": False},
        {"old_id": 374, "title": "", "name": "Sanjay Kumar Ghosh", "year": 1982, "deceased": False},
        {"old_id": 375, "title": "", "name": "Priyabrata Biswas", "year": 1985, "deceased": False},
        {"old_id": 376, "title": "", "name": "Prabir Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 377, "title": "", "name": "Salil Kumar Gangopadhyay", "year": 1966, "deceased": False},
        {"old_id": 378, "title": "", "name": "Balaram Mukhopadhyay", "year": 1944, "deceased": True},
        {"old_id": 379, "title": "", "name": "Arabinda Gangopadhyay", "year": 1960, "deceased": True},
        {"old_id": 380, "title": "Dr.", "name": "Utpal Kumar Roy", "year": 1967, "deceased": True},
        {"old_id": 381, "title": "", "name": "Gopal Biswas", "year": 1984, "deceased": False},
        {"old_id": 382, "title": "", "name": "Satyabrata Biswas", "year": 1985, "deceased": False},
        {"old_id": 383, "title": "", "name": "Mintu Roy", "year": 1971, "deceased": True},
        {"old_id": 384, "title": "", "name": "Debaprasad Mitra", "year": 1972, "deceased": False},
        {"old_id": 385, "title": "", "name": "Ramakrishna Sadhu Khan", "year": 1973, "deceased": False},
        {"old_id": 386, "title": "", "name": "Indrajit Saha", "year": 1984, "deceased": False},
        {"old_id": 387, "title": "", "name": "Gautam Saha", "year": 1983, "deceased": False},
        {"old_id": 388, "title": "", "name": "Soumen Basu", "year": 1973, "deceased": False},
        {"old_id": 389, "title": "", "name": "Subhash Sadhu Khan", "year": 1984, "deceased": False},
        {"old_id": 390, "title": "", "name": "Arun Kumar Bhattacharya", "year": 1952, "deceased": False},
        {"old_id": 391, "title": "", "name": "Sitangshu Shekhar Mukhopadhyay", "year": 1939, "deceased": True},
        {"old_id": 392, "title": "Dr.", "name": "Narayan Chandra Ghosh", "year": 1963, "deceased": False},
        {"old_id": 393, "title": "", "name": "Vivekananda Bhattacharya", "year": 1975, "deceased": False},
        {"old_id": 394, "title": "", "name": "Swapan Kumar De", "year": 1963, "deceased": False},
        {"old_id": 395, "title": "", "name": "Pashupati Mukhopadhyay", "year": 1951, "deceased": True},
        
        # Right Column entries (396-426)
        {"old_id": 396, "title": "", "name": "Manoranjan Biswas", "year": 1961, "deceased": False},
        {"old_id": 397, "title": "", "name": "Mihir Chakraborty", "year": 1967, "deceased": False},
        {"old_id": 398, "title": "", "name": "Utpal Gangopadhyay", "year": 1971, "deceased": True},
        {"old_id": 399, "title": "", "name": "Prabir Modak", "year": 1973, "deceased": False},
        {"old_id": 400, "title": "", "name": "Anjan Chakraborty", "year": 1976, "deceased": False},
        {"old_id": 401, "title": "", "name": "Shamijit Bhattacharya", "year": 1983, "deceased": False},
        {"old_id": 402, "title": "", "name": "Subrata Bhattacharya", "year": 1972, "deceased": True},
        {"old_id": 403, "title": "", "name": "Manas Kumar Mandal", "year": "", "deceased": False},
        {"old_id": 404, "title": "", "name": "Kaushik Chowdhury", "year": 1984, "deceased": False},
        {"old_id": 405, "title": "", "name": "Nimai Chandra Sadhu Khan", "year": 1980, "deceased": False},
        {"old_id": 406, "title": "", "name": "Balai Chandra Maity", "year": 1949, "deceased": True},
        {"old_id": 407, "title": "", "name": "Srikanta Mukhopadhyay", "year": 1959, "deceased": True},
        {"old_id": 408, "title": "", "name": "Shantinath Mukhopadhyay", "year": 1951, "deceased": True},
        {"old_id": 409, "title": "", "name": "Tapan Kumar Kar", "year": 1968, "deceased": False},
        {"old_id": 410, "title": "Dr.", "name": "Sanjay Ghatak", "year": 1990, "deceased": False},
        {"old_id": 411, "title": "", "name": "Kamal Das", "year": 1952, "deceased": True},
        {"old_id": 412, "title": "", "name": "Amitabh Sengupta", "year": 1970, "deceased": False},
        {"old_id": 413, "title": "", "name": "Shambhu Kumar Das", "year": 1972, "deceased": False},
        {"old_id": 414, "title": "", "name": "Srijit Mukhopadhyay", "year": 1972, "deceased": False},
        {"old_id": 415, "title": "", "name": "Jaharlal Chakraborty", "year": 1972, "deceased": False},
        {"old_id": 416, "title": "", "name": "Subir Kumar Biswas", "year": 1972, "deceased": False},
        {"old_id": 417, "title": "", "name": "Pradip Kumar Ghosh", "year": 1982, "deceased": False},
        {"old_id": 418, "title": "", "name": "Malay Bandyopadhyay", "year": 1979, "deceased": False},
        {"old_id": 419, "title": "", "name": "Kalyan Madhav Chattopadhyay", "year": 1971, "deceased": False},
        {"old_id": 420, "title": "", "name": "Amlan Ghosh", "year": "", "deceased": False},
        {"old_id": 421, "title": "", "name": "Rajan Chowdhury", "year": 1983, "deceased": True},
        {"old_id": 422, "title": "", "name": "Pranab De", "year": 1984, "deceased": False},
        {"old_id": 423, "title": "", "name": "Prabal Dhar", "year": "", "deceased": False},
        {"old_id": 424, "title": "", "name": "Shiv Prasad Samaddar", "year": 1956, "deceased": False},
        {"old_id": 425, "title": "Dr.", "name": "Dipak Kumar Mandal", "year": 1976, "deceased": False},
        {"old_id": 426, "title": "", "name": "Swapan Kumar Sadhu Khan", "year": "", "deceased": False},
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
    output_path = "20250908_105540_extracted.csv"
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
    create_csv_from_ai_extraction_image5()





