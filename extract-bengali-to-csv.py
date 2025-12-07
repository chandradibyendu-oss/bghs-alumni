#!/usr/bin/env python3
"""
Extract data from Bengali text and create CSV following alumni-migration-template.csv format
"""

import pandas as pd
import re

# Bengali numeral to English mapping
BENGALI_NUMERALS = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
}

def convert_bengali_year(bengali_year: str) -> str:
    """Convert Bengali numerals to English year"""
    if not bengali_year:
        return ''
    result = ''
    for char in bengali_year:
        if char in BENGALI_NUMERALS:
            result += BENGALI_NUMERALS[char]
        else:
            result += char
    return result

# Data extracted from the image description
alumni_data = [
    {
        'number': '57',
        'bengali_name': 'অরুণময় বন্দ্যোপাধ্যায়',
        'english_name': 'Arunmoy Bandyopadhyay',
        'bengali_year': '১৯৬৯',
        'year': '1969',
        'deceased': False,
        'title': None
    },
    {
        'number': '58',
        'bengali_name': 'অমিয় কুমার সরকার',
        'english_name': 'Amiya Kumar Sarkar',
        'bengali_year': '১৯৫১',
        'year': '1951',
        'deceased': True,
        'title': None
    },
    {
        'number': '59',
        'bengali_name': 'অসীম চন্দ্র ঘোষ',
        'english_name': 'Asim Chandra Ghosh',
        'bengali_year': '১৯৫৫',
        'year': '1955',
        'deceased': False,
        'title': None
    },
    {
        'number': '60',
        'bengali_name': 'অশোক কুমার ভট্টাচার্য্য',
        'english_name': 'Ashok Kumar Bhattacharya',
        'bengali_year': '১৯৫১',
        'year': '1951',
        'deceased': False,
        'title': None
    },
    {
        'number': '61',
        'bengali_name': 'দেবাশীষ দাশগুপ্ত',
        'english_name': 'Debashish Dasgupta',
        'bengali_year': '১৯৬৩',
        'year': '1963',
        'deceased': False,
        'title': None
    },
    {
        'number': '62',
        'bengali_name': 'অঞ্জন চট্টোপাধ্যায়',
        'english_name': 'Anjan Chattopadhyay',
        'bengali_year': '১৯৭৪',
        'year': '1974',
        'deceased': False,
        'title': None
    },
    {
        'number': '63',
        'bengali_name': 'ডাঃ অশোক রায়',
        'english_name': 'Dr. Ashok Roy',
        'bengali_year': '১৯৭২',
        'year': '1972',
        'deceased': False,
        'title': 'Dr.'
    },
    {
        'number': '64',
        'bengali_name': 'প্রদীপ রায়',
        'english_name': 'Pradip Roy',
        'bengali_year': '১৯৭৪',
        'year': '1974',
        'deceased': False,
        'title': None
    },
    {
        'number': '65',
        'bengali_name': 'শম্ভু মল্লিক',
        'english_name': 'Shambhu Mallick',
        'bengali_year': '১৯৭২',
        'year': '1972',
        'deceased': True,
        'title': None
    },
    {
        'number': '66',
        'bengali_name': 'প্রদীপ কুমার গুহ',
        'english_name': 'Pradip Kumar Guha',
        'bengali_year': '১৯৬০',
        'year': '1960',
        'deceased': True,
        'title': None
    },
    {
        'number': '67',
        'bengali_name': 'সুভাষ কুমার দাস',
        'english_name': 'Subhash Kumar Das',
        'bengali_year': '১৯৬৪',
        'year': '1964',
        'deceased': False,
        'title': None
    },
    {
        'number': '68',
        'bengali_name': 'রঞ্জিত বন্দ্যোপাধ্যায়',
        'english_name': 'Ranjit Bandyopadhyay',
        'bengali_year': '১৯৬৩',
        'year': '1963',
        'deceased': False,
        'title': None
    },
    {
        'number': '69',
        'bengali_name': 'অমিতাভ গুহ',
        'english_name': 'Amitabh Guha',
        'bengali_year': '১৯৬৪',
        'year': '1964',
        'deceased': False,
        'title': None
    },
    {
        'number': '70',
        'bengali_name': 'সমীর মুখোপাধ্যায়',
        'english_name': 'Samir Mukhopadhyay',
        'bengali_year': '১৯৭১',
        'year': '1971',
        'deceased': False,
        'title': None
    },
    {
        'number': '71',
        'bengali_name': 'দেবাশীষ রায়চৌধুরী',
        'english_name': 'Debashish Roychowdhury',
        'bengali_year': '১৯৭০',
        'year': '1970',
        'deceased': False,
        'title': None
    },
    {
        'number': '72',
        'bengali_name': 'অমিতাভ রায়',
        'english_name': 'Amitabh Roy',
        'bengali_year': '১৯৮৪',
        'year': '1984',
        'deceased': False,
        'title': None
    },
    {
        'number': '72ক',
        'bengali_name': 'অসিতাভ দে',
        'english_name': 'Asitabh De',
        'bengali_year': '',
        'year': '',
        'deceased': True,
        'title': None
    },
    {
        'number': '73',
        'bengali_name': 'শিশির রায়চৌধুরী',
        'english_name': 'Shishir Roychowdhury',
        'bengali_year': '১৯৬৮',
        'year': '1968',
        'deceased': False,
        'title': None
    },
    {
        'number': '74',
        'bengali_name': 'কল্যাণব্রত চক্রবর্তী',
        'english_name': 'Kalyanabrata Chakraborty',
        'bengali_year': '',
        'year': '',
        'deceased': False,
        'title': None
    },
    {
        'number': '75',
        'bengali_name': 'অপূর্ব ঘোষ',
        'english_name': 'Apurba Ghosh',
        'bengali_year': '',
        'year': '',
        'deceased': False,
        'title': None
    },
    {
        'number': '76',
        'bengali_name': 'জয়ন্ত কুমার দাস',
        'english_name': 'Jayanta Kumar Das',
        'bengali_year': '১৯৭২',
        'year': '1972',
        'deceased': False,
        'title': None
    },
    {
        'number': '77',
        'bengali_name': 'ডাঃ দীপঙ্কর মুখার্জী',
        'english_name': 'Dr. Dipankar Mukherjee',
        'bengali_year': '',
        'year': '',
        'deceased': False,
        'title': 'Dr.'
    },
    {
        'number': '78',
        'bengali_name': 'ডাঃ ধীমান চট্টোপাধ্যায়',
        'english_name': 'Dr. Dhiman Chattopadhyay',
        'bengali_year': '১৯৮৩',
        'year': '1983',
        'deceased': False,
        'title': 'Dr.'
    },
    {
        'number': '79',
        'bengali_name': 'প্রদ্যুৎ সরকার',
        'english_name': 'Pradyut Sarkar',
        'bengali_year': '১৯৮৪',
        'year': '1984',
        'deceased': True,
        'title': None
    },
    {
        'number': '80',
        'bengali_name': 'রামপ্রসাদ সেনগুপ্ত',
        'english_name': 'Ramprasad Sengupta',
        'bengali_year': '১৯৬৭',
        'year': '1967',
        'deceased': False,
        'title': None
    },
    {
        'number': '81',
        'bengali_name': 'মধুসূদন বিশ্বাস',
        'english_name': 'Madhusudan Biswas',
        'bengali_year': '১৯৭১',
        'year': '1971',
        'deceased': False,
        'title': None
    },
    {
        'number': '82',
        'bengali_name': 'হারাধন বিশ্বাস',
        'english_name': 'Haradhan Biswas',
        'bengali_year': '১৯৭২',
        'year': '1972',
        'deceased': False,
        'title': None
    },
    {
        'number': '83',
        'bengali_name': 'বরুণ কুমার চট্টোপাধ্যায়',
        'english_name': 'Barun Kumar Chattopadhyay',
        'bengali_year': '১৯৬৭',
        'year': '1967',
        'deceased': False,
        'title': None
    },
    {
        'number': '84',
        'bengali_name': 'সমীর করগুপ্ত',
        'english_name': 'Samir Karagupta',
        'bengali_year': '১৯৭১',
        'year': '1971',
        'deceased': False,
        'title': None
    },
    {
        'number': '85',
        'bengali_name': 'ধ্রুবাশিষ প্রামাণিক',
        'english_name': 'Dhrubashish Pramanik',
        'bengali_year': '১৯৬৩',
        'year': '1963',
        'deceased': False,
        'title': None
    },
    {
        'number': '86',
        'bengali_name': 'বিমল রায়',
        'english_name': 'Bimal Roy',
        'bengali_year': '১৯৬৩',
        'year': '1963',
        'deceased': False,
        'title': None
    },
]

def parse_name(full_name: str, title: str = None) -> dict:
    """Parse full name into First, Middle, Last name components"""
    # Remove title if present
    name = full_name.replace('Dr. ', '').replace('ডাঃ ', '').strip()
    
    # Split name into parts
    parts = name.split()
    
    if len(parts) == 0:
        return {'first_name': '', 'middle_name': '', 'last_name': ''}
    elif len(parts) == 1:
        return {'first_name': parts[0], 'middle_name': '', 'last_name': ''}
    elif len(parts) == 2:
        return {'first_name': parts[0], 'middle_name': '', 'last_name': parts[1]}
    else:
        # Typically: First, Middle(s), Last
        return {
            'first_name': parts[0],
            'middle_name': ' '.join(parts[1:-1]),
            'last_name': parts[-1]
        }

def generate_email(first_name: str, last_name: str, year: str) -> str:
    """Generate placeholder email address"""
    if not first_name or not last_name:
        return ''
    
    first_lower = first_name.lower().replace(' ', '')
    last_lower = last_name.lower().replace(' ', '')
    
    if year:
        return f"{first_lower}.{last_lower}.{year}@bghs-alumni.com"
    else:
        return f"{first_lower}.{last_lower}@bghs-alumni.com"

def create_csv_rows():
    """Create CSV rows from extracted data"""
    rows = []
    
    for entry in alumni_data:
        # Parse name
        name_parts = parse_name(entry['english_name'], entry['title'])
        
        # Generate email (required field)
        email = generate_email(name_parts['first_name'], name_parts['last_name'], entry['year'])
        
        # Build notes field
        notes_parts = []
        if entry['title']:
            notes_parts.append(f"Title: {entry['title']}")
        if entry['deceased']:
            notes_parts.append("Deceased (প্রয়াত)")
        if not entry['year']:
            notes_parts.append("Year of Leaving: Not specified")
        
        notes = '; '.join(notes_parts) if notes_parts else ''
        
        # Profession - set to Doctor if has Dr. title
        profession = 'Doctor' if entry['title'] == 'Dr.' else ''
        
        # Batch Year = Year of Leaving
        batch_year = entry['year'] if entry['year'] else ''
        
        # Last Class - default to 12 (assuming they completed school)
        last_class = '12' if entry['year'] else ''
        
        row = {
            'Email': email,
            'Phone': '',  # Not available
            'First Name': name_parts['first_name'],
            'Last Name': name_parts['last_name'],
            'Middle Name': name_parts['middle_name'],
            'Last Class': last_class,
            'Year of Leaving': entry['year'],
            'Start Class': '',  # Not available
            'Start Year': '',  # Not available
            'Batch Year': batch_year,
            'Profession': profession,
            'Company': '',  # Not available
            'Location': '',  # Not available
            'Bio': '',  # Not available
            'LinkedIn URL': '',  # Not available
            'Website URL': '',  # Not available
            'Role': 'alumni_member',
            'Notes': notes
        }
        
        rows.append(row)
    
    return rows

def main():
    """Main function to generate CSV file"""
    rows = create_csv_rows()
    
    # Create DataFrame
    df = pd.DataFrame(rows)
    
    # Output CSV file
    output_file = 'bengali-alumni-extracted.csv'
    df.to_csv(output_file, index=False, encoding='utf-8')
    
    print(f"✅ Successfully created CSV file: {output_file}")
    print(f"   Total records: {len(rows)}")
    print(f"\nFirst few records:")
    print(df.head(10).to_string())
    
    # Print summary
    print(f"\n📊 Summary:")
    print(f"   - Total entries: {len(rows)}")
    print(f"   - With Year of Leaving: {len([r for r in rows if r['Year of Leaving']])}")
    print(f"   - Missing Year: {len([r for r in rows if not r['Year of Leaving']])}")
    print(f"   - Deceased: {len([r for r in rows if 'Deceased' in r['Notes']])}")
    print(f"   - Doctors: {len([r for r in rows if r['Profession'] == 'Doctor'])}")

if __name__ == '__main__':
    main()


