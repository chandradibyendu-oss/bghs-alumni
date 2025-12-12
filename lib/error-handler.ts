import { NextResponse } from 'next/server'

/**
 * Safe error handler that prevents information disclosure
 * Logs full error server-side but returns generic message to client
 */
export function handleApiError(error: unknown, context: string = 'API'): NextResponse {
  // Log full error details server-side
  console.error(`${context} error:`, error)
  
  // Extract safe error message
  let errorMessage = 'An unexpected error occurred'
  let statusCode = 500
  
  if (error instanceof Error) {
    // Only expose specific error messages for known client errors
    const clientSafeErrors = [
      'Unauthorized',
      'Forbidden',
      'Not Found',
      'Bad Request',
      'Validation Error'
    ]
    
    const isClientSafe = clientSafeErrors.some(msg => error.message.includes(msg))
    
    if (isClientSafe) {
      errorMessage = error.message
      // Map to appropriate status codes
      if (error.message.includes('Unauthorized')) statusCode = 401
      else if (error.message.includes('Forbidden')) statusCode = 403
      else if (error.message.includes('Not Found')) statusCode = 404
      else if (error.message.includes('Bad Request') || error.message.includes('Validation')) statusCode = 400
    }
    // For other errors, use generic message
  }
  
  return NextResponse.json(
    {
      error: errorMessage,
      success: false
    },
    { status: statusCode }
  )
}

/**
 * Create a safe error response with custom message
 */
export function createErrorResponse(message: string, statusCode: number = 400): NextResponse {
  return NextResponse.json(
    {
      error: message,
      success: false
    },
    { status: statusCode }
  )
}

/**
 * Create a success response
 */
export function createSuccessResponse(data: any, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message })
  })
}

