import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generatePassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%^&*()-_=+[]{}'
  const all = upper + lower + digits + symbols
  let pwd = [
    upper[Math.floor(Math.random()*upper.length)],
    lower[Math.floor(Math.random()*lower.length)],
    digits[Math.floor(Math.random()*digits.length)],
    symbols[Math.floor(Math.random()*symbols.length)]
  ]
  for (let i = pwd.length; i < length; i++) {
    pwd.push(all[Math.floor(Math.random()*all.length)])
  }
  return pwd.sort(()=>Math.random()-0.5).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()
    if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })

    const supa = admin()

    // Require an authenticated admin token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.substring(7)
    const { data: { user: caller } } = await supa.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // Generate strong random password
    const newPassword = generatePassword(14)

    // Update in Supabase Auth
    const { error: authErr } = await supa.auth.admin.updateUserById(user_id, {
      password: newPassword,
      email_confirm: true,
      user_metadata: { must_change_password: true }
    })
    if (authErr) {
      console.error('Admin reset password error:', authErr)
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    // Fetch email from profiles/auth
    let email: string | null = null
    const { data: prof } = await supa.from('profiles').select('email').eq('id', user_id).single()
    email = prof?.email || null
    if (!email) {
      const { data: list } = await supa.auth.admin.listUsers()
      const u = list?.users.find(u => u.id === user_id)
      email = u?.email || null
    }

    // Email the user if possible
    if (email) {
      try {
        const { sendEmail } = await import('@/lib/email-service')
        await sendEmail({
          to: email,
          subject: 'BGHS Alumni - Your password has been reset',
          html: `<p>Hello,</p><p>An administrator has reset your password. Your temporary password is:</p><p><strong>${newPassword}</strong></p><p>Please log in and change it immediately.</p>`
        })
      } catch (e) {
        console.warn('Admin reset email send failed:', e)
      }
    }

    return NextResponse.json({ success: true, password: newPassword })
  } catch (e) {
    console.error('Admin reset route error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


