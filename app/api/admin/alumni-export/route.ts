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

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Fetch all alumni profiles with pagination (Supabase has a default limit of 1000)
    let allProfiles: any[] = []
    let page = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          email,
          phone,
          first_name,
          middle_name,
          last_name,
          last_class,
          year_of_leaving,
          start_class,
          start_year,
          batch_year,
          profession,
          company,
          location,
          bio,
          linkedin_url,
          website_url,
          role,
          registration_id,
          old_registration_id,
          is_deceased,
          deceased_year,
          professional_title_id,
          professional_titles(title)
        `)
        .order('registration_id', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) {
        console.error(`Error fetching profiles (page ${page}):`, error)
        return NextResponse.json({ error: 'Failed to fetch alumni data' }, { status: 500 })
      }

      if (profiles && profiles.length > 0) {
        allProfiles = allProfiles.concat(profiles)
        console.log(`Fetched page ${page}: ${profiles.length} records (total so far: ${allProfiles.length})`)
        
        // If we got fewer records than pageSize, we've reached the end
        if (profiles.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }
    }

    if (allProfiles.length === 0) {
      return NextResponse.json({ error: 'No alumni data found' }, { status: 404 })
    }

    console.log(`Total profiles fetched: ${allProfiles.length}`)
    const profiles = allProfiles

    // Convert to CSV format matching the template
    const csvRows: string[] = []
    
    // Header row - matching the exact template format
    csvRows.push([
      'Old Registration Number',
      'Registration Number',
      'Email',
      'Phone',
      'Title Prefix',
      'First Name',
      'Middle Name',
      'Last Name',
      'Last Class',
      'Year of Leaving',
      'Start Class',
      'Start Year',
      'Batch Year',
      'Profession',
      'Company',
      'Location',
      'Bio',
      'LinkedIn URL',
      'Website URL',
      'Role',
      'Is Deceased',
      'Deceased Year',
      'Notes'
    ].join(','))

    // Data rows
    for (const profile of profiles) {
      const professionalTitle = Array.isArray(profile.professional_titles) 
        ? profile.professional_titles[0]?.title 
        : profile.professional_titles?.title || ''
      
      // Extract title prefix (e.g., "Dr.", "Prof.") from professional title
      const titlePrefix = professionalTitle || ''
      
      const row = [
        escapeCSV(profile.old_registration_id || ''),
        escapeCSV(profile.registration_id || ''),
        escapeCSV(profile.email || ''),
        escapeCSV(profile.phone || ''),
        escapeCSV(titlePrefix),
        escapeCSV(profile.first_name || ''),
        escapeCSV(profile.middle_name || ''),
        escapeCSV(profile.last_name || ''),
        escapeCSV(profile.last_class?.toString() || ''),
        escapeCSV(profile.year_of_leaving?.toString() || ''),
        escapeCSV(profile.start_class?.toString() || ''),
        escapeCSV(profile.start_year?.toString() || ''),
        escapeCSV(profile.batch_year?.toString() || ''),
        escapeCSV(profile.profession || ''),
        escapeCSV(profile.company || ''),
        escapeCSV(profile.location || ''),
        escapeCSV(profile.bio || ''),
        escapeCSV(profile.linkedin_url || ''),
        escapeCSV(profile.website_url || ''),
        escapeCSV(profile.role || 'alumni_member'),
        escapeCSV(profile.is_deceased ? 'TRUE' : 'FALSE'),
        escapeCSV(profile.deceased_year?.toString() || ''),
        escapeCSV('') // Notes column - empty by default
      ]
      
      csvRows.push(row.join(','))
    }

    const csvContent = csvRows.join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="alumni-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export alumni data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to escape CSV values
function escapeCSV(value: string): string {
  if (!value) return ''
  
  // Convert to string and trim
  const str = String(value).trim()
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  
  return str
}

