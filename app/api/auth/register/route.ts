import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyOTPFromDB, markOTPAsUsed } from '@/lib/otp-utils'

const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const { email, phone, password, first_name, middle_name, last_name, last_class, year_of_leaving, start_class, start_year, email_otp, phone_otp } = await request.json()

    // Require at least one contact method
    if ((!email && !phone) || !password || !first_name || !last_name || !year_of_leaving || !last_class) {
      return NextResponse.json({ error: 'Provide email or phone and all required fields' }, { status: 400 })
    }

    // Require OTP for whichever contact(s) are provided, but at least one must be valid
    let verifiedAny = false
    if (email) {
      if (!email_otp || String(email_otp).length !== 6) {
        // allow phone-only verification if phone supplied
      } else {
        const ok = await verifyOTPFromDB(email, null, String(email_otp))
        if (!ok) return NextResponse.json({ error: 'Invalid email OTP' }, { status: 400 })
        verifiedAny = true
      }
    }
    if (phone) {
      if (!phone_otp || String(phone_otp).length !== 6) {
        // allow email-only verification if email supplied
      } else {
        const ok = await verifyOTPFromDB(null, phone, String(phone_otp))
        if (!ok) return NextResponse.json({ error: 'Invalid phone OTP' }, { status: 400 })
        verifiedAny = true
      }
    }
    if (!verifiedAny) {
      return NextResponse.json({ error: 'Verify email or phone with OTP' }, { status: 400 })
    }

    // Basic password rule: enforced again by reset route; keep consistent
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!strongPw.test(password)) {
      return NextResponse.json({ error: 'Password must be 8+ chars and include upper, lower, number, and symbol' }, { status: 400 })
    }

    const admin = supabaseAdmin()

    // Create auth user (email confirmation optional here)
    const { data: userRes, error: createErr } = await admin.auth.admin.createUser({
      email: email || undefined,
      phone: phone || undefined,
      password,
      email_confirm: !!email,
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
        email: email || null,
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
    if (email && email_otp) { await markOTPAsUsed(email, null, String(email_otp)) }
    if (phone && phone_otp) { await markOTPAsUsed(null, phone, String(phone_otp)) }

    return NextResponse.json({ success: true, pendingApproval: true })
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


