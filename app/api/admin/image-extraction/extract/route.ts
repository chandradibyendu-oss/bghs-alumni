import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null
  
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Create temporary file
    const tempDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const fileExtension = path.extname(file.name).toLowerCase()
    const tempFileName = `extraction-${Date.now()}${fileExtension}`
    tempFilePath = path.join(tempDir, tempFileName)
    
    // Write file to temporary location
    const buffer = await file.arrayBuffer()
    fs.writeFileSync(tempFilePath, Buffer.from(buffer))

    // Run the Python extraction script
    const scriptPath = path.join(process.cwd(), 'scripts', 'bengali-image-extractor.py')
    const outputPath = path.join(tempDir, `output-${Date.now()}.csv`)
    
    try {
      // Execute the Python script
      const { stdout, stderr } = await execAsync(
        `python3 "${scriptPath}" "${tempFilePath}" -o "${outputPath}" --debug`,
        { timeout: 60000 } // 60 second timeout
      )

      if (stderr && !stderr.includes('Warning')) {
        console.error('Python script stderr:', stderr)
      }

      // Read the output CSV file
      let csvData = ''
      let alumniRecords: any[] = []
      
      if (fs.existsSync(outputPath)) {
        csvData = fs.readFileSync(outputPath, 'utf-8')
        
        // Parse CSV to get alumni records
        const lines = csvData.split('\n')
        if (lines.length > 1) {
          const headers = lines[0].split(',')
          alumniRecords = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',')
              const record: any = {}
              headers.forEach((header, index) => {
                record[header.trim()] = values[index]?.trim() || ''
              })
              return record
            })
        }
      }

      // Extract text from stdout for debugging
      const extractedText = stdout || 'No text extracted'

      return NextResponse.json({
        success: true,
        extractedText: extractedText,
        alumniRecords: alumniRecords,
        csvData: csvData,
        message: `Successfully extracted ${alumniRecords.length} alumni records`
      })

    } catch (pythonError) {
      console.error('Python script error:', pythonError)
      
      // Fallback: Try to extract text using basic OCR if available
      try {
        const { stdout } = await execAsync(`python3 -c "
import cv2
import pytesseract
import sys

try:
    image = cv2.imread('${tempFilePath}')
    if image is not None:
        text = pytesseract.image_to_string(image, config='--oem 3 --psm 6 -l ben')
        print(text.strip())
    else:
        print('Could not load image')
except Exception as e:
    print(f'Error: {e}')
"`, { timeout: 30000 })

        return NextResponse.json({
          success: true,
          extractedText: stdout || 'No text extracted',
          alumniRecords: [],
          csvData: '',
          message: 'Text extracted but parsing failed. Please check the extracted text manually.'
        })

      } catch (fallbackError) {
        console.error('Fallback extraction error:', fallbackError)
        
        return NextResponse.json({
          success: false,
          error: 'Failed to extract text from image. Please ensure the image is clear and contains Bengali text.'
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('Image extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    // Cleanup temporary files
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath)
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError)
      }
    }
  }
}





