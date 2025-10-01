import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { databaseQueue } from '@/lib/queue-service'
import { pdfGenerator, RegistrationPDFData } from '@/lib/pdf-generator'
import { r2Storage } from '@/lib/r2-storage'
import { sendEmail, generateRegistrationNotificationEmail } from '@/lib/email-service'
import { EvidenceFile } from '@/lib/r2-storage'

const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    // Get the job from the queue
    const { data: job, error: jobError } = await supabase
      .from('job_queue')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'pending') {
      return NextResponse.json({ error: 'Job is not pending' }, { status: 400 })
    }

    // Mark job as processing
    await databaseQueue.markJobProcessing(jobId)

    try {
      const { userId } = job.payload

      // Get user data
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        throw new Error('User not found')
      }

      // Get verification data
      const { data: verification, error: verificationError } = await supabase
        .from('alumni_verification')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (verificationError || !verification) {
        throw new Error('Verification data not found')
      }

      // Prepare PDF data
      const evidenceFiles: EvidenceFile[] = verification.evidence_files || []
      const referenceValidation = {
        reference_1: verification.reference_1,
        reference_2: verification.reference_2,
        reference_1_valid: verification.reference_1_valid,
        reference_2_valid: verification.reference_2_valid
      }

      const pdfData: RegistrationPDFData = {
        user: {
          id: user.id,
          first_name: user.first_name || '',
          middle_name: user.middle_name,
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone,
          last_class: user.last_class || 0,
          year_of_leaving: user.year_of_leaving || 0,
          start_class: user.start_class,
          start_year: user.start_year,
          created_at: user.created_at || new Date().toISOString()
        },
        evidenceFiles,
        referenceValidation,
        registrationId: user.id,
        submissionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // Generate PDF
      const pdfBuffer = await pdfGenerator.generateRegistrationPDF(pdfData)

      // Upload PDF to R2
      const timestamp = new Date().toISOString().slice(0, 7) // YYYY-MM
      const fileName = `registration-${userId}-${Date.now()}.pdf`
      const pdfUrl = await r2Storage.uploadRegistrationPDF(pdfBuffer, userId)

      // Update verification record with PDF URL
      const { error: updateError } = await supabase
        .from('alumni_verification')
        .update({
          pdf_url: pdfUrl,
          pdf_generated_at: new Date().toISOString(),
          pdf_generation_status: 'completed'
        })
        .eq('user_id', userId)

      if (updateError) {
        throw new Error(`Failed to update verification record: ${updateError.message}`)
      }

      // Send email with PDF attachment
      const verificationMethod = evidenceFiles.length > 0 
        ? (referenceValidation.reference_1 ? 'Evidence + References' : 'Evidence Only')
        : 'References Only'

      const emailData = {
        first_name: user.first_name || '',
        middle_name: user.middle_name,
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone,
        last_class: user.last_class || 0,
        year_of_leaving: user.year_of_leaving || 0,
        start_class: user.start_class,
        start_year: user.start_year,
        verification_method: verificationMethod,
        evidence_count: evidenceFiles.length,
        reference_count: (referenceValidation.reference_1 ? 1 : 0) + (referenceValidation.reference_2 ? 1 : 0)
      }

      // Download PDF for email attachment
      const pdfResponse = await fetch(pdfUrl)
      const pdfAttachmentBuffer = await pdfResponse.arrayBuffer()

      const emailOptions = generateRegistrationNotificationEmail(emailData)
      emailOptions.attachments = [{
        content: Buffer.from(pdfAttachmentBuffer),
        filename: `registration-${userId}.pdf`,
        type: 'application/pdf'
      }]

      const emailSent = await sendEmail(emailOptions)

      if (!emailSent) {
        throw new Error('Failed to send admin notification email')
      }

      // Mark job as completed
      await databaseQueue.markJobCompleted(jobId, {
        success: true,
        data: {
          pdfUrl,
          emailSent: true,
          userId
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'PDF generated and email sent successfully',
        data: {
          pdfUrl,
          userId
        }
      })

    } catch (error) {
      console.error('PDF processing error:', error)
      
      // Update verification status to failed
      await supabase
        .from('alumni_verification')
        .update({
          pdf_generation_status: 'failed'
        })
        .eq('user_id', job.payload.userId)

      // Mark job as failed
      await databaseQueue.markJobFailed(jobId, error instanceof Error ? error.message : 'Unknown error')

      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'PDF processing failed' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('PDF processing API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

