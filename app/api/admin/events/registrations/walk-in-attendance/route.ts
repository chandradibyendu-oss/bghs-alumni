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
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the user is authenticated and has admin permissions
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
    const { eventId, attendeeName, guestCount = 1, existingUserId } = await request.json()
    
    if (!eventId || !attendeeName) {
      return NextResponse.json({ error: 'Event ID and attendee name are required' }, { status: 400 })
    }

    // Validate guest count
    if (guestCount < 1 || guestCount > 10) {
      return NextResponse.json({ error: 'Guest count must be between 1 and 10' }, { status: 400 })
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, max_attendees, current_attendees')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    let userId: string

    if (existingUserId) {
      // Use existing user ID (existing member who wasn't registered for this event)
      userId = existingUserId
      console.log(`Using existing user ID: ${userId}`)
    } else {
      // Create a temporary user profile for true walk-in attendee
      const tempEmail = `walkin-${Date.now()}@temp.local`
      
      // Create a temporary auth user
      const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.createUser({
        email: tempEmail,
        email_confirm: true,
        user_metadata: {
          full_name: attendeeName,
          is_walkin: true
        }
      })

      if (authUserError || !authUser.user) {
        console.error('Error creating temp auth user:', authUserError)
        return NextResponse.json({ error: 'Failed to create walk-in user' }, { status: 500 })
      }

      userId = authUser.user.id

      // Create a profile for the walk-in attendee
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          full_name: attendeeName,
          email: tempEmail,
          phone: null,
          profession: 'Walk-in Attendee',
          company: 'Not specified',
          location: 'Not specified',
          role: 'alumni_basic',
          is_approved: false, // Walk-in attendees are not approved members
          is_walkin: true
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Clean up the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        return NextResponse.json({ error: 'Failed to create walk-in profile' }, { status: 500 })
      }
    }

    // Check if user already has a registration for this event
    const { data: existingRegistration, error: existingError } = await supabaseAdmin
      .from('event_registrations')
      .select('id, status, guest_count, attendance_status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    let registration: any

    if (existingRegistration && !existingError) {
      // Update existing registration
      const { data: updatedRegistration, error: updateError } = await supabaseAdmin
        .from('event_registrations')
        .update({
          status: 'confirmed',
          guest_count: guestCount,
          attendance_status: 'attended',
          actual_attendance_count: guestCount,
          attendance_updated_at: new Date().toISOString(),
          attendance_updated_by: user.id,
          is_walkin: true  // Mark as walk-in registration
        })
        .eq('id', existingRegistration.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating existing registration:', updateError)
        return NextResponse.json({ error: 'Failed to update existing registration' }, { status: 500 })
      }

      registration = updatedRegistration
      console.log(`Updated existing registration for user: ${userId}`)
    } else {
      // Create new registration
      const { data: newRegistration, error: registrationError } = await supabaseAdmin
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'confirmed',
          guest_count: guestCount,
          attendance_status: 'attended',
          actual_attendance_count: guestCount,
          attendance_updated_at: new Date().toISOString(),
          attendance_updated_by: user.id,
          is_walkin: true  // Mark as walk-in registration
        })
        .select()
        .single()

      if (registrationError) {
        console.error('Error creating registration:', registrationError)
        // Only clean up if we created a new user (not for existing users)
        if (!existingUserId) {
          await supabaseAdmin.auth.admin.deleteUser(userId)
          await supabaseAdmin.from('profiles').delete().eq('id', userId)
        }
        return NextResponse.json({ error: 'Failed to create walk-in registration' }, { status: 500 })
      }

      registration = newRegistration
      console.log(`Created new registration for user: ${userId}`)
    }

    // Update event attendee count
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ current_attendees: event.current_attendees + guestCount })
      .eq('id', eventId)

    if (updateError) {
      console.error('Error updating event attendee count:', updateError)
      // Don't fail the operation if count update fails
    }

    console.log(`Walk-in attendance created: ${attendeeName} (${guestCount} people) for event ${event.title}`)

    return NextResponse.json({
      message: `Walk-in attendance marked for ${attendeeName} (${guestCount} people)`,
      registration: {
        id: registration.id,
        attendeeName,
        guestCount,
        status: 'confirmed',
        attendance_status: 'attended'
      }
    })

  } catch (error) {
    console.error('Walk-in attendance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
