/**
 * Registration Payment Link Page
 * Token-based payment - NO LOGIN REQUIRED
 * Users access this from email approval link
 * URL: /payments/registration/[token]
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Shield, CreditCard } from 'lucide-react';
import RazorPayCheckout from '@/components/payments/RazorPayCheckout';

interface TokenValidation {
  valid: boolean;
  userId?: string;
  paymentConfigId?: string;
  amount?: number;
  userName?: string;
  userEmail?: string;
  error?: string;
}

export default function RegistrationPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [validating, setValidating] = useState(true);
  const [tokenData, setTokenData] = useState<TokenValidation | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setValidating(true);

      const response = await fetch(`/api/payments/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setTokenData(data);
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenData({
        valid: false,
        error: 'Failed to validate payment link',
      });
    } finally {
      setValidating(false);
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    setPaymentComplete(true);
    
    // Mark token as used
    try {
      await fetch(`/api/payments/mark-token-used`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('Failed to mark token as used:', error);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
          <p className="text-gray-600">Verifying payment link...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!tokenData || !tokenData.valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
          <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Payment Link</h2>
          <p className="text-gray-600 mb-6">
            {tokenData?.error || 'This payment link is invalid or has expired.'}
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Possible reasons:
            </p>
            <ul className="text-sm text-left text-gray-600 space-y-1">
              <li>• Link has expired (valid for 72 hours)</li>
              <li>• Payment already completed</li>
              <li>• Link was already used</li>
              <li>• Invalid or corrupted link</li>
            </ul>
          </div>
          <div className="mt-8 space-y-3">
            <a href="/login" className="btn-primary inline-block w-full">
              Login to Your Account
            </a>
            <a href="mailto:admin@alumnibghs.org" className="text-sm text-primary-600 hover:text-primary-700">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Payment completed
  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your registration payment has been completed successfully.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              ✅ Your account is now fully activated!
            </p>
            <p className="text-green-700 text-xs mt-2">
              You can now access all alumni features and benefits.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="btn-primary w-full"
            >
              Login to Your Account
            </button>
            <a href="/" className="btn-secondary inline-block w-full">
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Valid token - Show payment form
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="/bghs-logo.png" 
              alt="BGHS Alumni" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Registration
            </h1>
            <p className="text-gray-600">
              One-time registration payment to activate your alumni account
            </p>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">
                  {tokenData.userName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{tokenData.userName}</h2>
                <p className="text-sm text-gray-600">{tokenData.userEmail}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Registration Fee</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{tokenData.amount?.toFixed(2)}
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 font-semibold text-sm">Secure Payment</p>
                    <p className="text-blue-700 text-xs mt-1">
                      Powered by RazorPay - Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-900 font-semibold text-sm">What Happens Next?</p>
                    <ul className="text-green-700 text-xs mt-2 space-y-1">
                      <li>• Account activated immediately after payment</li>
                      <li>• Login credentials remain the same</li>
                      <li>• Full access to all alumni features</li>
                      <li>• Receipt sent to your email</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="text-center">
              <RazorPayCheckout
                amount={tokenData.amount || 0}
                description="BGHS Alumni Registration Fee"
                relatedEntityType="registration"
                relatedEntityId={tokenData.userId}
                paymentConfigId={tokenData.paymentConfigId}
                metadata={{
                  token: token,
                  payment_type: 'registration',
                  user_email: tokenData.userEmail,
                }}
                onSuccess={handlePaymentSuccess}
                onFailure={(error) => {
                  alert(`Payment failed: ${error}`);
                }}
                userDetails={{
                  name: tokenData.userName,
                  email: tokenData.userEmail,
                }}
                buttonText={`Pay ₹${tokenData.amount?.toFixed(2)} Now`}
                buttonClassName="btn-primary w-full py-4 text-lg"
              />
              
              <p className="text-xs text-gray-500 mt-4">
                By clicking "Pay Now", you agree to complete the registration payment
              </p>
            </div>
          </div>

          {/* Help Section */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need help with payment?
            </p>
            <a 
              href="mailto:admin@alumnibghs.org" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Contact Admin Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
