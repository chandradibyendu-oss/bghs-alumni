import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { markOTPAsUsed } from '@/lib/otp-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to detect placeholder email
function isPlaceholderEmail(email: string): boolean {
  const placeholderPattern = /^[A-Za-z0-9]+@alumnibghs\.org$/i
  return placeholderPattern.test(email.trim())
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
    const { newEmail, otp } = await request.json()

    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json({ error: 'New email is required' }, { status: 400 })
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json({ error: 'Valid 6-digit OTP is required' }, { status: 400 })
    }

    const normalizedNewEmail = newEmail.trim().toLowerCase()

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

    // Verify current email is still a placeholder (security check)
    if (!isPlaceholderEmail(currentEmail)) {
      return NextResponse.json({ 
        error: 'Email can only be changed if it is a placeholder email' 
      }, { status: 403 })
    }

    // Verify OTP for the new email
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
    
    const { data: otpRecord, error: otpError } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('email', normalizedNewEmail)
      .eq('otp_hash', otpHash)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification code' 
      }, { status: 400 })
    }

    // Verify that the OTP was requested by the same user
    // (We stored user_id in phone field for email change requests)
    if (otpRecord.phone !== authUser.id) {
      return NextResponse.json({ 
        error: 'Verification code does not match your request' 
      }, { status: 403 })
    }

    // Double-check that new email doesn't exist (race condition protection)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', normalizedNewEmail)
      .single()

    if (existingProfile && existingProfile.id !== authUser.id) {
      return NextResponse.json({ 
        error: 'Email already in use by another user' 
      }, { status: 409 })
    }

    // Check auth.users for duplicates
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (!listError && authUsers) {
      const existingAuthUser = authUsers.users.find(
        u => u.email && u.email.toLowerCase() === normalizedNewEmail && u.id !== authUser.id
      )
      if (existingAuthUser) {
        return NextResponse.json({ 
          error: 'Email already registered' 
        }, { status: 409 })
      }
    }

    // Update email in auth.users
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { 
        email: normalizedNewEmail,
        email_confirm: true // Auto-confirm the new email
      }
    )

    if (authUpdateError) {
      console.error('Auth email update error:', authUpdateError)
      return NextResponse.json({ 
        error: 'Failed to update email in authentication system' 
      }, { status: 500 })
    }

    // Update email in profiles table
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ 
        email: normalizedNewEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', authUser.id)

    if (profileUpdateError) {
      console.error('Profile email update error:', profileUpdateError)
      // Try to rollback auth.users update if profile update fails
      // (This is best effort - if rollback fails, we'll log it)
      await supabase.auth.admin.updateUserById(
        authUser.id,
        { email: currentEmail }
      ).catch(err => console.error('Rollback failed:', err))
      
      return NextResponse.json({ 
        error: 'Failed to update email in profile' 
      }, { status: 500 })
    }

    // Mark OTP as used
    await markOTPAsUsed(normalizedNewEmail, authUser.id, otp)

    return NextResponse.json({
      message: 'Email updated successfully',
      newEmail: normalizedNewEmail
    })

  } catch (error) {
    console.error('Email change verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
