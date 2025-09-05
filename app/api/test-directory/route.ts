import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRoleKey: !!serviceRoleKey
      }, { status: 400 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    
    // Test the connection and query
    const { data: users, error, count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ 
        error: 'Supabase query failed',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userCount: count || 0,
      users: users || [],
      message: 'Directory query successful'
    })

  } catch (error) {
    console.error('Error in test directory API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

