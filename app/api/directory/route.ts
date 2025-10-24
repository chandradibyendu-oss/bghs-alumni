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

    // Get all approved users who allow directory visibility
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, full_name, batch_year, profession, company, location, 
        bio, avatar_url, linkedin_url, website_url, created_at,
        is_approved, privacy_settings, professional_title_id,
        professional_titles(title, category)
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

    // Filter and process users based on privacy settings and viewer permissions
    const processedUsers = await Promise.all(
      users.map(async (user: any) => {
        // Check if user allows directory visibility
        const allowsDirectory = await supabaseAdmin
          .rpc('user_allows_privacy_setting', {
            user_id: user.id,
            setting_key: 'show_in_directory'
          })

        // If user doesn't allow directory visibility, skip them
        if (!allowsDirectory.data) {
          return null
        }

        // If viewer can see full directory, get privacy-filtered data
        if (canViewFullDirectory && tokenUserId) {
          const { data: profileData } = await supabaseAdmin
            .rpc('get_profile_data_with_privacy', {
              viewer_id: tokenUserId,
              target_id: user.id
            })

          if (profileData?.profile) {
            return {
              ...profileData.profile,
              // Ensure we have the basic fields for directory display
              id: user.id,
              full_name: profileData.profile.full_name || user.full_name,
              batch_year: user.batch_year,
              // Only include fields that are allowed by privacy settings
              profession: profileData.profile.profession,
              company: profileData.profile.company,
              location: profileData.profile.location,
              bio: profileData.profile.bio,
              avatar_url: profileData.profile.avatar_url,
              linkedin_url: profileData.profile.linkedin_url,
              website_url: profileData.profile.website_url,
              email: profileData.profile.email,
              phone: profileData.profile.phone,
              created_at: user.created_at,
              // Include professional title information
              professional_title_id: user.professional_title_id,
              professional_title: user.professional_titles?.title || null,
              professional_title_category: user.professional_titles?.category || null
            }
          }
        }

        // For public or limited access, return basic anonymized data
        return {
          id: user.id,
          full_name: canViewFullDirectory ? user.full_name : anonymizeName(user.full_name),
          batch_year: user.batch_year,
          profession: canViewFullDirectory ? user.profession : 'BGHS Alumni',
          company: canViewFullDirectory ? user.company : null,
          location: canViewFullDirectory ? user.location : null,
          bio: canViewFullDirectory ? user.bio : null,
          avatar_url: canViewFullDirectory ? user.avatar_url : null,
          linkedin_url: canViewFullDirectory ? user.linkedin_url : null,
          website_url: canViewFullDirectory ? user.website_url : null,
          email: null, // Never show email in directory
          phone: null, // Never show phone in directory
          created_at: user.created_at,
          // Include professional title information (only for authenticated users)
          professional_title_id: canViewFullDirectory ? user.professional_title_id : null,
          professional_title: canViewFullDirectory ? (user.professional_titles?.title || null) : null,
          professional_title_category: canViewFullDirectory ? (user.professional_titles?.category || null) : null
        }
      })
    )

    // Filter out null entries (users who don't allow directory visibility)
    const filteredUsers = processedUsers.filter(user => user !== null)

    return NextResponse.json({ 
      users: filteredUsers,
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

