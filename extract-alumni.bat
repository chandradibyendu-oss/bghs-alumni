@echo off
echo ========================================
echo BGHS Alumni Image Extraction Tool
echo ========================================
echo.

if "%1"=="" (
    echo Usage: extract-alumni.bat "image_filename.jpg"
    echo.
    echo Example: extract-alumni.bat "alumni_list.jpg"
    echo.
    pause
    exit /b 1
)

set IMAGE_FILE=%1
set CSV_FILE=%~n1_extracted.csv

echo Processing image: %IMAGE_FILE%
echo Output CSV: %CSV_FILE%
echo.

REM Check if image file exists
if not exist "%IMAGE_FILE%" (
    echo Error: Image file "%IMAGE_FILE%" not found!
    echo.
    pause
    exit /b 1
)

REM Run the Python script
echo Running Python extraction script...
python3 scripts/bengali-image-extractor.py "%IMAGE_FILE%" -o "%CSV_FILE%" --debug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! CSV file created: %CSV_FILE%
    echo ========================================
    echo.
    echo Opening CSV file...
    start "" "%CSV_FILE%"
) else (
    echo.
    echo ========================================
    echo ERROR! Extraction failed.
    echo ========================================
    echo.
    echo Please check:
    echo 1. Python packages are installed
    echo 2. Tesseract OCR is installed
    echo 3. Image file is readable
    echo.
)

echo.
pause





