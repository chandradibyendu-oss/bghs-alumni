#!/usr/bin/env python3
"""
Create proper CSV from extracted alumni data
"""

import pandas as pd

# Sample data based on the image description
alumni_records = [
    {
        'Title Prefix': '',
        'First Name': 'Ratikanta',
        'Middle Name': '',
        'Last Name': 'Mukherjee',
        'Year of Leaving': '1954',
        'Is Deceased': 'false',
        'Deceased Year': ''
    },
    {
        'Title Prefix': 'Dr.',
        'First Name': 'Bishwatosh',
        'Middle Name': '',
        'Last Name': 'Basu',
        'Year of Leaving': '1953',
        'Is Deceased': 'true',
        'Deceased Year': ''
    },
    {
        'Title Prefix': 'Prof.',
        'First Name': 'Debnath',
        'Middle Name': '',
        'Last Name': 'Mukherjee',
        'Year of Leaving': '1965',
        'Is Deceased': 'false',
        'Deceased Year': ''
    },
    {
        'Title Prefix': '',
        'First Name': 'Gobinda',
        'Middle Name': 'Prasad',
        'Last Name': 'Samaddar',
        'Year of Leaving': '1967',
        'Is Deceased': 'true',
        'Deceased Year': ''
    },
    {
        'Title Prefix': '',
        'First Name': 'Ajit',
        'Middle Name': 'Kumar',
        'Last Name': 'Mitra',
        'Year of Leaving': '',
        'Is Deceased': 'true',
        'Deceased Year': ''
    },
    {
        'Title Prefix': '',
        'First Name': 'Barin',
        'Middle Name': 'Kumar',
        'Last Name': 'Chattopadhyay',
        'Year of Leaving': '1954',
        'Is Deceased': 'true',
        'Deceased Year': ''
    },
    {
        'Title Prefix': 'Dr.',
        'First Name': 'Dilip',
        'Middle Name': 'Kumar',
        'Last Name': 'Mashtak',
        'Year of Leaving': '1972',
        'Is Deceased': 'true',
        'Deceased Year': ''
    },
    {
        'Title Prefix': '',
        'First Name': 'Tamal',
        'Middle Name': 'Kumar',
        'Last Name': 'Chakraborty',
        'Year of Leaving': '1976',
        'Is Deceased': 'false',
        'Deceased Year': ''
    }
]

# Create DataFrame
df = pd.DataFrame(alumni_records)

# Add missing columns with default values
df['Email'] = ''
df['Phone'] = ''
df['Last Class'] = ''
df['Start Class'] = ''
df['Start Year'] = ''
df['Batch Year'] = ''
df['Profession'] = 'Alumni'
df['Company'] = 'Retired'
df['Location'] = 'Kolkata'
df['Bio'] = 'BGHS Alumni'
df['LinkedIn URL'] = ''
df['Website URL'] = ''
df['Role'] = 'alumni_member'
df['Notes'] = ''

# Generate email addresses
for idx, row in df.iterrows():
    first_name = row['First Name'].lower() if row['First Name'] else 'alumni'
    last_name = row['Last Name'].lower() if row['Last Name'] else 'member'
    df.at[idx, 'Email'] = f"{first_name}.{last_name}@bghs-alumni.com"

# Set batch year same as year of leaving for now
df['Batch Year'] = df['Year of Leaving']

# Reorder columns to match the expected format
required_columns = [
    'Email', 'Phone', 'Title Prefix', 'First Name', 'Middle Name', 'Last Name',
    'Last Class', 'Year of Leaving', 'Start Class', 'Start Year', 'Batch Year',
    'Profession', 'Company', 'Location', 'Bio', 'LinkedIn URL', 'Website URL',
    'Role', 'Is Deceased', 'Deceased Year', 'Notes'
]

df = df[required_columns]

# Save to CSV
output_path = "extracted_alumni_proper.csv"
df.to_csv(output_path, index=False, encoding='utf-8')

print(f"CSV file saved to: {output_path}")
print(f"Total records: {len(df)}")
print("\nFirst few records:")
print(df.head())


