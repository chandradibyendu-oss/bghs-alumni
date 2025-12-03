import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Access control configuration
// Set ENABLE_ACCESS_CONTROL=true in your environment variables to enable
const ENABLE_ACCESS_CONTROL = process.env.ENABLE_ACCESS_CONTROL === 'true'

// Test users - set these in your environment variables
// Format: "email1@example.com,email2@example.com"
const ALLOWED_EMAILS = process.env.ALLOWED_TEST_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []

// Password for basic auth (set in environment variables)
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || ''

// Paths that should be excluded from access control (public APIs, etc.)
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/check-user',
  '/_next',
  '/favicon.ico',
  '/bghs-logo.png',
  '/hero-images',
]

// Base64 decode helper for Edge runtime
// atob is available in Edge runtime
function base64Decode(str: string): string {
  return atob(str)
}

export function middleware(request: NextRequest) {
  // If access control is disabled, allow all requests
  if (!ENABLE_ACCESS_CONTROL) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for basic auth header
  const authHeader = request.headers.get('authorization')

  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const base64Credentials = authHeader.split(' ')[1]
      const credentials = base64Decode(base64Credentials)
      const [email, password] = credentials.split(':')

      // Verify password
      if (password === ACCESS_PASSWORD && ACCESS_PASSWORD) {
        // If email whitelist is configured, check it
        if (ALLOWED_EMAILS.length > 0) {
          if (ALLOWED_EMAILS.includes(email.toLowerCase())) {
            return NextResponse.next()
          } else {
            return new NextResponse('Access Denied: Your email is not authorized for testing.', {
              status: 403,
              headers: {
                'WWW-Authenticate': 'Basic realm="Restricted Access"',
              },
            })
          }
        } else {
          // No email whitelist, just check password
          return NextResponse.next()
        }
      }
    } catch (error) {
      // Invalid auth header format
    }
  }

  // No valid auth, return 401
  return new NextResponse('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Restricted Access - Testing Only"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

