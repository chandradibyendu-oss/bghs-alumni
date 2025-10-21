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
    const eventId = searchParams.get('eventId') || 'f4b7b9a5-9845-4025-9504-0f12e5401316'
    
    console.log('Debug: Checking registrations for event:', eventId)
    
    // Get all registrations for the event
    const { data: registrations, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        id,
        event_id,
        user_id,
        status,
        guest_count,
        attendance_status,
        actual_attendance_count,
        registration_date,
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

    console.log('Debug: Raw registrations query result:', { registrations, regError })

    // Also check profiles table for any users with similar names
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .or('full_name.ilike.%Dibrup%,full_name.ilike.%Dibyendu%')
      .order('created_at', { ascending: false })

    console.log('Debug: Profiles query result:', { profiles, profileError })

    return NextResponse.json({
      eventId,
      registrations,
      profiles,
      registrationsError: regError,
      profilesError: profileError,
      registrationCount: registrations?.length || 0,
      profileCount: profiles?.length || 0
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
