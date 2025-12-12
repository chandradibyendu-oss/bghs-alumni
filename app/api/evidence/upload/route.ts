import { NextRequest, NextResponse } from 'next/server'
import { r2Storage } from '@/lib/r2-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const userId = formData.get('userId') as string

    // Validate input
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate file count
    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 files allowed' },
        { status: 400 }
      )
    }

    // Upload files to R2
    const uploadResult = await r2Storage.uploadEvidenceFiles(files, userId)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadResult.files.length} file(s)`,
      data: {
        files: uploadResult.files,
        totalSize: uploadResult.totalSize,
        totalFiles: uploadResult.files.length
      }
    })

  } catch (error) {
    console.error('Evidence upload error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload evidence files',
        success: false 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  const { getCorsHeaders } = await import('@/lib/cors-utils')
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  })
}
