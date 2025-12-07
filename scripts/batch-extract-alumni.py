#!/usr/bin/env python3
"""
Batch Bengali Alumni Image Extractor
Process multiple images at once and combine or create separate CSV files.

Usage:
  # Process all images in a directory
  python batch-extract-alumni.py images/*.jpg --combine
  
  # Process images and create separate CSV for each
  python batch-extract-alumni.py images/*.jpg
  
  # Process images and output to specific directory
  python batch-extract-alumni.py images/*.jpg --output-dir outputs/
"""

import sys
import os
import argparse
from pathlib import Path
import pandas as pd

# Import functions from the generic extractor
# Add current directory to path to import the module
script_dir = Path(__file__).parent
sys.path.insert(0, str(script_dir))

def process_single_image(image_path: str, output_dir: str = None, combine: bool = False) -> dict:
    """Process a single image and return records"""
    print(f"\n{'='*60}")
    print(f"Processing: {image_path}")
    print(f"{'='*60}")
    
    # Extract text
    text = extract_text_from_image(image_path, use_bengali=True)
    
    if not text.strip():
        print(f"⚠️ No text extracted from {image_path}")
        return None
    
    # Parse records
    records = parse_alumni_from_text(text)
    
    if not records:
        print(f"⚠️ No alumni records found in {image_path}")
        return None
    
    print(f"✅ Found {len(records)} records")
    
    if not combine:
        # Create separate CSV for this image
        base_name = Path(image_path).stem
        output_path = os.path.join(output_dir or '', f"{base_name}_alumni.csv")
        create_csv_from_records(records, output_path)
    
    return {
        'source_image': image_path,
        'records': records,
        'count': len(records)
    }

def combine_all_records(results: list) -> list:
    """Combine all records from multiple images"""
    all_records = []
    for result in results:
        if result and result.get('records'):
            # Add source image info to notes
            for record in result['records']:
                if record.get('notes'):
                    record['notes'] += f"; Source: {Path(result['source_image']).name}"
                else:
                    record['notes'] = f"Source: {Path(result['source_image']).name}"
            all_records.extend(result['records'])
    return all_records

def main():
    parser = argparse.ArgumentParser(
        description='Batch process multiple Bengali alumni images',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process all images in directory and combine into one CSV
  python batch-extract-alumni.py images/*.jpg --combine -o combined.csv
  
  # Process images separately (one CSV per image)
  python batch-extract-alumni.py images/*.jpg --output-dir outputs/
  
  # Process specific images
  python batch-extract-alumni.py img1.jpg img2.jpg img3.jpg --combine
        """
    )
    
    parser.add_argument('images', nargs='+', help='Image files to process (supports wildcards)')
    parser.add_argument('--combine', action='store_true', help='Combine all records into one CSV file')
    parser.add_argument('-o', '--output', help='Output CSV file (required when using --combine)')
    parser.add_argument('--output-dir', help='Output directory for separate CSV files')
    parser.add_argument('--no-bengali', action='store_true', help='Skip Bengali OCR, use English only')
    
    args = parser.parse_args()
    
    # Expand wildcards if needed
    image_files = []
    for pattern in args.images:
        if '*' in pattern or '?' in pattern:
            from glob import glob
            image_files.extend(glob(pattern))
        else:
            image_files.append(pattern)
    
    # Remove duplicates and validate
    image_files = list(set(image_files))
    valid_images = []
    
    for img_path in image_files:
        if os.path.exists(img_path):
            valid_images.append(img_path)
        else:
            print(f"⚠️ Warning: Image not found: {img_path}")
    
    if not valid_images:
        print("❌ No valid image files found")
        sys.exit(1)
    
    print(f"📋 Found {len(valid_images)} image(s) to process")
    
    # Process each image
    results = []
    for img_path in valid_images:
        result = process_single_image(img_path, args.output_dir, args.combine)
        if result:
            results.append(result)
    
    if not results:
        print("\n❌ No records extracted from any images")
        sys.exit(1)
    
    # Combine if requested
    if args.combine:
        if not args.output:
            print("\n❌ Error: --output required when using --combine")
            sys.exit(1)
        
        print(f"\n{'='*60}")
        print(f"Combining all records...")
        print(f"{'='*60}")
        
        all_records = combine_all_records(results)
        create_csv_from_records(all_records, args.output)
        
        print(f"\n✅ Combined CSV created: {args.output}")
        print(f"📊 Total records from {len(results)} image(s): {len(all_records)}")
    else:
        print(f"\n✅ Processed {len(results)} image(s)")
        print(f"📊 Total records extracted: {sum(r['count'] for r in results)}")
        if args.output_dir:
            print(f"📁 Output directory: {args.output_dir}")
    
    print("\n🎉 Batch processing complete!")

if __name__ == "__main__":
    try:
        # Import the generic extractor module
        # The module name might need adjustment based on how Python imports it
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "extract_bengali_alumni_generic",
            script_dir / "extract-bengali-alumni-generic.py"
        )
        extractor_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(extractor_module)
        
        # Make functions available
        extract_text_from_image = extractor_module.extract_text_from_image
        parse_alumni_from_text = extractor_module.parse_alumni_from_text
        create_csv_from_records = extractor_module.create_csv_from_records
        
    except Exception as e:
        print(f"❌ Error: Could not import extract_bengali_alumni_generic module: {e}")
        print("   Make sure extract-bengali-alumni-generic.py is in the same directory")
        sys.exit(1)
    
    main()

