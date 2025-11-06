#!/usr/bin/env python3
"""
AI Manual Bengali Text Extraction for BGHS Alumni
Using the same logic that worked successfully in Cursor chat
"""

import pandas as pd

def create_csv_from_ai_extraction():
    """Create CSV using AI manual extraction logic"""
    
    # AI Manual Extraction - Same logic used in Cursor chat
    alumni_data = [
        # Left Column entries (118-148)
        {"old_id": 118, "title": "", "name": "Ashish Roy Chowdhury", "year": 1972, "deceased": False},
        {"old_id": 119, "title": "", "name": "Gautam Mukhopadhyay", "year": 1965, "deceased": False},
        {"old_id": 120, "title": "", "name": "Chunilal Chakraborty", "year": 1953, "deceased": True},
        {"old_id": 121, "title": "", "name": "Nirmal Chattopadhyay", "year": 1947, "deceased": True},
        {"old_id": 122, "title": "Dr.", "name": "Anuj Bhattacharya", "year": 1963, "deceased": True},
        {"old_id": 123, "title": "", "name": "Chandrashekhar Bandyopadhyay", "year": 1962, "deceased": False},
        {"old_id": 124, "title": "Dr.", "name": "Dipak Kumar Chatterjee", "year": 1963, "deceased": True},
        {"old_id": 125, "title": "Dr.", "name": "Gopal Chandra Mondal", "year": 1947, "deceased": True},
        {"old_id": 126, "title": "", "name": "Arunabha Roy", "year": 1984, "deceased": False},
        {"old_id": 127, "title": "", "name": "Subhashchandra Roy", "year": 1969, "deceased": False},
        {"old_id": 128, "title": "Dr.", "name": "Pranab Bishnu", "year": 1965, "deceased": False},
        {"old_id": 129, "title": "Dr.", "name": "Swapan Kumar Kar", "year": 1970, "deceased": False},
        {"old_id": 130, "title": "", "name": "Asim Roy", "year": 1973, "deceased": False},
        {"old_id": 131, "title": "", "name": "Anjan Banerjee", "year": 1981, "deceased": False},
        {"old_id": 132, "title": "", "name": "Samarendra Chatterjee", "year": 1968, "deceased": False},
        {"old_id": 133, "title": "", "name": "Ranjit Kumar Banerjee", "year": 1960, "deceased": True},
        {"old_id": 134, "title": "", "name": "Pratap Kumar Das", "year": "", "deceased": False},
        {"old_id": 135, "title": "", "name": "Prabhat Kumar Banerjee", "year": "", "deceased": True},
        {"old_id": 136, "title": "", "name": "Chanchal Roy Chowdhury", "year": 1972, "deceased": False},
        {"old_id": 137, "title": "", "name": "Chittaranjan Saha", "year": 1961, "deceased": True},
        {"old_id": 138, "title": "", "name": "Sagar Kallol Biswas", "year": 1980, "deceased": False},
        {"old_id": 139, "title": "", "name": "Kamal Nag", "year": 1970, "deceased": False},
        {"old_id": 140, "title": "Dr.", "name": "Arun Kumar Gan", "year": 1967, "deceased": False},
        {"old_id": 141, "title": "", "name": "Sushanta Kumar Biswas", "year": 1937, "deceased": True},
        {"old_id": 142, "title": "", "name": "Subhash Ghosh Roy", "year": 1949, "deceased": True},
        {"old_id": 143, "title": "", "name": "Bipul Krishna Roy", "year": 1954, "deceased": False},
        {"old_id": 144, "title": "", "name": "Samir Kumar Mitra", "year": 1970, "deceased": False},
        {"old_id": 145, "title": "", "name": "Nitai Chandra Paik", "year": 1937, "deceased": True},
        {"old_id": 146, "title": "Moh.", "name": "Abul Kalam", "year": 1965, "deceased": False},
        {"old_id": 147, "title": "", "name": "Kajal Kumar Karmakar", "year": 1968, "deceased": False},
        {"old_id": 148, "title": "", "name": "Narayan Sengupta", "year": 1965, "deceased": False},
        
        # Right Column entries (149-179)
        {"old_id": 149, "title": "", "name": "Nirmal Kumar Chattopadhyay", "year": 1949, "deceased": True},
        {"old_id": 150, "title": "", "name": "Hemanta Kumar Chattopadhyay", "year": 1936, "deceased": True},
        {"old_id": 151, "title": "", "name": "Tarunkanti Barman Roy", "year": 1953, "deceased": False},
        {"old_id": 152, "title": "", "name": "Samiran Debbhuti", "year": 1971, "deceased": False},
        {"old_id": 153, "title": "", "name": "Ashish Chattopadhyay", "year": 1968, "deceased": False},
        {"old_id": 154, "title": "", "name": "Sudip Kumar Roy", "year": 1966, "deceased": False},
        {"old_id": 155, "title": "Dr.", "name": "Niranjan Kumar Das", "year": 1950, "deceased": True},
        {"old_id": 156, "title": "", "name": "Sudip Ranjan Ghosh Dastidar", "year": 1967, "deceased": False},
        {"old_id": 157, "title": "", "name": "Shekhar Kumar Chakraborty", "year": 1967, "deceased": False},
        {"old_id": 158, "title": "", "name": "Ashish Banerjee", "year": 1963, "deceased": False},
        {"old_id": 159, "title": "", "name": "Sujit Kumar Nandi", "year": 1967, "deceased": False},
        {"old_id": 160, "title": "", "name": "Kirit Bose", "year": 1964, "deceased": False},
        {"old_id": 161, "title": "", "name": "Ananga Prasad Dutta", "year": 1967, "deceased": False},
        {"old_id": 162, "title": "", "name": "Kalyan Kumar Halder", "year": 1967, "deceased": False},
        {"old_id": 163, "title": "Dr.", "name": "Ashok Kumar Ghosh", "year": 1971, "deceased": False},
        {"old_id": 164, "title": "", "name": "Arun Kumar Basu", "year": 1963, "deceased": False},
        {"old_id": 165, "title": "", "name": "Mohit Kumar Basu", "year": 1945, "deceased": True},
        {"old_id": 166, "title": "Prof.", "name": "Madhumay Roy", "year": 1964, "deceased": True},
        {"old_id": 167, "title": "", "name": "Aloknath Chakraborty", "year": 1954, "deceased": False},
        {"old_id": 168, "title": "", "name": "Rathindranath Bagchi", "year": 1967, "deceased": False},
        {"old_id": 169, "title": "", "name": "Samarendranath Bagchi", "year": 1967, "deceased": False},
        {"old_id": 170, "title": "Dr.", "name": "Partha Chowdhury", "year": 1969, "deceased": False},
        {"old_id": 171, "title": "", "name": "Samar Kumar Dutta", "year": 1962, "deceased": False},
        {"old_id": 172, "title": "", "name": "Suman Mukhopadhyay", "year": 1984, "deceased": False},
        {"old_id": 173, "title": "", "name": "Prabir Kumar Bandyopadhyay", "year": 1967, "deceased": False},
        {"old_id": 174, "title": "", "name": "Subrata Pal", "year": 1973, "deceased": False},
        {"old_id": 175, "title": "", "name": "Atish Dey", "year": 1967, "deceased": False},
        {"old_id": 176, "title": "Dr.", "name": "Pritish Ghosh", "year": 1950, "deceased": False},
        {"old_id": 177, "title": "", "name": "Jaharlal Mashtak", "year": 1956, "deceased": True},
        {"old_id": 178, "title": "", "name": "Sambhudas Bandyopadhyay", "year": 1935, "deceased": True},
        {"old_id": 179, "title": "Dr.", "name": "Nikhil Chattopadhyay", "year": 1953, "deceased": True},
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
    output_path = "20250908_105131_extracted.csv"
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
    create_csv_from_ai_extraction()
