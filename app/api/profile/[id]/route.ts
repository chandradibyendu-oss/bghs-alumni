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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const profileId = params.id

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    let viewerId: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '').trim()
      // Verify token and get user
      const { data: userResp, error: authErr } = await supabaseAdmin.auth.getUser(accessToken)
      if (!authErr && userResp?.user) {
        viewerId = userResp.user.id
      }
    }

    if (!viewerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Use the new privacy-aware function to get profile data
    const { data: profileData, error } = await supabaseAdmin
      .rpc('get_profile_data_with_privacy', {
        viewer_id: viewerId,
        target_id: profileId
      })

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    if (profileData?.error) {
      return NextResponse.json({ 
        error: profileData.error,
        reason: profileData.reason 
      }, { status: 403 })
    }

    return NextResponse.json({
      profile: profileData.profile,
      privacy_settings: profileData.privacy_settings
    })

  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
