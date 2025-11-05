'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Upload, 
  Search, 
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square,
  Calendar,
  Users,
  ArrowLeft
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImportedUser {
  id: string
  email: string
  full_name: string
  registration_id?: string | null
  year_of_leaving?: number | null
  phone?: string | null
  imported_at: string
  created_at: string
}

interface ImportBatch {
  date: string
  count: number
  users: ImportedUser[]
}

export default function AlumniImportsPage() {
  const [users, setUsers] = useState<ImportedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dateFilter, setDateFilter] = useState('')
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([])
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
    fetchImportedUsers()
  }, [dateFilter])

  const checkAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'super_admin' && profile.role !== 'alumni_premium' && profile.role !== 'content_moderator')) {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  const fetchImportedUsers = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const params = new URLSearchParams()
      if (dateFilter) {
        params.append('dateFilter', dateFilter)
      }

      const response = await fetch(`/api/admin/alumni-imports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch imported users')
      }

      const data = await response.json()
      setUsers(data.users || [])
      
      // Group by import date
      const batches: ImportBatch[] = []
      const grouped = (data.users || []).reduce((acc: Record<string, ImportedUser[]>, user: ImportedUser) => {
        const date = new Date(user.imported_at).toISOString().split('T')[0]
        if (!acc[date]) acc[date] = []
        acc[date].push(user)
        return acc
      }, {})

      Object.keys(grouped).sort((a, b) => b.localeCompare(a)).forEach(date => {
        batches.push({
          date,
          count: grouped[date].length,
          users: grouped[date]
        })
      })
      
      setImportBatches(batches)
    } catch (error) {
      console.error('Error fetching imported users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectBatch = (batch: ImportBatch) => {
    const batchUserIds = new Set(batch.users.map(u => u.id))
    const allSelected = batch.users.every(u => selectedUsers.has(u.id))
    
    const newSelected = new Set(selectedUsers)
    if (allSelected) {
      // Deselect all in batch
      batchUserIds.forEach(id => newSelected.delete(id))
    } else {
      // Select all in batch
      batchUserIds.forEach(id => newSelected.add(id))
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one user to delete')
      return
    }

    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please log in to delete users')
        return
      }

      const response = await fetch('/api/admin/alumni-imports', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete users')
      }

      const data = await response.json()
      alert(`Successfully deleted ${data.deletedCount} user(s)`)
      setSelectedUsers(new Set())
      setShowDeleteConfirm(false)
      fetchImportedUsers()
    } catch (error) {
      console.error('Error deleting users:', error)
      alert(`Error deleting users: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setDeleting(false)
    }
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      user.full_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.registration_id?.toLowerCase().includes(search)
    )
  })

  const isBatchSelected = (batch: ImportBatch): boolean => {
    return batch.users.length > 0 && batch.users.every(u => selectedUsers.has(u.id))
  }

  const isBatchPartiallySelected = (batch: ImportBatch): boolean => {
    return batch.users.some(u => selectedUsers.has(u.id)) && !isBatchSelected(batch)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/alumni-migration" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <Upload className="h-8 w-8 text-primary-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CSV Import Management</h1>
                  <p className="text-sm text-gray-500">Manage and delete CSV-imported alumni records</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">⚠️ Warning: Permanent Deletion</p>
              <p>
                Deleting imported users will permanently remove their accounts, profiles, and all associated data.
                This action cannot be undone. Use this feature only when you need to rollback a CSV import.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">CSV-Imported Records</h2>
              <p className="text-blue-100 text-lg">
                <span className="text-3xl font-bold">{users.length.toLocaleString()}</span> records imported via CSV
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or registration ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchImportedUsers}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 border border-gray-300"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{selectedUsers.size}</span> user(s) selected
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Import Batches */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading imported records...</p>
          </div>
        ) : importBatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No CSV-imported records found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {importBatches.map((batch) => (
              <div key={batch.date} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSelectBatch(batch)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {isBatchSelected(batch) ? (
                          <CheckSquare className="h-5 w-5 text-primary-600" />
                        ) : isBatchPartiallySelected(batch) ? (
                          <Square className="h-5 w-5 text-primary-400" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Imported on {new Date(batch.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">{batch.count} record(s)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          <button
                            onClick={handleSelectAll}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 ? (
                              <CheckSquare className="h-5 w-5 text-primary-600" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year of Leaving
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Imported At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batch.users
                        .filter(user => {
                          if (!searchTerm) return true
                          const search = searchTerm.toLowerCase()
                          return (
                            user.full_name?.toLowerCase().includes(search) ||
                            user.email?.toLowerCase().includes(search) ||
                            user.registration_id?.toLowerCase().includes(search)
                          )
                        })
                        .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleSelectUser(user.id)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {selectedUsers.has(user.id) ? (
                                <CheckSquare className="h-5 w-5 text-primary-600" />
                              ) : (
                                <Square className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {user.registration_id || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.year_of_leaving || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.imported_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-medium">{selectedUsers.size}</span> user(s)? 
                  This action will permanently delete:
                </p>
                <ul className="text-sm text-gray-600 mb-6 list-disc list-inside space-y-1">
                  <li>User authentication accounts</li>
                  <li>User profiles and all data</li>
                  <li>Event registrations</li>
                  <li>All associated records</li>
                </ul>
                <p className="text-sm font-medium text-red-600 mb-6">
                  ⚠️ This action cannot be undone!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Permanently'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
