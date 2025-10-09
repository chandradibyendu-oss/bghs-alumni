/**
 * Payment Link Service
 * Handles secure payment link generation and validation
 * For registration payments that don't require login
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getFullUrl } from './url-utils';

/**
 * Get Supabase client with service role
 */
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * Generate a secure payment token
 */
export function generatePaymentToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token for database storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a payment token and store in database
 * For registration payments
 */
export async function createPaymentTokenForRegistration(
  userId: string,
  amount: number,
  currency: string,
  paymentConfigId?: string
): Promise<{ token: string; expiresAt: string }> {
  const supabase = getSupabaseServiceClient();

  try {
    // Generate token
    const token = generatePaymentToken();
    const tokenHash = hashToken(token);

    // Calculate expiry (72 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    // Store token in database
    const { error } = await supabase
      .from('payment_tokens')
      .insert({
        token_hash: tokenHash,
        user_id: userId,
        payment_config_id: paymentConfigId,
        amount: amount,
        currency: currency,
        token_type: 'registration_payment',
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (error) throw error;

    return { token, expiresAt: expiresAt.toISOString() };
  } catch (error: any) {
    console.error('Failed to create payment token:', error);
    throw new Error(`Failed to create payment token: ${error.message}`);
  }
}

/**
 * Create a payment link for registration payment
 * Returns the full URL with token
 */
export async function createRegistrationPaymentLink(
  userId: string,
  paymentConfigId: string,
  amount: number
): Promise<{ token: string; paymentLink: string }> {
  const supabase = getSupabaseServiceClient();

  try {
    // Generate token
    const token = generatePaymentToken();
    const tokenHash = hashToken(token);

    // Calculate expiry (72 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    // Store token in database
    const { error } = await supabase
      .from('payment_tokens')
      .insert({
        token_hash: tokenHash,
        user_id: userId,
        payment_config_id: paymentConfigId,
        amount: amount,
        token_type: 'registration_payment',
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (error) throw error;

    // Generate payment link
    const paymentLink = getFullUrl(`/payments/registration/${token}`);

    return { token, paymentLink };
  } catch (error: any) {
    console.error('Failed to create payment link:', error);
    throw new Error(`Failed to create payment link: ${error.message}`);
  }
}

/**
 * Validate payment token
 * Returns user info if token is valid
 */
export async function validatePaymentToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  paymentConfigId?: string;
  amount?: number;
  userName?: string;
  userEmail?: string;
  error?: string;
}> {
  const supabase = getSupabaseServiceClient();

  try {
    const tokenHash = hashToken(token);

    // Find token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from('payment_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenData) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return { valid: false, error: 'This payment link has expired' };
    }

    // Check if token was already used
    if (tokenData.used) {
      return { valid: false, error: 'This payment link has already been used' };
    }

    // Fetch user details
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email, registration_payment_status')
      .eq('id', tokenData.user_id)
      .single();

    if (userError || !user) {
      return { valid: false, error: 'User not found' };
    }

    // Check if already paid
    if (user.registration_payment_status === 'paid' || user.registration_payment_status === 'waived') {
      return { valid: false, error: 'Payment already completed' };
    }

    return {
      valid: true,
      userId: user.id,
      paymentConfigId: tokenData.payment_config_id,
      amount: tokenData.amount,
      userName: user.full_name,
      userEmail: user.email,
    };
  } catch (error: any) {
    console.error('Token validation error:', error);
    return { valid: false, error: 'Failed to validate token' };
  }
}

/**
 * Mark token as used after successful payment
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  const supabase = getSupabaseServiceClient();

  try {
    const tokenHash = hashToken(token);

    await supabase
      .from('payment_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);
  } catch (error: any) {
    console.error('Failed to mark token as used:', error);
    // Don't throw - payment already successful, this is just cleanup
  }
}

/**
 * Get active payment configuration by category
 */
export async function getActivePaymentConfig(category: string): Promise<{
  id: string;
  amount: number;
  currency: string;
  name: string;
  is_mandatory: boolean;
} | null> {
  const supabase = getSupabaseServiceClient();

  try {
    const { data, error } = await supabase
      .from('payment_configurations')
      .select('id, amount, currency, name, is_mandatory')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get payment config:', error);
    return null;
  }
}
