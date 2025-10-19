// Custom SMS Service for BGHS Alumni
// Supports multiple SMS providers: MTalkz, Fast2SMS, SMSIndiaHub

export interface SMSProvider {
  name: string
  apiUrl: string
  method: 'GET' | 'POST'
  params: Record<string, string>
}

export interface SMSOptions {
  to: string
  message: string
  provider?: 'mtalkz' | 'fast2sms' | 'smsindiahub' | 'console'
}

export interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
}

// SMS Provider configurations
const SMS_PROVIDERS: Record<string, SMSProvider> = {
  mtalkz: {
    name: 'MTalkz',
    apiUrl: 'https://api.mtalkz.com/api/v2/sms',
    method: 'POST',
    params: {
      username: process.env.MTALKZ_USERNAME || '',
      password: process.env.MTALKZ_PASSWORD || '',
      senderid: process.env.MTALKZ_SENDER_ID || 'BGHS',
      route: '1', // Transactional route
      unicode: '1'
    }
  },
  fast2sms: {
    name: 'Fast2SMS',
    apiUrl: 'https://www.fast2sms.com/dev/bulkV2',
    method: 'POST',
    params: {
      authorization: process.env.FAST2SMS_API_KEY || '',
      route: 'otp',
      flash: '0'
    }
  },
  smsindiahub: {
    name: 'SMSIndiaHub',
    apiUrl: 'https://www.smsindiahub.in/api/bulkSmsApi',
    method: 'POST',
    params: {
      username: process.env.SMSINDIAHUB_USERNAME || '',
      password: process.env.SMSINDIAHUB_PASSWORD || '',
      senderid: process.env.SMSINDIAHUB_SENDER_ID || 'BGHS',
      route: '4' // Transactional route
    }
  }
}

/**
 * Send SMS using the configured provider
 */
export async function sendCustomSMS(options: SMSOptions): Promise<SMSResponse> {
  try {
    // For development, use console output
    if (options.provider === 'console' || process.env.NODE_ENV === 'development') {
      console.log('=== CUSTOM SMS (DEVELOPMENT) ===')
      console.log(`To: ${options.to}`)
      console.log(`Message: ${options.message}`)
      console.log('===============================')
      
      return {
        success: true,
        messageId: `dev_${Date.now()}`
      }
    }

    // Get the configured provider
    const provider = process.env.SMS_PROVIDER || 'console'
    
    if (provider === 'console') {
      return await sendCustomSMS({ ...options, provider: 'console' })
    }

    if (!SMS_PROVIDERS[provider]) {
      throw new Error(`Unsupported SMS provider: ${provider}`)
    }

    const smsProvider = SMS_PROVIDERS[provider]
    
    // Prepare request parameters
    const requestParams = {
      ...smsProvider.params,
      numbers: options.to,
      message: options.message
    }

    // Make API request
    const response = await fetch(smsProvider.apiUrl, {
      method: smsProvider.method,
      headers: {
        'Content-Type': 'application/json',
        ...(smsProvider.name === 'Fast2SMS' && {
          'Authorization': smsProvider.params.authorization
        })
      },
      body: smsProvider.method === 'POST' ? JSON.stringify(requestParams) : undefined
    })

    const result = await response.json()

    // Handle provider-specific response formats
    if (response.ok) {
      return {
        success: true,
        messageId: result.messageId || result.request_id || `sms_${Date.now()}`
      }
    } else {
      return {
        success: false,
        error: result.message || result.error || 'SMS sending failed'
      }
    }

  } catch (error) {
    console.error('Custom SMS service error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Generate OTP SMS message
 */
export function generateOTPSMS(otp: string): string {
  return `Your BGHS Alumni login OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`
}

/**
 * Check if SMS provider is configured
 */
export function isSMSProviderConfigured(): boolean {
  const provider = process.env.SMS_PROVIDER || 'console'
  return provider !== 'console' && SMS_PROVIDERS[provider] !== undefined
}

