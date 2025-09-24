import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyOTPFromDB, markOTPAsUsed } from '@/lib/otp-utils'
import { databaseQueue } from '@/lib/queue-service'
import { r2Storage } from '@/lib/r2-storage'

const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  // Capture sessionId early so it's available in catch cleanup
  let sessionIdFromRequest: string | undefined
  try {
    const { 
      email, phone, password, first_name, middle_name, last_name, last_class, year_of_leaving, start_class, start_year, 
      email_otp, phone_otp, verification, sessionId 
    } = await request.json()

    sessionIdFromRequest = sessionId

    // Require email and all other required fields
    if (!email || !password || !first_name || !last_name || !year_of_leaving || !last_class) {
      return NextResponse.json({ error: 'Email and all required fields must be provided' }, { status: 400 })
    }

    // Normalize email (trim + lowercase)
    const normalizedEmail = String(email).trim().toLowerCase()

    // Require email OTP verification
    if (!email_otp || String(email_otp).length !== 6) {
      return NextResponse.json({ error: 'Email OTP is required' }, { status: 400 })
    }
    const emailVerified = await verifyOTPFromDB(normalizedEmail, null, String(email_otp))
    if (!emailVerified) {
      return NextResponse.json({ error: 'Invalid email OTP' }, { status: 400 })
    }
    
    // Phone OTP verification is optional - only if phone is provided
    if (phone) {
      if (phone_otp && String(phone_otp).length === 6) {
        const phoneVerified = await verifyOTPFromDB(null, phone, String(phone_otp))
        if (!phoneVerified) {
          return NextResponse.json({ error: 'Invalid phone OTP' }, { status: 400 })
        }
      }
    }

    // Basic password rule: enforced again by reset route; keep consistent
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!strongPw.test(password)) {
      return NextResponse.json({ error: 'Password must be 8+ chars and include upper, lower, number, and symbol' }, { status: 400 })
    }

    const admin = supabaseAdmin()

    // Create auth user (email is required, phone optional)
    const { data: userRes, error: createErr } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      phone: phone || undefined,
      password,
      email_confirm: true,
      phone_confirm: !!phone,
      user_metadata: { first_name, middle_name, last_name, last_class: Number(last_class), year_of_leaving: Number(year_of_leaving), start_class: start_class ? Number(start_class) : null, start_year: start_year ? Number(start_year) : null, batch_year: Number(year_of_leaving) }
    })

    if (createErr || !userRes?.user) {
      console.error('Register auth error:', createErr)
      return NextResponse.json({ error: 'Could not create account' }, { status: 500 })
    }

    // Create profile pending approval
    const { error: profileErr } = await admin
      .from('profiles')
      .insert({
        id: userRes.user.id,
        email: normalizedEmail,
        phone: phone || null,
        first_name: first_name.trim(),
        middle_name: middle_name ? middle_name.trim() : null,
        last_name: last_name.trim(),
        last_class: Number(last_class),
        year_of_leaving: Number(year_of_leaving),
        start_class: start_class ? Number(start_class) : null,
        start_year: start_year ? Number(start_year) : null,
        // legacy support
        batch_year: Number(year_of_leaving),
        is_approved: false
      })

    if (profileErr) {
      console.error('Register profile error:', profileErr)
      await admin.auth.admin.deleteUser(userRes.user.id)
      return NextResponse.json({ error: 'Could not create profile' }, { status: 500 })
    }

    // Mark OTPs as used
    await markOTPAsUsed(normalizedEmail, null, String(email_otp))
    if (phone && phone_otp) { await markOTPAsUsed(null, phone, String(phone_otp)) }

    // Handle verification data if provided
    if (verification) {
      const {
        has_evidence,
        evidence_files,
        has_references,
        reference_1,
        reference_2,
        reference_1_valid,
        reference_2_valid
      } = verification

      // Validate verification requirements
      if (!has_evidence && !has_references) {
        // Clean up created user and profile if verification is invalid
        await admin.auth.admin.deleteUser(userRes.user.id)
        return NextResponse.json({ 
          error: 'Either evidence files or references are required for verification' 
        }, { status: 400 })
      }

      // Validate references if provided
      if (has_references) {
        if (!reference_1 || !reference_2) {
          await admin.auth.admin.deleteUser(userRes.user.id)
          return NextResponse.json({ 
            error: 'Both reference IDs are required when using references' 
          }, { status: 400 })
        }
        
        if (!reference_1_valid || !reference_2_valid) {
          await admin.auth.admin.deleteUser(userRes.user.id)
          return NextResponse.json({ 
            error: 'Both reference IDs must be valid' 
          }, { status: 400 })
        }
      }

      // Create verification record
      const verificationData = {
        user_id: userRes.user.id,
        has_evidence: has_evidence || false,
        evidence_files: has_evidence && evidence_files ? evidence_files : [],
        has_references: has_references || false,
        reference_1: has_references ? reference_1 : null,
        reference_2: has_references ? reference_2 : null,
        reference_1_valid: has_references ? reference_1_valid : false,
        reference_2_valid: has_references ? reference_2_valid : false,
        verification_status: 'pending'
      }

      const { error: verificationErr } = await admin
        .from('alumni_verification')
        .insert(verificationData)

      if (verificationErr) {
        console.error('Verification creation error:', verificationErr)
        // Clean up created user and profile if verification fails
        await admin.auth.admin.deleteUser(userRes.user.id)
        return NextResponse.json({ 
          error: 'Could not save verification data' 
        }, { status: 500 })
      }

      // Move temporary evidence files to permanent location
      if (sessionId && verification?.has_evidence) {
        try {
          const permanentFiles = await r2Storage.moveTempEvidenceToPermanent(sessionId, userRes.user.id)
          
          // Update verification record with permanent file URLs
          if (permanentFiles.length > 0) {
            await admin
              .from('alumni_verification')
              .update({
                evidence_files: permanentFiles,
                has_evidence: true
              })
              .eq('user_id', userRes.user.id)
          }
        } catch (fileError) {
          console.error('Failed to move temp files to permanent:', fileError)
          // Clean up user if file move fails
          await admin.auth.admin.deleteUser(userRes.user.id)
          return NextResponse.json({ 
            error: 'Failed to process evidence files' 
          }, { status: 500 })
        }
      }

      // Queue PDF generation job for admin notification
      try {
        await databaseQueue.addJob('pdf_generation', { userId: userRes.user.id })
        console.log('PDF generation job queued for user:', userRes.user.id)
      } catch (queueError) {
        console.error('Failed to queue PDF generation:', queueError)
        // Don't fail registration if PDF queue fails - just log the error
      }
    }

    return NextResponse.json({ success: true, pendingApproval: true })
  } catch (e) {
    console.error('Register error:', e)
    
    // Clean up temporary files if sessionId exists
    if (sessionIdFromRequest) {
      try {
        await r2Storage.deleteTempEvidenceFiles(sessionIdFromRequest)
        console.log('Temporary files cleaned up for session:', sessionIdFromRequest)
      } catch (cleanupError) {
        console.error('Failed to cleanup temp files:', cleanupError)
      }
    }
    
    return NextResponse.json({ 
      error: e instanceof Error && e.message.includes('email_exists') 
        ? 'A user with this email address already exists' 
        : 'Internal server error' 
    }, { status: 500 })
  }
}


