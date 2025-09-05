// Email service utility for sending OTP emails
// In production, integrate with services like SendGrid, AWS SES, etc.

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if we're in production mode (has SendGrid API key)
    if (process.env.SENDGRID_API_KEY) {
      // Production: Send real email via SendGrid
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      const rawFrom = process.env.FROM_EMAIL || 'admin@alumnibghs.org'
      const fromWithName = rawFrom.includes('<') ? rawFrom : `BGHS Alumni <${rawFrom}>`

      const msg = {
        to: options.to,
        from: fromWithName,
        subject: options.subject,
        html: options.html,
        text: options.text
      }
      
      await sgMail.send(msg)
      console.log('✅ Email sent successfully to:', options.to)
      return true
    } else {
      // Development: Log the email content
      console.log('=== EMAIL SENT (DEVELOPMENT MODE) ===')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('Content:', options.html)
      console.log('=====================================')
      return true
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

export function generateOTPEmail(otp: string, recipientName?: string): EmailOptions {
  return {
    to: '', // Will be set by caller
    subject: 'BGHS Alumni - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://alumnibghs.org/bghs-logo.jpg" alt="BGHS Alumni" style="height: 60px; width: auto;">
          <h1 style="color: #1f2937; margin: 10px 0;">BGHS Alumni</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">বারাসাত গভঃ হাই স্কুল প্রাক্তন ছাত্র সমিতি</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #374151; line-height: 1.6;">
            ${recipientName ? `Hello ${recipientName},` : 'Hello,'}
          </p>
          <p style="color: #374151; line-height: 1.6;">
            We received a request to reset your password for your BGHS Alumni account. 
            Use the OTP below to complete your password reset:
          </p>
          
          <div style="background-color: #ffffff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #3b82f6; font-size: 32px; letter-spacing: 8px; margin: 0; font-weight: bold;">${otp}</h1>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            <strong>This OTP will expire in 10 minutes.</strong>
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email. 
            Your account security is important to us.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>© 2024 BGHS Alumni Association. All rights reserved.</p>
          <p>Barasat Peary Charan Sarkar Government High School</p>
        </div>
      </div>
    `,
    text: `
BGHS Alumni - Password Reset OTP

Your OTP for password reset is: ${otp}

This OTP will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

© 2024 BGHS Alumni Association
    `
  }
}
