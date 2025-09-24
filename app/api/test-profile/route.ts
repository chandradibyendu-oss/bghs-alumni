import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const { email, first_name, middle_name, last_name, year_of_leaving, last_class } = await request.json()

    if (!email || !first_name || !last_name) {
      return NextResponse.json({ error: 'email, first_name, last_name required' }, { status: 400 })
    }

    const admin = getAdmin()
    const normalizedEmail = String(email).trim().toLowerCase()

    // Create auth user
    const { data: authRes, error: authErr } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: 'Temp#1234',
      email_confirm: true,
      user_metadata: { first_name, middle_name: middle_name ?? null, last_name }
    })
    if (authErr || !authRes?.user) {
      return NextResponse.json({ error: 'auth create failed', code: (authErr as any)?.code, details: (authErr as any)?.message || String(authErr) }, { status: 500 })
    }

    // Insert profile with name parts
    const { data: insertData, error: insErr } = await admin
      .from('profiles')
      .insert({
        id: authRes.user.id,
        email: normalizedEmail,
        first_name: first_name.trim(),
        middle_name: middle_name ? String(middle_name).trim() : null,
        last_name: String(last_name).trim(),
        last_class: last_class ? Number(last_class) : null,
        year_of_leaving: year_of_leaving ? Number(year_of_leaving) : null,
        // keep legacy column in sync (NOT NULL in schema)
        batch_year: Number(year_of_leaving)
      })
      .select('*')
      .single()

    if (insErr) {
      await admin.auth.admin.deleteUser(authRes.user.id)
      return NextResponse.json({ error: 'profile insert failed', details: insErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: insertData })
  } catch (e) {
    console.error('test-profile POST error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = getAdmin()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const id = searchParams.get('id')

    if (!email && !id) {
      return NextResponse.json({ error: 'email or id required' }, { status: 400 })
    }

    const query = admin.from('profiles').select('id, email, first_name, middle_name, last_name, full_name').limit(1)
    const { data, error } = id
      ? await query.eq('id', id)
      : await query.ilike('email', String(email).trim().toLowerCase())

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ profile: data?.[0] || null })
  } catch (e) {
    console.error('test-profile GET error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}


