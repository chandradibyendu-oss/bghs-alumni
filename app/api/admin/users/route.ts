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
        website_url: website_url || null,
        // Admin-created users are immediately approved and get registration IDs
        is_approved: true,
        import_source: 'admin_created'
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

    // First, get the total count from database
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('[API] Error getting total count:', countError)
    } else {
      console.log('[API] Total records in database (from count):', totalCount)
    }

    // Fetch all users - use service role to bypass RLS
    // Supabase has a default limit of 1000, so we need to fetch in batches if needed
    let allUsers: any[] = []
    let page = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) {
        console.error(`[API] Error fetching users (page ${page}):`, error)
        break
      }

      if (users && users.length > 0) {
        allUsers = allUsers.concat(users)
        console.log(`[API] Fetched page ${page}: ${users.length} records (total so far: ${allUsers.length})`)
        
        // If we got fewer records than pageSize, we've reached the end
        if (users.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }
    }

    let finalUsers = allUsers
    
    // Verify count matches
    console.log('[API] Total users fetched from database:', finalUsers.length)
    if (totalCount !== null && totalCount !== undefined) {
      if (finalUsers.length !== totalCount) {
        console.error(`[API] COUNT MISMATCH! Database has ${totalCount} records, but API returned ${finalUsers.length} records`)
      } else {
        console.log('[API] ✓ Count matches database:', finalUsers.length, 'records')
      }
    }
    
    // Direct check for the specific emails
    const targetEmails = ['chandra.dibyendu@gmail.com', 'bghsa202501123@alumnibghs.org']
    const foundTargets = finalUsers.filter((u: any) => 
      targetEmails.some(e => u.email?.toLowerCase() === e.toLowerCase())
    )
    
    console.log('[API] Target emails found in main query:', foundTargets.length, 'out of', targetEmails.length)
    foundTargets.forEach((u: any) => {
      console.log('[API] ✓ Found target:', { id: u.id, email: u.email, full_name: u.full_name })
    })
    
    // Check for missing emails and fetch them separately if needed
    const missingEmails = targetEmails.filter(targetEmail => 
      !finalUsers.some((u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase())
    )
    
    if (missingEmails.length > 0) {
      console.warn('[API] Missing emails in main query:', missingEmails)
      
      // Fetch missing records individually
      for (const missingEmail of missingEmails) {
        const { data: missingUser, error: missingError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', missingEmail)
          .maybeSingle()
        
        if (missingError) {
          console.error(`[API] Error fetching ${missingEmail}:`, missingError)
        } else if (missingUser) {
          // Check if it's already in the array (case-insensitive check)
          const exists = finalUsers.some((u: any) => 
            u.id === missingUser.id || 
            u.email?.toLowerCase() === missingUser.email?.toLowerCase()
          )
          
          if (!exists) {
            finalUsers.push(missingUser)
            console.log(`[API] ✓ Added missing user: ${missingUser.email}`)
          } else {
            console.log(`[API] User ${missingEmail} already exists in array (duplicate check)`)
          }
        } else {
          console.warn(`[API] User ${missingEmail} not found in database`)
        }
      }
    }
    
    // Final verification
    const finalCheck = finalUsers.filter((u: any) => 
      targetEmails.some(e => u.email?.toLowerCase() === e.toLowerCase())
    )
    console.log('[API] Final count of target emails:', finalCheck.length, 'out of', targetEmails.length)
    finalCheck.forEach((u: any) => {
      console.log('[API] Final check - Found:', { id: u.id, email: u.email, full_name: u.full_name })
    })

    return NextResponse.json({ users: finalUsers })

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
    const { id, email, phone, first_name, middle_name, last_name, full_name, last_class, year_of_leaving, start_class, start_year, profession, company, location, bio, linkedin_url, website_url, is_approved, role, batch_year, is_deceased, deceased_year } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Fetch current profile to detect approval changes
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_approved, email, first_name, last_name, full_name, payment_status, registration_payment_status')
      .eq('id', id)
      .single()
    
    const wasApproved = currentProfile?.is_approved === true
    const isNowApproved = is_approved === true
    const approvalStatusChanged = !wasApproved && isNowApproved

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
    if (typeof is_deceased === 'boolean') {
      updates.is_deceased = is_deceased
      updates.deceased_updated_by = user.id
      updates.deceased_updated_at = new Date().toISOString()
    }
    if (deceased_year !== undefined) updates.deceased_year = deceased_year === null ? null : Number(deceased_year)

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

    // PAYMENT WORKFLOW: If user was just approved, check for registration payment requirement
    if (approvalStatusChanged) {
      try {
        // Check if user already paid (don't send duplicate payment requests)
        const shouldRequestPayment = currentProfile?.payment_status !== 'completed' && 
                                     currentProfile?.registration_payment_status !== 'paid'
        
        if (!shouldRequestPayment) {
          console.log(`[Payment Workflow] User ${id} already completed payment, skipping email`)
        } else {
          // Check if registration payment is required and active
          const { data: paymentConfig } = await supabaseAdmin
            .from('payment_configurations')
            .select('*')
            .eq('category', 'registration_fee')
            .eq('is_active', true)
            .single()

          if (paymentConfig && paymentConfig.is_mandatory) {
          // Import payment utilities dynamically
          const { createPaymentTokenForRegistration } = await import('@/lib/payment-link-service')
          const { generatePaymentLinkEmail } = await import('@/lib/email-service')
          const { getPaymentConfig } = await import('@/lib/payment-config')
          const { getBaseUrl } = await import('@/lib/url-utils')
          
          const userEmail = normalizedEmail || currentProfile?.email
          const userName = (first_name || currentProfile?.first_name || '') + ' ' + (last_name || currentProfile?.last_name || '')
          const userFullName = full_name || currentProfile?.full_name || userName.trim()
          
          if (userEmail && paymentConfig.amount > 0) {
            // Generate secure payment token
            const tokenData = await createPaymentTokenForRegistration(
              id,
              paymentConfig.amount,
              paymentConfig.currency,
              paymentConfig.id
            )

            // Build payment link
            const baseUrl = getBaseUrl()
            const paymentLink = `${baseUrl}/payments/registration/${tokenData.token}`

            // Generate email
            const emailConfig = getPaymentConfig()
            const emailData = generatePaymentLinkEmail({
              full_name: userFullName || 'Alumni Member',
              email: userEmail,
              amount: paymentConfig.amount,
              currency: paymentConfig.currency,
              payment_link: paymentLink,
              expiry_hours: emailConfig.receipt.linkExpiryHours
            })

            // Queue email notification
            // Note: transaction_id is null since payment hasn't happened yet
            await supabaseAdmin
              .from('payment_notification_queue')
              .insert({
                transaction_id: null, // Will be linked after payment
                recipient_user_id: id,
                notification_type: 'payment_link',
                channel: 'email',
                status: 'queued',
                metadata: {
                  payment_type: 'registration',
                  amount: paymentConfig.amount,
                  currency: paymentConfig.currency,
                  token: tokenData.token,
                  payment_link: paymentLink,
                  email: userEmail,
                  subject: emailData.subject,
                  body: emailData.html
                }
              })

            // Update user's payment status to pending
            await supabaseAdmin
              .from('profiles')
              .update({ payment_status: 'pending' })
              .eq('id', id)

            console.log(`[Payment Workflow] Payment link sent to ${userEmail} for registration approval`)
          }
        }
        }
      } catch (paymentError) {
        console.error('[Payment Workflow] Error sending payment link:', paymentError)
        // Don't fail the approval if payment email fails - log and continue
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

    // Get verification data before deletion to clean up R2 files
    const { data: verification } = await supabaseAdmin
      .from('alumni_verification')
      .select('pdf_url, evidence_files')
      .eq('user_id', resolvedUserId as string)
      .single()

    // Delete job queue entries for this user
    const { error: jobQueueError } = await supabaseAdmin
      .from('job_queue')
      .delete()
      .eq('payload->>userId', resolvedUserId as string)

    if (jobQueueError) {
      console.error('Error deleting job queue entries:', jobQueueError)
      // Not fatal, just log the error
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

    // Clean up R2 files if verification data exists
    if (verification) {
      try {
        const { r2Storage } = await import('@/lib/r2-storage')
        
        // Delete PDF file
        if (verification.pdf_url) {
          // Extract the full path from the URL (e.g., registration-pdfs/2025-09/filename.pdf)
          const urlParts = verification.pdf_url.split('/')
          const pdfPath = urlParts.slice(urlParts.indexOf('registration-pdfs')).join('/')
          if (pdfPath) {
            await r2Storage.deleteFile(pdfPath)
            console.log(`Deleted PDF file: ${pdfPath}`)
          }
        }

        // Delete evidence files
        if (verification.evidence_files && Array.isArray(verification.evidence_files)) {
          for (const file of verification.evidence_files) {
            if (file.key) {
              await r2Storage.deleteFile(file.key)
              console.log(`Deleted evidence file: ${file.key}`)
            }
          }
        }
      } catch (r2Error) {
        console.error('Error cleaning up R2 files:', r2Error)
        // Don't fail the deletion, just log the error
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully',
      cleanup: {
        database: true,
        r2Files: verification ? true : false
      }
    })

  } catch (error) {
    console.error('Error in user deletion API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
