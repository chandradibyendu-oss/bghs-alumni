import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { r2Storage } from '@/lib/r2-storage'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { extractFirstPageAsImage } from '@/lib/pdf-cover-extractor'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieClient = createRouteHandlerClient({ cookies })

    // Try to authenticate using bearer token first (from client), otherwise fall back to cookies
    const authHeader = headers().get('authorization') || headers().get('Authorization')
    const bearer = authHeader && authHeader.toLowerCase().startsWith('bearer ')
      ? (authHeader as string).split(' ')[1]
      : undefined

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let user = null as any
    if (bearer) {
      const { data } = await anonClient.auth.getUser(bearer)
      user = data.user
    } else {
      const { data } = await cookieClient.auth.getUser()
      user = data.user
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const perms = await getUserPermissions(user.id)
    const canManage = hasPermission(perms, 'can_manage_content') || hasPermission(perms, 'can_access_admin')

    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const yearStr = formData.get('year') as string
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const isPublic = formData.get('is_public') === 'true'
    const allowDownload = formData.get('allow_download') !== 'false' // Default to true

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!yearStr) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 })
    }

    const year = parseInt(yearStr, 10)
    if (isNaN(year) || year < 1900 || year > 2100) {
      return NextResponse.json({ error: 'Invalid year. Must be between 1900 and 2100' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (max 100MB for souvenir books)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 100MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload PDF to R2
    const pdfUrl = await r2Storage.uploadSouvenirPDF(
      buffer,
      year,
      file.name
    )

    // Extract first page as cover image
    let coverImageUrl: string | null = null
    try {
      console.log('Starting PDF cover extraction for year:', year)
      const coverImageBuffer = await extractFirstPageAsImage(buffer, 2)
      console.log('Cover image extracted, size:', coverImageBuffer.length, 'bytes')
      coverImageUrl = await r2Storage.uploadSouvenirCover(coverImageBuffer, year)
      console.log('Cover image uploaded successfully:', coverImageUrl)
    } catch (coverError) {
      console.error('Failed to extract cover image:', coverError)
      console.error('Error details:', {
        message: coverError instanceof Error ? coverError.message : 'Unknown error',
        stack: coverError instanceof Error ? coverError.stack : undefined
      })
      // Continue without cover image - it's optional
    }

    // Use service role client for database operations to bypass RLS
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if souvenir book for this year already exists
    const { data: existing } = await db
      .from('souvenir_books')
      .select('id')
      .eq('year', year)
      .single()

    let result
    if (existing) {
      // Update existing record
      const { data, error } = await db
        .from('souvenir_books')
        .update({
          title: title || null,
          description: description || null,
          pdf_url: pdfUrl,
          cover_image_url: coverImageUrl || null,
          file_size: file.size,
          is_public: isPublic,
          allow_download: allowDownload,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new record
      const { data, error } = await db
        .from('souvenir_books')
        .insert({
          year,
          title: title || null,
          description: description || null,
          pdf_url: pdfUrl,
          cover_image_url: coverImageUrl || null,
          file_size: file.size,
          is_public: isPublic,
          allow_download: allowDownload,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Souvenir book uploaded successfully'
    })

  } catch (error) {
    console.error('Souvenir upload error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload souvenir book',
        success: false 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

