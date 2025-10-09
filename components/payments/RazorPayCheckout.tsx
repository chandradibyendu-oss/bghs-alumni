/**
 * RazorPay Checkout Component
 * Handles payment initiation and RazorPay integration
 * Safe, isolated component - doesn't affect existing code
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// RazorPay Options type
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

// Declare RazorPay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorPayCheckoutProps {
  amount: number;
  currency?: string;
  description: string;
  relatedEntityType?: 'event' | 'registration' | 'donation' | 'membership' | 'other';
  relatedEntityId?: string;
  paymentConfigId?: string;
  metadata?: Record<string, any>;
  onSuccess?: (transactionId: string) => void;
  onFailure?: (error: string) => void;
  userDetails?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  buttonText?: string;
  buttonClassName?: string;
}

export default function RazorPayCheckout({
  amount,
  currency = 'INR',
  description,
  relatedEntityType,
  relatedEntityId,
  paymentConfigId,
  metadata,
  onSuccess,
  onFailure,
  userDetails,
  buttonText = 'Pay Now',
  buttonClassName = 'btn-primary',
}: RazorPayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Load RazorPay script dynamically
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Get user session token
   */
  const getSessionToken = async (): Promise<string | null> => {
    try {
      // Get token from Supabase session
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  };

  /**
   * Create payment order via API
   */
  const createOrder = async (token: string) => {
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        payment_config_id: paymentConfigId,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        metadata: metadata || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  };

  /**
   * Verify payment after completion
   */
  const verifyPayment = async (
    token: string,
    transactionId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) => {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_id: transactionId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    return response.json();
  };

  /**
   * Handle payment button click
   */
  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Load RazorPay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load RazorPay. Please check your internet connection.');
      }

      // Step 2: Get user session
      const token = await getSessionToken();
      if (!token) {
        throw new Error('Please login to continue with payment');
      }

      // Step 3: Create order
      const orderData = await createOrder(token);
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      // Step 4: Configure RazorPay options
      const options: RazorpayOptions = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        name: 'BGHS Alumni Association',
        description: description,
        order_id: orderData.razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verificationResult = await verifyPayment(
              token,
              orderData.transaction_id,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verificationResult.success) {
              // Payment successful
              if (onSuccess) {
                onSuccess(orderData.transaction_id);
              } else {
                // Default: redirect to success page
                router.push(`/payments/success?transaction_id=${orderData.transaction_id}`);
              }
            } else {
              throw new Error(verificationResult.message || 'Payment verification failed');
            }
          } catch (error: any) {
            const errorMsg = error.message || 'Payment verification failed';
            setError(errorMsg);
            if (onFailure) {
              onFailure(errorMsg);
            }
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: userDetails?.name,
          email: userDetails?.email,
          contact: userDetails?.contact,
        },
        theme: {
          color: '#3b82f6', // Primary blue color
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setError('Payment cancelled');
          },
        },
      };

      // Step 5: Open RazorPay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMsg = error.message || 'Payment failed. Please try again.';
      setError(errorMsg);
      setIsLoading(false);
      
      if (onFailure) {
        onFailure(errorMsg);
      }
    }
  };

  return (
    <div className="razorpay-checkout">
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`${buttonClassName} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          buttonText
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
