'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, Users, Key, Plus, Edit, Trash2, Save, X, 
  Eye, EyeOff, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'

interface Role {
  id: number
  name: string
  description: string
  permissions: { [key: string]: boolean }
  user_count: number
  created_at: string
  updated_at: string
}

interface Permission {
  name: string
  description: string
  category: string
}

export default function SimpleRoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '' })
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Define available permissions (all permissions from UserPermissions interface)
  const availablePermissions: Permission[] = [
    // Basic Access Permissions
    { name: 'can_view_landing', description: 'View landing page', category: 'General' },
    { name: 'can_view_directory', description: 'View alumni directory', category: 'General' },
    { name: 'can_edit_profile', description: 'Edit own profile', category: 'General' },
    { name: 'can_access_premium', description: 'Access premium features', category: 'General' },
    { name: 'can_download_directory', description: 'Download alumni directory', category: 'General' },
    
    // Event Permissions
    { name: 'can_view_events', description: 'View events', category: 'Events' },
    { name: 'can_register_events', description: 'Register for events', category: 'Events' },
    { name: 'can_create_events', description: 'Create events → Shows "Event Management" card', category: 'Events' },
    { name: 'can_manage_events', description: 'Manage events (create/edit/delete) → Shows "Event Management" card', category: 'Events' },
    { name: 'can_send_notifications', description: 'Send event notifications', category: 'Events' },
    { name: 'can_take_attendance', description: 'Take attendance at events → Shows "Take Attendance" card', category: 'Events' },
    { name: 'can_manage_committee', description: 'Manage committee members → Shows "Committee Management" card', category: 'Events' },
    
    // Blog/Content Permissions
    { name: 'can_view_blog', description: 'View blog posts', category: 'Content' },
    { name: 'can_comment_blog', description: 'Comment on blog posts', category: 'Content' },
    { name: 'can_create_blog', description: 'Create blog posts → Shows "Blog Management" card', category: 'Content' },
    { name: 'can_edit_blog', description: 'Edit blog posts', category: 'Content' },
    { name: 'can_moderate_blog', description: 'Moderate blog posts (approve/reject) → Shows "Blog Management" card', category: 'Content' },
    { name: 'can_publish_blog', description: 'Publish blog posts directly', category: 'Content' },
    { name: 'can_delete_blog', description: 'Delete blog posts', category: 'Content' },
    { name: 'can_upload_media', description: 'Upload images and media files', category: 'Content' },
    
    // Comment Moderation Permissions
    { name: 'can_moderate_comments', description: 'Moderate comments (approve/reject/delete)', category: 'Moderation' },
    { name: 'can_edit_public_content', description: 'Edit public-facing content', category: 'Moderation' },
    
    // Donation Permissions
    { name: 'can_view_donations', description: 'View donation records and reports', category: 'Donations' },
    { name: 'can_manage_campaigns', description: 'Create and manage donation campaigns', category: 'Donations' },
    { name: 'can_generate_reports', description: 'Generate donation and system reports', category: 'Donations' },
    
    // Administrative Permissions - Dashboard Card Access (Granular)
    { name: 'can_manage_user_profiles', description: 'Manage user profiles → Shows "User Management" card', category: 'Admin - Dashboard Cards' },
    { name: 'can_manage_payment_settings', description: 'Configure payment settings → Shows "Payment Settings" card', category: 'Admin - Dashboard Cards' },
    { name: 'can_view_payment_queue', description: 'View payment queue → Shows "Payment Queue" card', category: 'Admin - Dashboard Cards' },
    { name: 'can_manage_alumni_migration', description: 'Manage alumni data migration → Shows "Alumni Migration" card', category: 'Admin - Dashboard Cards' },
    { name: 'can_manage_notices', description: 'Manage notices and announcements → Shows "Notices Management" card', category: 'Admin - Dashboard Cards' },
    { name: 'can_export_alumni_data', description: 'Export alumni data to CSV → Shows "Export Alumni Data" card', category: 'Admin - Dashboard Cards' },
    { name: 'can_manage_roles', description: 'Manage roles and permissions → Shows "Role Management" card', category: 'Admin - Dashboard Cards' },
    
    // Administrative Permissions - Page-Level Access
    { name: 'can_manage_content', description: 'Manage content (used within pages for content management)', category: 'Admin - Page Access' },
    { name: 'can_access_admin', description: 'Access admin panel (grants ALL admin features and cards)', category: 'Admin - Page Access' },
    { name: 'can_view_analytics', description: 'View website analytics and statistics', category: 'Admin - Page Access' }
  ]

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
            user_count: count || 0
          }
        })
      )

      setRoles(rolesWithCounts)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleCreateRole = async () => {
    try {
      // Create permissions object from selected permissions
      const permissions: { [key: string]: boolean } = {}
      availablePermissions.forEach(perm => {
        permissions[perm.name] = selectedPermissions.has(perm.name)
      })

      // Create role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          name: newRole.name,
          description: newRole.description,
          permissions: permissions
        })

      if (error) throw error

      setShowCreateForm(false)
      setNewRole({ name: '', description: '' })
      setSelectedPermissions(new Set())
      await loadData()
    } catch (error) {
      console.error('Error creating role:', error)
      alert('Error creating role: ' + (error as any).message)
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    try {
      // Create permissions object from selected permissions
      const permissions: { [key: string]: boolean } = {}
      availablePermissions.forEach(perm => {
        permissions[perm.name] = selectedPermissions.has(perm.name)
      })

      // Update role
      const { error } = await supabase
        .from('user_roles')
        .update({
          name: editingRole.name,
          description: editingRole.description,
          permissions: permissions
        })
        .eq('id', editingRole.id)

      if (error) throw error

      setEditingRole(null)
      setSelectedPermissions(new Set())
      await loadData()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error updating role: ' + (error as any).message)
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
      alert('Error deleting role: ' + (error as any).message)
    }
  }

  const startEdit = (role: Role) => {
    setEditingRole(role)
    // Set selected permissions based on role's current permissions
    const selected = new Set<string>()
    Object.entries(role.permissions).forEach(([key, value]) => {
      if (value) selected.add(key)
    })
    setSelectedPermissions(selected)
  }

  const togglePermission = (permissionName: string) => {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(permissionName)) {
      newSelected.delete(permissionName)
    } else {
      newSelected.add(permissionName)
    }
    setSelectedPermissions(newSelected)
  }

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {}
    availablePermissions.forEach(perm => {
      if (!categories[perm.category]) {
        categories[perm.category] = []
      }
      categories[perm.category].push(perm)
    })
    return categories
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
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/bghs-logo.png" alt="BGHS Alumni" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900">Admin - Role Management</span>
          </div>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">← Back to Dashboard</Link>
        </div>
      </nav>

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
                        {Object.values(role.permissions).filter(Boolean).length} permissions
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {role.user_count} users
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(role.permissions)
                        .filter(([_, value]) => value)
                        .slice(0, 5)
                        .map(([permissionName, _]) => (
                        <span
                          key={permissionName}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {permissionName.replace('can_', '').replace(/_/g, ' ')}
                        </span>
                      ))}
                      {Object.values(role.permissions).filter(Boolean).length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          +{Object.values(role.permissions).filter(Boolean).length - 5} more
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
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className="border border-gray-200 rounded-lg">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">{category}</h4>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {permissions.map((permission) => {
                              const isDashboardCard = permission.description.includes('→ Shows')
                              const cardName = isDashboardCard 
                                ? permission.description.split('→ Shows "')[1]?.split('"')[0] 
                                : null
                              return (
                                <label
                                  key={permission.name}
                                  className={`flex items-start space-x-3 cursor-pointer p-2 rounded ${
                                    isDashboardCard ? 'bg-blue-50 border border-blue-200' : ''
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.has(permission.name)}
                                    onChange={() => togglePermission(permission.name)}
                                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-medium text-gray-900">
                                        {permission.name.replace('can_', '').replace(/_/g, ' ')}
                                      </div>
                                      {isDashboardCard && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                          Dashboard Card
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {permission.description}
                                    </div>
                                    {cardName && (
                                      <div className="text-xs text-blue-600 font-medium mt-1">
                                        📋 Card: {cardName}
                                      </div>
                                    )}
                                  </div>
                                </label>
                              )
                            })}
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
