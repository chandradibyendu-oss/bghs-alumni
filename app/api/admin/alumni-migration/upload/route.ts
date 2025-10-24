import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const execAsync = promisify(exec)

const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is not set.')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

interface AlumniRecord {
  email: string
  phone?: string
  first_name: string
  last_name: string
  middle_name?: string
  last_class: number
  year_of_leaving: number
  start_class?: number
  start_year?: number
  batch_year: number
  profession?: string
  company?: string
  location?: string
  bio?: string
  linkedin_url?: string
  website_url?: string
  role?: string
  professional_title?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null
  
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create temporary file
    const tempDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const fileExtension = path.extname(file.name).toLowerCase()
    const tempFileName = `migration-${Date.now()}${fileExtension}`
    tempFilePath = path.join(tempDir, tempFileName)
    
    // Write file to temporary location
    const buffer = await file.arrayBuffer()
    fs.writeFileSync(tempFilePath, Buffer.from(buffer))

    // Use Pandoc to convert to CSV if it's an Excel file
    let csvPath = tempFilePath
    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      const csvFileName = tempFileName.replace(fileExtension, '.csv')
      csvPath = path.join(tempDir, csvFileName)
      
      try {
        // Convert Excel to CSV using Pandoc
        await execAsync(`pandoc "${tempFilePath}" -t csv -o "${csvPath}"`)
      } catch (pandocError) {
        // If Pandoc fails, try alternative approach or return error
        console.error('Pandoc conversion failed:', pandocError)
        return NextResponse.json({ error: 'Failed to convert Excel file to CSV' }, { status: 400 })
      }
    }

    // Parse CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const jsonData = parseCSV(csvContent)

    if (!jsonData.length) {
      return NextResponse.json({ error: 'No data found in the file' }, { status: 400 })
    }

    // Process records in batches
    const BATCH_SIZE = 50
    const results = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [] as string[],
      details: [] as Array<{ email: string; status: 'success' | 'failed'; error?: string }>
    }

    // Process in batches to handle large files
    for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
      const batch = jsonData.slice(i, i + BATCH_SIZE)
      const batchResults = await processBatch(batch, supabaseAdmin)
      
      results.processed += batchResults.processed
      results.failed += batchResults.failed
      results.errors.push(...batchResults.errors)
      results.details.push(...batchResults.details)
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to process migration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    // Cleanup temporary files
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath)
        // Also clean up CSV file if it was created
        const csvPath = tempFilePath.replace(/\.(xlsx?|xls)$/i, '.csv')
        if (fs.existsSync(csvPath)) {
          fs.unlinkSync(csvPath)
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup temp files:', cleanupError)
      }
    }
  }
}

async function processBatch(batch: any[], supabaseAdmin: any) {
  const results = {
    processed: 0,
    failed: 0,
    errors: [] as string[],
    details: [] as Array<{ email: string; status: 'success' | 'failed'; error?: string }>
  }

  for (const record of batch) {
    try {
      // Validate and normalize the record
      const alumniRecord = validateAndNormalizeRecord(record)
      
      // Check if user already exists
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', alumniRecord.email)
        .single()

      if (existingProfile) {
        results.failed++
        results.errors.push(`User with email ${alumniRecord.email} already exists`)
        results.details.push({
          email: alumniRecord.email,
          status: 'failed',
          error: 'User already exists'
        })
        continue
      }

      // Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: alumniRecord.email,
        password: generateTemporaryPassword(),
        email_confirm: true
      })

      if (authError || !authUser.user) {
        results.failed++
        results.errors.push(`Failed to create auth user for ${alumniRecord.email}: ${authError?.message}`)
        results.details.push({
          email: alumniRecord.email,
          status: 'failed',
          error: authError?.message || 'Failed to create auth user'
        })
        continue
      }

      // Find professional title ID if provided
      let professionalTitleId = null
      if (alumniRecord.professional_title) {
        const { data: titleData } = await supabaseAdmin
          .from('professional_titles')
          .select('id')
          .eq('title', alumniRecord.professional_title)
          .eq('is_active', true)
          .single()
        
        if (titleData) {
          professionalTitleId = titleData.id
        }
      }

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: alumniRecord.email,
          phone: alumniRecord.phone,
          first_name: alumniRecord.first_name,
          last_name: alumniRecord.last_name,
          middle_name: alumniRecord.middle_name,
          full_name: `${alumniRecord.first_name} ${alumniRecord.middle_name ? alumniRecord.middle_name + ' ' : ''}${alumniRecord.last_name}`.trim(),
          last_class: alumniRecord.last_class,
          year_of_leaving: alumniRecord.year_of_leaving,
          start_class: alumniRecord.start_class,
          start_year: alumniRecord.start_year,
          batch_year: alumniRecord.batch_year,
          profession: alumniRecord.profession,
          company: alumniRecord.company,
          location: alumniRecord.location,
          bio: alumniRecord.bio,
          linkedin_url: alumniRecord.linkedin_url,
          website_url: alumniRecord.website_url,
          role: alumniRecord.role || 'alumni_member',
          professional_title_id: professionalTitleId,
          is_approved: true, // Auto-approve migrated records
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        
        results.failed++
        results.errors.push(`Failed to create profile for ${alumniRecord.email}: ${profileError.message}`)
        results.details.push({
          email: alumniRecord.email,
          status: 'failed',
          error: profileError.message
        })
        continue
      }

      results.processed++
      results.details.push({
        email: alumniRecord.email,
        status: 'success'
      })

    } catch (error) {
      results.failed++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results.errors.push(`Error processing ${record.Email || 'unknown'}: ${errorMessage}`)
      results.details.push({
        email: record.Email || 'unknown',
        status: 'failed',
        error: errorMessage
      })
    }
  }

  return results
}

function validateAndNormalizeRecord(record: any): AlumniRecord {
  // Normalize field names (handle different Excel formats)
  const normalized: any = {}
  
  // Map common variations to standard field names
  const fieldMappings: Record<string, string> = {
    'Email': 'email',
    'email': 'email',
    'First Name': 'first_name',
    'FirstName': 'first_name',
    'first_name': 'first_name',
    'Last Name': 'last_name',
    'LastName': 'last_name',
    'last_name': 'last_name',
    'Middle Name': 'middle_name',
    'MiddleName': 'middle_name',
    'middle_name': 'middle_name',
    'Phone': 'phone',
    'phone': 'phone',
    'Last Class': 'last_class',
    'LastClass': 'last_class',
    'last_class': 'last_class',
    'Year of Leaving': 'year_of_leaving',
    'YearOfLeaving': 'year_of_leaving',
    'year_of_leaving': 'year_of_leaving',
    'Start Class': 'start_class',
    'StartClass': 'start_class',
    'start_class': 'start_class',
    'Start Year': 'start_year',
    'StartYear': 'start_year',
    'start_year': 'start_year',
    'Batch Year': 'batch_year',
    'BatchYear': 'batch_year',
    'batch_year': 'batch_year',
    'Profession': 'profession',
    'profession': 'profession',
    'Company': 'company',
    'company': 'company',
    'Location': 'location',
    'location': 'location',
    'Bio': 'bio',
    'bio': 'bio',
    'LinkedIn URL': 'linkedin_url',
    'LinkedInUrl': 'linkedin_url',
    'linkedin_url': 'linkedin_url',
    'Website URL': 'website_url',
    'WebsiteUrl': 'website_url',
    'website_url': 'website_url',
    'Role': 'role',
    'role': 'role',
    'Professional Title': 'professional_title',
    'ProfessionalTitle': 'professional_title',
    'professional_title': 'professional_title'
  }

  // Apply field mappings
  Object.keys(record).forEach(key => {
    const mappedKey = fieldMappings[key] || key.toLowerCase()
    normalized[mappedKey] = record[key]
  })

  // Validate required fields
  if (!normalized.email) {
    throw new Error('Email is required')
  }
  if (!normalized.first_name) {
    throw new Error('First name is required')
  }
  if (!normalized.last_name) {
    throw new Error('Last name is required')
  }
  if (!normalized.last_class) {
    throw new Error('Last class is required')
  }
  if (!normalized.year_of_leaving) {
    throw new Error('Year of leaving is required')
  }

  // Validate and convert data types
  const alumniRecord: AlumniRecord = {
    email: normalized.email.toString().trim(),
    phone: normalized.phone ? normalized.phone.toString().trim() : undefined,
    first_name: normalized.first_name.toString().trim(),
    last_name: normalized.last_name.toString().trim(),
    middle_name: normalized.middle_name ? normalized.middle_name.toString().trim() : undefined,
    last_class: parseInt(normalized.last_class),
    year_of_leaving: parseInt(normalized.year_of_leaving),
    start_class: normalized.start_class ? parseInt(normalized.start_class) : undefined,
    start_year: normalized.start_year ? parseInt(normalized.start_year) : undefined,
    batch_year: normalized.batch_year ? parseInt(normalized.batch_year) : parseInt(normalized.year_of_leaving),
    profession: normalized.profession ? normalized.profession.toString().trim() : undefined,
    company: normalized.company ? normalized.company.toString().trim() : undefined,
    location: normalized.location ? normalized.location.toString().trim() : undefined,
    bio: normalized.bio ? normalized.bio.toString().trim() : undefined,
    linkedin_url: normalized.linkedin_url ? normalized.linkedin_url.toString().trim() : undefined,
    website_url: normalized.website_url ? normalized.website_url.toString().trim() : undefined,
    role: normalized.role ? normalized.role.toString().trim() : 'alumni_member',
    professional_title: normalized.professional_title ? normalized.professional_title.toString().trim() : undefined
  }

  // Validate data ranges
  if (alumniRecord.last_class < 1 || alumniRecord.last_class > 12) {
    throw new Error('Last class must be between 1 and 12')
  }
  if (alumniRecord.year_of_leaving < 1950 || alumniRecord.year_of_leaving > new Date().getFullYear()) {
    throw new Error('Year of leaving must be between 1950 and current year')
  }
  if (alumniRecord.start_class && (alumniRecord.start_class < 1 || alumniRecord.start_class > 12)) {
    throw new Error('Start class must be between 1 and 12')
  }
  if (alumniRecord.start_year && (alumniRecord.start_year < 1950 || alumniRecord.start_year > new Date().getFullYear())) {
    throw new Error('Start year must be between 1950 and current year')
  }

  return alumniRecord
}

function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  // Parse header row
  const headers = parseCSVLine(lines[0])
  const result: any[] = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue // Skip empty lines
    
    const row: any = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : ''
    })
    result.push(row)
  }

  return result
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

function generateTemporaryPassword(): string {
  // Generate a secure random password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
