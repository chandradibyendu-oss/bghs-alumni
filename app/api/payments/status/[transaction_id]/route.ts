/**
 * Payment Status API
 * GET /api/payments/status/[transaction_id]
 * 
 * Gets the current status of a payment transaction
 * Used to check payment status after completion or during processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTransaction } from '@/lib/payment-service';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { transaction_id: string } }
) {
  try {
    // Step 1: Authenticate user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'You must be logged in to check payment status'
        },
        { status: 401 }
      );
    }

    // Step 2: Get transaction ID from params
    const { transaction_id } = params;
    
    if (!transaction_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request',
          message: 'Transaction ID is required'
        },
        { status: 400 }
      );
    }

    // Step 3: Fetch transaction
    const transaction = await getTransaction(transaction_id);
    
    if (!transaction) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction not found',
          message: 'No transaction found with the given ID'
        },
        { status: 404 }
      );
    }

    // Step 4: Verify user owns this transaction
    if (transaction.user_id !== user.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'You do not have permission to view this transaction'
        },
        { status: 403 }
      );
    }

    // Step 5: Return transaction status
    return NextResponse.json(
      { 
        success: true, 
        transaction 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Payment status API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch status',
        message: error.message || 'Failed to fetch payment status'
      },
      { status: 500 }
    );
  }
}

// Only GET method allowed
export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      message: 'Use GET method to check payment status'
    },
    { status: 405 }
  );
}
