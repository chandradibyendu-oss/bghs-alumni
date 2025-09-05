import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Admin Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function verifyOTPFromDB(
  email: string | null,
  phone: string | null,
  otp: string
): Promise<boolean> {
  try {
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

    const { data, error } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('otp_hash', otpHash)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return false
    }

    if (email && data.email !== email) return false
    if (phone && data.phone !== phone) return false

    return true
  } catch (error) {
    console.error('OTP verification error:', error)
    return false
  }
}

export async function markOTPAsUsed(
  email: string | null,
  phone: string | null,
  otp: string
): Promise<boolean> {
  try {
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

    const { error } = await supabase
      .from('password_reset_otps')
      .update({ used: true })
      .eq('otp_hash', otpHash)
      .eq('used', false)

    return !error
  } catch (error) {
    console.error('Mark OTP as used error:', error)
    return false
  }
}


