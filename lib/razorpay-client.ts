/**
 * RazorPay Client Wrapper
 * Provides a clean interface to RazorPay SDK
 * Safe, isolated module - doesn't affect existing code
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getPaymentConfig, toPaise, fromPaise, logPaymentOperation } from './payment-config';
// Use RazorPay SDK's own types to avoid conflicts
import type { Orders } from 'razorpay/dist/types/orders';

/**
 * Get or create RazorPay instance
 * Singleton pattern for reuse
 */
let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    const config = getPaymentConfig();
    
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });

    logPaymentOperation('razorpay_init', {
      mode: config.razorpay.mode,
      keyIdPrefix: config.razorpay.keyId.substring(0, 12),
    });
  }

  return razorpayInstance;
}

/**
 * Create a RazorPay order
 * @param amount Amount in rupees (will be converted to paise)
 * @param currency Currency code (default: INR)
 * @param receipt Receipt ID for reference
 * @param notes Additional notes/metadata
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt: string,
  notes?: Record<string, string>
): Promise<Orders.RazorpayOrder> {
  try {
    const razorpay = getRazorpayInstance();
    
    const options: Orders.RazorpayOrderCreateRequestBody = {
      amount: toPaise(amount), // Convert to paise
      currency,
      receipt,
      notes: notes || {},
    };

    logPaymentOperation('create_order', {
      amount_inr: amount,
      amount_paise: options.amount,
      receipt,
      currency,
    });

    const order = await razorpay.orders.create(options);

    logPaymentOperation('order_created', {
      order_id: order.id,
      amount: amount,
      status: order.status,
    });

    return order;
  } catch (error: any) {
    logPaymentOperation('order_creation_failed', {
      error: error.message,
      amount,
      receipt,
    }, 'error');
    throw error;
  }
}

/**
 * Verify RazorPay payment signature
 * Critical for security - ensures payment is legitimate
 * 
 * @param orderId RazorPay order ID
 * @param paymentId RazorPay payment ID
 * @param signature Signature from RazorPay
 * @returns true if signature is valid
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const config = getPaymentConfig();
    
    // Generate expected signature
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(text)
      .digest('hex');

    const isValid = expectedSignature === signature;

    logPaymentOperation('signature_verification', {
      order_id: orderId,
      payment_id: paymentId,
      is_valid: isValid,
    }, isValid ? 'info' : 'warn');

    return isValid;
  } catch (error: any) {
    logPaymentOperation('signature_verification_failed', {
      error: error.message,
      order_id: orderId,
      payment_id: paymentId,
    }, 'error');
    return false;
  }
}

/**
 * Verify webhook signature
 * Ensures webhook requests are actually from RazorPay
 * 
 * @param body Raw webhook body (as string)
 * @param signature X-Razorpay-Signature header value
 * @returns true if webhook is authentic
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  try {
    const config = getPaymentConfig();
    
    if (!config.razorpay.webhookSecret) {
      logPaymentOperation('webhook_verification_skipped', {
        reason: 'No webhook secret configured',
      }, 'warn');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;

    logPaymentOperation('webhook_verification', {
      is_valid: isValid,
    }, isValid ? 'info' : 'warn');

    return isValid;
  } catch (error: any) {
    logPaymentOperation('webhook_verification_failed', {
      error: error.message,
    }, 'error');
    return false;
  }
}

/**
 * Fetch payment details from RazorPay
 * @param paymentId RazorPay payment ID
 */
export async function fetchPaymentDetails(paymentId: string) {
  try {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);

    logPaymentOperation('payment_fetched', {
      payment_id: paymentId,
      status: payment.status,
      method: payment.method,
    });

    return payment;
  } catch (error: any) {
    logPaymentOperation('payment_fetch_failed', {
      error: error.message,
      payment_id: paymentId,
    }, 'error');
    throw error;
  }
}

/**
 * Fetch order details from RazorPay
 * @param orderId RazorPay order ID
 */
export async function fetchOrderDetails(orderId: string) {
  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.fetch(orderId);

    logPaymentOperation('order_fetched', {
      order_id: orderId,
      status: order.status,
      amount: fromPaise(order.amount),
    });

    return order;
  } catch (error: any) {
    logPaymentOperation('order_fetch_failed', {
      error: error.message,
      order_id: orderId,
    }, 'error');
    throw error;
  }
}

/**
 * Initiate a refund
 * @param paymentId RazorPay payment ID to refund
 * @param amount Amount to refund in rupees (optional, full refund if not provided)
 */
export async function initiateRefund(
  paymentId: string,
  amount?: number
) {
  try {
    const razorpay = getRazorpayInstance();
    
    const refundData: any = {
      payment_id: paymentId,
    };

    if (amount) {
      refundData.amount = toPaise(amount);
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);

    logPaymentOperation('refund_initiated', {
      payment_id: paymentId,
      refund_id: refund.id,
      amount: amount ? amount : 'full',
    });

    return refund;
  } catch (error: any) {
    logPaymentOperation('refund_failed', {
      error: error.message,
      payment_id: paymentId,
      amount,
    }, 'error');
    throw error;
  }
}

/**
 * Utility: Generate receipt number
 * Format: BGHS-YYYYMMDD-RANDOM
 */
export function generateReceiptId(prefix: string = 'BGHS'): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

/**
 * Utility: Check if order is paid
 */
export function isOrderPaid(order: Orders.RazorpayOrder): boolean {
  return order.status === 'paid' && order.amount_paid === order.amount;
}

/**
 * Utility: Check if order is pending
 */
export function isOrderPending(order: Orders.RazorpayOrder): boolean {
  return order.status === 'created' || order.status === 'attempted';
}
