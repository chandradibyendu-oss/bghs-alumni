#!/usr/bin/env python3
"""
Fix Bengali extraction issues - correct middle names and surname transliterations
"""

import pandas as pd

def create_corrected_alumni_csv():
    """Create corrected CSV with proper middle names and surname transliterations"""
    
    # Corrected alumni data with proper middle names and surname transliterations
    alumni_data = [
        # Left Column entries - corrected
        {"number": "1", "title": "", "name": "Ratikanta Mukhopadhyay", "year": "1954", "deceased": False},
        {"number": "2", "title": "", "name": "Barin Kumar Chattopadhyay", "year": "1954", "deceased": True},
        {"number": "3", "title": "", "name": "Debi Prasad Sengupta", "year": "1965", "deceased": True},
        {"number": "4", "title": "", "name": "Tapan Kumar Chattopadhyay", "year": "1972", "deceased": False},
        {"number": "5", "title": "", "name": "Anjan Kumar Bandyopadhyay", "year": "1967", "deceased": True},
        {"number": "6", "title": "Dr.", "name": "Bishwatosh Basu", "year": "1953", "deceased": True},
        {"number": "7", "title": "", "name": "Kanak Chattopadhyay", "year": "1953", "deceased": True},
        {"number": "8", "title": "", "name": "Kiran Shankar Chattopadhyay", "year": "1961", "deceased": True},
        {"number": "9", "title": "Prof.", "name": "Debnath Mukhopadhyay", "year": "1965", "deceased": False},
        {"number": "10", "title": "", "name": "Dilip Chattopadhyay", "year": "", "deceased": True},
        {"number": "11", "title": "", "name": "Bankim Saha", "year": "1963", "deceased": True},
        {"number": "12", "title": "", "name": "Nishith Chattopadhyay", "year": "1945", "deceased": True},
        {"number": "13", "title": "Dr.", "name": "Manilal Mukhopadhyay", "year": "1945", "deceased": True},
        {"number": "14", "title": "", "name": "Haradhan Chattopadhyay", "year": "", "deceased": True},
        {"number": "15", "title": "Dr.", "name": "Baidyanath Mukhopadhyay", "year": "1956", "deceased": False},
        {"number": "16", "title": "Dr.", "name": "Radhika Ranjan Samaddar", "year": "1952", "deceased": False},
        {"number": "17", "title": "", "name": "Rabindranath Chattopadhyay", "year": "", "deceased": True},
        {"number": "18", "title": "Dr.", "name": "Prashant Kumar Basu", "year": "1950", "deceased": True},
        {"number": "19", "title": "", "name": "Malay Ranjan De", "year": "1974", "deceased": False},
        {"number": "20", "title": "", "name": "Prashant Bandyopadhyay", "year": "1957", "deceased": True},
        {"number": "21", "title": "", "name": "Subrata Mukhopadhyay", "year": "1971", "deceased": False},
        {"number": "22", "title": "", "name": "Hirendranath Maschatak", "year": "1963", "deceased": False},
        {"number": "23", "title": "Dr.", "name": "Dilip Kumar Mashtak", "year": "1972", "deceased": True},
        {"number": "24", "title": "Prof.", "name": "Shobhakar Gangopadhyay", "year": "1956", "deceased": False},
        {"number": "25", "title": "", "name": "Ashim Roy", "year": "1975", "deceased": False},
        {"number": "26", "title": "", "name": "Anindya Sen", "year": "1967", "deceased": False},
        {"number": "27", "title": "Dr.", "name": "Subrata Ghosh", "year": "1963", "deceased": False},
        {"number": "28", "title": "", "name": "Bishwanath Mukhopadhyay", "year": "1969", "deceased": False},
        
        # Right Column entries - corrected
        {"number": "28 ka", "title": "", "name": "Ajit Kumar Mitra", "year": "", "deceased": True},
        {"number": "29", "title": "", "name": "Barin Kumar Chattopadhyay", "year": "1954", "deceased": True},
        {"number": "30", "title": "", "name": "Tridib Paik", "year": "1966", "deceased": False},
        {"number": "31", "title": "", "name": "Pabitracharan Bhattacharya", "year": "1954", "deceased": False},
        {"number": "32", "title": "", "name": "Ajit Roy Mukhopadhyay", "year": "1926", "deceased": True},
        {"number": "33", "title": "Prof.", "name": "Sudin Chattopadhyay", "year": "1958", "deceased": False},
        {"number": "34", "title": "", "name": "Girindranath Chakraborty", "year": "1953", "deceased": True},
        {"number": "35", "title": "", "name": "Gobinda Prasad Samaddar", "year": "1967", "deceased": True},
        {"number": "36", "title": "", "name": "Prabir Kumar Sengupta", "year": "1969", "deceased": False},
        {"number": "37", "title": "", "name": "Tarun Kumar Roy", "year": "1975", "deceased": False},
        {"number": "38", "title": "", "name": "Tarun Kumar Bhattacharya", "year": "1954", "deceased": True},
        {"number": "39", "title": "", "name": "Sanjeeb Bhushan Ghatak", "year": "1953", "deceased": False},
        {"number": "40", "title": "", "name": "Dulal Krishna Ghosh", "year": "1956", "deceased": True},
        {"number": "41", "title": "Dr.", "name": "Jayant Kumar Sen", "year": "1952", "deceased": True},
        {"number": "42", "title": "", "name": "Shibdas Roy", "year": "1963", "deceased": False},
        {"number": "43", "title": "Dr.", "name": "Kanchan Chattopadhyay", "year": "1963", "deceased": False},
        {"number": "44", "title": "", "name": "Ashwini Bandyopadhyay", "year": "1941", "deceased": True},
        {"number": "45", "title": "", "name": "Tapan Kumar De Sarkar", "year": "1962", "deceased": True},
        {"number": "46", "title": "", "name": "Subrata Ghosh Dastidar", "year": "1962", "deceased": False},
        {"number": "47", "title": "", "name": "Anshu Sengupta", "year": "1963", "deceased": True},
        {"number": "48", "title": "", "name": "Ashish Kumar Chattopadhyay", "year": "1956", "deceased": True},
        {"number": "49", "title": "Dr.", "name": "Kalyan Kumar Chattopadhyay", "year": "1950", "deceased": True},
        {"number": "50", "title": "", "name": "Sunil Kumar Mukhopadhyay", "year": "1949", "deceased": True},
        {"number": "51", "title": "", "name": "Rabin Chattopadhyay", "year": "1956", "deceased": False},
        {"number": "52", "title": "", "name": "Delwar Ahmed", "year": "1949", "deceased": True},
        {"number": "53", "title": "", "name": "Ajay Bhattacharya", "year": "1961", "deceased": False},
        {"number": "54", "title": "", "name": "Barun Kanti Barman Roy", "year": "1958", "deceased": False},
        {"number": "55", "title": "Dr.", "name": "Nandan Kumar Chakraborty", "year": "1957", "deceased": False},
        {"number": "56", "title": "", "name": "Tamal Kumar Chakraborty", "year": "1976", "deceased": False},
    ]
    
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
        
        # Create record
        record = {
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
            'Notes': f'Entry #{entry["number"]}'
        }
        
        csv_records.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(csv_records)
    
    # Save to CSV
    output_path = "bengali_alumni_corrected_extraction.csv"
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"Corrected CSV file saved to: {output_path}")
    print(f"Total records: {len(df)}")
    print(f"Deceased records: {len(df[df['Is Deceased'] == 'true'])}")
    print(f"Living records: {len(df[df['Is Deceased'] == 'false'])}")
    
    # Show sample records with middle names
    print("\nSample records with corrected middle names:")
    sample_df = df[['Title Prefix', 'First Name', 'Middle Name', 'Last Name', 'Year of Leaving', 'Is Deceased']].head(15)
    print(sample_df.to_string(index=False))
    
    # Show records with Mukhopadhyay surname
    print("\nRecords with Mukhopadhyay surname:")
    mukhopadhyay_df = df[df['Last Name'] == 'Mukhopadhyay'][['Title Prefix', 'First Name', 'Middle Name', 'Last Name', 'Year of Leaving', 'Is Deceased']]
    print(mukhopadhyay_df.to_string(index=False))
    
    return df

if __name__ == "__main__":
    create_corrected_alumni_csv()


