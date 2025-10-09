/**
 * Validate Payment Token API
 * POST /api/payments/validate-token
 * 
 * Validates a payment link token without requiring login
 * Used by token-based payment pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { validatePaymentToken } from '@/lib/payment-link-service';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Token is required',
        },
        { status: 400 }
      );
    }

    // Validate token
    const validationResult = await validatePaymentToken(token);

    return NextResponse.json(validationResult, {
      status: validationResult.valid ? 200 : 400,
    });
  } catch (error: any) {
    console.error('Token validation API error:', error);

    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to validate token',
      },
      { status: 500 }
    );
  }
}

// Only POST allowed
export async function GET() {
  return NextResponse.json(
    {
      valid: false,
      error: 'Method not allowed',
      message: 'Use POST method to validate token',
    },
    { status: 405 }
  );
}
