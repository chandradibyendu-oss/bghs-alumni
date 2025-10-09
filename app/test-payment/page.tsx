/**
 * Payment System Test Page
 * Use this page to test RazorPay integration
 * Access at: http://localhost:3000/test-payment
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import RazorPayCheckout from '@/components/payments/RazorPayCheckout';

export default function TestPaymentPage() {
  const [amount, setAmount] = useState(500);
  const [description, setDescription] = useState('Test Payment');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [lastResult, setLastResult] = useState<{
    type: 'success' | 'failure';
    message: string;
    transactionId?: string;
  } | null>(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setIsLoggedIn(true);
          
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUserName(profile.full_name);
            setUserEmail(profile.email);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, []);

  const handleSuccess = (transactionId: string) => {
    setLastResult({
      type: 'success',
      message: 'Payment completed successfully!',
      transactionId,
    });
  };

  const handleFailure = (error: string) => {
    setLastResult({
      type: 'failure',
      message: error,
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please login to test the payment system
              </p>
              <Link href="/login" className="btn-primary inline-block">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Payment System Test</h1>
          <p className="text-gray-600 mt-2">
            Test the RazorPay integration with test cards (no real money charged)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary-600" />
              Test Payment
            </h2>

            {/* User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-semibold text-gray-900">{userName}</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1"
                max="100000"
                className="input-field"
                placeholder="Enter amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Test with any amount (no real money charged)
              </p>
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                placeholder="Payment description"
              />
            </div>

            {/* Payment Button */}
            <div className="mb-6">
              <RazorPayCheckout
                amount={amount}
                description={description}
                relatedEntityType="other"
                metadata={{ test: true, page: 'test-payment' }}
                onSuccess={handleSuccess}
                onFailure={handleFailure}
                userDetails={{
                  name: userName,
                  email: userEmail,
                }}
                buttonText={`Pay ₹${amount} (Test)`}
                buttonClassName="btn-primary w-full py-3 text-lg"
              />
            </div>

            {/* Last Result */}
            {lastResult && (
              <div
                className={`rounded-lg p-4 ${
                  lastResult.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {lastResult.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        lastResult.type === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {lastResult.type === 'success' ? 'Success!' : 'Failed'}
                    </p>
                    <p
                      className={`text-sm ${
                        lastResult.type === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {lastResult.message}
                    </p>
                    {lastResult.transactionId && (
                      <p className="text-xs text-gray-600 mt-2">
                        Transaction ID: {lastResult.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Test Instructions */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🧪 Test Card Details
              </h2>
              
              <div className="space-y-4">
                {/* Success Card */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">
                    ✅ Successful Payment
                  </h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Card:</strong> 4111 1111 1111 1111</p>
                    <p><strong>CVV:</strong> Any 3 digits (e.g., 123)</p>
                    <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
                    <p><strong>Name:</strong> Any name</p>
                  </div>
                </div>

                {/* Failure Card */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">
                    ❌ Failed Payment
                  </h3>
                  <div className="text-sm text-red-800 space-y-1">
                    <p><strong>Card:</strong> 4000 0000 0000 0002</p>
                    <p><strong>CVV:</strong> Any 3 digits</p>
                    <p><strong>Expiry:</strong> Any future date</p>
                  </div>
                </div>

                {/* UPI Option */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    💳 UPI Test
                  </h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>UPI ID:</strong> success@razorpay</p>
                    <p className="text-xs text-blue-600">
                      Will show success immediately
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 How to Test
              </h2>
              
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="font-bold text-primary-600">1.</span>
                  <span>Enter an amount and click "Pay ₹500 (Test)"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary-600">2.</span>
                  <span>RazorPay checkout will open in a modal</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary-600">3.</span>
                  <span>Select "Card" as payment method</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary-600">4.</span>
                  <span>Enter test card details (see above)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary-600">5.</span>
                  <span>Click "Pay Now" in RazorPay modal</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary-600">6.</span>
                  <span>You'll see success/failure message</span>
                </li>
              </ol>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is test mode. No real money is charged.
                  All transactions are recorded in your database.
                </p>
              </div>
            </div>

            {/* View History */}
            <div className="mt-6">
              <Link
                href="/test-payment/history"
                className="btn-secondary w-full text-center"
              >
                View Payment History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
