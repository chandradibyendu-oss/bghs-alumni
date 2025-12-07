import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
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

    // Check if user is admin or event manager
    const { data: profile } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const canUpload = profile?.role && ['super_admin', 'event_manager', 'content_creator'].includes(profile.role)

    if (!canUpload) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const eventId = formData.get('eventId') as string // Event ID for organization
    const sponsorIndex = formData.get('sponsorIndex') as string // Sponsor index in the form
    const imageType = formData.get('imageType') as string // 'logo' or 'banner'
    const sponsorTier = formData.get('sponsorTier') as string // 'Platinum', 'Gold', 'Silver', 'Bronze'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB for sponsor images)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes) as Buffer

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `sponsor-${eventId || 'temp'}-${sponsorIndex}-${imageType}-${timestamp}.${fileExtension}`

    // Optimize image based on type and tier
    let optimizedBuffer = buffer
    try {
      // Dynamically import sharp
      const sharp = await import('sharp')
      const sharpDefault = sharp.default || sharp
      
      if (imageType === 'logo') {
        // Logo: Square format, max 800x800px for Silver/Bronze
        optimizedBuffer = await sharpDefault(buffer)
          .resize(800, 800, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (imageType === 'banner') {
        // Banner: Optimize based on tier
        if (sponsorTier === 'Platinum') {
          // Platinum: 16:9 ratio, max 1920x1080px
          optimizedBuffer = await sharpDefault(buffer)
            .resize(1920, 1080, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer()
        } else if (sponsorTier === 'Gold') {
          // Gold: 4:3 ratio, max 1200x900px
          optimizedBuffer = await sharpDefault(buffer)
            .resize(1200, 900, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer()
        } else {
          // Default banner optimization
          optimizedBuffer = await sharpDefault(buffer)
            .resize(1200, 800, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer()
        }
      }

      // Upload optimized image
      const optimizedFileName = fileName.replace(/\.[^.]+$/, '.jpg')
      const result = await r2Storage.uploadFile(
        optimizedBuffer, 
        optimizedFileName, 
        'image/jpeg', 
        'events/sponsors'
      )
      return NextResponse.json({
        success: true,
        url: result.url,
        message: 'Sponsor image uploaded successfully'
      })
    } catch (sharpError) {
      // Sharp not available or error, upload original
      console.warn('Sharp optimization failed, uploading original:', sharpError)
      const result = await r2Storage.uploadFile(
        buffer, 
        fileName, 
        `image/${fileExtension}`, 
        'events/sponsors'
      )
      return NextResponse.json({
        success: true,
        url: result.url,
        message: 'Sponsor image uploaded successfully'
      })
    }

  } catch (error) {
    console.error('Sponsor image upload error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload image',
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

