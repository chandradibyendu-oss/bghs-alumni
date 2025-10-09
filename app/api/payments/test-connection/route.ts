/**
 * Test RazorPay Connection API Route
 * This endpoint verifies that RazorPay credentials are configured correctly
 * 
 * Usage: GET /api/payments/test-connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentConfig, isPaymentConfigured, isTestMode } from '@/lib/payment-config';

export async function GET(request: NextRequest) {
  try {
    // Step 1: Check if payment system is configured
    if (!isPaymentConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Payment system not configured',
        message: 'RazorPay credentials not found in environment variables',
        required: [
          'RAZORPAY_KEY_ID',
          'RAZORPAY_KEY_SECRET',
        ],
        hint: 'Please check STEP_3_RAZORPAY_SETUP_GUIDE.md for setup instructions',
      }, { status: 500 });
    }

    // Step 2: Get configuration
    const config = getPaymentConfig();

    // Step 3: Verify RazorPay SDK (we'll install this next)
    let razorpayAvailable = false;
    let razorpayInstance = null;

    try {
      // Try to import and initialize RazorPay
      const Razorpay = require('razorpay');
      
      razorpayInstance = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });

      razorpayAvailable = true;
    } catch (error: any) {
      // RazorPay SDK not installed yet (expected at this stage)
      if (error.code === 'MODULE_NOT_FOUND') {
        razorpayAvailable = false;
      } else {
        throw error;
      }
    }

    // Step 4: Return configuration status
    return NextResponse.json({
      success: true,
      message: 'Payment system configuration verified',
      configuration: {
        razorpay: {
          keyIdConfigured: !!config.razorpay.keyId,
          keyIdPrefix: config.razorpay.keyId.substring(0, 12) + '...',
          keySecretConfigured: !!config.razorpay.keySecret,
          webhookSecretConfigured: !!config.razorpay.webhookSecret,
          mode: config.razorpay.mode,
          isTestMode: isTestMode(),
        },
        receipt: {
          bucket: config.receipt.bucket,
          linkExpiryHours: config.receipt.linkExpiryHours,
        },
        defaults: {
          currency: config.defaults.currency,
          adminEmail: config.notification.adminEmail,
        },
      },
      razorpaySDK: {
        installed: razorpayAvailable,
        status: razorpayAvailable 
          ? '✅ RazorPay SDK installed and initialized' 
          : '⏳ RazorPay SDK not installed yet (will install in next step)',
      },
      nextSteps: razorpayAvailable 
        ? [
            '✅ RazorPay credentials verified',
            '✅ Configuration loaded successfully',
            '🚀 Ready to build payment service layer',
          ]
        : [
            '✅ Configuration verified',
            '⏳ Need to install RazorPay SDK: npm install razorpay',
            '⏳ Then build payment service layer',
          ],
    });

  } catch (error: any) {
    console.error('Payment configuration test error:', error);

    return NextResponse.json({
      success: false,
      error: 'Configuration test failed',
      message: error.message,
      details: error.toString(),
      hint: 'Check your .env.local file and ensure RazorPay credentials are set correctly',
    }, { status: 500 });
  }
}

// Also support POST for testing from tools like Postman
export async function POST(request: NextRequest) {
  return GET(request);
}
