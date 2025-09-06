import { NextRequest, NextResponse } from 'next/server'
import { oneDriveAPI } from '@/lib/onedrive-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.json({ error: `Authentication failed: ${error}` }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ error: 'No authorization code received' }, { status: 400 })
    }

    // Exchange code for tokens
    const tokens = await oneDriveAPI.exchangeCodeForTokens(code)

    // In production, store these tokens securely in your database
    // For now, return them to the user to add to environment variables
    return NextResponse.json({
      success: true,
      message: 'Authentication successful! Add these to your environment variables:',
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in
      },
      instructions: [
        '1. Copy the access_token and refresh_token values',
        '2. Add them to your .env.local file:',
        '   ONEDRIVE_ACCESS_TOKEN=your_access_token_here',
        '   ONEDRIVE_REFRESH_TOKEN=your_refresh_token_here',
        '3. Restart your development server'
      ]
    })

  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.json({ 
      error: 'Authentication failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
