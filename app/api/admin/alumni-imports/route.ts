import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const dateFilter = searchParams.get('dateFilter') || ''

    // Build query for CSV-imported users
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, registration_id, year_of_leaving, phone, imported_at, created_at')
      .eq('import_source', 'csv_import')
      .not('imported_at', 'is', null)
      .order('imported_at', { ascending: false })

    // Apply date filter if provided
    if (dateFilter) {
      const startDate = new Date(dateFilter)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(dateFilter)
      endDate.setHours(23, 59, 59, 999)
      
      query = query
        .gte('imported_at', startDate.toISOString())
        .lte('imported_at', endDate.toISOString())
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching imported users:', error)
      return NextResponse.json({ error: 'Failed to fetch imported users' }, { status: 500 })
    }

    return NextResponse.json({
      users: users || []
    })

  } catch (error) {
    console.error('Error in alumni imports API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super admin access required for deletion' }, { status: 403 })
    }

    // Get user IDs from request body
    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 })
    }

    // Verify all users are CSV-imported before deletion
    const { data: importedUsers, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds)
      .eq('import_source', 'csv_import')

    if (verifyError) {
      console.error('Error verifying imported users:', verifyError)
      return NextResponse.json({ error: 'Failed to verify users' }, { status: 500 })
    }

    const verifiedIds = (importedUsers || []).map(u => u.id)
    if (verifiedIds.length !== userIds.length) {
      return NextResponse.json({ 
        error: 'Some users are not CSV-imported records and cannot be deleted through this endpoint' 
      }, { status: 400 })
    }

    // Delete users from auth (this will cascade delete profiles due to foreign key)
    let deletedCount = 0
    const errors: string[] = []

    for (const userId of verifiedIds) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
        if (deleteError) {
          console.error(`Error deleting user ${userId}:`, deleteError)
          errors.push(`Failed to delete user ${userId}: ${deleteError.message}`)
        } else {
          deletedCount++
        }
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error)
        errors.push(`Failed to delete user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    if (errors.length > 0 && deletedCount === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete users',
        details: errors
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in alumni imports delete API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
