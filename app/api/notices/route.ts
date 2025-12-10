import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is not set.')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

// GET - Fetch notices (public or authenticated)
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') // Filter by type
    const priority = searchParams.get('priority') // Filter by priority
    const includeExpired = searchParams.get('include_expired') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')
    const eventId = searchParams.get('event_id') // Filter by event

    let query = supabase
      .from('notices')
      .select(`
        *,
        events(id, title, date, location)
      `)
      .order('priority', { ascending: true })
      .order('start_date', { ascending: false })

    // Filter by active status and dates (unless including expired)
    if (!includeExpired) {
      query = query
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .or('end_date.is.null,end_date.gte.' + new Date().toISOString())
    }

    // Filter by type
    if (type) {
      query = query.eq('type', type)
    }

    // Filter by priority
    if (priority) {
      query = query.eq('priority', parseInt(priority))
    }

    // Filter by event
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    // Apply limit
    if (limit > 0) {
      query = query.limit(limit)
    }

    const { data: notices, error } = await query

    if (error) {
      console.error('Error fetching notices:', error)
      return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
    }

    return NextResponse.json({ notices: notices || [] })
  } catch (error) {
    console.error('Error in notices GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create notice (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()
    
    const {
      title,
      content,
      type = 'general',
      priority = 3,
      event_id,
      start_date,
      end_date,
      is_active = true,
      link_url,
      icon = 'info'
    } = body

    // Validate required fields
    if (!title || !content || !start_date) {
      return NextResponse.json(
        { error: 'Title, content, and start_date are required' },
        { status: 400 }
      )
    }

    // Get user for created_by
    const authHeader = request.headers.get('authorization')
    let createdBy = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      createdBy = user?.id || null
    }

    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        title,
        content,
        type,
        priority,
        event_id: event_id || null,
        start_date,
        end_date: end_date || null,
        is_active,
        link_url: link_url || null,
        icon,
        created_by: createdBy
      })
      .select(`
        *,
        events(id, title, date, location)
      `)
      .single()

    if (error) {
      console.error('Error creating notice:', error)
      return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
    }

    return NextResponse.json({ notice }, { status: 201 })
  } catch (error) {
    console.error('Error in notices POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

