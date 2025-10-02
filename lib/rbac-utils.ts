import { createClient } from '@supabase/supabase-js'

// Enhanced RBAC utilities for comprehensive permission management

export interface Permission {
  id: number
  name: string
  description: string
  category: string
  display_order: number
}

export interface PermissionCategory {
  id: number
  name: string
  description: string
  permissions: Permission[]
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
  user_count: number
  created_at: string
  updated_at: string
}

export interface UserPermissions {
  [category: string]: {
    [permission: string]: boolean
  }
}

// Create Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Get detailed user permissions with categories
export async function getUserPermissionsDetailed(userId: string): Promise<UserPermissions> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .rpc('get_user_permissions_detailed', { user_uuid: userId })
    
    if (error) {
      console.error('Error fetching detailed permissions:', error)
      return {}
    }
    
    return data || {}
  } catch (error) {
    console.error('Error in getUserPermissionsDetailed:', error)
    return {}
  }
}

// Check if user has specific permission
export async function hasPermissionDetailed(userId: string, permissionName: string): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .rpc('has_permission', { 
        user_uuid: userId, 
        permission_name: permissionName 
      })
    
    if (error) {
      console.error('Error checking permission:', error)
      return false
    }
    
    return data || false
  } catch (error) {
    console.error('Error in hasPermissionDetailed:', error)
    return false
  }
}

// Get all available roles
export async function getAvailableRoles(): Promise<Role[]> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        role_permissions(
          permission_id,
          permissions(
            id,
            name,
            description,
            category_id,
            permission_categories(name)
          )
        )
      `)
      .order('name')
    
    if (error) {
      console.error('Error fetching roles:', error)
      return []
    }
    
    return data?.map(role => ({
      ...role,
      permissions: role.role_permissions?.map((rp: any) => rp.permissions) || [],
      user_count: 0 // TODO: Add user count
    })) || []
  } catch (error) {
    console.error('Error in getAvailableRoles:', error)
    return []
  }
}

// Get all permissions grouped by category
export async function getPermissionsByCategory(): Promise<PermissionCategory[]> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('permission_categories')
      .select(`
        *,
        permissions(*)
      `)
      .order('display_order')
    
    if (error) {
      console.error('Error fetching permissions by category:', error)
      return []
    }
    
    return data?.map(category => ({
      ...category,
      permissions: category.permissions || []
    })) || []
  } catch (error) {
    console.error('Error in getPermissionsByCategory:', error)
    return []
  }
}

// Update user role
export async function updateUserRole(
  userId: string, 
  newRoleId: number,
  updatedBy: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()
    
    // Get role name
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('name')
      .eq('id', newRoleId)
      .single()
    
    if (roleError) {
      console.error('Error fetching role:', roleError)
      return false
    }
    
    // Update user's role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: roleData.name })
      .eq('id', userId)
    
    if (updateError) {
      console.error('Error updating user role:', updateError)
      return false
    }
    
    // Log the change
    await supabase.rpc('log_permission_change', {
      p_user_id: userId,
      p_action: 'role_change',
      p_permission_name: null,
      p_role_name: roleData.name,
      p_target_user_id: userId,
      p_performed_by: updatedBy
    })
    
    return true
  } catch (error) {
    console.error('Error in updateUserRole:', error)
    return false
  }
}

// Create new role
export async function createRole(
  name: string,
  description: string,
  permissionIds: number[],
  createdBy: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()
    
    // Create role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        name,
        description,
        permissions: {}
      })
      .select()
      .single()
    
    if (roleError) {
      console.error('Error creating role:', roleError)
      return false
    }
    
    // Add permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: roleData.id,
        permission_id: permissionId,
        granted: true,
        granted_by: createdBy
      }))
      
      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions)
      
      if (permError) {
        console.error('Error adding permissions:', permError)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error in createRole:', error)
    return false
  }
}

// Update role permissions
export async function updateRolePermissions(
  roleId: number,
  permissionIds: number[],
  updatedBy: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()
    
    // Remove all existing permissions
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
    
    if (deleteError) {
      console.error('Error removing existing permissions:', deleteError)
      return false
    }
    
    // Add new permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId,
        granted: true,
        granted_by: updatedBy
      }))
      
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions)
      
      if (insertError) {
        console.error('Error adding new permissions:', insertError)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error in updateRolePermissions:', error)
    return false
  }
}

// Get permission audit log
export async function getPermissionAuditLog(
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('permission_audit_log')
      .select(`
        *,
        target_user:profiles!permission_audit_log_target_user_id_fkey(full_name, email),
        performed_by_user:profiles!permission_audit_log_performed_by_fkey(full_name, email)
      `)
      .order('performed_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching audit log:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getPermissionAuditLog:', error)
    return []
  }
}

// Check multiple permissions at once
export async function checkMultiplePermissions(
  userId: string, 
  permissionNames: string[]
): Promise<{ [permission: string]: boolean }> {
  try {
    const results: { [permission: string]: boolean } = {}
    
    // Check each permission
    for (const permission of permissionNames) {
      results[permission] = await hasPermissionDetailed(userId, permission)
    }
    
    return results
  } catch (error) {
    console.error('Error in checkMultiplePermissions:', error)
    return {}
  }
}

// Get user's role information
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }
    
    return data?.role || null
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

// Check if user has any of the specified permissions
export async function hasAnyPermission(
  userId: string, 
  permissionNames: string[]
): Promise<boolean> {
  try {
    for (const permission of permissionNames) {
      if (await hasPermissionDetailed(userId, permission)) {
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error in hasAnyPermission:', error)
    return false
  }
}

// Check if user has all of the specified permissions
export async function hasAllPermissions(
  userId: string, 
  permissionNames: string[]
): Promise<boolean> {
  try {
    for (const permission of permissionNames) {
      if (!(await hasPermissionDetailed(userId, permission))) {
        return false
      }
    }
    return true
  } catch (error) {
    console.error('Error in hasAllPermissions:', error)
    return false
  }
}
