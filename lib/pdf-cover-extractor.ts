import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// Browser setup for PDF rendering using Puppeteer
let chromium: any
let puppeteerCore: any

async function getBrowser() {
  const isServerless = 
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.cwd().includes('/var/task/') ||
    process.cwd().includes('/tmp/') ||
    (process.env.NODE_ENV === 'production' && !process.env.LOCAL_DEV)
  
  const isLocal = !isServerless && (process.env.NODE_ENV === 'development' || process.env.LOCAL_DEV === '1')
  
  if (isLocal) {
    try {
      const puppeteer = await import('puppeteer')
      return await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
    } catch (error) {
      console.error('Failed to launch local puppeteer:', error)
    }
  }
  
  try {
    if (!chromium) {
      const chromiumModule = await import('@sparticuz/chromium')
      chromium = chromiumModule.default || chromiumModule
    }
    if (!puppeteerCore) {
      const puppeteerCoreModule = await import('puppeteer-core')
      puppeteerCore = puppeteerCoreModule.default || puppeteerCoreModule
    }
    
    const executablePath = await chromium.executablePath()
    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless !== false,
    })
    
    return browser
  } catch (error) {
    console.error('Failed to launch browser:', error)
    throw error
  }
}

/**
 * Extract the first page of a PDF as an image using Puppeteer
 * @param pdfBuffer PDF file buffer
 * @param scale Scale factor for the image (default: 2 for better quality)
 * @returns Image buffer (JPEG)
 */
export async function extractFirstPageAsImage(
  pdfBuffer: Buffer,
  scale: number = 2
): Promise<Buffer> {
  let tempPdfPath: string | null = null
  let browser: any = null
  let page: any = null

  try {
    console.log('Creating temporary PDF file...')
    // Create temporary file for PDF
    const tempDir = os.tmpdir()
    const timestamp = Date.now()
    tempPdfPath = path.join(tempDir, `souvenir-${timestamp}.pdf`)
    fs.writeFileSync(tempPdfPath, pdfBuffer)
    console.log('PDF saved to temp file:', tempPdfPath)

    // Convert PDF to base64 for embedding
    const base64Pdf = pdfBuffer.toString('base64')
    const dataUrl = `data:application/pdf;base64,${base64Pdf}`
    console.log('PDF converted to base64, size:', base64Pdf.length)

    // Create HTML page that embeds the PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: white;
      overflow: hidden;
    }
    embed, iframe {
      width: 100vw;
      height: 100vh;
      border: none;
    }
  </style>
</head>
<body>
  <embed src="${dataUrl}" type="application/pdf" width="100%" height="100%" />
</body>
</html>
`
    const tempHtmlPath = path.join(tempDir, `souvenir-${timestamp}.html`)
    fs.writeFileSync(tempHtmlPath, htmlContent)
    console.log('HTML page created:', tempHtmlPath)

    // Launch browser
    console.log('Launching browser...')
    browser = await getBrowser()
    if (!browser) {
      throw new Error('Failed to launch browser')
    }
    console.log('Browser launched successfully')

    // Create new page
    page = await browser.newPage()
    page.setDefaultNavigationTimeout(60000)
    console.log('New page created')

    // Set viewport for better quality (A4 aspect ratio)
    await page.setViewport({ width: 1200, height: 1600 })
    console.log('Viewport set to 1200x1600')

    // Navigate to HTML file
    const fileUrl = `file://${tempHtmlPath.replace(/\\/g, '/')}`
    console.log('Loading HTML page from:', fileUrl)
    await page.goto(fileUrl, { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    })
    console.log('HTML page loaded')

    // Wait for PDF to render in embed
    console.log('Waiting for PDF to render...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Take screenshot of the page (first page of PDF)
    console.log('Taking screenshot of first page...')
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      fullPage: false, // Only capture viewport
    })
    console.log('Screenshot captured, size:', screenshot.length, 'bytes')

    // Cleanup HTML file
    try {
      fs.unlinkSync(tempHtmlPath)
      console.log('Temp HTML file deleted')
    } catch (e) {
      console.warn('Error deleting temp HTML file:', e)
    }

    // Optimize image with Sharp
    console.log('Optimizing image with Sharp...')
    const optimizedImage = await sharp(screenshot)
      .resize(800, null, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer()
    
    console.log('Image optimized, final size:', optimizedImage.length, 'bytes')
    return optimizedImage
  } catch (error) {
    console.error('Error extracting PDF cover:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    throw new Error(`Failed to extract PDF cover: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    // Cleanup
    if (page) {
      try {
        await page.close()
        console.log('Page closed')
      } catch (e) {
        console.warn('Error closing page:', e)
      }
    }
    if (browser) {
      try {
        await browser.close()
        console.log('Browser closed')
      } catch (e) {
        console.warn('Error closing browser:', e)
      }
    }
    if (tempPdfPath && fs.existsSync(tempPdfPath)) {
      try {
        fs.unlinkSync(tempPdfPath)
        console.log('Temp file deleted')
      } catch (e) {
        console.warn('Error deleting temp file:', e)
      }
    }
  }
}

