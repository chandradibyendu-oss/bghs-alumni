/**
 * Payment System Type Definitions
 * These types align with the database schema created in payment-system-schema.sql
 */

// ========================================
// PAYMENT CONFIGURATION TYPES
// ========================================

export type PaymentCategory = 
  | 'registration_fee' 
  | 'event_fee' 
  | 'donation' 
  | 'membership_renewal' 
  | 'other';

export type PaymentGateway = 'razorpay' | 'manual';

export interface PaymentConfiguration {
  id: string;
  category: PaymentCategory;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  is_active: boolean;
  is_mandatory: boolean;
  payment_gateway: PaymentGateway;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentConfigurationInput {
  category: PaymentCategory;
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  is_active?: boolean;
  is_mandatory?: boolean;
  payment_gateway?: PaymentGateway;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentConfigurationInput {
  name?: string;
  description?: string;
  amount?: number;
  is_active?: boolean;
  is_mandatory?: boolean;
  metadata?: Record<string, any>;
}

// ========================================
// PAYMENT TRANSACTION TYPES
// ========================================

export type PaymentStatus = 
  | 'initiated' 
  | 'pending' 
  | 'success' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded';

export type RelatedEntityType = 
  | 'registration' 
  | 'event' 
  | 'donation' 
  | 'membership' 
  | 'other';

export type PaymentMethod = 
  | 'card' 
  | 'upi' 
  | 'netbanking' 
  | 'wallet' 
  | 'other';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  payment_config_id: string | null;
  related_entity_type: RelatedEntityType | null;
  related_entity_id: string | null;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  payment_method: PaymentMethod | null;
  failure_reason: string | null;
  retry_count: number;
  metadata: Record<string, any>;
  initiated_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  user_id: string;
  payment_config_id?: string;
  related_entity_type?: RelatedEntityType;
  related_entity_id?: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionInput {
  payment_status?: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  payment_method?: PaymentMethod;
  failure_reason?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

// ========================================
// PAYMENT RECEIPT TYPES
// ========================================

export interface PaymentReceipt {
  id: string;
  transaction_id: string;
  receipt_number: string;
  pdf_url: string | null;
  issued_at: string;
  created_at: string;
}

export interface CreateReceiptInput {
  transaction_id: string;
  receipt_number: string;
  pdf_url?: string;
}

// ========================================
// PAYMENT NOTIFICATION TYPES
// ========================================

export type NotificationType = 
  | 'payment_initiated' 
  | 'payment_link' 
  | 'payment_success' 
  | 'payment_failed' 
  | 'payment_reminder' 
  | 'receipt_generated';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'retry';

export interface PaymentNotification {
  id: string;
  transaction_id: string;
  recipient_user_id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  retry_count: number;
  max_retries: number;
  scheduled_for: string;
  sent_at: string | null;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  transaction_id: string;
  recipient_user_id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  scheduled_for?: string;
  metadata?: Record<string, any>;
}

// ========================================
// RAZORPAY TYPES
// ========================================

export interface RazorpayOrderOptions {
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: string | number; // RazorPay SDK can return string or number
  amount_paid: string | number;
  amount_due: string | number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: RazorpayPaymentEntity;
    };
    order?: {
      entity: RazorpayOrder;
    };
  };
  created_at: number;
}

export interface RazorpayPaymentEntity {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number | null;
  tax: number | null;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  created_at: number;
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

export interface CreateOrderRequest {
  payment_config_id?: string;
  related_entity_type?: RelatedEntityType;
  related_entity_id?: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface CreateOrderResponse {
  success: boolean;
  transaction_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  razorpay_key_id: string; // Public key for frontend
}

export interface VerifyPaymentRequest {
  transaction_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  transaction: PaymentTransaction;
  receipt?: PaymentReceipt;
}

export interface PaymentStatusResponse {
  success: boolean;
  transaction: PaymentTransaction;
  receipt?: PaymentReceipt;
}

export interface PaymentHistoryResponse {
  success: boolean;
  transactions: PaymentTransaction[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface PaymentStatistics {
  total_transactions: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  total_revenue: number;
  total_refunded: number;
  average_transaction_value: number;
  success_rate: number;
}

export interface UserPaymentSummary {
  total_paid: number;
  total_pending: number;
  total_failed: number;
  last_payment_date: string | null;
}

// ========================================
// ERROR TYPES
// ========================================

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class RazorpayError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'RAZORPAY_ERROR', 500, details);
    this.name = 'RazorpayError';
  }
}

export class TransactionError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'TRANSACTION_ERROR', 400, details);
    this.name = 'TransactionError';
  }
}

export class VerificationError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'VERIFICATION_ERROR', 400, details);
    this.name = 'VerificationError';
  }
}

// ========================================
// UTILITY TYPES
// ========================================

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface FilterParams {
  status?: PaymentStatus;
  category?: PaymentCategory;
  start_date?: string;
  end_date?: string;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sort_by?: 'created_at' | 'amount' | 'status';
  sort_order?: SortOrder;
}
