import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is not set.')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Fetch registrations with user profiles
    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        id,
        event_id,
        user_id,
        status,
        guest_count,
        registration_date,
        attendance_status,
        actual_attendance_count,
        attendance_updated_at,
        user:profiles!event_registrations_user_id_fkey(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('event_id', eventId)
      .order('registration_date', { ascending: false })

    if (error) {
      console.error('Registrations query error:', error)
      return NextResponse.json({ error: 'Failed to fetch registrations', details: error.message }, { status: 500 })
    }

    // Process the data to flatten the user object
    const processedData = data?.map(reg => ({
      ...reg,
      user: Array.isArray(reg.user) ? reg.user[0] : reg.user
    })) || []

    return NextResponse.json({ 
      data: processedData, 
      count: processedData.length 
    })

  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
