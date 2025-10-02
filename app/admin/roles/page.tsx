'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, Users, Key, Plus, Edit, Trash2, Save, X, 
  Eye, EyeOff, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'

interface Permission {
  id: number
  name: string
  description: string
  category: string
  display_order: number
}

interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
  user_count: number
  created_at: string
  updated_at: string
}

interface PermissionCategory {
  id: number
  name: string
  description: string
  permissions: Permission[]
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [categories, setCategories] = useState<PermissionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '' })
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set())
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      const perms = await getUserPermissions(user.id)
      
      if (!hasPermission(perms, 'can_manage_roles')) {
        router.push('/dashboard')
        return
      }

      await loadData()
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Load roles from the current system
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('*')
        .order('name')

      // Get user counts for each role
      const rolesWithCounts = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', role.name)
          
          return {
            ...role,
            permissions: [], // Will be populated from role.permissions JSONB
            user_count: count || 0
          }
        })
      )

      // Create mock categories for the current permission system
      const mockCategories: PermissionCategory[] = [
        {
          id: 1,
          name: 'General',
          description: 'General access permissions',
          permissions: [
            { id: 1, name: 'can_view_landing', description: 'View landing page', category: 'general', display_order: 1 },
            { id: 2, name: 'can_view_directory', description: 'View alumni directory', category: 'general', display_order: 2 },
            { id: 3, name: 'can_edit_profile', description: 'Edit own profile', category: 'general', display_order: 3 }
          ]
        },
        {
          id: 2,
          name: 'Events',
          description: 'Event management permissions',
          permissions: [
            { id: 4, name: 'can_view_events', description: 'View events', category: 'events', display_order: 1 },
            { id: 5, name: 'can_register_events', description: 'Register for events', category: 'events', display_order: 2 },
            { id: 6, name: 'can_create_events', description: 'Create events', category: 'events', display_order: 3 },
            { id: 7, name: 'can_manage_events', description: 'Manage events', category: 'events', display_order: 4 }
          ]
        },
        {
          id: 3,
          name: 'Content',
          description: 'Content management permissions',
          permissions: [
            { id: 8, name: 'can_view_blog', description: 'View blog posts', category: 'content', display_order: 1 },
            { id: 9, name: 'can_comment_blog', description: 'Comment on blog', category: 'content', display_order: 2 },
            { id: 10, name: 'can_create_blog', description: 'Create blog posts', category: 'content', display_order: 3 },
            { id: 11, name: 'can_edit_blog', description: 'Edit blog posts', category: 'content', display_order: 4 },
            { id: 12, name: 'can_moderate_comments', description: 'Moderate comments', category: 'content', display_order: 5 }
          ]
        },
        {
          id: 4,
          name: 'Administration',
          description: 'Administrative permissions',
          permissions: [
            { id: 13, name: 'can_manage_users', description: 'Manage users', category: 'admin', display_order: 1 },
            { id: 14, name: 'can_manage_roles', description: 'Manage roles', category: 'admin', display_order: 2 },
            { id: 15, name: 'can_access_admin', description: 'Access admin panel', category: 'admin', display_order: 3 },
            { id: 16, name: 'can_view_analytics', description: 'View analytics', category: 'admin', display_order: 4 }
          ]
        }
      ]

      setRoles(rolesWithCounts)
      setCategories(mockCategories)
      setPermissions(mockCategories.flatMap(cat => cat.permissions))
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleCreateRole = async () => {
    try {
      // Create role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          name: newRole.name,
          description: newRole.description,
          permissions: {}
        })
        .select()
        .single()

      if (roleError) throw roleError

      // Add permissions
      if (selectedPermissions.size > 0) {
        const rolePermissions = Array.from(selectedPermissions).map(permissionId => ({
          role_id: roleData.id,
          permission_id: permissionId,
          granted: true,
          granted_by: user.id
        }))

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions)

        if (permError) throw permError
      }

      setShowCreateForm(false)
      setNewRole({ name: '', description: '' })
      setSelectedPermissions(new Set())
      await loadData()
    } catch (error) {
      console.error('Error creating role:', error)
      alert('Error creating role')
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    try {
      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          name: editingRole.name,
          description: editingRole.description
        })
        .eq('id', editingRole.id)

      if (roleError) throw roleError

      // Update permissions
      // First, remove all existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', editingRole.id)

      // Then add selected permissions
      if (selectedPermissions.size > 0) {
        const rolePermissions = Array.from(selectedPermissions).map(permissionId => ({
          role_id: editingRole.id,
          permission_id: permissionId,
          granted: true,
          granted_by: user.id
        }))

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions)

        if (permError) throw permError
      }

      setEditingRole(null)
      setSelectedPermissions(new Set())
      await loadData()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error updating role')
    }
  }

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('Error deleting role')
    }
  }

  const startEdit = (role: Role) => {
    setEditingRole(role)
    setSelectedPermissions(new Set(role.permissions.map(p => p.id)))
  }

  const togglePermission = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId)
    } else {
      newSelected.add(permissionId)
    }
    setSelectedPermissions(newSelected)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
                <p className="text-gray-600">Manage user roles and permissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Role
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Roles List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Roles ({roles.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {roles.map((role) => (
              <div key={role.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role.permissions.length} permissions
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {role.user_count} users
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map((permission) => (
                        <span
                          key={permission.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {permission.name}
                        </span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          +{role.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(role)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Role Modal */}
        {(showCreateForm || editingRole) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingRole(null)
                      setSelectedPermissions(new Set())
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Role Details */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Name
                      </label>
                      <input
                        type="text"
                        value={editingRole?.name || newRole.name}
                        onChange={(e) => {
                          if (editingRole) {
                            setEditingRole({ ...editingRole, name: e.target.value })
                          } else {
                            setNewRole({ ...newRole, name: e.target.value })
                          }
                        }}
                        className="input-field"
                        placeholder="e.g., content_moderator"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={editingRole?.description || newRole.description}
                        onChange={(e) => {
                          if (editingRole) {
                            setEditingRole({ ...editingRole, description: e.target.value })
                          } else {
                            setNewRole({ ...newRole, description: e.target.value })
                          }
                        }}
                        className="input-field"
                        placeholder="Brief description of the role"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
                  <div className="space-y-6">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-gray-200 rounded-lg">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {category.permissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-center space-x-3 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.has(permission.id)}
                                  onChange={() => togglePermission(permission.id)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {permission.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {permission.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingRole(null)
                    setSelectedPermissions(new Set())
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={editingRole ? handleUpdateRole : handleCreateRole}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
