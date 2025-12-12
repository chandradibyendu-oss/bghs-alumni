import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // Use service role client for database operations to bypass RLS
    // RLS policies will handle visibility based on is_public and authentication
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch souvenir books - RLS will filter based on user authentication
    // For public users, only show is_public = true
    // For authenticated users, show all
    const { data: souvenirBooks, error } = await db
      .from('souvenir_books')
      .select('*')
      .order('year', { ascending: false })

    if (error) throw error

    // If user is not authenticated, filter to only public books
    const filteredBooks = user 
      ? souvenirBooks 
      : (souvenirBooks || []).filter((book: any) => book.is_public === true)

    return NextResponse.json({
      success: true,
      data: filteredBooks || []
    })

  } catch (error) {
    const { handleApiError } = await import('@/lib/error-handler')
    const response = handleApiError(error, 'Souvenir fetch')
    // Add empty data array for consistency
    const body = await response.json()
    return NextResponse.json({ ...body, data: [] }, { status: response.status })
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

