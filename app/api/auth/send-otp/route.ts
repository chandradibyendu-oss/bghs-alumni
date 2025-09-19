import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json()

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Hash the OTP for secure storage
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('password_reset_otps')
      .insert({
        email: email || null,
        phone: phone || null,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('OTP storage error:', insertError)
      return NextResponse.json(
        { error: 'Failed to store OTP' },
        { status: 500 }
      )
    }

    // Dev console output for quick testing (remove in production)
    try {
      console.log('=== OTP DEBUG ===')
      if (email) console.log(`Email: ${email} -> OTP: ${otp}`)
      if (phone) console.log(`Phone: ${phone} -> OTP: ${otp}`)
      console.log('==================')
    } catch {}

    // Send OTP via email or SMS (both if both provided)
    const tasks: Promise<any>[] = []
    if (email) tasks.push(sendEmailOTP(String(email), otp))
    if (phone) tasks.push(sendSMSOTP(String(phone), otp))
    await Promise.allSettled(tasks)

    return NextResponse.json({ message: 'OTP sent if contact is valid', expires: 600 })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendEmailOTP(email: string, otp: string) {
  try {
    const { sendEmail, generateOTPEmail } = await import('@/lib/email-service')
    const emailOptions = generateOTPEmail(otp)
    emailOptions.to = email
    await sendEmail(emailOptions)
  } catch (error) {
    console.error('Email OTP error:', error)
  }
}

async function sendSMSOTP(phone: string, otp: string) {
  try {
    const { sendSMS, generateOTPSMS } = await import('@/lib/sms-service')
    const smsOptions = generateOTPSMS(otp)
    smsOptions.to = phone
    await sendSMS(smsOptions)
  } catch (error) {
    console.error('SMS OTP error:', error)
  }
}


