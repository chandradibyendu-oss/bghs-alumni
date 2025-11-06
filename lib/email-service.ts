// Email service utility for sending emails
// Uses Brevo (formerly Sendinblue) for email delivery

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
  replyTo?: string // Optional Reply-To address (only for emails where replies are expected)
}

export interface EmailAttachment {
  content: Buffer | string
  filename: string
  type: string
  disposition?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if we're in production mode (has Brevo API key)
    const brevoApiKey = process.env.BREVO_API_KEY?.trim()
    
    if (!brevoApiKey) {
      console.log('⚠️ BREVO_API_KEY not found in environment variables')
      // Fall through to development mode
    } else {
      // Production: Send real email via Brevo REST API (direct HTTP call)
      const rawFrom = process.env.FROM_EMAIL || 'admin@alumnibghs.org'
      const displayName = process.env.EMAIL_DISPLAY_NAME || 'BGHS Alumni'
      
      // Parse from email (handle both formats: "email@domain.com" or "Display Name <email@domain.com>")
      let fromEmail: string
      let fromName: string
      
      if (rawFrom.includes('<')) {
        // Format: "Display Name <email@domain.com>"
        const match = rawFrom.match(/^(.+?)\s*<(.+?)>$/)
        if (match) {
          fromName = match[1].trim()
          fromEmail = match[2].trim()
        } else {
          fromEmail = rawFrom
          fromName = displayName
        }
      } else {
        fromEmail = rawFrom
        fromName = displayName
      }

      // Prepare attachments for Brevo
      const normalizedAttachments = (options.attachments || []).map(att => {
        let contentBase64: string
        if (typeof att.content === 'string') {
          // Best effort: if not base64, convert it
          try {
            // Detect if string already looks like base64 (basic heuristic)
            const maybeBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(att.content)
            contentBase64 = maybeBase64 ? att.content : Buffer.from(att.content).toString('base64')
          } catch {
            contentBase64 = Buffer.from(att.content).toString('base64')
          }
        } else {
          contentBase64 = Buffer.from(att.content).toString('base64')
        }
        return {
          name: att.filename,
          content: contentBase64,
        }
      })

      // Prepare email payload for Brevo API
      const emailPayload: any = {
        sender: {
          name: fromName,
          email: fromEmail
        },
        to: [
          {
            email: options.to
          }
        ],
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text || undefined
      }
      
      // Add Reply-To header if provided (only for emails where replies are expected)
      if (options.replyTo) {
        emailPayload.replyTo = {
          email: options.replyTo
        }
      }
      
      // Add attachments if any
      if (normalizedAttachments.length > 0) {
        emailPayload.attachment = normalizedAttachments
      }
      
      // Call Brevo REST API directly
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify(emailPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Brevo API error:', response.status, errorText)
        // Debug: Check if API key is present (show first 4 chars for debugging)
        const apiKeyPreview = brevoApiKey ? `${brevoApiKey.substring(0, 4)}...` : 'MISSING'
        console.error('API Key preview (first 4 chars):', apiKeyPreview)
        console.error('API Key length:', brevoApiKey?.length || 0)
        throw new Error(`Brevo API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Email sent successfully to:', options.to)
      if (options.replyTo) {
        console.log('   Reply-To:', options.replyTo)
      }
      return true
    }
    
    // Development mode (no API key or API key not found)
    // Development: Log the email content
    console.log('=== EMAIL SENT (DEVELOPMENT MODE) ===')
    console.log('To:', options.to)
    console.log('Subject:', options.subject)
    if (options.replyTo) {
      console.log('Reply-To:', options.replyTo)
    }
    console.log('Content:', options.html)
    if (options.attachments && options.attachments.length > 0) {
      console.log('Attachments:', options.attachments.map(a => `${a.filename} (${a.type})`).join(', '))
    }
    console.log('=====================================')
    return true
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
  
  // Add Reply-To for admin emails so they can reply if needed
  const replyToEmail = process.env.REPLY_TO_EMAIL || process.env.ADMIN_EMAIL || 'admin@alumnibghs.org'
  
  return {
    to: process.env.ADMIN_EMAIL || 'admin@alumnibghs.org',
    subject: `New Alumni Registration - ${fullName} (${userData.year_of_leaving})`,
    replyTo: replyToEmail, // Allow replies to admin email
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

/**
 * Generate payment link email after registration approval
 */
export function generatePaymentLinkEmail(userData: {
  full_name: string;
  email: string;
  amount: number;
  currency: string;
  payment_link: string;
  expiry_hours: number;
}): EmailOptions {
  const currencySymbol = userData.currency === 'INR' ? '₹' : userData.currency === 'USD' ? '$' : '€';
  
  // Add Reply-To for payment emails so users can ask questions if needed
  const replyToEmail = process.env.REPLY_TO_EMAIL || process.env.ADMIN_EMAIL || 'admin@alumnibghs.org'
  
  return {
    to: userData.email,
    subject: `Registration Approved - Complete Payment of ${currencySymbol}${userData.amount}`,
    replyTo: replyToEmail, // Allow replies for payment support
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://alumnibghs.org/bghs-logo.png" alt="BGHS Alumni" style="height: 60px; width: auto;">
          <h1 style="color: #1f2937; margin: 10px 0;">BGHS Alumni</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয় প্রাক্তন ছাত্র সমিতি</p>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
          <h2 style="color: #065f46; margin-top: 0;">🎉 Registration Approved!</h2>
          <p style="color: #065f46; margin: 0;">Congratulations! Your registration has been approved.</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Complete Your Registration</h2>
          <p style="color: #374151; line-height: 1.6;">
            Dear ${userData.full_name},
          </p>
          <p style="color: #374151; line-height: 1.6;">
            Welcome to the BGHS Alumni Association! Your registration has been approved by our admin team.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            To activate your account and gain full access to all alumni features, please complete the one-time registration payment.
          </p>
          
          <div style="background-color: #ffffff; border: 2px solid #3b82f6; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Registration Fee</p>
            <h1 style="color: #3b82f6; font-size: 42px; margin: 0 0 20px 0; font-weight: bold;">${currencySymbol}${userData.amount.toFixed(2)}</h1>
            
            <a href="${userData.payment_link}" 
               style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; 
                      padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 10px 0;">
              Pay ${currencySymbol}${userData.amount.toFixed(2)} Now
            </a>
            
            <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0;">
              Secure payment powered by RazorPay
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6; font-size: 14px;">
            <strong>Important:</strong>
          </p>
          <ul style="color: #374151; line-height: 1.8; font-size: 14px;">
            <li>This payment link is valid for ${userData.expiry_hours} hours</li>
            <li>You can pay directly from this email - no login required</li>
            <li>After payment, you can login and access all features</li>
            <li>Your account will be automatically activated upon payment</li>
          </ul>
        </div>
        
        <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin-top: 0;">What You'll Get</h3>
          <ul style="color: #0c4a6e; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Access to alumni directory</li>
            <li>Event registration and participation</li>
            <li>Photo gallery access and uploads</li>
            <li>Blog posts and community updates</li>
            <li>Networking with fellow alumni</li>
            <li>Exclusive member benefits</li>
          </ul>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Need Help?</strong> If you have any questions or face issues with payment, 
            please contact us at <a href="mailto:admin@alumnibghs.org" style="color: #3b82f6;">admin@alumnibghs.org</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
          <p>This is an automated email from BGHS Alumni System</p>
          <p>© 2024 BGHS Alumni Association. All rights reserved.</p>
          <p>Barasat Peary Charan Sarkar Government High School</p>
        </div>
      </div>
    `,
    text: `
BGHS Alumni - Registration Approved!

Dear ${userData.full_name},

Congratulations! Your registration has been approved.

COMPLETE YOUR REGISTRATION
==========================

To activate your account, please complete the one-time registration payment:

Amount: ${currencySymbol}${userData.amount.toFixed(2)}

Payment Link:
${userData.payment_link}

IMPORTANT DETAILS:
- This link is valid for ${userData.expiry_hours} hours
- You can pay directly from this email - no login required
- Your account will be activated automatically after payment
- Secure payment powered by RazorPay

WHAT YOU'LL GET:
✓ Access to alumni directory
✓ Event registration and participation
✓ Photo gallery access and uploads
✓ Blog posts and community updates
✓ Networking with fellow alumni
✓ Exclusive member benefits

Need help? Contact us at admin@alumnibghs.org

Best regards,
BGHS Alumni Association
Barasat Peary Charan Sarkar Government High School

---
This is an automated email. Please do not reply to this email.
    `
  };
}