import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Create Supabase admin client to check user status
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user exists in auth.users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
    }

    // Find the specific user
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found in Supabase Auth',
        message: 'The user was not created in the authentication system'
      }, { status: 404 })
    }

    // Check user status
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      }
    })

  } catch (error) {
    console.error('Error debugging user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

