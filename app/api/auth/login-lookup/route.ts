import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json()

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    // Helper to normalize phone input
    const normalizePhone = (raw: string): string[] => {
      const trimmed = raw.trim()
      const digits = trimmed.replace(/\D/g, '')
      const plusDigits = digits.startsWith('+') ? digits : `+${digits}`
      // Return unique candidates preserving original
      const set = new Set<string>([trimmed, digits, plusDigits])
      return Array.from(set).filter(Boolean)
    }

    // Check if it looks like an email
    const isEmail = identifier.includes('@')
    
    let user: { id: string; email: string | null; phone: string | null } | null = null

    if (isEmail) {
      // Look up by email
      const { data: emailUser } = await supabase
        .from('profiles')
        .select('id, email, phone')
        .eq('email', identifier.trim())
        .single()
      
      if (emailUser) {
        user = emailUser as any
      }
    } else {
      // Look up by phone
      const candidates = normalizePhone(String(identifier))
      for (const candidate of candidates) {
        const { data: phoneUser } = await supabase
          .from('profiles')
          .select('id, email, phone')
          .eq('phone', candidate)
          .single()
        if (phoneUser) { 
          user = phoneUser as any
          break 
        }
      }
    }

    // If not found in profiles, check auth.users (Supabase Auth)
    if (!user) {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (!authError && authUsers) {
        let authUser = null as any
        if (isEmail) {
          authUser = authUsers.users.find(u => u.email === identifier.trim())
        } else {
          const candidates = normalizePhone(String(identifier))
          authUser = authUsers.users.find(u => u.phone && candidates.includes(u.phone))
        }
        if (authUser) {
          user = {
            id: authUser.id,
            email: authUser.email,
            phone: authUser.phone
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email or phone number' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      found: true,
      email: user.email,
      phone: user.phone,
      loginMethod: isEmail ? 'email' : 'phone'
    })

  } catch (error) {
    console.error('Login lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
