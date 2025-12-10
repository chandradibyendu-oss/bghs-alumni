'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { ArrowLeft, Save, Calendar, Bell, Info, AlertCircle } from 'lucide-react'

export default function CreateNoticePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 3,
    event_id: '',
    start_date: '',
    end_date: '',
    is_active: true,
    link_url: '',
    icon: 'info'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([verifyAccess(), fetchEvents()])
      setLoading(false)
    }
    initialize()
  }, [])

  const verifyAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        router.push('/login')
        return 
      }
      
      const perms = await getUserPermissions(user.id)
      const hasAccess = hasPermission(perms, 'can_manage_notices') || 
                       hasPermission(perms, 'can_access_admin')
      
      if (!hasAccess) {
        alert('You do not have permission to create notices.')
        router.push('/admin/notices')
        return
      }

      setIsAuthorized(true)
    } catch (error) {
      console.error('Error verifying access:', error)
      router.push('/admin/notices')
    }
  }

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date')
        .order('date', { ascending: false })
        .limit(100)

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login to create notices')
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        alert('Authentication error. Please login again.')
        return
      }

      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          type: formData.type,
          priority: formData.priority,
          event_id: formData.event_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          is_active: formData.is_active,
          link_url: formData.link_url || null,
          icon: formData.icon
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create notice')
      }

      alert('Notice created successfully!')
      router.push('/admin/notices')
    } catch (error: any) {
      console.error('Error creating notice:', error)
      alert(error.message || 'Failed to create notice')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/notices" 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Notice</h1>
              <p className="text-sm text-gray-600 mt-1">Add a new notice or announcement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`input-field ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="Enter notice title"
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                  className={`input-field ${errors.content ? 'border-red-300' : ''}`}
                  placeholder="Enter notice content"
                  required
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>

              {/* Type and Priority */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="input-field"
                  >
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="announcement">Announcement</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value="3">General</option>
                    <option value="2">Important</option>
                    <option value="1">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  className="input-field"
                >
                  <option value="info">Info</option>
                  <option value="calendar">Calendar</option>
                  <option value="bell">Bell</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Schedule</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={`input-field ${errors.start_date ? 'border-red-300' : ''}`}
                  required
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="input-field"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty for notices without expiration</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Links & Associations</h2>
            
            <div className="space-y-6">
              {/* Related Event */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Event (Optional)
                </label>
                <select
                  value={formData.event_id}
                  onChange={(e) => handleInputChange('event_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">No event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({new Date(event.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Link this notice to an event. If set, "View Event" button will appear on the notice.
                </p>
              </div>

              {/* Custom Link URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Link URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => handleInputChange('link_url', e.target.value)}
                  className="input-field"
                  placeholder="https://example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Overrides event link if both are set. Leave empty to use event link.
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Status</h2>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (Notice will be visible to users)
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Link
              href="/admin/notices"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Notice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

