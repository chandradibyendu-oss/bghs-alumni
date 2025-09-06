import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, middle_name, last_name, batch_year } = await request.json()

    if (!email || !password || !first_name || !last_name || !batch_year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Basic password rule: enforced again by reset route; keep consistent
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!strongPw.test(password)) {
      return NextResponse.json({ error: 'Password must be 8+ chars and include upper, lower, number, and symbol' }, { status: 400 })
    }

    const admin = supabaseAdmin()

    // Create auth user (email confirmation optional here)
    const { data: userRes, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { first_name, middle_name, last_name, batch_year: parseInt(batch_year) }
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
        email,
        first_name: first_name.trim(),
        middle_name: middle_name ? middle_name.trim() : null,
        last_name: last_name.trim(),
        batch_year: parseInt(batch_year),
        is_approved: false
      })

    if (profileErr) {
      console.error('Register profile error:', profileErr)
      await admin.auth.admin.deleteUser(userRes.user.id)
      return NextResponse.json({ error: 'Could not create profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, pendingApproval: true })
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


