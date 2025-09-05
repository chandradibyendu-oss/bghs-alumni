import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyOTPFromDB, markOTPAsUsed } from '@/lib/otp-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, phone, otp, newPassword } = await request.json()

    // Enforce: min 8 chars with upper, lower, number and special symbol
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!newPassword || !strongPw.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must be 8+ chars and include upper, lower, number, and symbol' },
        { status: 400 }
      )
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    // Verify OTP again for security
    const isValid = await verifyOTPFromDB(email || null, phone || null, otp)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Find user by email or phone
    let user = null
    let userId = null
    
    if (email) {
      // First check profiles table
      const { data: emailUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single()
      user = emailUser
      userId = emailUser?.id
    }

    if (!user && phone) {
      const { data: phoneUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('phone', phone)
        .single()
      user = phoneUser
      userId = phoneUser?.id
    }

    // If not found in profiles, check auth.users (Supabase Auth)
    if (!user && email) {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (!authError && authUsers) {
        const authUser = authUsers.users.find(u => u.email === email)
        if (authUser) {
          user = {
            id: authUser.id,
            email: authUser.email
          }
          userId = authUser.id
        }
      }
    }

    if (!user || !userId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update password in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (authError) {
      console.error('Auth password update error:', authError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Mark OTP as used
    await markOTPAsUsed(email || null, phone || null, otp)

    return NextResponse.json({
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
