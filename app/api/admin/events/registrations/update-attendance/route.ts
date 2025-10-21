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
    const { registrationId, attendanceStatus, eventId, actualAttendanceCount, updateStatusToConfirmed } = await request.json()
    
    if (!registrationId || !attendanceStatus || !eventId) {
      return NextResponse.json({ error: 'Registration ID, attendance status, and event ID are required' }, { status: 400 })
    }

    if (!['attended', 'no_show'].includes(attendanceStatus)) {
      return NextResponse.json({ error: 'Invalid attendance status. Must be attended or no_show' }, { status: 400 })
    }

    // Get the current registration details
    const { data: currentRegistration, error: fetchError } = await supabaseAdmin
      .from('event_registrations')
      .select('status, attendance_status, guest_count')
      .eq('id', registrationId)
      .eq('event_id', eventId)
      .single()

    if (fetchError || !currentRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Allow attendance updates for any active registration (not cancelled)
    if (currentRegistration.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot update attendance for cancelled registrations' }, { status: 400 })
    }

    // Validate actual attendance count if provided (allow up to 10 people)
    if (actualAttendanceCount !== undefined) {
      if (actualAttendanceCount < 1 || actualAttendanceCount > 10) {
        return NextResponse.json({ 
          error: 'Actual attendance count must be between 1 and 10' 
        }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      attendance_status: attendanceStatus,
      attendance_updated_at: new Date().toISOString(),
      attendance_updated_by: user.id
    }

    // Include actual attendance count if provided
    if (actualAttendanceCount !== undefined) {
      updateData.actual_attendance_count = actualAttendanceCount
    }

    // Auto-confirm registration status when marking attendance (if requested)
    if (updateStatusToConfirmed && currentRegistration.status !== 'confirmed') {
      updateData.status = 'confirmed'
    }

    // Update the attendance status
    const { error: updateError } = await supabaseAdmin
      .from('event_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .eq('event_id', eventId)

    if (updateError) {
      console.error('Error updating attendance status:', updateError)
      return NextResponse.json({ error: 'Failed to update attendance status' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `Attendance updated to ${attendanceStatus}`,
      attendanceStatus,
      registrationId,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    })

  } catch (error) {
    console.error('Attendance update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
