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
    const { registrationId, status, eventId } = await request.json()
    
    if (!registrationId || !status || !eventId) {
      return NextResponse.json({ error: 'Registration ID, status, and event ID are required' }, { status: 400 })
    }

    if (!['confirmed', 'waitlist', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be confirmed, waitlist, or cancelled' }, { status: 400 })
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

    // Update the registration status
    const { error: updateError } = await supabaseAdmin
      .from('event_registrations')
      .update({ status })
      .eq('id', registrationId)
      .eq('event_id', eventId)

    if (updateError) {
      console.error('Error updating registration status:', updateError)
      return NextResponse.json({ error: 'Failed to update registration status' }, { status: 500 })
    }

    // Update event attendee count based on status change
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('current_attendees')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      console.error('Error fetching event for attendee count update:', eventError)
      // Don't fail the status update if attendee count update fails
    } else {
      let attendeeCountChange = 0
      const guestCount = currentRegistration.guest_count || 1

      // Calculate the change in attendee count
      if (currentRegistration.status === 'confirmed' && status !== 'confirmed') {
        // Moving from confirmed to waitlist/cancelled - reduce count
        attendeeCountChange = -guestCount
      } else if (currentRegistration.status !== 'confirmed' && status === 'confirmed') {
        // Moving to confirmed - increase count
        attendeeCountChange = guestCount
      }

      if (attendeeCountChange !== 0) {
        const { error: countUpdateError } = await supabaseAdmin
          .from('events')
          .update({ current_attendees: Math.max(0, event.current_attendees + attendeeCountChange) })
          .eq('id', eventId)

        if (countUpdateError) {
          console.error('Error updating attendee count:', countUpdateError)
          // Don't fail the status update if attendee count update fails
        }
      }
    }

    return NextResponse.json({ 
      message: `Registration status updated to ${status}`,
      status,
      registrationId
    })

  } catch (error) {
    console.error('Registration status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
