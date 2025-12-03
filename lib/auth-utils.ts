import { createClient } from '@supabase/supabase-js'

export interface UserPermissions {
  can_view_landing: boolean
  can_view_directory: boolean
  can_edit_profile: boolean
  can_view_events: boolean
  can_register_events: boolean
  can_view_blog: boolean
  can_comment_blog: boolean
  can_access_premium: boolean
  can_download_directory: boolean
  can_moderate_comments: boolean
  can_edit_public_content: boolean
  can_create_events: boolean
  can_manage_events: boolean
  can_send_notifications: boolean
  can_create_blog: boolean
  can_edit_blog: boolean
  can_delete_blog: boolean
  can_moderate_blog: boolean
  can_publish_blog: boolean
  can_upload_media: boolean
  can_view_donations: boolean
  can_manage_campaigns: boolean
  can_generate_reports: boolean
  can_manage_users: boolean
  can_manage_roles: boolean
  can_access_admin: boolean
  can_view_analytics: boolean
}

export interface UserRole {
  id: number
  name: string
  description: string
  permissions: UserPermissions
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  first_name?: string
  middle_name?: string
  last_name?: string
  batch_year: number
  profession: string
  company: string
  location: string
  bio: string
  avatar_url: string
  linkedin_url: string
  website_url: string
  role: string
  permissions: UserPermissions
  created_at: string
  updated_at: string
}

// Create Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// Get user permissions from Supabase (Dynamic lookup from role definitions)
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  try {
    const supabase = createSupabaseClient()
    
    // First, get the user's role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }
    
    if (!profile?.role) {
      // If no role assigned, return empty permissions (public user)
      return {} as UserPermissions
    }
    
    // Get permissions from the role definition in user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('permissions')
      .eq('name', profile.role)
      .single()
    
    if (roleError) {
      console.error('Error fetching role permissions:', roleError)
      return null
    }
    
    // Return the permissions from the role definition (always current)
    return (roleData?.permissions || {}) as UserPermissions
  } catch (error) {
    console.error('Error in getUserPermissions:', error)
    return null
  }
}

// Check if user has specific permission
export function hasPermission(
  permissions: UserPermissions | null, 
  permission: keyof UserPermissions
): boolean {
  if (!permissions) return false
  return permissions[permission] === true
}

// Check if user can access a specific page/feature
export function canAccess(
  permissions: UserPermissions | null,
  requiredPermissions: (keyof UserPermissions)[]
): boolean {
  if (!permissions) return false
  
  return requiredPermissions.every(permission => 
    permissions[permission] === true
  )
}

// Get user profile with permissions (Dynamic lookup)
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    // Get permissions dynamically from role definition
    const permissions = await getUserPermissions(userId)
    
    return {
      ...data,
      permissions: permissions || {} as UserPermissions
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Get all available roles
export async function getAvailableRoles(): Promise<UserRole[]> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching roles:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getAvailableRoles:', error)
    return []
  }
}

// Update user role (Dynamic permissions - no need to update permissions column)
export async function updateUserRole(
  userId: string, 
  newRole: string,
  updatedBy: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()
    
    // Update the profile with new role only
    // Permissions will be dynamically looked up from user_roles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error updating profile role:', profileError)
      return false
    }
    
    // No need to update permissions column - they're now dynamically looked up
    return true
  } catch (error) {
    console.error('Error in updateUserRole:', error)
    return false
  }
}

