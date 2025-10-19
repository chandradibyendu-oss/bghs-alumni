import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'Valid 6-digit OTP is required' },
        { status: 400 }
      )
    }

    console.log(`=== CUSTOM SMS OTP LOGIN ===`)
    console.log(`Phone: ${phone}, OTP: ${otp}`)

    // Hash the provided OTP for comparison
    const crypto = await import('crypto')
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
    
    // Verify OTP against database
    const { data: otpData, error: otpError } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('phone', phone)
      .eq('otp_hash', otpHash)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpData) {
      console.error('Custom OTP verification failed:', otpError)
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Find existing user profile (LOGIN ONLY - NO USER CREATION)
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist - this is LOGIN, not registration
      console.log('User not found for phone:', phone)
      return NextResponse.json(
        { error: 'User not registered. Please contact admin to register first.' },
        { status: 404 }
      )
    } else if (userError) {
      console.error('User lookup error:', userError)
      return NextResponse.json(
        { error: 'User lookup failed' },
        { status: 500 }
      )
    }

    // User exists in profiles, now find their Supabase auth user
    console.log('Found existing user profile:', userData.full_name)
    
    // Find corresponding Supabase auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Failed to list auth users:', authError)
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 500 }
      )
    }

    // Find auth user by ID (profiles.id = auth.users.id)
    const authUser = authUsers.users.find(u => u.id === userData.id)
    
    if (!authUser) {
      console.error('Auth user not found for profile ID:', userData.id)
      return NextResponse.json(
        { error: 'User authentication failed. Please contact admin.' },
        { status: 404 }
      )
    }

    console.log('Found existing auth user:', authUser.email || authUser.phone)

    // Mark OTP as used
    await supabase
      .from('password_reset_otps')
      .update({ used: true })
      .eq('phone', phone)
      .eq('otp_hash', otpHash)

    // Create session using Supabase admin API
    // Use the actual email from the auth user (not a temp email)
    const userEmail = authUser.email || userData.email
    if (!userEmail) {
      console.error('No email found for user')
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 500 }
      )
    }

    // Generate a magic link for the user (this will create a proper session)
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login?otp_success=true`
      }
    })

    if (sessionError || !sessionData) {
      console.error('Failed to generate session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // For magic links, we need to return the link itself, not extract tokens
    // The client will navigate to this link to complete the authentication
    const magicLink = sessionData.properties.action_link

    console.log(`Custom SMS OTP login successful for user: ${userData?.full_name || authUser.email}`)
    
    return NextResponse.json({
      message: 'OTP login successful',
      user: {
        id: authUser.id,
        email: authUser.email,
        phone: authUser.phone,
        full_name: userData?.full_name || 'Mobile User'
      },
      magicLink: magicLink,
      verified: true
    })

  } catch (error) {
    console.error('Supabase native OTP login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
