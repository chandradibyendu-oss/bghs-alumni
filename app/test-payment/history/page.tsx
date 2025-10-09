/**
 * Payment History Test Page
 * View all test payment transactions
 * Access at: http://localhost:3000/test-payment/history
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PaymentHistory from '@/components/payments/PaymentHistory';

export default function TestPaymentHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/test-payment" 
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payment Test
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">
            All your test payment transactions
          </p>
        </div>

        {/* Payment History Component */}
        <PaymentHistory pageSize={10} showFilters={true} />
      </div>
    </div>
  );
}
