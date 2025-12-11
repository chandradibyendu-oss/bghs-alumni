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

// GET - Fetch single notice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()
    
    const { data: notice, error } = await supabase
      .from('notices')
      .select(`
        *,
        events(id, title, date, location, description)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching notice:', error)
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    return NextResponse.json({ notice })
  } catch (error) {
    console.error('Error in notice GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update notice (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()
    
    const {
      title,
      content,
      type,
      priority,
      event_id,
      start_date,
      end_date,
      is_active,
      is_public,
      link_url,
      icon
    } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (type !== undefined) updateData.type = type
    if (priority !== undefined) updateData.priority = priority
    if (event_id !== undefined) updateData.event_id = event_id || null
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date || null
    if (is_active !== undefined) updateData.is_active = is_active
    if (is_public !== undefined) updateData.is_public = is_public
    if (link_url !== undefined) updateData.link_url = link_url || null
    if (icon !== undefined) updateData.icon = icon

    const { data: notice, error } = await supabase
      .from('notices')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        events(id, title, date, location)
      `)
      .single()

    if (error) {
      console.error('Error updating notice:', error)
      return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 })
    }

    return NextResponse.json({ notice })
  } catch (error) {
    console.error('Error in notice PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete notice (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()
    
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting notice:', error)
      return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in notice DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

