import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to detect placeholder email
function isPlaceholderEmail(email: string): boolean {
  // Pattern: [alphanumeric]@alumnibghs.org
  // Example: BGHSA202500031@alumnibghs.org
  const placeholderPattern = /^[A-Za-z0-9]+@alumnibghs\.org$/i
  return placeholderPattern.test(email.trim())
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get request body
    const { newEmail } = await request.json()

    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json({ error: 'New email is required' }, { status: 400 })
    }

    const normalizedNewEmail = newEmail.trim().toLowerCase()

    // Validate email format
    if (!isValidEmail(normalizedNewEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const currentEmail = profile.email

    // Only allow email change if current email is a placeholder
    if (!isPlaceholderEmail(currentEmail)) {
      return NextResponse.json({ 
        error: 'Email can only be changed if it is a placeholder email' 
      }, { status: 403 })
    }

    // Check if new email is the same as current (case-insensitive)
    if (normalizedNewEmail === currentEmail.toLowerCase()) {
      return NextResponse.json({ 
        error: 'New email is the same as current email' 
      }, { status: 400 })
    }

    // Check if new email already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', normalizedNewEmail)
      .single()

    if (existingProfile) {
      return NextResponse.json({ 
        error: 'Email already in use by another user' 
      }, { status: 409 })
    }

    // Check if new email already exists in auth.users
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (!listError && authUsers) {
      const existingAuthUser = authUsers.users.find(
        u => u.email && u.email.toLowerCase() === normalizedNewEmail
      )
      if (existingAuthUser) {
        return NextResponse.json({ 
          error: 'Email already registered' 
        }, { status: 409 })
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Hash the OTP for secure storage
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

    // Store OTP in database with new email and user_id
    // We'll use password_reset_otps table:
    // - email: new email address
    // - phone: user_id (temporarily storing user ID for email change requests)
    // - otp_hash: hashed OTP
    const { error: insertError } = await supabase
      .from('password_reset_otps')
      .insert({
        email: normalizedNewEmail, // Store new email in email field
        phone: authUser.id, // Store user_id in phone field for email change tracking
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('OTP storage error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to store verification code' 
      }, { status: 500 })
    }

    // Send verification email to new email address
    const emailSent = await sendEmail({
      to: normalizedNewEmail,
      subject: 'Verify Your New Email Address - BGHS Alumni',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your New Email Address</h2>
          <p>You requested to change your email address from <strong>${currentEmail}</strong> to <strong>${normalizedNewEmail}</strong>.</p>
          <p>Please use the following verification code to complete the email change:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this change, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">BGHS Alumni Association</p>
        </div>
      `,
      text: `Verify Your New Email Address\n\nYou requested to change your email address from ${currentEmail} to ${normalizedNewEmail}.\n\nVerification Code: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this change, please ignore this email.`
    })

    // In development mode or if email sending fails, return OTP in response for testing
    const isDevelopment = !process.env.SENDGRID_API_KEY || process.env.NODE_ENV === 'development'
    const responseData: any = {
      message: emailSent 
        ? 'Verification code sent to new email address' 
        : 'Verification code generated (email sending failed - check console or use OTP below)',
      expires: expiresAt.getTime()
    }

    if (!emailSent || isDevelopment) {
      // Include OTP in response for development/testing purposes
      console.log('=== EMAIL CHANGE OTP (DEVELOPMENT MODE) ===')
      console.log(`User: ${authUser.id}`)
      console.log(`Current Email: ${currentEmail}`)
      console.log(`New Email: ${normalizedNewEmail}`)
      console.log(`Verification Code: ${otp}`)
      console.log(`Expires: ${expiresAt.toISOString()}`)
      console.log('==========================================')
      
      // Include OTP in response only in development
      if (isDevelopment) {
        responseData.devOtp = otp
        responseData.devNote = 'In development mode - OTP included for testing'
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Email change request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
