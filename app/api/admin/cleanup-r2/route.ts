import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { r2Storage } from '@/lib/r2-storage'

// Create Supabase client with service role key for admin operations
const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
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
    
    // Verify the user is authenticated and is admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['super_admin', 'content_moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { cleanupType } = await request.json()

    let results = {
      orphanedPdfs: 0,
      orphanedEvidence: 0,
      deletedPdfs: 0,
      deletedEvidence: 0,
      errors: [] as string[]
    }

    if (cleanupType === 'scan' || cleanupType === 'cleanup') {
      // Get all verification records with PDF URLs
      const { data: verifications } = await supabaseAdmin
        .from('alumni_verification')
        .select('pdf_url, evidence_files, user_id')
        .not('pdf_url', 'is', null)

      // Get all user IDs that exist
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id')

      const existingUserIds = new Set(profiles?.map(p => p.id) || [])

      // Find orphaned PDFs
      const orphanedPdfs = verifications?.filter(v => 
        v.pdf_url && !existingUserIds.has(v.user_id)
      ) || []

      // Find orphaned evidence files
      const orphanedEvidence = verifications?.filter(v => 
        v.evidence_files && Array.isArray(v.evidence_files) && 
        v.evidence_files.length > 0 && !existingUserIds.has(v.user_id)
      ) || []

      results.orphanedPdfs = orphanedPdfs.length
      results.orphanedEvidence = orphanedEvidence.length

      if (cleanupType === 'cleanup') {
        // Delete orphaned PDFs
        for (const verification of orphanedPdfs) {
          try {
            if (verification.pdf_url) {
              // Extract the full path from the URL (e.g., registration-pdfs/2025-09/filename.pdf)
              const urlParts = verification.pdf_url.split('/')
              const pdfPath = urlParts.slice(urlParts.indexOf('registration-pdfs')).join('/')
              if (pdfPath) {
                await r2Storage.deleteFile(pdfPath)
                results.deletedPdfs++
                console.log(`Deleted orphaned PDF: ${pdfPath}`)
              }
            }
          } catch (error) {
            results.errors.push(`Failed to delete PDF ${verification.pdf_url}: ${error}`)
          }
        }

        // Delete orphaned evidence files
        for (const verification of orphanedEvidence) {
          try {
            if (verification.evidence_files && Array.isArray(verification.evidence_files)) {
              for (const file of verification.evidence_files) {
                if (file.key) {
                  await r2Storage.deleteFile(file.key)
                  results.deletedEvidence++
                  console.log(`Deleted orphaned evidence: ${file.key}`)
                }
              }
            }
          } catch (error) {
            results.errors.push(`Failed to delete evidence files for user ${verification.user_id}: ${error}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: cleanupType === 'scan' ? 'Orphaned files scan completed' : 'Cleanup completed',
      results
    })

  } catch (error) {
    console.error('R2 cleanup error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
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
    
    // Verify the user is authenticated and is admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['super_admin', 'content_moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get storage statistics
    const { data: verifications } = await supabaseAdmin
      .from('alumni_verification')
      .select('pdf_url, evidence_files')

    const stats = {
      totalPdfs: 0,
      totalEvidenceFiles: 0,
      totalSize: 0
    }

    verifications?.forEach(v => {
      if (v.pdf_url) stats.totalPdfs++
      if (v.evidence_files && Array.isArray(v.evidence_files)) {
        stats.totalEvidenceFiles += v.evidence_files.length
        v.evidence_files.forEach((file: any) => {
          stats.totalSize += file.size || 0
        })
      }
    })

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('R2 stats error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
