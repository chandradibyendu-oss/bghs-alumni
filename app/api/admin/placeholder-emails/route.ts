import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to detect placeholder email
function isPlaceholderEmail(email: string): boolean {
  const placeholderPattern = /^[A-Za-z0-9]+@alumnibghs\.org$/i
  return placeholderPattern.test(email.trim())
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'super_admin' && profile.role !== 'alumni_premium' && profile.role !== 'content_moderator')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const filterYear = searchParams.get('filterYear') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Fetch all profiles
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, registration_id, year_of_leaving, batch_year, last_class, phone, created_at, updated_at, is_approved, role', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Filter by placeholder email pattern using SQL pattern matching
    query = query.ilike('email', '%@alumnibghs.org')

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,registration_id.ilike.%${search}%`)
    }

    // Apply year filter
    if (filterYear) {
      query = query.eq('year_of_leaving', parseInt(filterYear))
    }

    // Get total count and paginated results
    const { data: profiles, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching placeholder emails:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Filter by exact placeholder pattern (client-side filtering for precision)
    const placeholderUsers = (profiles || []).filter(p => isPlaceholderEmail(p.email || ''))

    // Get total count of placeholder emails - fetch all matching emails and filter
    const { data: allMatchingProfiles } = await supabase
      .from('profiles')
      .select('email')
      .ilike('email', '%@alumnibghs.org')

    // Apply exact placeholder email pattern match
    const filteredForCount = (allMatchingProfiles || []).filter(p => isPlaceholderEmail(p.email || '')).length

    // Get available years for filter - fetch all placeholder users to get unique years
    const { data: allPlaceholderUsers } = await supabase
      .from('profiles')
      .select('year_of_leaving')
      .ilike('email', '%@alumnibghs.org')
      .not('year_of_leaving', 'is', null)

    const uniqueYears = Array.from(new Set(
      (allPlaceholderUsers || [])
        .map(p => p.year_of_leaving)
        .filter((year): year is number => year !== null && year !== undefined)
    )).sort((a, b) => b - a)

    return NextResponse.json({
      users: placeholderUsers,
      total: filteredForCount,
      page,
      limit,
      totalPages: Math.ceil(filteredForCount / limit),
      availableYears: uniqueYears
    })

  } catch (error) {
    console.error('Error in placeholder emails API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
