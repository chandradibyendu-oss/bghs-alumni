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

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const body = await request.json()
    const { registrationId, eventId } = body

    if (!registrationId || !eventId) {
      return NextResponse.json({ error: 'Registration ID and Event ID are required' }, { status: 400 })
    }

    // Check if registration exists
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('event_id', eventId)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Smart logic: Different behavior for walk-ins vs registered members
    // Walk-ins: Delete registration entirely (they shouldn't be registered)
    // Registered members: Keep registration, just clear attendance
    
    // Use the is_walkin field to determine behavior (permanent, reliable detection)
    const isWalkIn = registration.is_walkin === true

    if (isWalkIn) {
      // For walk-ins, DELETE the entire registration since they shouldn't be registered
      const { data, error } = await supabaseAdmin
        .from('event_registrations')
        .delete()
        .eq('id', registrationId)
        .select()

      if (error) {
        console.error('Error deleting walk-in registration:', error)
        return NextResponse.json({ error: 'Failed to delete walk-in registration' }, { status: 500 })
      }

      // Update event attendee count - decrement by guest count
      const guestCount = registration.guest_count || 1
      const { data: currentEvent } = await supabaseAdmin
        .from('events')
        .select('current_attendees')
        .eq('id', eventId)
        .single()

      if (currentEvent) {
        const newCount = Math.max(0, currentEvent.current_attendees - guestCount)
        const { error: updateEventError } = await supabaseAdmin
          .from('events')
          .update({ current_attendees: newCount })
          .eq('id', eventId)

        if (updateEventError) {
          console.error('Error updating event attendee count:', updateEventError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Walk-in registration deleted successfully',
        data: data[0]
      })
    } else {
      // For regular registrations, just undo the attendance but keep the registration
      const { data, error } = await supabaseAdmin
        .from('event_registrations')
        .update({
          attendance_status: null,
          actual_attendance_count: null,
          attendance_updated_at: null,
          attendance_updated_by: null
        })
        .eq('id', registrationId)
        .select()

      if (error) {
        console.error('Error undoing attendance:', error)
        return NextResponse.json({ error: 'Failed to undo attendance' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Attendance undone successfully',
        data: data[0]
      })
    }

  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
