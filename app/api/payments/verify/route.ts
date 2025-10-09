/**
 * Verify Payment API
 * POST /api/payments/verify
 * 
 * Verifies payment signature after user completes payment on RazorPay
 * Critical for security - ensures payment is legitimate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayment } from '@/lib/payment-service';
import type { VerifyPaymentRequest } from '@/types/payment.types';

/**
 * Get authenticated user from request
 */
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'You must be logged in to verify payment'
        },
        { status: 401 }
      );
    }

    // Step 2: Parse and validate request body
    const body = await request.json() as VerifyPaymentRequest;
    
    // Validate required fields
    if (!body.transaction_id || !body.razorpay_order_id || 
        !body.razorpay_payment_id || !body.razorpay_signature) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request',
          message: 'Missing required payment verification fields'
        },
        { status: 400 }
      );
    }

    // Step 3: Verify payment (includes signature verification)
    const verificationResponse = await verifyPayment(body);

    // Step 4: Return verification result
    if (verificationResponse.success) {
      return NextResponse.json(verificationResponse, { status: 200 });
    } else {
      return NextResponse.json(verificationResponse, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment verification API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Verification failed',
        message: error.message || 'Failed to verify payment'
      },
      { status: 500 }
    );
  }
}

// Only POST method allowed
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      message: 'Use POST method to verify payment'
    },
    { status: 405 }
  );
}
