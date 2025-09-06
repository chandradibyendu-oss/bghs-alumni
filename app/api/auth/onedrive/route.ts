import { NextRequest, NextResponse } from 'next/server'
import { oneDriveAPI } from '@/lib/onedrive-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authUrl = oneDriveAPI.getAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate authentication URL' }, { status: 500 })
  }
}
