import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { r2Storage } from '@/lib/r2-storage'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'

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

    // Check if user can upload blog images
    const perms = await getUserPermissions(user.id)
    const canUpload = hasPermission(perms, 'can_create_blog') || 
                     hasPermission(perms, 'can_edit_blog') || 
                     hasPermission(perms, 'can_access_admin')

    if (!canUpload) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const blogId = formData.get('blogId') as string // Optional - can be 'temp' for drafts

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 10MB for blog images)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to R2
    const imageUrl = await r2Storage.uploadBlogImage(
      buffer,
      blogId || `temp-${Date.now()}`,
      file.name
    )

    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('Blog image upload error:', error)
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
export async function OPTIONS(request: NextRequest) {
  const { getCorsHeaders } = await import('@/lib/cors-utils')
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  })
}

