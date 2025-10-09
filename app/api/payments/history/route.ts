/**
 * Payment History API
 * GET /api/payments/history
 * 
 * Gets the authenticated user's payment transaction history
 * Supports pagination via query parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserPaymentHistory } from '@/lib/payment-service';

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

export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'You must be logged in to view payment history'
        },
        { status: 401 }
      );
    }

    // Step 2: Parse pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

    // Validate pagination
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid pagination',
          message: 'Page must be >= 1 and page_size must be between 1 and 100'
        },
        { status: 400 }
      );
    }

    // Step 3: Fetch payment history
    const { transactions, total } = await getUserPaymentHistory(
      user.id,
      page,
      pageSize
    );

    // Step 4: Return paginated results
    return NextResponse.json(
      { 
        success: true,
        transactions,
        pagination: {
          page,
          page_size: pageSize,
          total_count: total,
          total_pages: Math.ceil(total / pageSize),
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Payment history API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch history',
        message: error.message || 'Failed to fetch payment history'
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
      message: 'Use GET method to fetch payment history'
    },
    { status: 405 }
  );
}
