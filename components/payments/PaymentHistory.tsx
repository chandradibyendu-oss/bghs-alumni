/**
 * Payment History Component
 * Displays user's payment transaction history with pagination
 * Safe, isolated component - doesn't affect existing code
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react';

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  payment_status: string;
  payment_method: string | null;
  related_entity_type: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  completed_at: string | null;
  failure_reason: string | null;
}

interface PaymentHistoryProps {
  pageSize?: number;
  showFilters?: boolean;
}

export default function PaymentHistory({ 
  pageSize = 10,
  showFilters = true 
}: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
   * Fetch payment history
   */
  const fetchPaymentHistory = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = await getSessionToken();
      if (!token) {
        throw new Error('Please login to view payment history');
      }

      const response = await fetch(
        `/api/payments/history?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment history');
      }

      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.transactions);
        setTotalPages(data.pagination.total_pages);
        setTotalCount(data.pagination.total_count);
      } else {
        throw new Error(data.message || 'Failed to load transactions');
      }
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      setError(error.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory(currentPage);
  }, [currentPage]);

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'initiated':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      case 'initiated':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-800 font-semibold">{error}</p>
        <button
          onClick={() => fetchPaymentHistory(currentPage)}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Payment History</h3>
        <p className="text-gray-600">You haven't made any payments yet.</p>
      </div>
    );
  }

  return (
    <div className="payment-history">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {transactions.length} of {totalCount} transactions
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              {/* Left: Transaction Details */}
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">
                  {getStatusIcon(transaction.payment_status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.payment_status
                      )}`}
                    >
                      {transaction.payment_status.charAt(0).toUpperCase() + 
                       transaction.payment_status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(transaction.created_at)}
                    </p>
                    {transaction.payment_method && (
                      <p className="capitalize">
                        Payment Method: {transaction.payment_method}
                      </p>
                    )}
                    {transaction.related_entity_type && (
                      <p className="capitalize">
                        Type: {transaction.related_entity_type.replace('_', ' ')}
                      </p>
                    )}
                    {transaction.razorpay_payment_id && (
                      <p className="text-xs text-gray-500">
                        Payment ID: {transaction.razorpay_payment_id}
                      </p>
                    )}
                    {transaction.failure_reason && (
                      <p className="text-xs text-red-600">
                        Reason: {transaction.failure_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              {transaction.payment_status === 'success' && (
                <div className="ml-4">
                  <button
                    className="btn-secondary flex items-center gap-2 text-sm"
                    onClick={() => {
                      // TODO: Download receipt
                      alert('Receipt download coming soon!');
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
