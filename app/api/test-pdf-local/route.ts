import { NextRequest, NextResponse } from 'next/server'

// Local-only PDF testing - uses local puppeteer with updated template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Use form data directly (flat structure from the form)
    const testData = {
      user: {
        id: body.user?.id || 'test-user-456',
        first_name: body.first_name || body.user?.first_name || 'John', // mandatory
        middle_name: body.middle_name || body.user?.middle_name || undefined, // optional - allow null
        last_name: body.last_name || body.user?.last_name || 'Doe', // mandatory
        email: body.email || body.user?.email || 'john.doe@example.com', // mandatory
        phone: body.phone || body.user?.phone || undefined, // optional - allow null
        last_class: body.last_class || body.user?.last_class || 12, // mandatory
        year_of_leaving: body.year_of_leaving || body.user?.year_of_leaving || 2020, // mandatory
        start_class: body.start_class || body.user?.start_class || undefined, // optional - allow null
        start_year: body.start_year || body.user?.start_year || undefined, // optional - allow null
        created_at: new Date().toISOString()
      },
      evidenceFiles: body.evidenceFiles || [
        {
          name: 'certificate-of-excellence.jpg',
          size: 1024000,
          url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&crop=center',
          type: 'image/jpeg'
        },
        {
          name: 'academic-transcript.pdf',
          size: 512000,
          url: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=Academic+Transcript',
          type: 'application/pdf'
        }
      ],
      referenceValidation: {
        reference_1: body.reference_1 || undefined, // optional - allow null
        reference_2: body.reference_2 || undefined, // optional - allow null
        reference_1_valid: body.reference_1_valid || undefined,
        reference_2_valid: body.reference_2_valid || undefined
      },
      registrationId: body.registrationId || 'test-reg-123',
      submissionDate: body.submissionDate || new Date().toLocaleDateString()
    }

    // Use same PDF generator as production for consistency
    const { pdfGenerator } = await import('@/lib/pdf-generator')
    
    // Generate PDF using the same logic as production
    const pdfBuffer = await pdfGenerator.generateRegistrationPDF(testData)
    
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test-registration.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('PDF test error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'PDF generation failed' 
    }, { status: 500 })
  }
}



export async function GET() {
  return NextResponse.json({
    message: 'Local PDF Test Endpoint (Development Only)',
    usage: 'POST with optional data to generate test PDF using same generator as production',
    note: 'This endpoint uses the same PDF generator as production for consistency'
  })
}
