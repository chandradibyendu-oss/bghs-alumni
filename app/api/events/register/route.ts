import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Create Supabase client with service role key
const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
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

    // Get the request body
    const { eventId, guestCount = 1 } = await request.json()
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Validate guest count
    if (guestCount < 1 || guestCount > 10) {
      return NextResponse.json({ error: 'Guest count must be between 1 and 10' }, { status: 400 })
    }

    // Check if event exists and get event details (including metadata for visibility)
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, max_attendees, current_attendees, metadata')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check visibility and user access
    const visibility = event.metadata?.visibility || 'public'
    
    // Public events: anyone can register (but must be authenticated to use API)
    if (visibility === 'public') {
      // Already authenticated (checked above), so allow
    } 
    // Alumni only events: only authenticated alumni can register
    else if (visibility === 'alumni_only') {
      // User is already authenticated (checked above), so allow
      // In future, could add additional checks like is_approved status
    }
    // Invite only events: only invited users can register
    else if (visibility === 'invite_only') {
      // For now, allow authenticated users (can be enhanced with actual invite system later)
      // User is already authenticated (checked above), so allow
    }
    else {
      // Unknown visibility type, default to public access
    }

    // Calculate available spots
    const availableSpots = event.max_attendees - event.current_attendees

    // Check if user is already registered
    const { data: existingRegistration, error: existingError } = await supabaseAdmin
      .from('event_registrations')
      .select('id, status, guest_count')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (existingRegistration) {
      // Update existing registration instead of creating new one
      const currentCount = existingRegistration.guest_count || 1
      
      // Update the registration with new guest count
      const { data: updatedRegistration, error: updateError } = await supabaseAdmin
        .from('event_registrations')
        .update({ 
          guest_count: guestCount,
          status: availableSpots < guestCount ? 'waitlist' : 'confirmed'
        })
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating registration:', updateError)
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 })
      }

      // Update event attendee count (adjust for the difference)
      const countDifference = guestCount - currentCount
      const { error: eventUpdateError } = await supabaseAdmin
        .from('events')
        .update({ current_attendees: event.current_attendees + countDifference })
        .eq('id', eventId)

      if (eventUpdateError) {
        console.error('Error updating event attendee count:', eventUpdateError)
      }

      return NextResponse.json({ 
        message: `Registration updated to ${guestCount} people successfully`,
        registration: updatedRegistration,
        status: updatedRegistration.status,
        guestCount
      })
    }

    // Check if event has enough capacity for the group
    if (availableSpots < guestCount) {
      // Register for waitlist if not enough spots
      const { data: registration, error: registerError } = await supabaseAdmin
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'waitlist',
          guest_count: guestCount
        })
        .select()
        .single()

      if (registerError) {
        console.error('Error registering for waitlist:', registerError)
        return NextResponse.json({ error: 'Failed to register for waitlist' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: `Registered ${guestCount} people for waitlist successfully`,
        registration,
        status: 'waitlist',
        guestCount
      })
    } else {
      // Register normally
      const { data: registration, error: registerError } = await supabaseAdmin
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed',
          guest_count: guestCount
        })
        .select()
        .single()

      if (registerError) {
        console.error('Error registering for event:', registerError)
        return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 })
      }

      // Update event attendee count
      const { error: updateError } = await supabaseAdmin
        .from('events')
        .update({ current_attendees: event.current_attendees + guestCount })
        .eq('id', eventId)

      if (updateError) {
        console.error('Error updating attendee count:', updateError)
        // Don't fail the registration if count update fails
      }

      return NextResponse.json({ 
        message: `Registered ${guestCount} people for event successfully`,
        registration,
        status: 'confirmed',
        guestCount
      })
    }

  } catch (error) {
    console.error('Event registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get the request body
    const { eventId } = await request.json()
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Get the registration to check status
    const { data: registration, error: registrationError } = await supabaseAdmin
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Delete the registration
    const { error: deleteError } = await supabaseAdmin
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error cancelling registration:', deleteError)
      return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 })
    }

    // Update event attendee count if it was a confirmed registration
    if (registration.status === 'confirmed') {
      const { data: event, error: eventError } = await supabaseAdmin
        .from('events')
        .select('current_attendees')
        .eq('id', eventId)
        .single()

      if (!eventError && event) {
        const { error: updateError } = await supabaseAdmin
          .from('events')
          .update({ current_attendees: Math.max(0, event.current_attendees - 1) })
          .eq('id', eventId)

        if (updateError) {
          console.error('Error updating attendee count:', updateError)
        }
      }
    }

    return NextResponse.json({ 
      message: 'Registration cancelled successfully'
    })

  } catch (error) {
    console.error('Event registration cancellation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
