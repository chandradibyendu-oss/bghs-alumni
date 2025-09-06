import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for admin operations
const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the request body
    const { email, password, first_name, middle_name, last_name, batch_year, profession, company, location, bio, linkedin_url, website_url } = await request.json()

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !batch_year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create the user with admin privileges
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        middle_name,
        last_name,
        batch_year: parseInt(batch_year)
      }
    })

    if (createUserError) {
      console.error('Error creating auth user:', createUserError)
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
    }

    // Create the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name: first_name.trim(),
        middle_name: middle_name ? middle_name.trim() : null,
        last_name: last_name.trim(),
        batch_year: parseInt(batch_year),
        profession: profession || null,
        company: company || null,
        location: location || null,
        bio: bio || null,
        linkedin_url: linkedin_url || null,
        website_url: website_url || null
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // If profile creation fails, we should clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      user: authData.user,
      message: 'User created successfully' 
    })

  } catch (error) {
    console.error('Error in user creation API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch all users
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error in users fetch API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the request body
    const { id, full_name, batch_year, profession, company, location, bio, linkedin_url, website_url, is_approved, role } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Build updates only with provided fields
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (full_name !== undefined) updates.full_name = full_name
    if (batch_year !== undefined) updates.batch_year = Number.parseInt(batch_year)
    if (profession !== undefined) updates.profession = profession || null
    if (company !== undefined) updates.company = company || null
    if (location !== undefined) updates.location = location || null
    if (bio !== undefined) updates.bio = bio || null
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url || null
    if (website_url !== undefined) updates.website_url = website_url || null
    if (role !== undefined) updates.role = role
    if (typeof is_approved === 'boolean') updates.is_approved = is_approved

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // If role provided, also update permissions from user_roles table (if exists)
    if (role !== undefined) {
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('permissions')
        .eq('name', role)
        .single()
      if (roleData?.permissions) {
        await supabaseAdmin
          .from('profiles')
          .update({ permissions: roleData.permissions })
          .eq('id', id)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully' 
    })

  } catch (error) {
    console.error('Error in user update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the user ID from the URL
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Delete the profile first
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return NextResponse.json({ error: 'Failed to delete user profile' }, { status: 500 })
    }

    // Delete the auth user
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      // Note: Auth user deletion might fail if they have active sessions
      // This is not critical for profile deletion
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    })

  } catch (error) {
    console.error('Error in user deletion API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
