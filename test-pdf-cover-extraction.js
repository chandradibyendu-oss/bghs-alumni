// Test script to verify PDF cover extraction
const fs = require('fs')
const path = require('path')

async function testPdfCoverExtraction() {
  try {
    console.log('Testing PDF cover extraction...')
    
    // Import the extraction function
    const { extractFirstPageAsImage } = require('./lib/pdf-cover-extractor.ts')
    
    // Check if there's a test PDF file
    const testPdfPath = process.argv[2] || path.join(__dirname, 'test.pdf')
    
    if (!fs.existsSync(testPdfPath)) {
      console.error('❌ Test PDF file not found:', testPdfPath)
      console.log('Usage: node test-pdf-cover-extraction.js [path-to-pdf-file]')
      return
    }
    
    console.log('📄 Reading PDF file:', testPdfPath)
    const pdfBuffer = fs.readFileSync(testPdfPath)
    console.log('✅ PDF loaded, size:', pdfBuffer.length, 'bytes')
    
    console.log('🖼️  Extracting first page as image...')
    const imageBuffer = await extractFirstPageAsImage(pdfBuffer, 2)
    
    console.log('✅ Image extracted successfully!')
    console.log('📊 Image size:', imageBuffer.length, 'bytes')
    console.log('📊 Image size (KB):', (imageBuffer.length / 1024).toFixed(2))
    
    // Save the extracted image for verification
    const outputPath = path.join(__dirname, 'test-cover-output.jpg')
    fs.writeFileSync(outputPath, imageBuffer)
    console.log('💾 Image saved to:', outputPath)
    console.log('✅ Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    process.exit(1)
  }
}

testPdfCoverExtraction()

