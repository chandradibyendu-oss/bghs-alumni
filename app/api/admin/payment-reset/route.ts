import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

// GET: Fetch users with payment status
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch users with payment status
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, payment_status, registration_payment_status, registration_payment_transaction_id, is_approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error in payment reset GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Reset payment status for a specific user
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Reset payment status for the user
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        payment_status: 'pending',
        registration_payment_status: 'pending',
        registration_payment_transaction_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error resetting payment status:', updateError)
      return NextResponse.json({ error: 'Failed to reset payment status' }, { status: 500 })
    }

    // Delete payment transactions for this user (related_entity_id)
    await supabaseAdmin
      .from('payment_transactions')
      .delete()
      .eq('related_entity_id', userId)

    // Delete payment tokens for this user
    await supabaseAdmin
      .from('payment_tokens')
      .delete()
      .eq('user_id', userId)

    // Delete payment notification queue records for this user
    await supabaseAdmin
      .from('payment_notification_queue')
      .delete()
      .eq('recipient_user_id', userId)
      .eq('notification_type', 'payment_link')

    console.log(`[Payment Reset] Reset payment status, transactions, tokens, and notifications for user ${userId}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Payment status reset successfully' 
    })

  } catch (error) {
    console.error('Error in payment reset POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

