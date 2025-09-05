import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Create Supabase client with service role key for public directory access
const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()

    // Helper to anonymize names for public responses
    const anonymizeName = (fullName: string | null): string => {
      if (!fullName) return 'Alumni Member'
      const parts = fullName.trim().split(/\s+/)
      if (parts.length === 1) return `${parts[0].slice(0, 1)}. Alumni`
      const first = parts[0]
      const lastInitial = parts[parts.length - 1].slice(0, 1)
      return `${first} ${lastInitial}.`
    }

    // Determine if requester may view full directory
    const authHeader = request.headers.get('authorization')
    let canViewFullDirectory = false
    let tokenUserId: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '').trim()
      // Verify token and fetch user
      const { data: userResp, error: authErr } = await supabaseAdmin.auth.getUser(accessToken)
      if (!authErr && userResp?.user) {
        tokenUserId = userResp.user.id
        // Check permissions securely on the server
        const { data: perm, error: permErr } = await supabaseAdmin
          .rpc('get_user_permissions', { user_uuid: tokenUserId })
        if (!permErr && perm) {
          canViewFullDirectory = perm.can_view_directory === true
        }
      }
    }

    const selectFields = canViewFullDirectory
      ? 'id, email, full_name, batch_year, profession, company, location, bio, avatar_url, linkedin_url, website_url, created_at'
      : 'id, full_name, batch_year, created_at'

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(selectFields)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching directory users:', error)
      return NextResponse.json({ error: 'Failed to fetch alumni directory' }, { status: 500 })
    }

    // For public responses, mask names before returning
    if (!canViewFullDirectory) {
      const masked = (users || []).map((u: any) => ({
        ...u,
        full_name: anonymizeName(u.full_name || null)
      }))
      return NextResponse.json({ users: masked })
    }

    return NextResponse.json({ users: users || [] })

  } catch (error) {
    console.error('Error in directory API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

