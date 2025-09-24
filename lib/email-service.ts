// Email service utility for sending OTP emails
// In production, integrate with services like SendGrid, AWS SES, etc.

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  content: Buffer | string
  filename: string
  type: string
  disposition?: string
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
        text: options.text,
        attachments: options.attachments
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
      if (options.attachments && options.attachments.length > 0) {
        console.log('Attachments:', options.attachments.map(a => `${a.filename} (${a.type})`).join(', '))
      }
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
          <img src="https://alumnibghs.org/bghs-logo.png" alt="BGHS Alumni" style="height: 60px; width: auto;">
          <h1 style="color: #1f2937; margin: 10px 0;">BGHS Alumni</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয় প্রাক্তন ছাত্র সমিতি</p>
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

export function generateRegistrationNotificationEmail(userData: {
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone?: string
  last_class: number
  year_of_leaving: number
  start_class?: number
  start_year?: number
  verification_method: string
  evidence_count: number
  reference_count: number
}): EmailOptions {
  const fullName = `${userData.first_name} ${userData.middle_name ? userData.middle_name + ' ' : ''}${userData.last_name}`
  
  return {
    to: process.env.ADMIN_EMAIL || 'admin@alumnibghs.org',
    subject: `New Alumni Registration - ${fullName} (${userData.year_of_leaving})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://alumnibghs.org/bghs-logo.png" alt="BGHS Alumni" style="height: 60px; width: auto;">
          <h1 style="color: #1f2937; margin: 10px 0;">BGHS Alumni</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয় প্রাক্তন ছাত্র সমিতি</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #92400e; margin-top: 0;">🔔 New Alumni Registration</h2>
          <p style="color: #92400e; margin: 0;">A new alumni member has registered and requires verification.</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Registration Summary</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 15px;">
            <div style="font-weight: bold; color: #374151;">Name:</div>
            <div style="color: #6b7280;">${fullName}</div>
            
            <div style="font-weight: bold; color: #374151;">Email:</div>
            <div style="color: #6b7280;">${userData.email}</div>
            
            <div style="font-weight: bold; color: #374151;">Phone:</div>
            <div style="color: #6b7280;">${userData.phone || 'Not provided'}</div>
            
            <div style="font-weight: bold; color: #374151;">Batch Year:</div>
            <div style="color: #6b7280;">${userData.year_of_leaving}</div>
            
            <div style="font-weight: bold; color: #374151;">Last Class:</div>
            <div style="color: #6b7280;">Class ${userData.last_class}</div>
            
            <div style="font-weight: bold; color: #374151;">Verification Method:</div>
            <div style="color: #6b7280;">${userData.verification_method}</div>
          </div>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin-top: 0;">Verification Status</h3>
          <p style="color: #065f46; margin: 5px 0;"><strong>Evidence Files:</strong> ${userData.evidence_count} files uploaded</p>
          <p style="color: #065f46; margin: 5px 0;"><strong>References Provided:</strong> ${userData.reference_count} references</p>
          <p style="color: #065f46; margin: 5px 0;"><strong>Status:</strong> Pending Admin Review</p>
        </div>
        
        <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin-top: 0;">Action Required</h3>
          <p style="color: #0c4a6e; margin: 5px 0;">Please review the attached PDF document and verify the alumni credentials.</p>
          <p style="color: #0c4a6e; margin: 5px 0;">The user is currently pending approval and cannot access the platform.</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <h3 style="color: #374151; margin-top: 0;">Next Steps</h3>
          <ol style="color: #6b7280; padding-left: 20px;">
            <li>Review the attached PDF document</li>
            <li>Validate evidence documents</li>
            <li>Check reference alumni credentials</li>
            <li>Approve or reject the registration</li>
          </ol>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
          <p>This notification was automatically generated by the BGHS Alumni System</p>
          <p>© 2024 BGHS Alumni Association. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
New Alumni Registration - ${fullName} (${userData.year_of_leaving})

A new alumni member has registered and requires verification.

REGISTRATION SUMMARY:
• Name: ${fullName}
• Email: ${userData.email}
• Phone: ${userData.phone || 'Not provided'}
• Batch Year: ${userData.year_of_leaving}
• Last Class: Class ${userData.last_class}
• Verification Method: ${userData.verification_method}

VERIFICATION STATUS:
• Evidence Files: ${userData.evidence_count} files uploaded
• References Provided: ${userData.reference_count} references
• Status: Pending Admin Review

Action Required:
Please review the attached PDF document and verify the alumni credentials. 
The user is currently pending approval and cannot access the platform.

Next Steps:
1. Review the attached PDF document
2. Validate evidence documents
3. Check reference alumni credentials
4. Approve or reject the registration

Best regards,
BGHS Alumni System
    `
  }
}
