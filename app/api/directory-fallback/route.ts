import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Create Supabase client with service role key
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

    // Get all approved users (bypass privacy system for now)
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, full_name, batch_year, profession, company, location, 
        bio, avatar_url, linkedin_url, website_url, created_at,
        is_approved
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching directory users:', error)
      return NextResponse.json({ error: 'Failed to fetch alumni directory' }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Process users based on viewer permissions
    const processedUsers = users.map((user: any) => {
      if (canViewFullDirectory) {
        // Full access - show all data
        return {
          id: user.id,
          full_name: user.full_name,
          batch_year: user.batch_year,
          profession: user.profession || 'Not specified',
          company: user.company,
          location: user.location,
          bio: user.bio,
          avatar_url: user.avatar_url,
          linkedin_url: user.linkedin_url,
          website_url: user.website_url,
          email: null, // Never show email in directory
          phone: null, // Never show phone in directory
          created_at: user.created_at
        }
      } else {
        // Limited access - anonymized data
        return {
          id: user.id,
          full_name: anonymizeName(user.full_name),
          batch_year: user.batch_year,
          profession: 'BGHS Alumni',
          company: null,
          location: null,
          bio: null,
          avatar_url: null,
          linkedin_url: null,
          website_url: null,
          email: null,
          phone: null,
          created_at: user.created_at
        }
      }
    })

    return NextResponse.json({ 
      users: processedUsers,
      viewer_permissions: {
        can_view_full_directory: canViewFullDirectory,
        is_authenticated: !!tokenUserId
      }
    })

  } catch (error) {
    console.error('Error in directory API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
