import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    const filePath = join(process.cwd(), 'public', 'gallery', filename)
    
    const fileBuffer = await readFile(filePath)
    
    // Determine content type based on file extension
    const contentType = filename.endsWith('.jpg') || filename.endsWith('.jpeg') 
      ? 'image/jpeg' 
      : filename.endsWith('.png') 
      ? 'image/png' 
      : 'application/octet-stream'
    
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Image not found', { status: 404 })
  }
}
