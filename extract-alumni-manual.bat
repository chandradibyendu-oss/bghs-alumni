@echo off
echo ========================================
echo BGHS Alumni Manual Data Entry Tool
echo ========================================
echo.

if "%1"=="" (
    echo Usage: extract-alumni-manual.bat "image_filename.jpg"
    echo.
    echo Example: extract-alumni-manual.bat "alumni_list.jpg"
    echo.
    echo This tool creates a CSV template for manual data entry
    echo from Bengali alumni images.
    echo.
    pause
    exit /b 1
)

set IMAGE_FILE=%1

echo Processing image: %IMAGE_FILE%
echo.

REM Check if image file exists
if not exist "%IMAGE_FILE%" (
    echo Error: Image file "%IMAGE_FILE%" not found!
    echo.
    pause
    exit /b 1
)

REM Run the Python manual extraction tool
echo Running manual extraction tool...
python3 extract-alumni-manual.py "%IMAGE_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! CSV template created.
    echo ========================================
    echo.
    echo The CSV file has been opened for you to manually
    echo extract data from the Bengali alumni image.
    echo.
    echo Remember to apply the company field logic:
    echo - Deceased members → Company: "Deceased"
    echo - Dr. titles → Company: "Medical Practice"
    echo - Prof. titles → Company: "Academic Institution"
    echo - Others → Company: "" (empty)
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR! Manual extraction failed.
    echo ========================================
    echo.
    echo Please check:
    echo 1. Python is installed
    echo 2. pandas package is installed
    echo 3. Image file is readable
    echo.
)

echo.
pause


