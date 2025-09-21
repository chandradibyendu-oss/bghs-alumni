/**
 * Registration ID utilities for generating memorable alumni registration IDs
 * Format: BGHS-YYYY-XXXX (e.g., BGHS-2024-0001)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * Generate a new registration ID
 * This calls the database function to get the next sequential ID
 */
export async function generateRegistrationId(): Promise<string> {
  try {
    const supabase = supabaseAdmin()
    
    const { data, error } = await supabase
      .rpc('generate_registration_id')
    
    if (error) {
      console.error('Error generating registration ID:', error)
      throw new Error('Failed to generate registration ID')
    }
    
    return data
  } catch (error) {
    console.error('Error in generateRegistrationId:', error)
    throw error
  }
}

/**
 * Validate registration ID format
 * @param registrationId - The registration ID to validate
 * @returns boolean indicating if the format is valid
 */
export function validateRegistrationIdFormat(registrationId: string): boolean {
  const pattern = /^BGHS-\d{4}-\d{4}$/
  return pattern.test(registrationId)
}

/**
 * Extract year from registration ID
 * @param registrationId - The registration ID
 * @returns year as number or null if invalid format
 */
export function extractYearFromRegistrationId(registrationId: string): number | null {
  if (!validateRegistrationIdFormat(registrationId)) {
    return null
  }
  
  const match = registrationId.match(/^BGHS-(\d{4})-\d{4}$/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Extract sequence number from registration ID
 * @param registrationId - The registration ID
 * @returns sequence number or null if invalid format
 */
export function extractSequenceFromRegistrationId(registrationId: string): number | null {
  if (!validateRegistrationIdFormat(registrationId)) {
    return null
  }
  
  const match = registrationId.match(/^BGHS-\d{4}-(\d{4})$/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Get registration statistics
 * @returns object with registration statistics
 */
export async function getRegistrationStats(): Promise<{
  totalRegistrations: number
  currentYearRegistrations: number
  lastRegistrationId: string | null
}> {
  try {
    const supabase = supabaseAdmin()
    const currentYear = new Date().getFullYear()
    
    // Get total registrations
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Get current year registrations
    const { count: yearCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .like('registration_id', `BGHS-${currentYear}-%`)
    
    // Get last registration ID
    const { data: lastReg } = await supabase
      .from('profiles')
      .select('registration_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    return {
      totalRegistrations: totalCount || 0,
      currentYearRegistrations: yearCount || 0,
      lastRegistrationId: lastReg?.registration_id || null
    }
  } catch (error) {
    console.error('Error getting registration stats:', error)
    return {
      totalRegistrations: 0,
      currentYearRegistrations: 0,
      lastRegistrationId: null
    }
  }
}

/**
 * Search alumni by registration ID
 * @param registrationId - The registration ID to search for
 * @returns profile data or null if not found
 */
export async function findAlumniByRegistrationId(registrationId: string) {
  try {
    const supabase = supabaseAdmin()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('registration_id', registrationId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error finding alumni by registration ID:', error)
    throw error
  }
}




