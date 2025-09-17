import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { r2Storage } from '@/lib/r2-storage'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieClient = createRouteHandlerClient({ cookies })

    // Try bearer token first (from client), otherwise fall back to cookies
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Limit avatar size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
    const fileName = `${user.id}_${timestamp}.${fileExtension}`

    // Optionally process image (resize to max 512px)
    let uploadBuffer: Buffer = buffer
    let mimeType = file.type
    try {
      const sharp = await import('sharp')
      const processed = await sharp.default(buffer)
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()
      uploadBuffer = Buffer.from(processed)
      mimeType = 'image/jpeg'
    } catch {
      // If sharp isn't available in the environment, proceed with original file
    }

    // Upload to R2 under avatars/
    const r2Response = await r2Storage.uploadFile(
      uploadBuffer,
      fileName,
      mimeType,
      'avatars'
    )

    // Update profile avatar_url using service role to ensure permission
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await db
      .from('profiles')
      .update({ avatar_url: r2Response.url, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ avatar_url: r2Response.url }, { status: 200 })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


