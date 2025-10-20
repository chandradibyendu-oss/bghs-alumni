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

export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user has admin permissions
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'super_admin' || profile?.role === 'event_manager'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the request body
    const { registrationId, eventId } = await request.json()
    
    if (!registrationId || !eventId) {
      return NextResponse.json({ error: 'Registration ID and event ID are required' }, { status: 400 })
    }

    // Get the current registration details
    const { data: currentRegistration, error: fetchError } = await supabaseAdmin
      .from('event_registrations')
      .select('status, guest_count')
      .eq('id', registrationId)
      .eq('event_id', eventId)
      .single()

    if (fetchError || !currentRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (currentRegistration.status !== 'waitlist') {
      return NextResponse.json({ error: 'Registration is not on waitlist' }, { status: 400 })
    }

    // Get event capacity information
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('max_attendees, current_attendees')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const guestCount = currentRegistration.guest_count || 1
    const availableSpots = event.max_attendees - event.current_attendees

    // Check if there's enough space
    if (availableSpots < guestCount) {
      return NextResponse.json({ 
        error: `Not enough space. Available spots: ${availableSpots}, Required: ${guestCount}` 
      }, { status: 400 })
    }

    // Move from waitlist to confirmed
    const { error: updateError } = await supabaseAdmin
      .from('event_registrations')
      .update({ status: 'confirmed' })
      .eq('id', registrationId)
      .eq('event_id', eventId)

    if (updateError) {
      console.error('Error moving registration from waitlist:', updateError)
      return NextResponse.json({ error: 'Failed to move registration from waitlist' }, { status: 500 })
    }

    // Update event attendee count
    const { error: countUpdateError } = await supabaseAdmin
      .from('events')
      .update({ current_attendees: event.current_attendees + guestCount })
      .eq('id', eventId)

    if (countUpdateError) {
      console.error('Error updating attendee count:', countUpdateError)
      // Don't fail the waitlist move if attendee count update fails
    }

    return NextResponse.json({ 
      message: 'Registration moved from waitlist to confirmed',
      status: 'confirmed',
      registrationId
    })

  } catch (error) {
    console.error('Move from waitlist error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
