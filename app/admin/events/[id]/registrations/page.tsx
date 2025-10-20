'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Search, 
  Filter,
  User,
  Mail,
  Phone,
  Building,
  MapPin as LocationIcon,
  CheckCircle,
  Clock as WaitlistIcon,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Printer,
  Edit
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  max_attendees: number
  current_attendees: number
  category: string
  image_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

interface Registration {
  id: string
  event_id: string
  user_id: string
  status: 'confirmed' | 'waitlist' | 'cancelled'
  guest_count: number
  registration_date: string
  attendance_status?: 'pending' | 'attended' | 'no_show'
  attendance_updated_at?: string
  attendance_updated_by?: string
  actual_attendance_count?: number
  user: {
    id: string
    full_name: string
    email: string
    phone?: string
    profession: string
    company: string
    location: string
    last_class?: number
    year_of_leaving?: number
  }
}

interface RegistrationStats {
  total_registrations: number
  confirmed_count: number
  waitlist_count: number
  cancelled_count: number
  total_attendees: number
  confirmed_attendees: number
  waitlist_attendees: number
  attended_count: number
  no_show_count: number
  pending_attendance_count: number
  actual_attendees: number
}

export default function EventRegistrationsPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<RegistrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'waitlist' | 'cancelled'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [attendanceCounts, setAttendanceCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    checkAuthAndLoadData()
  }, [eventId])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check admin permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const isAdmin = profile?.role === 'super_admin' || profile?.role === 'event_manager'
      if (!isAdmin) {
        alert('You do not have permission to view event registrations.')
        router.push('/dashboard')
        return
      }

      await Promise.all([
        loadEventDetails(),
        loadRegistrations()
      ])
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error('Error loading event:', error)
      alert('Failed to load event details')
    }
  }

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          user:profiles!event_registrations_user_id_fkey(
            id,
            full_name,
            email,
            phone,
            profession,
            company,
            location,
            last_class,
            year_of_leaving
          )
        `)
        .eq('event_id', eventId)
        .order('registration_date', { ascending: false })

      if (error) throw error

      const registrationData = data.map(reg => ({
        ...reg,
        user: reg.user || {}
      })) as Registration[]

      setRegistrations(registrationData)
      calculateStats(registrationData)
    } catch (error) {
      console.error('Error loading registrations:', error)
      alert('Failed to load registrations')
    }
  }

  const calculateStats = (regData: Registration[]) => {
    const confirmedRegistrations = regData.filter(r => r.status === 'confirmed')
    const attendedRegistrations = regData.filter(r => r.attendance_status === 'attended')
    const noShowRegistrations = regData.filter(r => r.attendance_status === 'no_show')
    const pendingAttendanceRegistrations = regData.filter(r => r.status === 'confirmed' && (!r.attendance_status || r.attendance_status === 'pending'))
    
    // Calculate actual attendees based on actual_attendance_count or guest_count
    const actualAttendees = regData.reduce((sum, r) => {
      if (r.attendance_status === 'attended') {
        return sum + (r.actual_attendance_count || r.guest_count || 1)
      }
      return sum
    }, 0)
    
    const stats: RegistrationStats = {
      total_registrations: regData.length,
      confirmed_count: confirmedRegistrations.length,
      waitlist_count: regData.filter(r => r.status === 'waitlist').length,
      cancelled_count: regData.filter(r => r.status === 'cancelled').length,
      total_attendees: regData.reduce((sum, r) => sum + (r.guest_count || 1), 0),
      confirmed_attendees: confirmedRegistrations.reduce((sum, r) => sum + (r.guest_count || 1), 0),
      waitlist_attendees: regData.filter(r => r.status === 'waitlist').reduce((sum, r) => sum + (r.guest_count || 1), 0),
      attended_count: attendedRegistrations.length,
      no_show_count: noShowRegistrations.length,
      pending_attendance_count: pendingAttendanceRegistrations.length,
      actual_attendees: actualAttendees
    }
    setStats(stats)
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.user.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.user.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.user.full_name.localeCompare(b.user.full_name)
        break
      case 'date':
        comparison = new Date(a.registration_date).getTime() - new Date(b.registration_date).getTime()
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const toggleRowExpansion = (registrationId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(registrationId)) {
      newExpanded.delete(registrationId)
    } else {
      newExpanded.add(registrationId)
    }
    setExpandedRows(newExpanded)
  }

  const updateRegistrationStatus = async (registrationId: string, newStatus: 'confirmed' | 'waitlist' | 'cancelled') => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to update registrations')
        return
      }

      const response = await fetch('/api/admin/events/registrations/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          registrationId,
          status: newStatus,
          eventId
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Registration status updated to ${newStatus}`)
        await loadRegistrations() // Reload data
      } else {
        alert(data.error || 'Failed to update registration status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('An error occurred while updating status')
    }
  }

  const moveFromWaitlist = async (registrationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to manage registrations')
        return
      }

      const response = await fetch('/api/admin/events/registrations/move-from-waitlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          registrationId,
          eventId
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Registration moved from waitlist to confirmed')
        await loadRegistrations() // Reload data
      } else {
        alert(data.error || 'Failed to move from waitlist')
      }
    } catch (error) {
      console.error('Error moving from waitlist:', error)
      alert('An error occurred while moving from waitlist')
    }
  }

  const updateAttendance = async (registrationId: string, attendanceStatus: 'attended' | 'no_show') => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to update attendance')
        return
      }

      const response = await fetch('/api/admin/events/registrations/update-attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          registrationId,
          attendanceStatus,
          eventId
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Attendance updated to ${attendanceStatus}`)
        await loadRegistrations() // Reload data
      } else {
        alert(data.error || 'Failed to update attendance')
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
      alert('An error occurred while updating attendance')
    }
  }

  const updateAttendanceWithCount = async (registrationId: string, attendanceStatus: 'attended' | 'no_show', actualCount: number) => {
    try {
      console.log('Updating attendance count:', { registrationId, attendanceStatus, actualCount, eventId })
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to update attendance')
        return
      }

      const response = await fetch('/api/admin/events/registrations/update-attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          registrationId,
          attendanceStatus,
          actualAttendanceCount: actualCount,
          eventId
        })
      })

      const data = await response.json()
      console.log('API response:', data)

      if (response.ok) {
        console.log('Attendance count updated successfully')
        await loadRegistrations() // Reload data
      } else {
        console.error('API error:', data.error)
        alert(data.error || 'Failed to update attendance count')
      }
    } catch (error) {
      console.error('Error updating attendance count:', error)
      alert('An error occurred while updating attendance count')
    }
  }

  const exportRegistrations = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Guest Count', 'Actual Attendance', 'Registration Date', 'Attendance Status', 'Attendance Updated', 'Profession', 'Company', 'Location'].join(','),
      ...sortedRegistrations.map(reg => [
        reg.user.full_name,
        reg.user.email,
        reg.user.phone || '',
        reg.status,
        reg.guest_count,
        reg.actual_attendance_count || reg.guest_count || 1,
        new Date(reg.registration_date).toLocaleDateString(),
        reg.attendance_status || 'pending',
        reg.attendance_updated_at ? new Date(reg.attendance_updated_at).toLocaleString() : '',
        reg.user.profession,
        reg.user.company,
        reg.user.location
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_registrations_with_attendance.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'waitlist':
        return <WaitlistIcon className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'waitlist':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event registrations...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Link href="/admin/events" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/admin/events" 
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Events
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
                  <p className="text-gray-600 mt-1">{event.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link 
                  href={`/admin/events/${eventId}/edit`}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Event
                </Link>
                <button 
                  onClick={exportRegistrations}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-lg font-semibold text-gray-900">{event.time}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Capacity</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {event.current_attendees}/{event.max_attendees}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Actions */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-2">Confirm Waitlist</h4>
                <p className="text-xs text-green-700 mb-3">Move waitlist registrations to confirmed when space opens</p>
                <span className="text-lg font-bold text-green-600">{stats?.waitlist_count || 0}</span>
                <span className="text-sm text-green-600 ml-1">waiting</span>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Manage Capacity</h4>
                <p className="text-xs text-blue-700 mb-3">Adjust confirmed registrations based on event capacity</p>
                <span className="text-lg font-bold text-blue-600">{event.current_attendees}/{event.max_attendees}</span>
                <span className="text-sm text-blue-600 ml-1">attendees</span>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="text-sm font-medium text-orange-900 mb-2">Track Attendance</h4>
                <p className="text-xs text-orange-700 mb-3">Mark who actually attended on event day</p>
                <span className="text-lg font-bold text-orange-600">{stats?.pending_attendance_count || 0}</span>
                <span className="text-sm text-orange-600 ml-1">pending</span>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-900 mb-2">Export List</h4>
                <p className="text-xs text-purple-700 mb-3">Download confirmed attendees for event check-in</p>
                <button 
                  onClick={exportRegistrations}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm hover:bg-purple-200 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total_registrations}</p>
                <p className="text-sm text-gray-600">Total Registrations</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.confirmed_count}</p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.waitlist_count}</p>
                <p className="text-sm text-gray-600">Waitlist</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.cancelled_count}</p>
                <p className="text-sm text-gray-600">Cancelled</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.attended_count}</p>
                <p className="text-sm text-gray-600">Actually Attended</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.no_show_count}</p>
                <p className="text-sm text-gray-600">No Show</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.pending_attendance_count}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.actual_attendees}</p>
                <p className="text-sm text-gray-600">Actual Attendees</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, profession, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="date">Registration Date</option>
                    <option value="name">Name</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1 hover:bg-gray-100 rounded"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Status Management Tips */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Registration & Attendance Management</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <div>
                  <p><strong>🟢 Confirmed:</strong> Registrant has a confirmed spot at the event</p>
                  <p className="text-xs ml-4">• Automatically assigned when space is available</p>
                  <p className="text-xs ml-4">• Admin can move to waitlist if needed</p>
                </div>
                <div>
                  <p><strong>🟡 Waitlist:</strong> Event is full, registrant is on waiting list</p>
                  <p className="text-xs ml-4">• Admin must manually confirm when space opens</p>
                  <p className="text-xs ml-4">• Use "Move to Confirmed" button</p>
                </div>
                <div>
                  <p><strong>🔴 Cancelled:</strong> Registration has been cancelled</p>
                  <p className="text-xs ml-4">• Can be restored to waitlist if needed</p>
                </div>
                <div className="mt-3 p-2 bg-emerald-100 rounded">
                  <p className="text-xs font-semibold">📋 <strong>Event Day Attendance Tracking:</strong></p>
                  <p className="text-xs">• <strong>Pending:</strong> Confirmed but attendance not yet marked</p>
                  <p className="text-xs">• <strong>Attended:</strong> Actually showed up on event day</p>
                  <p className="text-xs">• <strong>No Show:</strong> Confirmed but did not attend</p>
                  <p className="text-xs">• Only confirmed registrations can have attendance marked</p>
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded">
                  <p className="text-xs font-semibold">💡 <strong>How to Manage:</strong></p>
                  <p className="text-xs">1. Click "View" next to any registration</p>
                  <p className="text-xs">2. Use status buttons for registration management</p>
                  <p className="text-xs">3. Use attendance buttons for event day tracking</p>
                  <p className="text-xs">4. Monitor all metrics in the stats dashboard above</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Registrations ({sortedRegistrations.length})
            </h3>
          </div>
          
          {sortedRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No one has registered for this event yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRegistrations.map((registration) => (
                    <>
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {registration.user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {registration.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(registration.status)}
                            <span className={getStatusBadge(registration.status)}>
                              {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.guest_count || 1} {registration.guest_count === 1 ? 'person' : 'people'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(registration.registration_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(registration.registration_date).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleRowExpansion(registration.id)}
                              className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              {expandedRows.has(registration.id) ? 'Hide' : 'View'}
                            </button>
                            <Link
                              href={`/profile/${registration.user_id}`}
                              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              Profile
                            </Link>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row */}
                      {expandedRows.has(registration.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {registration.user.email}
                                  </div>
                                  {registration.user.phone && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Phone className="h-4 w-4 mr-2" />
                                      {registration.user.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Professional Information</h4>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Building className="h-4 w-4 mr-2" />
                                    {registration.user.profession} at {registration.user.company}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <LocationIcon className="h-4 w-4 mr-2" />
                                    {registration.user.location}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Alumni Information</h4>
                                <div className="space-y-1">
                                  {registration.user.last_class && (
                                    <div className="text-sm text-gray-600">
                                      Last Class: {registration.user.last_class}
                                    </div>
                                  )}
                                  {registration.user.year_of_leaving && (
                                    <div className="text-sm text-gray-600">
                                      Year of Leaving: {registration.user.year_of_leaving}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Status Management Section */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-900">Registration Management</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  registration.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  registration.status === 'waitlist' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  Current Status: {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                                </span>
                              </div>
                              
                              {/* Only show registration management if attendance is not marked as attended */}
                              {registration.attendance_status !== 'attended' && (
                                <div className="flex flex-wrap gap-2">
                                  {registration.status === 'waitlist' && (
                                    <button
                                      onClick={() => moveFromWaitlist(registration.id)}
                                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200 transition-colors"
                                    >
                                      Move to Confirmed
                                    </button>
                                  )}
                                  
                                  {registration.status === 'confirmed' && (
                                    <button
                                      onClick={() => updateRegistrationStatus(registration.id, 'waitlist')}
                                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200 transition-colors"
                                    >
                                      Move to Waitlist
                                    </button>
                                  )}
                                  
                                  {registration.status !== 'cancelled' && (
                                    <button
                                      onClick={() => {
                                        if (confirm('Are you sure you want to cancel this registration?')) {
                                          updateRegistrationStatus(registration.id, 'cancelled')
                                        }
                                      }}
                                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200 transition-colors"
                                    >
                                      Cancel Registration
                                    </button>
                                  )}
                                  
                                  {registration.status === 'cancelled' && (
                                    <button
                                      onClick={() => updateRegistrationStatus(registration.id, 'waitlist')}
                                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
                                    >
                                      Restore to Waitlist
                                    </button>
                                  )}
                                </div>
                              )}
                              
                              {/* Show message if attendance is marked as attended */}
                              {registration.attendance_status === 'attended' && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                  <p className="text-sm text-emerald-800 font-medium">✅ Registration Management Locked</p>
                                  <p className="text-xs text-emerald-700 mt-1">
                                    Since this person has already attended the event, registration status changes are not allowed.
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Attendance Tracking Section */}
                            {registration.status === 'confirmed' && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h5 className="text-sm font-medium text-gray-900 mb-3">Event Day Attendance</h5>
                                
                                {/* Headcount Management for Attended Registrations */}
                                {registration.attendance_status === 'attended' && (
                                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                    <h6 className="text-sm font-medium text-emerald-900 mb-2">Individual Headcount Tracking</h6>
                                    <div className="flex items-center gap-4">
                                      <div className="text-sm text-emerald-800">
                                        Registered: {registration.guest_count || 1} people
                                      </div>
                                      <div className="text-sm text-emerald-800">
                                        Actually Attended: {registration.actual_attendance_count || registration.guest_count || 1} people
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            const currentCount = registration.actual_attendance_count || registration.guest_count || 1
                                            console.log('Minus button clicked, current count:', currentCount)
                                            if (currentCount > 1) {
                                              updateAttendanceWithCount(registration.id, 'attended', currentCount - 1)
                                            }
                                          }}
                                          className="w-8 h-8 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center text-emerald-800 font-semibold"
                                          disabled={false}
                                        >
                                          -
                                        </button>
                                        <span className="text-lg font-bold text-emerald-900">
                                          {registration.actual_attendance_count || registration.guest_count || 1}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const currentCount = registration.actual_attendance_count || registration.guest_count || 1
                                            console.log('Plus button clicked, current count:', currentCount)
                                            if (currentCount < (registration.guest_count || 1)) {
                                              updateAttendanceWithCount(registration.id, 'attended', currentCount + 1)
                                            }
                                          }}
                                          className="w-8 h-8 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center text-emerald-800 font-semibold"
                                          disabled={false}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-xs text-emerald-700 mt-2">
                                      Adjust the actual attendance count if fewer people attended than registered
                                    </p>
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap gap-2">
                                  {registration.attendance_status === 'attended' ? (
                                    <div className="flex flex-col gap-2">
                                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md text-sm font-medium">
                                        ✅ Attended ({registration.actual_attendance_count || registration.guest_count || 1}/{registration.guest_count || 1})
                                      </span>
                                      <button
                                        onClick={() => updateAttendance(registration.id, 'no_show')}
                                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200 transition-colors"
                                      >
                                        ❌ Change to No Show
                                      </button>
                                    </div>
                                  ) : registration.attendance_status === 'no_show' ? (
                                    <div className="flex flex-col gap-2">
                                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium">
                                        ❌ No Show
                                      </span>
                                      <button
                                        onClick={() => updateAttendance(registration.id, 'attended')}
                                        className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md text-sm hover:bg-emerald-200 transition-colors"
                                      >
                                        ✅ Change to Attended
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => updateAttendance(registration.id, 'attended')}
                                        className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md text-sm hover:bg-emerald-200 transition-colors"
                                      >
                                        ✅ Mark as Attended
                                      </button>
                                      <button
                                        onClick={() => updateAttendance(registration.id, 'no_show')}
                                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200 transition-colors"
                                      >
                                        ❌ Mark as No Show
                                      </button>
                                    </>
                                  )}
                                </div>
                                {registration.attendance_updated_at && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Updated: {new Date(registration.attendance_updated_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
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
