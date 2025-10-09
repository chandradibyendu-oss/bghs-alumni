/**
 * Mark Payment Token as Used API
 * POST /api/payments/mark-token-used
 * 
 * Marks a payment token as used after successful payment
 * Prevents token reuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { markTokenAsUsed } from '@/lib/payment-link-service';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token is required',
        },
        { status: 400 }
      );
    }

    // Mark token as used
    await markTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: 'Token marked as used',
    });
  } catch (error: any) {
    console.error('Mark token used API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark token as used',
      },
      { status: 500 }
    );
  }
}

// Only POST allowed
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'Use POST method to mark token as used',
    },
    { status: 405 }
  );
}
