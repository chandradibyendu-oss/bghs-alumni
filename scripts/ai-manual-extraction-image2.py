#!/usr/bin/env python3
"""
AI Manual Bengali Text Extraction for BGHS Alumni - Image 2
Extracting entries 180-241 from the second image
"""

import pandas as pd

def create_csv_from_ai_extraction_image2():
    """Create CSV using AI manual extraction logic for second image"""
    
    # AI Manual Extraction - Second image (entries 180-241)
    alumni_data = [
        # Left Column entries (180-210)
        {"old_id": 180, "title": "", "name": "Amiya Kumar Bose", "year": 1950, "deceased": True},
        {"old_id": 181, "title": "", "name": "Debashish Chakraborty", "year": 1978, "deceased": False},
        {"old_id": 182, "title": "", "name": "Tamal Gobinda Chowdhury", "year": 1966, "deceased": False},
        {"old_id": 183, "title": "", "name": "Anupam Roy", "year": 1973, "deceased": True},
        {"old_id": 184, "title": "", "name": "Alok Pal", "year": 1967, "deceased": False},
        {"old_id": 185, "title": "", "name": "Asim Gan", "year": 1978, "deceased": False},
        {"old_id": 186, "title": "", "name": "Shyamal Gan", "year": 1966, "deceased": False},
        {"old_id": 187, "title": "", "name": "Shiv Kumar Roy", "year": 1965, "deceased": False},
        {"old_id": 188, "title": "", "name": "Swapan Chattopadhyay", "year": 1967, "deceased": False},
        {"old_id": 189, "title": "", "name": "Bimalendu Paik", "year": 1967, "deceased": False},
        {"old_id": 190, "title": "", "name": "Tapas Ghosh", "year": 1980, "deceased": True},
        {"old_id": 191, "title": "Dr.", "name": "Tapas Dutta", "year": 1980, "deceased": False},
        {"old_id": 192, "title": "", "name": "Arun Sadhu Khan", "year": 1974, "deceased": False},
        {"old_id": 193, "title": "", "name": "Pradeep Kumar Sengupta", "year": 1968, "deceased": False},
        {"old_id": 194, "title": "", "name": "Mihir Kumar De", "year": 1968, "deceased": False},
        {"old_id": 195, "title": "", "name": "Babul Nandi", "year": 1968, "deceased": True},
        {"old_id": 196, "title": "", "name": "Pushpal Kumar Nag", "year": 1955, "deceased": False},
        {"old_id": 197, "title": "", "name": "Ashish Mukhopadhyay", "year": 1956, "deceased": True},
        {"old_id": 198, "title": "", "name": "Partha Sarkar", "year": 1984, "deceased": False},
        {"old_id": 199, "title": "", "name": "Prithvish Nandi", "year": 1966, "deceased": False},
        {"old_id": 200, "title": "Dr.", "name": "Nilaratan Chakraborty", "year": 1965, "deceased": False},
        {"old_id": 201, "title": "", "name": "Akshay Mukherjee", "year": 1940, "deceased": True},
        {"old_id": 202, "title": "", "name": "Pankaj Kumar Purkait", "year": 1963, "deceased": False},
        {"old_id": 203, "title": "", "name": "Jugal Chandra Roy", "year": 1965, "deceased": False},
        {"old_id": 204, "title": "", "name": "Tarun Chatterjee", "year": "", "deceased": False},
        {"old_id": 205, "title": "", "name": "Ramesh Chandra De", "year": 1949, "deceased": True},
        {"old_id": 206, "title": "", "name": "Nanigopal Bhattacharya", "year": 1948, "deceased": False},
        {"old_id": 207, "title": "", "name": "Shivchandra Ghosh", "year": 1944, "deceased": True},
        {"old_id": 208, "title": "", "name": "Chinmoy Goswami", "year": 1980, "deceased": False},
        {"old_id": 209, "title": "", "name": "Gopalchandra Mukherjee", "year": 1952, "deceased": False},
        {"old_id": 210, "title": "", "name": "Amrit Mukherjee", "year": 1984, "deceased": True},
        
        # Right Column entries (211-241)
        {"old_id": 211, "title": "Dr.", "name": "Kabiranjan Pal", "year": 1967, "deceased": False},
        {"old_id": 212, "title": "", "name": "Samar Ranjan Pal", "year": 1962, "deceased": False},
        {"old_id": 213, "title": "", "name": "Binay Bhushan Ghatak", "year": 1957, "deceased": False},
        {"old_id": 214, "title": "", "name": "Ashok Kumar Chowdhury", "year": 1967, "deceased": False},
        {"old_id": 215, "title": "", "name": "Tapas Kumar Chatterjee", "year": 1967, "deceased": False},
        {"old_id": 216, "title": "", "name": "Dinesh Chandra Modak", "year": 1965, "deceased": False},
        {"old_id": 217, "title": "", "name": "Bidhanchandra Chowdhury", "year": 1966, "deceased": False},
        {"old_id": 218, "title": "", "name": "Aniruddha Munshi", "year": 1966, "deceased": False},
        {"old_id": 219, "title": "Dr.", "name": "Gautam Das", "year": 1967, "deceased": False},
        {"old_id": 220, "title": "", "name": "Shekh Amjad Ali", "year": 1965, "deceased": False},
        {"old_id": 221, "title": "Dr.", "name": "Subhash Basu", "year": 1964, "deceased": False},
        {"old_id": 222, "title": "Dr.", "name": "Malay Chatterjee", "year": 1964, "deceased": False},
        {"old_id": 223, "title": "", "name": "Amitabh Mukherjee", "year": 1972, "deceased": False},
        {"old_id": 224, "title": "", "name": "Shyamal Ghosh", "year": 1964, "deceased": False},
        {"old_id": 225, "title": "", "name": "Arun Kumar Dasgupta", "year": 1964, "deceased": False},
        {"old_id": 226, "title": "", "name": "Satyendranath Mashtak", "year": 1966, "deceased": False},
        {"old_id": 227, "title": "", "name": "Shaibal Kumar Nandi", "year": 1937, "deceased": False},
        {"old_id": 228, "title": "", "name": "Biplab Basu Thakur", "year": 1966, "deceased": False},
        {"old_id": 229, "title": "", "name": "Smriti Bikash Chakraborty", "year": 1937, "deceased": False},
        {"old_id": 230, "title": "", "name": "Deepankar Bhattacharya", "year": 1967, "deceased": False},
        {"old_id": 231, "title": "", "name": "Kamini Kumar Chatterjee", "year": 1930, "deceased": True},
        {"old_id": 232, "title": "", "name": "Satinath Bandyopadhyay", "year": 1982, "deceased": False},
        {"old_id": 233, "title": "", "name": "Rajiv Roy", "year": 1978, "deceased": False},
        {"old_id": 234, "title": "", "name": "Swapan Kumar Banerjee", "year": 1965, "deceased": False},
        {"old_id": 235, "title": "", "name": "Ramani Mohan Chatterjee", "year": 1948, "deceased": True},
        {"old_id": 236, "title": "", "name": "Pradeep Kumar Bose", "year": 1966, "deceased": True},
        {"old_id": 237, "title": "", "name": "Bishwanath Ghosh", "year": 1965, "deceased": False},
        {"old_id": 238, "title": "", "name": "Ashwini Niyogi", "year": 1967, "deceased": False},
        {"old_id": 239, "title": "", "name": "Kiriti Dutta", "year": 1965, "deceased": False},
        {"old_id": 240, "title": "", "name": "Subhash Pal", "year": 1975, "deceased": False},
        {"old_id": 241, "title": "", "name": "Koushik Das", "year": 1988, "deceased": True},
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
        company = "Deceased" if entry["deceased"] else ("Medical Practice" if entry["title"] == "Dr." else "")
        
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
    
    # Save to CSV with same name as image file (assuming filename follows pattern)
    output_path = "20250908_105131_image2_extracted.csv"
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"AI Manual Extraction Complete!")
    print(f"CSV file created: {output_path}")
    print(f"Total records: {len(df)}")
    print(f"Deceased records: {len(df[df['Is Deceased'] == 'true'])}")
    print(f"Living records: {len(df[df['Is Deceased'] == 'false'])}")
    print(f"Medical professionals: {len(df[df['Company'] == 'Medical Practice'])}")
    
    return df

if __name__ == "__main__":
    create_csv_from_ai_extraction_image2()
