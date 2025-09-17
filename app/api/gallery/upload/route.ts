import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { r2Storage } from '@/lib/r2-storage'

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

    // Use service role client for database operations to bypass RLS
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check permissions - simplified for now, will be handled by RLS policies
    const { data: profile } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const canCreate = profile?.role && ['content_creator', 'content_moderator', 'super_admin'].includes(profile.role)

    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const eventId = formData.get('eventId') as string

    if (!file || !title || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 50MB for R2)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}_${timestamp}.${fileExtension}`

    // Upload to R2 Storage
    console.log('Uploading to R2...')
    
    // Upload original file to R2
    const r2Response = await r2Storage.uploadFile(
      buffer,
      fileName,
      file.type,
      'gallery'
    )
    
    console.log('Original file uploaded to R2:', r2Response.key)

    // Create and upload thumbnail
    let thumbnailResponse = null
    try {
      const sharp = await import('sharp')
      const thumbnailBuffer = await sharp.default(buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer()

      const thumbnailFileName = `thumb_${fileName}`
      
      thumbnailResponse = await r2Storage.uploadFile(
        thumbnailBuffer,
        thumbnailFileName,
        'image/jpeg',
        'gallery/thumbnails'
      )
      
      console.log('Thumbnail uploaded to R2:', thumbnailResponse.key)
    } catch (error) {
      console.warn('Sharp not available, skipping thumbnail generation:', error)
    }

    // Get image dimensions
    let width = 0, height = 0
    try {
      const sharp = await import('sharp')
      const metadata = await sharp.default(buffer).metadata()
      width = metadata.width || 0
      height = metadata.height || 0
    } catch (error) {
      console.warn('Could not get image dimensions')
    }

    // Store metadata in database
    const { data: photo, error } = await db
      .from('gallery_photos')
      .insert({
        title,
        description,
        category_id: categoryId,
        event_id: eventId || null,
        uploaded_by: user.id,
        file_url: r2Response.url,
        thumbnail_url: thumbnailResponse?.url || null,
        file_size: file.size,
        width,
        height,
        is_approved: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving photo metadata:', error)
      return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 })
    }

    return NextResponse.json({ 
      photo,
      message: 'Photo uploaded successfully to R2 storage!' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error in upload API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}