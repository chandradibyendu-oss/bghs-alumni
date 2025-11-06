@echo off
echo Installing Python dependencies for Bengali Image Extractor...
echo.

echo Installing required packages...
pip install -r requirements.txt

echo.
echo Installing Tesseract OCR (if not already installed)...
echo Note: You may need to install Tesseract OCR manually from: https://github.com/UB-Mannheim/tesseract/wiki
echo.

echo Setup complete!
echo.
echo To test the installation, run:
echo python scripts/bengali-image-extractor.py --help
pause


