'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Bell, Info, AlertCircle, X, ExternalLink } from 'lucide-react'
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

interface NoticesSectionProps {
  limit?: number
  showHeader?: boolean
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

export default function NoticesSection({ limit = 3, showHeader = true }: NoticesSectionProps) {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchNotices()
  }, [limit])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const now = new Date().toISOString()
      console.log('Fetching notices with filters:', {
        is_active: true,
        end_date: `null OR >= ${now}`,
        note: 'Showing all active notices (including scheduled/future start dates)'
      })
      
      const { data, error } = await supabase
        .from('notices')
        .select(`
          *,
          events(id, title, date, location)
        `)
        .eq('is_active', true)
        // Show notices that haven't ended yet (or have no end date)
        // Note: We show scheduled notices (future start_date) so users can see upcoming announcements
        .or('end_date.is.null,end_date.gte.' + now)
        .order('priority', { ascending: true })
        .order('start_date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching notices:', error)
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
          priority: n.priority
        })))
      }
      
      setNotices(data || [])
    } catch (error) {
      console.error('Error fetching notices:', error)
      // Set empty array on error so component doesn't crash
      setNotices([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Past'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (notices.length === 0) {
    return null // Don't show section if no notices
  }

  return (
    <>
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showHeader && (
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" />
                Latest Notices & Announcements
              </h2>
              <p className="text-gray-600">
                Stay updated with important information and upcoming events
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((notice) => {
              const priority = priorityConfig[notice.priority as keyof typeof priorityConfig] || priorityConfig[3]
              const IconComponent = iconMap[notice.icon || 'info'] || Info
              const noticeLink = getNoticeLink(notice)

              return (
                <div
                  key={notice.id}
                  className={`bg-white rounded-lg shadow-sm border-2 ${priority.borderColor} p-6 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden`}
                  onClick={() => handleNoticeClick(notice)}
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
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {notice.content}
                      </p>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(notice.start_date)}</span>
                        {notice.events && (
                          <>
                            <span>•</span>
                            <span className="text-primary-600">Event Related</span>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {noticeLink && (
                          <Link
                            href={noticeLink}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              notice.event_id
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {notice.event_id ? 'View Event' : 'View Details'}
                          </Link>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNoticeClick(notice)
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* View All Link */}
          {notices.length >= limit && (
            <div className="text-center mt-8">
              <Link
                href="/notices"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Notices
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Notice Modal */}
      {modalOpen && selectedNotice && (
        <NoticeModal
          notice={selectedNotice}
          onClose={() => {
            setModalOpen(false)
            setSelectedNotice(null)
          }}
        />
      )}
    </>
  )
}

// Helper function to get notice link
function getNoticeLink(notice: Notice) {
  if (notice.link_url) return notice.link_url
  if (notice.event_id && notice.events) return `/events/${notice.event_id}`
  return null
}

// Notice Modal Component
function NoticeModal({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  const priority = priorityConfig[notice.priority as keyof typeof priorityConfig] || priorityConfig[3]
  const IconComponent = iconMap[notice.icon || 'info'] || Info
  const noticeLink = getNoticeLink(notice)

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${priority.color} text-white p-6 rounded-t-lg`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white bg-opacity-20 text-xs font-bold px-2 py-1 rounded">
                    {priority.label}
                  </span>
                  {notice.type && (
                    <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded capitalize">
                      {notice.type}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{notice.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Dates */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                <strong>Start:</strong> {formatFullDate(notice.start_date)}
              </span>
            </div>
            {notice.end_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  <strong>End:</strong> {formatFullDate(notice.end_date)}
                </span>
              </div>
            )}
          </div>

          {/* Event Link */}
          {notice.events && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm font-medium text-primary-900 mb-1">Related Event:</p>
              <p className="text-primary-700 font-semibold">{notice.events.title}</p>
              {notice.events.location && (
                <p className="text-sm text-primary-600 mt-1">{notice.events.location}</p>
              )}
            </div>
          )}

          {/* Full Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {noticeLink && (
              <Link
                href={noticeLink}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors text-center font-medium"
              >
                {notice.event_id ? 'View Event Page' : 'View Details'}
              </Link>
            )}
            <Link
              href="/notices"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View All Notices
            </Link>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

