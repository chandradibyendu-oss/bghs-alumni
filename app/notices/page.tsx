'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Bell, Info, AlertCircle, Filter, Search, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Notice {
  id: string
  title: string
  content: string
  type: string
  priority: number
  event_id?: string | null
  start_date: string
  end_date?: string | null
  link_url?: string | null
  icon?: string
  events?: {
    id: string
    title: string
    date: string
    location?: string
  } | null
}

const iconMap: Record<string, any> = {
  calendar: Calendar,
  bell: Bell,
  info: Info,
  alert: AlertCircle,
}

const priorityConfig = {
  1: { label: 'URGENT', color: 'bg-red-500', textColor: 'text-red-700', borderColor: 'border-red-300' },
  2: { label: 'IMPORTANT', color: 'bg-orange-500', textColor: 'text-orange-700', borderColor: 'border-orange-300' },
  3: { label: 'GENERAL', color: 'bg-blue-500', textColor: 'text-blue-700', borderColor: 'border-blue-300' },
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchNotices()
  }, [filterType, filterPriority])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const now = new Date().toISOString()
      console.log('Fetching notices with filters:', {
        is_active: true,
        end_date: `null OR >= ${now}`,
        filterType,
        filterPriority,
        note: 'Showing all active notices (including scheduled/future start dates)'
      })
      
      let query = supabase
        .from('notices')
        .select(`
          *,
          events(id, title, date, location)
        `)
        .eq('is_active', true)
        // Show notices that haven't ended yet (or have no end date)
        .or('end_date.is.null,end_date.gte.' + now)
        .order('priority', { ascending: true })
        .order('start_date', { ascending: false })

      if (filterType !== 'all') {
        query = query.eq('type', filterType)
      }

      if (filterPriority !== 'all') {
        query = query.eq('priority', parseInt(filterPriority))
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notices:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('Fetched notices:', data?.length || 0, 'notices')
      if (data && data.length > 0) {
        console.log('Notice details:', data.map(n => ({
          id: n.id,
          title: n.title,
          is_active: n.is_active,
          start_date: n.start_date,
          end_date: n.end_date,
          priority: n.priority,
          type: n.type
        })))
      } else {
        console.log('No notices returned. Checking all notices (without filters)...')
        // Try fetching all notices to see if any exist
        const { data: allNotices, error: allError } = await supabase
          .from('notices')
          .select('id, title, is_active, start_date, end_date, priority, type')
          .limit(10)
        
        if (!allError && allNotices) {
          console.log('All notices in database:', allNotices.length)
          console.log('All notices details:', allNotices)
        }
      }

      let filteredNotices = data || []

      // Client-side search
      if (searchTerm) {
        filteredNotices = filteredNotices.filter(
          (notice) =>
            notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setNotices(filteredNotices)
    } catch (error) {
      console.error('Error fetching notices:', error)
      setNotices([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getNoticeLink = (notice: Notice) => {
    if (notice.link_url) return notice.link_url
    if (notice.event_id && notice.events) return `/events/${notice.event_id}`
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Notices & Announcements</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Stay updated with important information, events, and announcements from the BGHS Alumni Association
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Notices</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or content..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    fetchNotices()
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="event">Events</option>
                <option value="announcement">Announcements</option>
                <option value="general">General</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="1">Urgent</option>
                <option value="2">Important</option>
                <option value="3">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notices Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notices found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((notice) => {
              const priority = priorityConfig[notice.priority as keyof typeof priorityConfig] || priorityConfig[3]
              const IconComponent = iconMap[notice.icon || 'info'] || Info
              const noticeLink = getNoticeLink(notice)

              return (
                <Link
                  key={notice.id}
                  href={noticeLink || `/notices/${notice.id}`}
                  className={`bg-white rounded-lg shadow-sm border-2 ${priority.borderColor} p-6 hover:shadow-md transition-all duration-200 relative overflow-hidden block`}
                >
                  {/* Priority Badge */}
                  <div className={`absolute top-0 left-0 ${priority.color} text-white text-xs font-bold px-3 py-1 rounded-br-lg`}>
                    {priority.label}
                  </div>

                  {/* Icon */}
                  <div className="flex items-start gap-4 mt-2">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${priority.color} bg-opacity-10 flex items-center justify-center`}>
                      <IconComponent className={`h-6 w-6 ${priority.textColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {notice.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {notice.content}
                      </p>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(notice.start_date)}</span>
                        {notice.events && (
                          <>
                            <span>•</span>
                            <span className="text-primary-600">Event Related</span>
                          </>
                        )}
                      </div>

                      {/* Type Badge */}
                      {notice.type && (
                        <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                          {notice.type}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

