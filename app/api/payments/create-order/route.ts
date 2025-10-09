/**
 * Create Payment Order API
 * POST /api/payments/create-order
 * 
 * Creates a new payment transaction and RazorPay order
 * Returns order details for frontend to initiate payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPaymentOrder } from '@/lib/payment-service';
import type { CreateOrderRequest } from '@/types/payment.types';

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
          message: 'You must be logged in to create a payment order'
        },
        { status: 401 }
      );
    }

    // Step 2: Parse and validate request body
    const body = await request.json() as CreateOrderRequest;
    
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid amount',
          message: 'Amount must be greater than 0'
        },
        { status: 400 }
      );
    }

    // Step 3: Create payment order
    const orderResponse = await createPaymentOrder({
      user_id: user.id,
      payment_config_id: body.payment_config_id,
      related_entity_type: body.related_entity_type,
      related_entity_id: body.related_entity_id,
      amount: body.amount,
      currency: body.currency || 'INR',
      metadata: body.metadata || {},
    });

    // Step 4: Return order details to frontend
    return NextResponse.json(orderResponse, { status: 200 });

  } catch (error: any) {
    console.error('Create order API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Order creation failed',
        message: error.message || 'Failed to create payment order'
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
      message: 'Use POST method to create payment order'
    },
    { status: 405 }
  );
}
