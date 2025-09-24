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
    const { email, phone, password, first_name, middle_name, last_name, last_class, year_of_leaving, start_class, start_year, profession, company, location, bio, linkedin_url, website_url, batch_year } = await request.json()

    // Validate required fields (use new fields; keep batch_year temporarily optional for back-compat)
    if (!email || !phone || !password || !first_name || !last_name || !(Number.isFinite(Number(year_of_leaving)) && Number(year_of_leaving) > 1900) || !(Number.isFinite(Number(last_class)) && Number(last_class) >= 1 && Number(last_class) <= 12)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create the user with admin privileges
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      phone,
      password,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        first_name,
        middle_name,
        last_name,
        last_class: Number(last_class),
        year_of_leaving: Number(year_of_leaving),
        start_class: start_class ? Number(start_class) : null,
        start_year: start_year ? Number(start_year) : null,
        // legacy value for any consumers still reading it
        batch_year: year_of_leaving ? Number(year_of_leaving) : (batch_year ? Number(batch_year) : null)
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
        phone,
        first_name: first_name.trim(),
        middle_name: middle_name ? middle_name.trim() : null,
        last_name: last_name.trim(),
        last_class: Number(last_class),
        year_of_leaving: Number(year_of_leaving),
        start_class: start_class ? Number(start_class) : null,
        start_year: start_year ? Number(start_year) : null,
        // keep legacy column populated if it still exists
        batch_year: year_of_leaving ? Number(year_of_leaving) : null,
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
    const { id, email, phone, first_name, middle_name, last_name, full_name, last_class, year_of_leaving, start_class, start_year, profession, company, location, bio, linkedin_url, website_url, is_approved, role, batch_year } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Optional: normalize inputs
    const normalizedEmail = typeof email === 'string' && email ? String(email).trim().toLowerCase() : undefined
    const normalizedPhone = typeof phone === 'string' && phone ? String(phone).trim() : undefined

    // Validate uniqueness if email/phone provided
    if (normalizedEmail) {
      // Check profiles for duplicate email (case-insensitive)
      const { data: dupProfiles, error: dupErr } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('email', normalizedEmail)
        .neq('id', id)
      if (dupErr) {
        console.error('Email duplicate check error:', dupErr)
        return NextResponse.json({ error: 'Failed to validate email uniqueness' }, { status: 500 })
      }
      if ((dupProfiles || []).length > 0) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
      // Check Auth (listUsers as no direct select on auth schema)
      const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
      if (listErr) {
        console.error('Auth list users error:', listErr)
        return NextResponse.json({ error: 'Failed to validate email in auth' }, { status: 500 })
      }
      const authDup = (listData.users || []).find(u => (u.email || '').toLowerCase() === normalizedEmail && u.id !== id)
      if (authDup) {
        return NextResponse.json({ error: 'Email already registered in auth' }, { status: 409 })
      }
    }

    if (normalizedPhone) {
      const { data: dupPhones, error: phoneDupErr } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', normalizedPhone)
        .neq('id', id)
      if (phoneDupErr) {
        console.error('Phone duplicate check error:', phoneDupErr)
        return NextResponse.json({ error: 'Failed to validate phone uniqueness' }, { status: 500 })
      }
      if ((dupPhones || []).length > 0) {
        return NextResponse.json({ error: 'Phone already in use' }, { status: 409 })
      }
    }

    // Build updates only with provided fields
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (normalizedEmail !== undefined) updates.email = normalizedEmail
    if (normalizedPhone !== undefined) updates.phone = normalizedPhone
    if (full_name !== undefined) updates.full_name = typeof full_name === 'string' ? full_name.trim() : full_name
    if (first_name !== undefined) updates.first_name = typeof first_name === 'string' ? first_name.trim() : first_name
    if (middle_name !== undefined) updates.middle_name = middle_name === null ? null : (typeof middle_name === 'string' ? middle_name.trim() : middle_name)
    if (last_name !== undefined) updates.last_name = typeof last_name === 'string' ? last_name.trim() : last_name
    if (last_class !== undefined) updates.last_class = last_class === null ? null : Number(last_class)
    if (year_of_leaving !== undefined) updates.year_of_leaving = year_of_leaving === null ? null : Number(year_of_leaving)
    if (start_class !== undefined) updates.start_class = start_class === null ? null : Number(start_class)
    if (start_year !== undefined) updates.start_year = start_year === null ? null : Number(start_year)
    // keep legacy column in sync, if present
    if (year_of_leaving !== undefined) updates.batch_year = year_of_leaving === null ? null : Number(year_of_leaving)
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

    // Update auth email/phone if provided
    if (normalizedEmail || normalizedPhone || first_name !== undefined || middle_name !== undefined || last_name !== undefined) {
      const { error: authUpdateErr } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email: normalizedEmail,
        phone: normalizedPhone,
        email_confirm: normalizedEmail ? true : undefined,
        phone_confirm: normalizedPhone ? true : undefined,
        user_metadata: {
          ...(first_name !== undefined ? { first_name: typeof first_name === 'string' ? first_name.trim() : first_name } : {}),
          ...(middle_name !== undefined ? { middle_name: middle_name === null ? null : (typeof middle_name === 'string' ? middle_name.trim() : middle_name) } : {}),
          ...(last_name !== undefined ? { last_name: typeof last_name === 'string' ? last_name.trim() : last_name } : {})
        }
      } as any)
      if (authUpdateErr) {
        console.error('Auth update error:', authUpdateErr)
        return NextResponse.json({ error: 'Failed to update auth user' }, { status: 500 })
      }
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

    // Get identifiers from the URL
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    const emailRaw = searchParams.get('email')

    if (!userId && !emailRaw) {
      return NextResponse.json({ error: 'User ID or email is required' }, { status: 400 })
    }

    // Resolve to userId if only email is provided
    let resolvedUserId = userId
    if (!resolvedUserId && emailRaw) {
      const normalizedEmail = emailRaw.trim().toLowerCase()
      const { data: authUsers, error: findErr } = await supabaseAdmin.auth.admin.listUsers()
      if (findErr) {
        console.error('Error listing users:', findErr)
        return NextResponse.json({ error: 'Failed to locate user by email' }, { status: 500 })
      }
      const match = authUsers.users.find(u => (u.email || '').toLowerCase() === normalizedEmail)
      if (!match) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      resolvedUserId = match.id
    }

    // Delete from Auth first
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(resolvedUserId as string)
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 })
    }

    // Then delete the profile (and any cascading dependents)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', resolvedUserId as string)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      // Not fatal since auth is already removed; surface warning
      return NextResponse.json({ success: true, warning: 'Auth user deleted, but profile removal failed' })
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
