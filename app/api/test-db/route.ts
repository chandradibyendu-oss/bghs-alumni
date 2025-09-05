import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        supabaseUrl: !!supabaseUrl,
        serviceRoleKey: !!serviceRoleKey
      }, { status: 500 })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    // Test database connection by counting profiles
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Database connection successful',
      profilesCount: count,
      environment: 'production'
    })

  } catch (error) {
    console.error('Test DB error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

