'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import {
  Bell,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  Info,
  X,
  CheckCircle,
  Filter
} from 'lucide-react'

interface Notice {
  id: string
  title: string
  content: string
  type: string
  priority: number
  event_id?: string | null
  start_date: string
  end_date?: string | null
  is_active: boolean
  link_url?: string | null
  icon?: string
  created_at: string
  updated_at: string
  events?: {
    id: string
    title: string
  } | null
}

const priorityConfig = {
  1: { label: 'URGENT', color: 'bg-red-500', textColor: 'text-red-700' },
  2: { label: 'IMPORTANT', color: 'bg-orange-500', textColor: 'text-orange-700' },
  3: { label: 'GENERAL', color: 'bg-blue-500', textColor: 'text-blue-700' },
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [showExpired, setShowExpired] = useState(false)
  const router = useRouter()
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    Promise.all([verifyAccess(), fetchNotices()])
  }, [typeFilter, priorityFilter, showExpired])

  const verifyAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { 
      router.push('/login')
      return 
    }
    const perms = await getUserPermissions(user.id)
    const hasAccess = hasPermission(perms, 'can_manage_notices') || 
                     hasPermission(perms, 'can_access_admin')
    
    if (!hasAccess) {
      alert('You do not have permission to manage notices.')
      router.push('/dashboard')
      return
    }

    setCanManage(true)
  }

  const fetchNotices = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('notices')
        .select(`
          *,
          events(id, title)
        `)
        .order('priority', { ascending: true })
        .order('start_date', { ascending: false })

      if (!showExpired) {
        query = query.or('end_date.is.null,end_date.gte.' + new Date().toISOString())
      }

      if (typeFilter) {
        query = query.eq('type', typeFilter)
      }

      if (priorityFilter) {
        query = query.eq('priority', parseInt(priorityFilter))
      }

      const { data, error } = await query

      if (error) throw error

      let filteredNotices = data || []

      if (search) {
        filteredNotices = filteredNotices.filter(
          (notice) =>
            notice.title.toLowerCase().includes(search.toLowerCase()) ||
            notice.content.toLowerCase().includes(search.toLowerCase())
        )
      }

      setNotices(filteredNotices)
    } catch (error) {
      console.error('Error fetching notices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return

    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchNotices()
    } catch (error) {
      console.error('Error deleting notice:', error)
      alert('Failed to delete notice')
    }
  }

  const toggleActive = async (notice: Notice) => {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_active: !notice.is_active })
        .eq('id', notice.id)

      if (error) throw error

      fetchNotices()
    } catch (error) {
      console.error('Error toggling notice:', error)
      alert('Failed to update notice')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isExpired = (notice: Notice) => {
    if (!notice.end_date) return false
    return new Date(notice.end_date) < new Date()
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
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
            <span className="text-xl font-bold text-gray-900">Admin - Notices Management</span>
          </div>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notices Management</h1>
            <p className="text-gray-600 mt-1">Create and manage notices and announcements</p>
          </div>
          <Link
            href="/admin/notices/new"
            className="btn-primary flex items-center gap-2 px-6 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Create New Notice
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="event">Event</option>
                <option value="announcement">Announcement</option>
                <option value="general">General</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value="1">Urgent</option>
                <option value="2">Important</option>
                <option value="3">General</option>
              </select>
            </div>
          </div>

          {/* Show Expired Toggle */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="showExpired"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showExpired" className="text-sm text-gray-700">
              Show expired notices
            </label>
          </div>
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notices found</p>
            <Link href="/admin/notices/new" className="btn-primary mt-4 inline-block">
              Create First Notice
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type / Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notices.map((notice) => {
                    const priority = priorityConfig[notice.priority as keyof typeof priorityConfig] || priorityConfig[3]
                    const expired = isExpired(notice)

                    return (
                      <tr key={notice.id} className={!notice.is_active ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900">{notice.title}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notice.content}</p>
                              {notice.events && (
                                <span className="inline-block mt-2 text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                                  Event: {notice.events.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-block text-xs px-2 py-1 ${priority.color} text-white rounded`}>
                              {priority.label}
                            </span>
                            <br />
                            <span className="text-xs text-gray-500 capitalize">{notice.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Start: {formatDate(notice.start_date)}</div>
                          {notice.end_date && (
                            <div className={expired ? 'text-red-600' : ''}>
                              End: {formatDate(notice.end_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleActive(notice)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                notice.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {notice.is_active ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" />
                                  Inactive
                                </>
                              )}
                            </button>
                            {expired && (
                              <span className="text-xs text-red-600">Expired</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/notices/${notice.id}/edit`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(notice.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

