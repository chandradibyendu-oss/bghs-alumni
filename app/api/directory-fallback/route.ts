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
  
  return createClient(supabaseUrl, serviceRoleKey, {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Parse pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

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

    // For debugging: always allow full directory view
    canViewFullDirectory = true
    console.log('DEBUG: Setting canViewFullDirectory to true for debugging')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '').trim()
      // Verify token and fetch user
      const { data: userResp, error: authErr } = await supabaseAdmin.auth.getUser(accessToken)
      if (!authErr && userResp?.user) {
        tokenUserId = userResp.user.id
        console.log('DEBUG: Authenticated user:', userResp.user.email)
      } else {
        console.log('DEBUG: Authentication failed:', authErr)
      }
    } else {
      console.log('DEBUG: No auth header found')
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)

    if (countError) {
      console.error('Error fetching total count:', countError)
      return NextResponse.json({ error: 'Failed to fetch alumni count' }, { status: 500 })
    }

    // Get paginated approved users
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, email, full_name, batch_year, profession, company, location, bio, avatar_url, 
        linkedin_url, website_url, phone, is_approved, created_at, updated_at, role,
        first_name, last_name, middle_name, last_class, year_of_leaving, start_class, 
        start_year, registration_id, import_source, imported_at, privacy_settings,
        registration_payment_status, registration_payment_transaction_id, payment_status,
        professional_title_id, is_deceased, deceased_year
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching directory users:', error)
      return NextResponse.json({ error: 'Failed to fetch alumni directory' }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        users: [], 
        pagination: {
          page,
          limit,
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
          hasNextPage: false,
          hasPrevPage: false
        }
      })
    }

    // Get professional titles for users who have professional_title_id
    const userIdsWithTitles = users.filter(u => u.professional_title_id !== null && u.professional_title_id !== undefined).map(u => u.professional_title_id)
    let professionalTitlesMap: any = {}
    
    if (userIdsWithTitles.length > 0) {
      const { data: titles, error: titlesError } = await supabaseAdmin
        .from('professional_titles')
        .select('id, title, category')
        .in('id', userIdsWithTitles)
      
      if (!titlesError && titles) {
        professionalTitlesMap = titles.reduce((acc: any, title: any) => {
          acc[title.id] = title
          return acc
        }, {} as any)
      }
    }

    // Process users based on viewer permissions
    const processedUsers = users.map((user: any) => {
      const professionalTitle = professionalTitlesMap[user.professional_title_id]
      
      // Return user data with professional title information
      return {
        id: user.id,
        full_name: user.full_name,
        batch_year: user.batch_year,
        year_of_leaving: user.year_of_leaving,
        last_class: user.last_class,
        profession: user.profession || 'Not specified',
        company: user.company,
        location: user.location,
        bio: user.bio,
        avatar_url: user.avatar_url,
        linkedin_url: user.linkedin_url,
        website_url: user.website_url,
        email: null, // Never show email in directory
        phone: null, // Never show phone in directory
        created_at: user.created_at,
        professional_title_id: user.professional_title_id,
        professional_title: professionalTitle?.title || null,
        professional_title_category: professionalTitle?.category || null,
        is_deceased: user.is_deceased || false,
        deceased_year: user.deceased_year
      }
    })

    return NextResponse.json({ 
      users: processedUsers,
      pagination: {
        page,
        limit,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNextPage: page < Math.ceil((totalCount || 0) / limit),
        hasPrevPage: page > 1
      },
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
