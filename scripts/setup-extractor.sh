#!/bin/bash

# Setup script for Bengali Image Extractor
echo "Setting up Bengali Image Extractor..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if tesseract is installed
if ! command -v tesseract &> /dev/null; then
    echo "Warning: Tesseract OCR is not installed."
    echo "Please install Tesseract OCR:"
    echo "  - Ubuntu/Debian: sudo apt-get install tesseract-ocr tesseract-ocr-ben"
    echo "  - macOS: brew install tesseract tesseract-lang"
    echo "  - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki"
    echo ""
    echo "Also install Bengali language pack for better OCR results."
fi

echo "Setup completed!"
echo ""
echo "Usage:"
echo "  python3 bengali-image-extractor.py <image_path> [-o output.csv] [--debug]"
echo ""
echo "Example:"
echo "  python3 bengali-image-extractor.py alumni_image.jpg -o extracted_alumni.csv --debug"





