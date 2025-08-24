import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Create a Supabase client with anon key for testing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Try to sign in with the credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 400 })
    }

    // Sign out immediately (we're just testing)
    await supabase.auth.signOut()

    return NextResponse.json({ 
      success: true, 
      message: 'User can authenticate successfully',
      user: data.user
    })

  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
