import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Create Supabase client with service role key
const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Get total count of approved alumni
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)

    if (countError) {
      console.error('Error fetching total count:', countError)
      return NextResponse.json({ error: 'Failed to fetch alumni count' }, { status: 500 })
    }

    // Get unique professions (excluding null and anonymized values)
    const { data: professionData, error: professionError } = await supabaseAdmin
      .from('profiles')
      .select('profession')
      .eq('is_approved', true)
      .not('profession', 'is', null)

    const uniqueProfessions = new Set<string>()
    if (!professionError && professionData) {
      professionData.forEach(p => {
        if (p.profession && p.profession !== 'BGHS Alumni') {
          uniqueProfessions.add(p.profession)
        }
      })
    }

    // Get unique year decades from year_of_leaving
    const { data: yearData, error: yearError } = await supabaseAdmin
      .from('profiles')
      .select('year_of_leaving')
      .eq('is_approved', true)
      .not('year_of_leaving', 'is', null)

    const uniqueDecades = new Set<string>()
    if (!yearError && yearData) {
      yearData.forEach(p => {
        if (p.year_of_leaving) {
          const decade = Math.floor(p.year_of_leaving / 10) * 10
          uniqueDecades.add(`${decade}s`)
        }
      })
    }

    // Get unique classes
    const { data: classData, error: classError } = await supabaseAdmin
      .from('profiles')
      .select('last_class')
      .eq('is_approved', true)
      .not('last_class', 'is', null)

    const uniqueClasses = new Set<number>()
    if (!classError && classData) {
      classData.forEach(p => {
        if (p.last_class) {
          uniqueClasses.add(p.last_class)
        }
      })
    }

    return NextResponse.json({
      totalAlumni: totalCount || 0,
      totalProfessions: uniqueProfessions.size,
      totalYearDecades: uniqueDecades.size,
      totalClasses: uniqueClasses.size,
      professions: Array.from(uniqueProfessions).sort(),
      yearDecades: Array.from(uniqueDecades).sort(),
      classes: Array.from(uniqueClasses).sort((a, b) => a - b)
    })

  } catch (error) {
    console.error('Error in directory stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



