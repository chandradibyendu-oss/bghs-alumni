#!/usr/bin/env python3
"""
Fix Bengali extraction with proper registration number extraction and conversion
"""

import pandas as pd

def create_corrected_alumni_csv_with_registration():
    """Create corrected CSV with proper registration number extraction and conversion"""
    
    # Corrected alumni data with proper registration numbers and middle names
    alumni_data = [
        # Left Column entries - with registration numbers
        {"old_reg_no": "1", "title": "", "name": "Ratikanta Mukhopadhyay", "year": "1954", "deceased": False},
        {"old_reg_no": "2", "title": "", "name": "Barin Kumar Chattopadhyay", "year": "1954", "deceased": True},
        {"old_reg_no": "3", "title": "", "name": "Debi Prasad Sengupta", "year": "1965", "deceased": True},
        {"old_reg_no": "4", "title": "", "name": "Tapan Kumar Chattopadhyay", "year": "1972", "deceased": False},
        {"old_reg_no": "5", "title": "", "name": "Anjan Kumar Bandyopadhyay", "year": "1967", "deceased": True},
        {"old_reg_no": "6", "title": "Dr.", "name": "Bishwatosh Basu", "year": "1953", "deceased": True},
        {"old_reg_no": "7", "title": "", "name": "Kanak Chattopadhyay", "year": "1953", "deceased": True},
        {"old_reg_no": "8", "title": "", "name": "Kiran Shankar Chattopadhyay", "year": "1961", "deceased": True},
        {"old_reg_no": "9", "title": "Prof.", "name": "Debnath Mukhopadhyay", "year": "1965", "deceased": False},
        {"old_reg_no": "10", "title": "", "name": "Dilip Chattopadhyay", "year": "", "deceased": True},
        {"old_reg_no": "11", "title": "", "name": "Bankim Saha", "year": "1963", "deceased": True},
        {"old_reg_no": "12", "title": "", "name": "Nishith Chattopadhyay", "year": "1945", "deceased": True},
        {"old_reg_no": "13", "title": "Dr.", "name": "Manilal Mukhopadhyay", "year": "1945", "deceased": True},
        {"old_reg_no": "14", "title": "", "name": "Haradhan Chattopadhyay", "year": "", "deceased": True},
        {"old_reg_no": "15", "title": "Dr.", "name": "Baidyanath Mukhopadhyay", "year": "1956", "deceased": False},
        {"old_reg_no": "16", "title": "Dr.", "name": "Radhika Ranjan Samaddar", "year": "1952", "deceased": False},
        {"old_reg_no": "17", "title": "", "name": "Rabindranath Chattopadhyay", "year": "", "deceased": True},
        {"old_reg_no": "18", "title": "Dr.", "name": "Prashant Kumar Basu", "year": "1950", "deceased": True},
        {"old_reg_no": "19", "title": "", "name": "Malay Ranjan De", "year": "1974", "deceased": False},
        {"old_reg_no": "20", "title": "", "name": "Prashant Bandyopadhyay", "year": "1957", "deceased": True},
        {"old_reg_no": "21", "title": "", "name": "Subrata Mukhopadhyay", "year": "1971", "deceased": False},
        {"old_reg_no": "22", "title": "", "name": "Hirendranath Maschatak", "year": "1963", "deceased": False},
        {"old_reg_no": "23", "title": "Dr.", "name": "Dilip Kumar Mashtak", "year": "1972", "deceased": True},
        {"old_reg_no": "24", "title": "Prof.", "name": "Shobhakar Gangopadhyay", "year": "1956", "deceased": False},
        {"old_reg_no": "25", "title": "", "name": "Ashim Roy", "year": "1975", "deceased": False},
        {"old_reg_no": "26", "title": "", "name": "Anindya Sen", "year": "1967", "deceased": False},
        {"old_reg_no": "27", "title": "Dr.", "name": "Subrata Ghosh", "year": "1963", "deceased": False},
        {"old_reg_no": "28", "title": "", "name": "Bishwanath Mukhopadhyay", "year": "1969", "deceased": False},
        
        # Right Column entries - with registration numbers
        {"old_reg_no": "28 ka", "title": "", "name": "Ajit Kumar Mitra", "year": "", "deceased": True},
        {"old_reg_no": "29", "title": "", "name": "Barin Kumar Chattopadhyay", "year": "1954", "deceased": True},
        {"old_reg_no": "30", "title": "", "name": "Tridib Paik", "year": "1966", "deceased": False},
        {"old_reg_no": "31", "title": "", "name": "Pabitracharan Bhattacharya", "year": "1954", "deceased": False},
        {"old_reg_no": "32", "title": "", "name": "Ajit Roy Mukhopadhyay", "year": "1926", "deceased": True},
        {"old_reg_no": "33", "title": "Prof.", "name": "Sudin Chattopadhyay", "year": "1958", "deceased": False},
        {"old_reg_no": "34", "title": "", "name": "Girindranath Chakraborty", "year": "1953", "deceased": True},
        {"old_reg_no": "35", "title": "", "name": "Gobinda Prasad Samaddar", "year": "1967", "deceased": True},
        {"old_reg_no": "36", "title": "", "name": "Prabir Kumar Sengupta", "year": "1969", "deceased": False},
        {"old_reg_no": "37", "title": "", "name": "Tarun Kumar Roy", "year": "1975", "deceased": False},
        {"old_reg_no": "38", "title": "", "name": "Tarun Kumar Bhattacharya", "year": "1954", "deceased": True},
        {"old_reg_no": "39", "title": "", "name": "Sanjeeb Bhushan Ghatak", "year": "1953", "deceased": False},
        {"old_reg_no": "40", "title": "", "name": "Dulal Krishna Ghosh", "year": "1956", "deceased": True},
        {"old_reg_no": "41", "title": "Dr.", "name": "Jayant Kumar Sen", "year": "1952", "deceased": True},
        {"old_reg_no": "42", "title": "", "name": "Shibdas Roy", "year": "1963", "deceased": False},
        {"old_reg_no": "43", "title": "Dr.", "name": "Kanchan Chattopadhyay", "year": "1963", "deceased": False},
        {"old_reg_no": "44", "title": "", "name": "Ashwini Bandyopadhyay", "year": "1941", "deceased": True},
        {"old_reg_no": "45", "title": "", "name": "Tapan Kumar De Sarkar", "year": "1962", "deceased": True},
        {"old_reg_no": "46", "title": "", "name": "Subrata Ghosh Dastidar", "year": "1962", "deceased": False},
        {"old_reg_no": "47", "title": "", "name": "Anshu Sengupta", "year": "1963", "deceased": True},
        {"old_reg_no": "48", "title": "", "name": "Ashish Kumar Chattopadhyay", "year": "1956", "deceased": True},
        {"old_reg_no": "49", "title": "Dr.", "name": "Kalyan Kumar Chattopadhyay", "year": "1950", "deceased": True},
        {"old_reg_no": "50", "title": "", "name": "Sunil Kumar Mukhopadhyay", "year": "1949", "deceased": True},
        {"old_reg_no": "51", "title": "", "name": "Rabin Chattopadhyay", "year": "1956", "deceased": False},
        {"old_reg_no": "52", "title": "", "name": "Delwar Ahmed", "year": "1949", "deceased": True},
        {"old_reg_no": "53", "title": "", "name": "Ajay Bhattacharya", "year": "1961", "deceased": False},
        {"old_reg_no": "54", "title": "", "name": "Barun Kanti Barman Roy", "year": "1958", "deceased": False},
        {"old_reg_no": "55", "title": "Dr.", "name": "Nandan Kumar Chakraborty", "year": "1957", "deceased": False},
        {"old_reg_no": "56", "title": "", "name": "Tamal Kumar Chakraborty", "year": "1976", "deceased": False},
    ]
    
    def convert_registration_number(old_reg_no):
        """Convert old registration number to new format BGHS-2025-XXXXXX"""
        try:
            # Handle special case like "28 ka"
            if " ka" in old_reg_no:
                old_reg_no = old_reg_no.replace(" ka", "")
            
            # Convert to integer and format with leading zeros
            reg_num = int(old_reg_no)
            new_reg_no = f"BGHS-2025-{reg_num:06d}"
            return new_reg_no
        except:
            # Fallback for any parsing issues
            return f"BGHS-2025-{old_reg_no.zfill(6)}"
    
    # Convert to CSV format
    csv_records = []
    
    for entry in alumni_data:
        # Parse name into parts
        name_parts = entry["name"].split()
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        middle_name = " ".join(name_parts[1:-1]) if len(name_parts) > 2 else ""
        
        # Generate email with corrected surnames
        email = f"{first_name.lower()}.{last_name.lower()}@bghs-alumni.com" if first_name and last_name else "alumni.member@bghs-alumni.com"
        
        # Convert registration number
        new_reg_no = convert_registration_number(entry["old_reg_no"])
        
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
            'Last Class': '12',  # Assuming Class 12 for all
            'Year of Leaving': entry["year"],
            'Start Class': '',
            'Start Year': '',
            'Batch Year': entry["year"],
            'Profession': 'Alumni',
            'Company': 'Retired',
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
    output_path = "bengali_alumni_with_registration_numbers.csv"
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"CSV file with registration numbers saved to: {output_path}")
    print(f"Total records: {len(df)}")
    print(f"Deceased records: {len(df[df['Is Deceased'] == 'true'])}")
    print(f"Living records: {len(df[df['Is Deceased'] == 'false'])}")
    
    # Show sample records with registration numbers
    print("\nSample records with registration numbers:")
    sample_df = df[['Old Registration Number', 'Registration Number', 'Title Prefix', 'First Name', 'Middle Name', 'Last Name', 'Year of Leaving', 'Is Deceased']].head(15)
    print(sample_df.to_string(index=False))
    
    # Show registration number conversion examples
    print("\nRegistration number conversion examples:")
    conversion_examples = df[['Old Registration Number', 'Registration Number']].head(10)
    print(conversion_examples.to_string(index=False))
    
    return df

if __name__ == "__main__":
    create_corrected_alumni_csv_with_registration()


