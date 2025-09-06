import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('gallery_photos')
      .select(`
        *,
        photo_categories(name),
        profiles(full_name)
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: photos, error } = await query

    if (error) {
      console.error('Error fetching photos:', error)
      return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
    }

    return NextResponse.json({ photos: photos || [] })
  } catch (error) {
    console.error('Error in gallery API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const { data: permissions } = await supabase.rpc('get_user_permissions', { user_id: user.id })
    const canCreate = permissions?.some((p: any) => 
      ['can_create_content', 'can_manage_content', 'can_access_admin'].includes(p.permission_name)
    )

    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category_id, file_url, thumbnail_url, file_size, width, height } = body

    const { data: photo, error } = await supabase
      .from('gallery_photos')
      .insert({
        title,
        description,
        category_id,
        uploaded_by: user.id,
        file_url,
        thumbnail_url,
        file_size,
        width,
        height,
        is_approved: false // Require approval
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating photo:', error)
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('Error in gallery POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
