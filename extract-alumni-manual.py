#!/usr/bin/env python3
"""
Manual Alumni Data Entry Tool
Creates CSV template for manual data entry from Bengali alumni images
"""

import sys
import os
import pandas as pd
from datetime import datetime

def create_csv_template(image_filename):
    """Create a CSV template for manual data entry"""
    
    # Generate output filename
    base_name = os.path.splitext(image_filename)[0]
    csv_filename = f"{base_name}_manual_extraction.csv"
    
    # Create sample data template
    sample_data = [
        {
            'Old Registration Number': '1',
            'Registration Number': 'BGHSA-2025-00001',
            'Email': 'alumni1@bghs-alumni.com',
            'Phone': '',
            'Title Prefix': '',
            'First Name': 'Sample',
            'Middle Name': '',
            'Last Name': 'Alumni',
            'Last Class': '12',
            'Year of Leaving': '2000',
            'Start Class': '',
            'Start Year': '',
            'Batch Year': '2000',
            'Profession': 'Alumni',
            'Company': '',
            'Location': 'Kolkata',
            'Bio': 'BGHS Alumni',
            'LinkedIn URL': '',
            'Website URL': '',
            'Role': 'alumni_member',
            'Is Deceased': 'false',
            'Deceased Year': '',
            'Notes': 'Please manually extract data from image'
        },
        {
            'Old Registration Number': '2',
            'Registration Number': 'BGHSA-2025-00002',
            'Email': 'alumni2@bghs-alumni.com',
            'Phone': '',
            'Title Prefix': 'Dr.',
            'First Name': 'Sample',
            'Middle Name': '',
            'Last Name': 'Doctor',
            'Last Class': '12',
            'Year of Leaving': '1995',
            'Start Class': '',
            'Start Year': '',
            'Batch Year': '1995',
            'Profession': 'Alumni',
            'Company': 'Medical Practice',
            'Location': 'Kolkata',
            'Bio': 'BGHS Alumni',
            'LinkedIn URL': '',
            'Website URL': '',
            'Role': 'alumni_member',
            'Is Deceased': 'false',
            'Deceased Year': '',
            'Notes': 'Please manually extract data from image'
        }
    ]
    
    # Create DataFrame
    df = pd.DataFrame(sample_data)
    
    # Save to CSV
    df.to_csv(csv_filename, index=False, encoding='utf-8')
    
    print(f"✅ CSV template created: {csv_filename}")
    print(f"📋 Template contains {len(sample_data)} sample entries")
    print(f"📝 Please manually extract data from the image and update the CSV file")
    print(f"🔄 Use the improved company field logic:")
    print(f"   - Deceased members → Company: 'Deceased'")
    print(f"   - Dr. titles → Company: 'Medical Practice'")
    print(f"   - Prof. titles → Company: 'Academic Institution'")
    print(f"   - Others → Company: '' (empty)")
    
    return csv_filename

def main():
    if len(sys.argv) != 2:
        print("Usage: python extract-alumni-manual.py <image_filename>")
        print("Example: python extract-alumni-manual.py alumni_list.jpg")
        sys.exit(1)
    
    image_filename = sys.argv[1]
    
    if not os.path.exists(image_filename):
        print(f"❌ Error: Image file '{image_filename}' not found!")
        sys.exit(1)
    
    print("=" * 50)
    print("BGHS Alumni Manual Data Entry Tool")
    print("=" * 50)
    print(f"📁 Processing image: {image_filename}")
    
    try:
        csv_filename = create_csv_template(image_filename)
        print(f"\n🎉 Success! Open the CSV file to manually extract data:")
        print(f"📂 {csv_filename}")
        
        # Try to open the CSV file
        try:
            import subprocess
            import platform
            
            if platform.system() == 'Windows':
                os.startfile(csv_filename)
            elif platform.system() == 'Darwin':  # macOS
                subprocess.run(['open', csv_filename])
            else:  # Linux
                subprocess.run(['xdg-open', csv_filename])
        except:
            print(f"💡 Please manually open: {csv_filename}")
            
    except Exception as e:
        print(f"❌ Error creating CSV template: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()


