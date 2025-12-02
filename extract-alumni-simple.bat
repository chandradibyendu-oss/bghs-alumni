@echo off
echo ========================================
echo BGHS Alumni Image Extraction Tool (Simple)
echo ========================================
echo.

if "%1"=="" (
    echo Usage: extract-alumni-simple.bat "image_filename.jpg"
    echo.
    echo Example: extract-alumni-simple.bat "alumni_list.jpg"
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

REM Try to run the Python script
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
    echo Python script failed. Trying fallback...
    echo ========================================
    echo.
    
    REM Create a basic CSV template
    echo Creating basic CSV template...
    echo Old Registration Number,Registration Number,Email,Phone,Title Prefix,First Name,Middle Name,Last Name,Last Class,Year of Leaving,Start Class,Start Year,Batch Year,Profession,Company,Location,Bio,LinkedIn URL,Website URL,Role,Is Deceased,Deceased Year,Notes > "%CSV_FILE%"
    echo "Manual Entry 1","BGHSA-2025-00001","alumni@bghs-alumni.com","","","First","Middle","Last","12","2000","","","2000","Alumni","","Kolkata","BGHS Alumni","","","alumni_member","false","","Please manually extract data from image" >> "%CSV_FILE%"
    
    echo.
    echo ========================================
    echo Basic CSV template created: %CSV_FILE%
    echo ========================================
    echo.
    echo Please manually extract data from the image and update the CSV file.
    echo.
    echo Opening CSV file...
    start "" "%CSV_FILE%"
)

echo.
pause





