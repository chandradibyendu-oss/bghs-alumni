import { NextRequest, NextResponse } from 'next/server'
import { r2Storage } from '@/lib/r2-storage'

const TEMP_UPLOAD_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const sessionId = formData.get('sessionId') as string

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required for temporary uploads' }, { status: 400 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Upload to temporary location with session ID
    const uploadedFiles = await r2Storage.uploadEvidenceFilesToTemp(files, sessionId)

    return NextResponse.json({ 
      success: true, 
      data: {
        files: uploadedFiles,
        sessionId,
        expiresAt: new Date(Date.now() + TEMP_UPLOAD_EXPIRY).toISOString()
      }
    })
  } catch (error) {
    console.error('Temp evidence upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload evidence' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Delete temporary files
    await r2Storage.deleteTempEvidenceFiles(sessionId)

    return NextResponse.json({ success: true, message: 'Temporary files deleted' })
  } catch (error) {
    console.error('Temp evidence deletion error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete temporary files' 
    }, { status: 500 })
  }
}









