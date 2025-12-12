import { NextRequest, NextResponse } from 'next/server'

/**
 * Get allowed origins based on environment
 * In production, only allow specific domains
 * In development, allow localhost
 */
export function getAllowedOrigins(): string[] {
  const origins: string[] = []
  
  // Production domains
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      origins.push(process.env.NEXT_PUBLIC_SITE_URL)
    }
    // Add specific production domains
    origins.push('https://alumnibghs.org')
    origins.push('https://www.alumnibghs.org')
  } else {
    // Development - allow localhost
    origins.push('http://localhost:3000')
    origins.push('http://127.0.0.1:3000')
  }
  
  // Allow additional origins from environment variable
  if (process.env.ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    origins.push(...additionalOrigins)
  }
  
  return origins.filter(Boolean)
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  const allowedOrigins = getAllowedOrigins()
  return allowedOrigins.includes(origin)
}

/**
 * Create CORS headers for response
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin')
  const allowedOrigins = getAllowedOrigins()
  
  // In production, only allow whitelisted origins
  // In development, allow localhost or first allowed origin
  let allowOrigin: string
  if (origin && isOriginAllowed(origin)) {
    allowOrigin = origin
  } else if (process.env.NODE_ENV === 'development') {
    // Development: allow localhost or first allowed origin
    allowOrigin = allowedOrigins[0] || 'http://localhost:3000'
  } else {
    // Production: reject unknown origins by using first allowed origin (not '*')
    allowOrigin = allowedOrigins[0] || 'https://alumnibghs.org'
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: getCorsHeaders(request),
    })
  }
  return null
}

