import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      hasEvidence,
      evidenceFiles,
      hasReferences,
      reference1,
      reference2,
      reference1Valid,
      reference2Valid
    } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate verification requirements
    if (!hasEvidence && !hasReferences) {
      return NextResponse.json(
        { error: 'Either evidence files or references are required for verification' },
        { status: 400 }
      )
    }

    // Validate references if provided
    if (hasReferences) {
      if (!reference1 || !reference2) {
        return NextResponse.json(
          { error: 'Both reference IDs are required when using references' },
          { status: 400 }
        )
      }
      
      if (!reference1Valid || !reference2Valid) {
        return NextResponse.json(
          { error: 'Both reference IDs must be valid' },
          { status: 400 }
        )
      }
    }

    const supabase = supabaseAdmin()

    // Check if verification record already exists
    const { data: existingVerification, error: checkError } = await supabase
      .from('alumni_verification')
      .select('id, verification_status')
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing verification:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing verification' },
        { status: 500 }
      )
    }

    // If verification exists and is not pending, don't allow updates
    if (existingVerification && existingVerification.verification_status !== 'pending') {
      return NextResponse.json(
        { error: 'Verification has already been processed and cannot be modified' },
        { status: 400 }
      )
    }

    // Prepare verification data
    const verificationData = {
      user_id: userId,
      has_evidence: hasEvidence || false,
      evidence_files: hasEvidence && evidenceFiles ? evidenceFiles : [],
      has_references: hasReferences || false,
      reference_1: hasReferences ? reference1 : null,
      reference_2: hasReferences ? reference2 : null,
      reference_1_valid: hasReferences ? reference1Valid : false,
      reference_2_valid: hasReferences ? reference2Valid : false,
      verification_status: 'pending' as const,
      updated_at: new Date().toISOString()
    }

    let result
    let error

    if (existingVerification) {
      // Update existing verification
      const { data, error: updateError } = await supabase
        .from('alumni_verification')
        .update(verificationData)
        .eq('id', existingVerification.id)
        .select()
        .single()

      result = data
      error = updateError
    } else {
      // Create new verification record
      const { data, error: insertError } = await supabase
        .from('alumni_verification')
        .insert(verificationData)
        .select()
        .single()

      result = data
      error = insertError
    }

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save verification data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification data submitted successfully',
      data: {
        id: result.id,
        verification_status: result.verification_status,
        has_evidence: result.has_evidence,
        has_references: result.has_references,
        created_at: result.created_at
      }
    })

  } catch (error) {
    console.error('Verification submission error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to submit verification',
        success: false 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
