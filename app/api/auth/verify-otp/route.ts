import { NextRequest, NextResponse } from 'next/server'
import { verifyOTPFromDB } from '@/lib/otp-utils'

export async function POST(request: NextRequest) {
  try {
    const { email, phone, otp } = await request.json()

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Valid 6-digit OTP is required' },
        { status: 400 }
      )
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    // Verify OTP from database
    const isValid = await verifyOTPFromDB(email || null, phone || null, otp)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'OTP verified successfully',
      verified: true
    })

  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
