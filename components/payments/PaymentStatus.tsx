/**
 * Payment Status Component
 * Displays payment success/failure status with details
 * Safe, isolated component - doesn't affect existing code
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Download, Home, ArrowRight } from 'lucide-react';

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  payment_status: string;
  payment_method: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  completed_at: string | null;
}

interface PaymentStatusProps {
  transactionId: string;
  onContinue?: () => void;
  showActions?: boolean;
}

export default function PaymentStatus({ 
  transactionId,
  onContinue,
  showActions = true,
}: PaymentStatusProps) {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Get user session token
   */
  const getSessionToken = async (): Promise<string | null> => {
    try {
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
   * Fetch transaction status
   */
  const fetchTransactionStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getSessionToken();
      if (!token) {
        throw new Error('Please login to view payment status');
      }

      const response = await fetch(`/api/payments/status/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment status');
      }

      const data = await response.json();
      
      if (data.success) {
        setTransaction(data.transaction);
      } else {
        throw new Error(data.message || 'Failed to load payment status');
      }
    } catch (error: any) {
      console.error('Error fetching payment status:', error);
      setError(error.message || 'Failed to load payment status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) {
      fetchTransactionStatus();
    }
  }, [transactionId]);

  /**
   * Format currency
   */
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-6"></div>
            <p className="text-gray-600">Loading payment status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="text-center">
            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Failed to Load Payment Status
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Transaction not found'}
            </p>
            {showActions && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </button>
                <button
                  onClick={() => fetchTransactionStatus()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Payment Success
  if (transaction.payment_status === 'success') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto animate-bounce" />
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-8">
              Your payment has been processed successfully
            </p>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </span>
                </div>
                
                {transaction.payment_method && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="text-gray-900 capitalize">
                      {transaction.payment_method}
                    </span>
                  </div>
                )}

                {transaction.razorpay_payment_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="text-sm text-gray-700 font-mono">
                      {transaction.razorpay_payment_id}
                    </span>
                  </div>
                )}

                {transaction.completed_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date & Time</span>
                    <span className="text-gray-900">
                      {formatDate(transaction.completed_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    // TODO: Download receipt
                    alert('Receipt download coming soon!');
                  }}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Receipt
                </button>

                {onContinue ? (
                  <button
                    onClick={onContinue}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Go to Dashboard
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Payment Failed
  if (transaction.payment_status === 'failed' || transaction.payment_status === 'cancelled') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="text-center">
            {/* Failed Icon */}
            <div className="mb-6">
              <XCircle className="w-20 h-20 text-red-600 mx-auto" />
            </div>

            {/* Failed Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Payment {transaction.payment_status === 'cancelled' ? 'Cancelled' : 'Failed'}
            </h2>
            <p className="text-gray-600 mb-8">
              {transaction.payment_status === 'cancelled' 
                ? 'You cancelled the payment process'
                : 'Your payment could not be processed'}
            </p>

            {/* Payment Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </span>
                </div>

                {transaction.created_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Attempted On</span>
                    <span className="text-gray-900">
                      {formatDate(transaction.created_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </button>

                <button
                  onClick={() => router.back()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Payment Pending
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="text-center">
          {/* Pending Icon */}
          <div className="mb-6">
            <Clock className="w-20 h-20 text-yellow-600 mx-auto animate-pulse" />
          </div>

          {/* Pending Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Pending
          </h2>
          <p className="text-gray-600 mb-8">
            Your payment is being processed. This may take a few minutes.
          </p>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => fetchTransactionStatus()}
                className="btn-primary"
              >
                Refresh Status
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
