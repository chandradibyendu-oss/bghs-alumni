/**
 * Payment Service - Core Business Logic
 * Handles all payment operations with database integration
 * Safe, isolated module - doesn't affect existing code
 */

import { createClient } from '@supabase/supabase-js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  generateReceiptId,
  fetchPaymentDetails,
} from './razorpay-client';
import { getPaymentConfig, PAYMENT_CONSTANTS } from './payment-config';
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  PaymentTransaction,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  PaymentError,
} from '@/types/payment.types';

/**
 * Get Supabase client with service role (for backend operations)
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
 * Create a new payment transaction and RazorPay order
 * This initiates the payment flow
 */
export async function createPaymentOrder(
  input: CreateTransactionInput
): Promise<CreateOrderResponse> {
  const supabase = getSupabaseServiceClient();
  const config = getPaymentConfig();

  try {
    // Step 1: Generate receipt ID
    const receiptId = generateReceiptId();

    // Step 2: Create transaction record in database (initiated status)
    const { data: transaction, error: dbError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: input.user_id,
        payment_config_id: input.payment_config_id || null,
        related_entity_type: input.related_entity_type || null,
        related_entity_id: input.related_entity_id || null,
        amount: input.amount,
        currency: input.currency || config.defaults.currency,
        payment_status: PAYMENT_CONSTANTS.STATUS.INITIATED,
        metadata: {
          ...input.metadata,
          receipt_id: receiptId,
        },
      })
      .select()
      .single();

    if (dbError || !transaction) {
      throw new Error(`Failed to create transaction: ${dbError?.message}`);
    }

    // Step 3: Create RazorPay order
    const razorpayOrder = await createRazorpayOrder(
      input.amount,
      input.currency || config.defaults.currency,
      receiptId,
      {
        transaction_id: transaction.id,
        user_id: input.user_id,
        ...(input.related_entity_type && { entity_type: input.related_entity_type }),
        ...(input.related_entity_id && { entity_id: input.related_entity_id }),
      }
    );

    // Step 4: Update transaction with RazorPay order ID
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        razorpay_order_id: razorpayOrder.id,
        payment_status: PAYMENT_CONSTANTS.STATUS.PENDING,
      })
      .eq('id', transaction.id);

    if (updateError) {
      throw new Error(`Failed to update transaction: ${updateError.message}`);
    }

    // Step 5: Return order details for frontend
    return {
      success: true,
      transaction_id: transaction.id,
      razorpay_order_id: razorpayOrder.id,
      amount: input.amount,
      currency: input.currency || config.defaults.currency,
      razorpay_key_id: config.razorpay.keyId, // Public key for frontend
    };
  } catch (error: any) {
    console.error('Payment order creation failed:', error);
    throw new Error(`Payment order creation failed: ${error.message}`);
  }
}

/**
 * Verify payment after user completes payment on RazorPay
 * This is critical for security - ensures payment is legitimate
 */
export async function verifyPayment(
  request: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  const supabase = getSupabaseServiceClient();

  try {
    // Step 1: Verify signature (CRITICAL FOR SECURITY)
    const isValidSignature = verifyPaymentSignature(
      request.razorpay_order_id,
      request.razorpay_payment_id,
      request.razorpay_signature
    );

    if (!isValidSignature) {
      // Update transaction as failed
      await supabase
        .from('payment_transactions')
        .update({
          payment_status: PAYMENT_CONSTANTS.STATUS.FAILED,
          failure_reason: 'Invalid payment signature',
        })
        .eq('id', request.transaction_id);

      return {
        success: false,
        message: 'Payment verification failed - invalid signature',
        transaction: null as any,
      };
    }

    // Step 2: Fetch payment details from RazorPay
    const paymentDetails = await fetchPaymentDetails(request.razorpay_payment_id);

    // Step 3: Update transaction in database
    const { data: transaction, error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        payment_status: PAYMENT_CONSTANTS.STATUS.SUCCESS,
        razorpay_payment_id: request.razorpay_payment_id,
        razorpay_signature: request.razorpay_signature,
        payment_method: paymentDetails.method || 'unknown',
        completed_at: new Date().toISOString(),
      })
      .eq('id', request.transaction_id)
      .select()
      .single();

    if (updateError || !transaction) {
      throw new Error(`Failed to update transaction: ${updateError?.message}`);
    }

    // Step 4: Update related entity if applicable
    if (transaction.related_entity_type && transaction.related_entity_id) {
      await updateRelatedEntity(
        transaction.related_entity_type,
        transaction.related_entity_id,
        transaction.id
      );
    }

    return {
      success: true,
      message: 'Payment verified successfully',
      transaction: transaction as PaymentTransaction,
    };
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
}

/**
 * Update related entity after successful payment
 * e.g., mark event registration as paid, update profile registration status
 */
async function updateRelatedEntity(
  entityType: string,
  entityId: string,
  transactionId: string
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  try {
    switch (entityType) {
      case PAYMENT_CONSTANTS.ENTITY_TYPE.EVENT:
        // Update event registration
        await supabase
          .from('event_registrations')
          .update({
            payment_status: 'paid',
            payment_transaction_id: transactionId,
            registration_confirmed: true,
          })
          .eq('id', entityId);
        break;

      case PAYMENT_CONSTANTS.ENTITY_TYPE.REGISTRATION:
        // Update profile registration payment status
        await supabase
          .from('profiles')
          .update({
            registration_payment_status: 'paid',
            registration_payment_transaction_id: transactionId,
            payment_status: 'completed', // Mark overall payment status as complete
          })
          .eq('id', entityId);
        
        console.log(`[Payment Service] User ${entityId} registration payment completed`);
        break;

      case PAYMENT_CONSTANTS.ENTITY_TYPE.DONATION:
        // Update donation status
        await supabase
          .from('donations')
          .update({
            payment_status: 'completed',
            payment_transaction_id: transactionId,
          })
          .eq('id', entityId);
        break;

      default:
        console.log(`No update handler for entity type: ${entityType}`);
    }
  } catch (error: any) {
    console.error('Failed to update related entity:', error);
    // Don't throw - payment is already successful, this is just a bonus update
  }
}

/**
 * Get transaction by ID
 */
export async function getTransaction(
  transactionId: string
): Promise<PaymentTransaction | null> {
  const supabase = getSupabaseServiceClient();

  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }

    return data as PaymentTransaction;
  } catch (error: any) {
    console.error('Failed to get transaction:', error);
    return null;
  }
}

/**
 * Get user's payment history
 */
export async function getUserPaymentHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ transactions: PaymentTransaction[]; total: number }> {
  const supabase = getSupabaseServiceClient();

  try {
    const offset = (page - 1) * pageSize;

    // Get transactions
    const { data: transactions, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch transactions: ${fetchError.message}`);
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      throw new Error(`Failed to count transactions: ${countError.message}`);
    }

    return {
      transactions: (transactions || []) as PaymentTransaction[],
      total: count || 0,
    };
  } catch (error: any) {
    console.error('Failed to get payment history:', error);
    return { transactions: [], total: 0 };
  }
}

/**
 * Mark payment as failed
 */
export async function markPaymentFailed(
  transactionId: string,
  reason: string
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  try {
    await supabase
      .from('payment_transactions')
      .update({
        payment_status: PAYMENT_CONSTANTS.STATUS.FAILED,
        failure_reason: reason,
      })
      .eq('id', transactionId);
  } catch (error: any) {
    console.error('Failed to mark payment as failed:', error);
    throw error;
  }
}

/**
 * Get payment statistics (for admin dashboard)
 */
export async function getPaymentStatistics(
  startDate?: string,
  endDate?: string
) {
  const supabase = getSupabaseServiceClient();

  try {
    const { data, error } = await supabase
      .rpc('get_payment_statistics', {
        start_date: startDate || null,
        end_date: endDate || null,
      });

    if (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Failed to get payment statistics:', error);
    return null;
  }
}

/**
 * Get user payment summary
 */
export async function getUserPaymentSummary(userId: string) {
  const supabase = getSupabaseServiceClient();

  try {
    const { data, error } = await supabase
      .rpc('get_user_payment_summary', {
        p_user_id: userId,
      });

    if (error) {
      throw new Error(`Failed to get user summary: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Failed to get user payment summary:', error);
    return null;
  }
}
