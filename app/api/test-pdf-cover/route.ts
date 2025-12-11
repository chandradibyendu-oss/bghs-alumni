import { NextRequest, NextResponse } from 'next/server'
import { extractFirstPageAsImage } from '@/lib/pdf-cover-extractor'
import { r2Storage } from '@/lib/r2-storage'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    console.log('📄 Testing PDF cover extraction...')
    console.log('File name:', file.name)
    console.log('File size:', file.size, 'bytes')

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('🖼️  Extracting first page as image...')
    const imageBuffer = await extractFirstPageAsImage(buffer, 2)

    console.log('✅ Image extracted successfully!')
    console.log('Image size:', imageBuffer.length, 'bytes')

    // Test upload to R2 (optional - just to verify the full flow)
    const testYear = 2025
    let uploadUrl: string | null = null
    
    try {
      uploadUrl = await r2Storage.uploadSouvenirCover(imageBuffer, testYear)
      console.log('✅ Image uploaded to R2:', uploadUrl)
    } catch (uploadError) {
      console.warn('⚠️  Upload failed (this is OK for testing):', uploadError)
    }

    // Return success with image data
    return NextResponse.json({
      success: true,
      message: 'PDF cover extraction test successful',
      imageSize: imageBuffer.length,
      imageSizeKB: (imageBuffer.length / 1024).toFixed(2),
      uploadUrl: uploadUrl,
      // Return image as base64 for preview (optional)
      imageBase64: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET endpoint for instructions
export async function GET() {
  return NextResponse.json({
    message: 'PDF Cover Extraction Test Endpoint',
    instructions: {
      method: 'POST',
      contentType: 'multipart/form-data',
      body: {
        file: 'PDF file to test'
      },
      example: 'Use a form with file input or Postman to POST a PDF file'
    }
  })
}

