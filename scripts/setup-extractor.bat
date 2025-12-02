@echo off
echo Setting up Bengali Image Extractor...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: pip is not installed. Please install pip first.
    pause
    exit /b 1
)

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Check if tesseract is installed
tesseract --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Tesseract OCR is not installed.
    echo Please install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki
    echo Also install Bengali language pack for better OCR results.
)

echo Setup completed!
echo.
echo Usage:
echo   python bengali-image-extractor.py ^<image_path^> [-o output.csv] [--debug]
echo.
echo Example:
echo   python bengali-image-extractor.py alumni_image.jpg -o extracted_alumni.csv --debug
pause





