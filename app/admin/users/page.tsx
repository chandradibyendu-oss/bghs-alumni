'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  User,
  Mail,
  Calendar,
  Building,
  MapPin,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  KeyRound
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission, UserPermissions } from '@/lib/auth-utils'
import { UserRole, getAvailableRoles, updateUserRole } from '@/lib/auth-utils'

interface UserProfile {
  id: string
  email: string
  phone?: string | null
  full_name: string
  registration_id?: string | null
  last_class?: number | null
  year_of_leaving?: number | null
  start_class?: number | null
  start_year?: number | null
  profession: string
  company: string
  location: string
  bio: string
  avatar_url: string
  linkedin_url: string
  website_url: string
  role: string
  is_approved?: boolean
  payment_status?: string | null
  created_at: string
  updated_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    last_class: '',
    year_of_leaving: '',
    start_class: '',
    start_year: '',
    profession: '',
    company: '',
    location: '',
    bio: '',
    linkedin_url: '',
    website_url: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([])
  const [selectedRole, setSelectedRole] = useState('alumni_member')
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
    fetchUsers()
    fetchAvailableRoles()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      // Enforce admin permission based on profiles.role if RPC is unavailable
      let canAccess = false
      try {
        const permissions = await getUserPermissions(user.id)
        canAccess = hasPermission(permissions, 'can_access_admin') || hasPermission(permissions, 'can_manage_users')
      } catch {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        canAccess = data?.role === 'super_admin' || data?.role === 'donation_manager' || data?.role === 'event_manager' || data?.role === 'content_moderator'
      }
      if (!canAccess) {
        alert('You do not have permission to access User Management.')
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  const fetchAvailableRoles = async () => {
    try {
      const roles = await getAvailableRoles()
      setAvailableRoles(roles)
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const { users } = await response.json()
      setUsers((users || []).map((u: any) => ({ ...u, is_approved: u.is_approved ?? false })))
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          password: password,
          first_name: formData.first_name,
          middle_name: formData.middle_name || undefined,
          last_name: formData.last_name,
          full_name: `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name}`.trim(),
          // send new fields; keep batch_year for temporary compatibility
          last_class: formData.last_class ? Number(formData.last_class) : null,
          year_of_leaving: formData.year_of_leaving ? Number(formData.year_of_leaving) : null,
          start_class: formData.start_class ? Number(formData.start_class) : null,
          start_year: formData.start_year ? Number(formData.start_year) : null,
          batch_year: formData.year_of_leaving || undefined,
          profession: formData.profession,
          company: formData.company,
          location: formData.location,
          bio: formData.bio,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      // Reset form and refresh users
      resetForm()
      fetchUsers()
      setShowAddForm(false)
      alert('User created successfully!')
    } catch (error) {
      console.error('Error adding user:', error)
      alert(`Error adding user: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingUser.id,
          email: formData.email,
          phone: formData.phone,
          first_name: formData.first_name || undefined,
          middle_name: formData.middle_name || undefined,
          last_name: formData.last_name || undefined,
          full_name: `${formData.first_name || ''} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name || ''}`.trim(),
          last_class: formData.last_class ? Number(formData.last_class) : null,
          year_of_leaving: formData.year_of_leaving ? Number(formData.year_of_leaving) : null,
          start_class: formData.start_class ? Number(formData.start_class) : null,
          start_year: formData.start_year ? Number(formData.start_year) : null,
          batch_year: formData.year_of_leaving || undefined,
          profession: formData.profession,
          company: formData.company,
          location: formData.location,
          bio: formData.bio,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      resetForm()
      setEditingUser(null)
      fetchUsers()
      alert('User updated successfully!')
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Error updating user: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userId, role: newRole })
      })
      if (!res.ok) {
        const data = await res.json(); throw new Error(data.error || 'Failed')
      }
      fetchUsers()
      alert('User role updated successfully!')
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error updating user role')
    }
  }

  const handleToggleApproval = async (user: UserProfile) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: user.id, is_approved: !user.is_approved })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update approval')
      }

      fetchUsers()
    } catch (e) {
      console.error('Approval toggle error:', e)
      alert('Failed to update approval status')
    }
  }

  const handleAdminResetPassword = async (user: UserProfile) => {
    if (!confirm(`Generate a new password for ${user.email}?`)) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      alert(`Temporary password: ${data.password}\nIt has also been emailed if the user has a valid email.`)
    } catch (e) {
      console.error('Admin reset error:', e)
      alert('Failed to reset password')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      fetchUsers()
      alert('User deleted successfully!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`Error deleting user: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      last_class: '',
      year_of_leaving: '',
      start_class: '',
      start_year: '',
      phone: '',
      profession: '',
      company: '',
      location: '',
      bio: '',
      linkedin_url: '',
      website_url: ''
    })
    setPassword('')
  }

  const startEdit = (user: UserProfile) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      phone: (user as any).phone || '',
      first_name: (user as any).first_name || '',
      middle_name: (user as any).middle_name || '',
      last_name: (user as any).last_name || '',
      last_class: user.last_class?.toString() || '',
      year_of_leaving: user.year_of_leaving?.toString() || (user as any).batch_year?.toString() || '',
      start_class: user.start_class?.toString() || '',
      start_year: user.start_year?.toString() || '',
      profession: user.profession || '',
      company: user.company || '',
      location: user.location || '',
      bio: user.bio || '',
      linkedin_url: user.linkedin_url || '',
      website_url: user.website_url || ''
    })
  }

  const filteredUsers = users.filter(user => {
    const term = searchTerm.trim().toLowerCase()
    const matchesNameEmailProfession = user.full_name.toLowerCase().includes(term) ||
                         user.email.toLowerCase().includes(term) ||
                         user.profession?.toLowerCase().includes(term)
    // Allow search by full or last 5 digits of registration_id
    const regId = (user.registration_id || '').toLowerCase()
    const matchesRegId = term
      ? (regId.includes(term) || (term.length <= 5 && regId.endsWith(term)))
      : true
    const matchesSearch = matchesNameEmailProfession || matchesRegId
    const matchesYear = !filterYear || (user.year_of_leaving?.toString() === filterYear)
    return matchesSearch && matchesYear
  })

  const leavingYears = Array.from(new Set(users.map(u => u.year_of_leaving).filter(Boolean) as number[])).sort((a, b) => (b - a))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
                             <img 
                 src="/bghs-logo.png" 
                 alt="BGHS Alumni Association" 
                className="h-14 w-auto object-contain shrink-0"
               />
              <span className="text-xl font-bold text-gray-900">Admin - User Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 transition-colors">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage BGHS Alumni user profiles</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or profession..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year of Leaving</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="input-field"
              >
                <option value="">All Years</option>
                {leavingYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit User Form */}
        {(showAddForm || editingUser) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingUser(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleEditUser : handleAddUser} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Fields marked with <span className="text-red-500">*</span> are required
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!!editingUser}
                    required
                    className="input-field"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                  <p className="text-xs text-blue-600 mt-2">📱 Include country code (e.g., +91XXXXXXXXXX)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="input-field"
                    required
                  >
                    {availableRoles.map((role) => (
                      <option key={role.name} value={role.name}>
                        {role.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                    className="input-field"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                    className="input-field"
                    placeholder="A."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Class Attended <span className="text-red-500">*</span></label>
                  <select
                    value={formData.last_class}
                    onChange={(e) => setFormData({...formData, last_class: e.target.value})}
                    required
                    className="input-field"
                  >
                    <option value="">Select class</option>
                    {Array.from({length:12}).map((_,i)=>i+1).map(n=> (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Leaving (YYYY) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={formData.year_of_leaving}
                    onChange={(e) => setFormData({...formData, year_of_leaving: e.target.value})}
                    required
                    min="1950"
                    max="2035"
                    className="input-field"
                    placeholder="2005"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    className="input-field"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="input-field"
                    placeholder="Tech Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="input-field"
                    placeholder="Kolkata, West Bengal"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-field pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                    className="input-field"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    className="input-field"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingUser(null)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingUser ? 'Update User' : 'Add User'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year of Leaving
                    </th>
                    {/* Profession column hidden to reduce width */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar_url}
                                alt={user.full_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {user.registration_id ? user.registration_id : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.last_class ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {user.year_of_leaving ?? '-'}
                        </span>
                      </td>
                      {/* Profession column removed to reduce width */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden">
                        {user.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role || 'alumni_member'}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                            className="border border-gray-300 rounded-md text-xs px-2 py-1 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            title="Change user role"
                          >
                            {availableRoles.map((role) => (
                              <option key={role.name} value={role.name}>{role.description || role.name}</option>
                            ))}
                          </select>
                          <Shield className="h-4 w-4 text-gray-300" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleApproval(user)}
                          className={
                            `px-2 py-1 rounded text-xs font-medium ` +
                            (user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                          }
                          title={user.is_approved ? 'Click to revoke approval' : 'Click to approve'}
                        >
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.payment_status === 'pending' ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        ) : user.payment_status === 'completed' ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-40">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleAdminResetPassword(user)}
                            className="text-amber-600 hover:text-amber-800 transition-colors p-1"
                            title="Reset password"
                          >
                            <KeyRound className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => startEdit(user)}
                            className="text-primary-600 hover:text-primary-900 transition-colors p-1"
                            title="Edit user"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1"
                            title="Delete user"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
