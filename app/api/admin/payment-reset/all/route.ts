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

// POST: Reset all test payment data
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

    console.log('[Payment Reset All] Starting cleanup of all test payment data')

    // 1. Delete all pending payment notifications
    const { error: queueError } = await supabaseAdmin
      .from('payment_notification_queue')
      .delete()
      .eq('status', 'pending')
      .eq('notification_type', 'payment_link')

    if (queueError) {
      console.error('Error clearing notification queue:', queueError)
    } else {
      console.log('[Payment Reset All] Cleared pending payment notifications')
    }

    // 2. Delete all used payment tokens
    const { error: tokensError } = await supabaseAdmin
      .from('payment_tokens')
      .delete()
      .eq('used', true)

    if (tokensError) {
      console.error('Error clearing payment tokens:', tokensError)
    } else {
      console.log('[Payment Reset All] Cleared used payment tokens')
    }

    // 3. Optionally: Delete all test payment transactions
    // Uncomment if you want to also clear transaction history
    /*
    const { error: transactionsError } = await supabaseAdmin
      .from('payment_transactions')
      .delete()
      .in('payment_status', ['initiated', 'pending', 'failed'])

    if (transactionsError) {
      console.error('Error clearing test transactions:', transactionsError)
    } else {
      console.log('[Payment Reset All] Cleared test payment transactions')
    }
    */

    console.log('[Payment Reset All] Cleanup completed successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'All test payment data reset successfully' 
    })

  } catch (error) {
    console.error('Error in payment reset all:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

