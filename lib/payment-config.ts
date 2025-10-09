/**
 * Payment System Configuration
 * Validates and exports environment variables for payment system
 */

// ========================================
// CONFIGURATION VALIDATION
// ========================================

interface PaymentConfig {
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
    mode: 'test' | 'live';
  };
  receipt: {
    bucket: string;
    linkExpiryHours: number;
  };
  notification: {
    adminEmail: string;
  };
  defaults: {
    currency: string;
  };
}

/**
 * Validates required environment variables
 * @throws Error if required variables are missing
 */
function validateEnv(): PaymentConfig {
  const requiredVars = {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  };

  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required payment environment variables: ${missing.join(', ')}\n` +
      `Please check PAYMENT_SYSTEM_ENV_SETUP.md for configuration instructions.`
    );
  }

  return {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID!,
      keySecret: process.env.RAZORPAY_KEY_SECRET!,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      mode: (process.env.RAZORPAY_MODE as 'test' | 'live') || 'test',
    },
    receipt: {
      bucket: process.env.PAYMENT_RECEIPT_BUCKET || 'payment-receipts',
      linkExpiryHours: parseInt(process.env.PAYMENT_LINK_EXPIRY_HOURS || '72', 10),
    },
    notification: {
      adminEmail: process.env.PAYMENT_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@alumnibghs.org',
    },
    defaults: {
      currency: process.env.PAYMENT_DEFAULT_CURRENCY || 'INR',
    },
  };
}

// ========================================
// EXPORT CONFIGURATION
// ========================================

let config: PaymentConfig | null = null;

/**
 * Get payment configuration
 * Lazy loads and validates on first access
 */
export function getPaymentConfig(): PaymentConfig {
  if (!config) {
    config = validateEnv();
  }
  return config;
}

/**
 * Check if payment system is configured
 * Returns false if required env variables are missing
 */
export function isPaymentConfigured(): boolean {
  try {
    getPaymentConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get RazorPay public key ID (safe to expose to frontend)
 */
export function getRazorpayKeyId(): string {
  return getPaymentConfig().razorpay.keyId;
}

/**
 * Check if running in test mode
 */
export function isTestMode(): boolean {
  const config = getPaymentConfig();
  return config.razorpay.mode === 'test';
}

/**
 * Get default currency
 */
export function getDefaultCurrency(): string {
  return getPaymentConfig().defaults.currency;
}

/**
 * Convert amount to smallest currency unit (paise for INR)
 * RazorPay expects amount in paise (1 INR = 100 paise)
 */
export function toPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert amount from smallest currency unit to main unit
 * RazorPay returns amount in paise (can be string or number)
 */
export function fromPaise(amountInPaise: number | string): number {
  const amount = typeof amountInPaise === 'string' ? parseFloat(amountInPaise) : amountInPaise;
  return amount / 100;
}

// ========================================
// CONSTANTS
// ========================================

export const PAYMENT_CONSTANTS = {
  // Transaction statuses
  STATUS: {
    INITIATED: 'initiated',
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  },

  // Payment categories
  CATEGORY: {
    REGISTRATION_FEE: 'registration_fee',
    EVENT_FEE: 'event_fee',
    DONATION: 'donation',
    MEMBERSHIP_RENEWAL: 'membership_renewal',
    OTHER: 'other',
  },

  // Related entity types
  ENTITY_TYPE: {
    REGISTRATION: 'registration',
    EVENT: 'event',
    DONATION: 'donation',
    MEMBERSHIP: 'membership',
    OTHER: 'other',
  },

  // Notification types
  NOTIFICATION_TYPE: {
    PAYMENT_INITIATED: 'payment_initiated',
    PAYMENT_LINK: 'payment_link',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    PAYMENT_REMINDER: 'payment_reminder',
    RECEIPT_GENERATED: 'receipt_generated',
  },

  // Payment methods
  PAYMENT_METHOD: {
    CARD: 'card',
    UPI: 'upi',
    NETBANKING: 'netbanking',
    WALLET: 'wallet',
    OTHER: 'other',
  },

  // Notification channels
  NOTIFICATION_CHANNEL: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
  },

  // Limits and defaults
  MAX_RETRY_COUNT: 3,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RECEIPT_NUMBER_PREFIX: 'BGHS',
} as const;

// ========================================
// LOGGING HELPER
// ========================================

/**
 * Log payment operation (for debugging and audit)
 * In production, this should integrate with your logging service
 */
export function logPaymentOperation(
  operation: string,
  data: Record<string, any>,
  level: 'info' | 'error' | 'warn' = 'info'
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    mode: isTestMode() ? 'TEST' : 'LIVE',
    ...data,
  };

  if (level === 'error') {
    console.error('[Payment Error]', logData);
  } else if (level === 'warn') {
    console.warn('[Payment Warning]', logData);
  } else {
    console.log('[Payment Info]', logData);
  }

  // TODO: In production, send to logging service (e.g., Sentry, LogRocket)
  // if (process.env.NODE_ENV === 'production') {
  //   logToExternalService(logData);
  // }
}
