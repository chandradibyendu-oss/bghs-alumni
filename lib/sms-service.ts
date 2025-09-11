// SMS service utility for sending OTP SMS messages
// In production, integrate with services like Twilio, AWS SNS, etc.

export interface SMSOptions {
  to: string
  message: string
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    // Optional console logging for debugging OTP delivery
    const shouldLog = process.env.LOG_SMS_OTP === '1' || process.env.NODE_ENV !== 'production'
    if (shouldLog) {
      try {
        console.log('=== SMS DEBUG (OTP) ===')
        console.log('To:', options.to)
        console.log('Message:', options.message)
        console.log('=======================')
      } catch {}
    }

    const hasTwilioCreds = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    )

    if (hasTwilioCreds) {
      // Production: Send real SMS via Twilio
      const twilio = require('twilio')
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )

      await client.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: options.to
      })

      console.log('✅ SMS sent successfully to:', options.to)
      return true
    }

    // Development: Log the SMS content
    console.log('=== SMS SENT (DEVELOPMENT MODE) ===')
    console.log('To:', options.to)
    console.log('Message:', options.message)
    console.log('===================================')
    return true
  } catch (error) {
    console.error('SMS sending error:', error)
    return false
  }
}

export function generateOTPSMS(otp: string): SMSOptions {
  return {
    to: '', // Will be set by caller
    message: `Your BGHS Alumni password reset OTP is: ${otp}. Valid for 10 minutes. If you didn't request this, please ignore.`
  }
}
