import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendCustomSMS, generateOTPSMS, isSMSProviderConfigured } from '@/lib/custom-sms-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    console.log(`=== CUSTOM SMS OTP SEND ===`)
    console.log(`Phone: ${phone}`)

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Hash the OTP before storing
    const crypto = await import('crypto')
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
    
    // Store OTP in database for verification
    const { error: dbError } = await supabase
      .from('password_reset_otps')
      .upsert({
        phone: phone,
        otp_hash: otpHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        used: false
      })

    if (dbError) {
      console.error('Failed to store OTP in database:', dbError)
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      )
    }

    // Send SMS using custom SMS service
    const smsMessage = generateOTPSMS(otp)
    const smsResult = await sendCustomSMS({
      to: phone,
      message: smsMessage,
      provider: isSMSProviderConfigured() ? undefined : 'console'
    })

    if (!smsResult.success) {
      console.error('SMS sending failed:', smsResult.error)
      return NextResponse.json(
        { error: smsResult.error || 'Failed to send OTP' },
        { status: 500 }
      )
    }

    console.log(`Custom SMS OTP sent successfully to: ${phone}`)
    
    return NextResponse.json({
      message: 'OTP sent successfully',
      success: true
    })

  } catch (error) {
    console.error('Supabase native OTP send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
