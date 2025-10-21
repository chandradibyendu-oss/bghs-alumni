'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Search, CheckCircle, Clock, MapPin, User, Phone, Mail } from 'lucide-react'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

interface Event {
  id: string
  title: string
  date: string
  location: string
  max_attendees: number
  current_attendees: number
}

interface Registration {
  id: string
  event_id: string
  user_id: string
  status: 'confirmed' | 'waitlist' | 'cancelled' | 'not_registered'
  guest_count: number
  registration_date: string
  attendance_status?: 'pending' | 'attended' | 'no_show'
  actual_attendance_count?: number
  attendance_updated_at?: string
  user: {
    id: string
    full_name: string
    email: string
    phone?: string
  }
}

export default function EventAttendancePage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [attendanceCount, setAttendanceCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user has admin permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const isAdmin = profile?.role === 'super_admin' || profile?.role === 'event_manager'
      if (!isAdmin) {
        alert('You do not have permission to access Event Attendance.')
        router.push('/dashboard')
        return
      }

      setCurrentUserId(user.id)
      setUserRole(profile?.role || null)
      await loadUpcomingEvents()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      console.log('Loading events from date:', today)
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, location, max_attendees, current_attendees')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(10)

      console.log('Events query result:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      setEvents(data || [])
      console.log('Events loaded:', data?.length || 0)
    } catch (error) {
      console.error('Error loading events:', error)
      alert('Failed to load upcoming events: ' + (error as Error).message)
    }
  }

  const loadEventRegistrations = async (eventId: string) => {
    try {
      console.log('Loading registrations for event:', eventId)
      
      // Use the new API endpoint that bypasses RLS
      const response = await fetch(`/api/admin/events/attendance/registrations?eventId=${eventId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API response:', result)

      if (result.error) {
        throw new Error(result.error)
      }
      
      const processedData = result.data || []
      console.log('Processed registrations:', processedData.length, processedData.map((r: any) => ({
        name: r.user.full_name,
        status: r.status,
        attendance: r.attendance_status,
        count: r.guest_count,
        actual_count: r.actual_attendance_count,
        id: r.id
      })))
      setRegistrations(processedData)
    } catch (error) {
      console.error('Error loading registrations:', error)
      alert('Failed to load event registrations: ' + (error as Error).message)
    }
  }

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
    setSearchTerm('')
    setSelectedRegistration(null)
    setAttendanceCount(1)
    loadEventRegistrations(event.id)
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    
    if (term.length < 2) {
      setSelectedRegistration(null)
      return
    }
    
    try {
      let foundMember: any = null
      let foundRegistration: any = null
      
      if (term.length === 6 && /^\d+$/.test(term)) {
        // First try to find by registration ID (6-digit number) in current event
        foundRegistration = registrations.find(reg => reg.id.startsWith(term))
      } else {
        // Search in entire alumni database (profiles table) by name or phone
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, role, is_approved')
          .or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`)
          .limit(10)
        
        if (error) {
          console.error('Error searching profiles:', error)
          setSelectedRegistration(null)
          return
        }
        
        // If we found profiles, check if any have registrations for this event
        if (profiles && profiles.length > 0) {
          // Take the first matching profile
          foundMember = profiles[0]
          
          // Always check database directly for fresh data using the API (bypasses RLS)
          if (selectedEvent) {
            console.log('Searching for registration:', {
              eventId: selectedEvent.id,
              userId: foundMember.id,
              memberName: foundMember.full_name
            })
            
            try {
              const response = await fetch(`/api/admin/events/attendance/registrations?eventId=${selectedEvent.id}`)
              const apiResult = await response.json()
              
              if (response.ok && apiResult.data) {
                // Find the registration for this specific user (any registration, including cancelled)
                const userRegistration = apiResult.data.find((reg: any) => reg.user_id === foundMember.id)
                
                console.log('Registration search result:', {
                  totalRegistrations: apiResult.data.length,
                  foundForUser: !!userRegistration,
                  userRegistration: userRegistration,
                  allUserRegistrations: apiResult.data.filter((reg: any) => reg.user_id === foundMember.id)
                })
                
                if (userRegistration) {
                  foundRegistration = userRegistration
                  console.log('Using registration:', foundRegistration)
                }
              } else {
                console.error('API error:', apiResult)
              }
            } catch (error) {
              console.error('Search error:', error)
            }
          }
        }
      }
      
      if (foundRegistration && foundRegistration.status !== 'cancelled') {
        // Member found with active registration for this event
        setSelectedRegistration(foundRegistration)
        setAttendanceCount(foundRegistration.actual_attendance_count || foundRegistration.guest_count || 1)
      } else if (foundMember) {
        // Member found in database but no active registration for this event
        // This includes cancelled registrations - treat them as not registered for attendance
        // Create a temporary registration object for display
        const tempRegistration = {
          id: 'temp-' + foundMember.id,
          event_id: selectedEvent?.id || '',
          user_id: foundMember.id,
          status: 'not_registered' as const,
          guest_count: 1,
          registration_date: new Date().toISOString(),
          attendance_status: 'pending' as const,
          actual_attendance_count: 1,
          user: {
            id: foundMember.id,
            full_name: foundMember.full_name,
            email: foundMember.email,
            phone: foundMember.phone || ''
          }
        }
        setSelectedRegistration(tempRegistration)
        setAttendanceCount(1)
      } else {
        // No member found in database - this is a true walk-in
        setSelectedRegistration(null)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSelectedRegistration(null)
    }
  }

  const handleMarkWalkInAttendance = async () => {
    if (!searchTerm.trim() || !selectedEvent) return

    try {
      setUpdating(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to mark attendance')
        return
      }

      // Create walk-in registration and mark attendance in one call
      const response = await fetch('/api/admin/events/registrations/walk-in-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          attendeeName: searchTerm.trim(),
          guestCount: attendanceCount
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Walk-in attendance marked for ${searchTerm.trim()} (${attendanceCount} people)`)
        
        // Small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Reload registrations to include the new walk-in and update statistics
        await loadEventRegistrations(selectedEvent.id)
        
        // Reset for next person
        setSearchTerm('')
        setSelectedRegistration(null)
        setAttendanceCount(1)
      } else {
        alert(data.error || 'Failed to mark walk-in attendance')
      }
    } catch (error) {
      console.error('Error marking walk-in attendance:', error)
      alert('An error occurred while marking walk-in attendance')
    } finally {
      setUpdating(false)
    }
  }

  const handleUndoAttendance = async (registrationId: string) => {
    if (!selectedEvent) return

    const confirmUndo = confirm('Are you sure you want to undo this attendance? This action cannot be undone.')
    if (!confirmUndo) return

    try {
      setUpdating(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to undo attendance')
        return
      }

      const response = await fetch('/api/admin/events/registrations/undo-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          registrationId: registrationId,
          eventId: selectedEvent.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Attendance undone successfully for ${data.data?.user?.full_name || 'attendee'}`)
        
        // Small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Reload registrations to show updated data
        await loadEventRegistrations(selectedEvent.id)
      } else {
        alert(data.error || 'Failed to undo attendance')
      }
    } catch (error) {
      console.error('Error undoing attendance:', error)
      alert('An error occurred while undoing attendance')
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkAttendance = async () => {
    if (!selectedRegistration) return

    try {
      setUpdating(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to mark attendance')
        return
      }

      // If this is an existing member who wasn't registered for the event, use walk-in API
      if (selectedRegistration.status === 'not_registered') {
        const response = await fetch('/api/admin/events/registrations/walk-in-attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            eventId: selectedEvent?.id,
            attendeeName: selectedRegistration.user.full_name,
            guestCount: attendanceCount,
            existingUserId: selectedRegistration.user_id // Pass existing user ID
          })
        })

        const data = await response.json()

        if (response.ok) {
          alert(`✅ Attendance marked for existing member ${selectedRegistration.user.full_name} (${attendanceCount} people)`)
          
          // Small delay to ensure database is updated
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Reload registrations to include the new registration and update statistics
          await loadEventRegistrations(selectedEvent?.id || '')
          
          
          // Reset for next person
          setSearchTerm('')
          setSelectedRegistration(null)
          setAttendanceCount(1)
        } else {
          alert(data.error || 'Failed to mark attendance for existing member')
        }
        return
      }

      // For existing registrations, use the update attendance API
      const response = await fetch('/api/admin/events/registrations/update-attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          registrationId: selectedRegistration.id,
          attendanceStatus: 'attended',
          actualAttendanceCount: attendanceCount,
          eventId: selectedEvent?.id,
          updateStatusToConfirmed: true // Auto-confirm registration when marking attendance
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Attendance marked for ${selectedRegistration.user.full_name} (${attendanceCount} people)`)
        
        // Small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Reload registrations to get updated data from database
        await loadEventRegistrations(selectedEvent?.id || '')
        
        
        // Reset for next person
        setSearchTerm('')
        setSelectedRegistration(null)
        setAttendanceCount(1)
      } else {
        alert(data.error || 'Failed to mark attendance')
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('An error occurred while marking attendance')
    } finally {
      setUpdating(false)
    }
  }

  // No need for filtered registrations since we removed the list view

  // Filter out cancelled registrations for statistics
  const activeRegistrations = registrations.filter(reg => reg.status !== 'cancelled')
  
  const attendedCount = activeRegistrations.filter(reg => reg.attendance_status === 'attended').length
  const pendingCount = activeRegistrations.filter(reg => !reg.attendance_status || reg.attendance_status === 'pending').length

  if (loading) {
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Attendance</h1>
              <p className="text-gray-600">Quick attendance capture for event coordinators</p>
            </div>
            <button
              onClick={() => router.push('/admin/events')}
              className="btn-secondary"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!selectedEvent ? (
          /* Event Selection */
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Upcoming Event
              </h2>
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming events found</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map(event => (
                    <button
                      key={event.id}
                      onClick={() => handleEventSelect(event)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {event.current_attendees}/{event.max_attendees} registered
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Attendance Capture Interface */
          <div className="space-y-6">
            {/* Event Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h2>
                <button
                  onClick={() => {
                    setSelectedEvent(null)
                    setRegistrations([])
                    setSearchTerm('')
                    setSelectedRegistration(null)
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Change Event
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {selectedEvent.location}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  {activeRegistrations.length} registered
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{activeRegistrations.length}</div>
                <div className="text-sm text-gray-600">Total Confirmed</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{attendedCount}</div>
                <div className="text-sm text-gray-600">Attended</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {activeRegistrations.reduce((sum, reg) => sum + (reg.attendance_status === 'attended' ? (reg.actual_attendance_count || reg.guest_count || 1) : 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total People</div>
              </div>
            </div>

            {/* Search and Attendance Capture */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Attendance Capture</h3>
              
              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Name, Phone, or Registration ID (6 digits)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Type member name, phone, or 6-digit registration ID..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use 6-digit registration ID for fastest lookup. Walk-in attendees will be auto-registered.
                </p>
              </div>

              {/* Selected Registration */}
              {selectedRegistration && (
                <div className={`mb-6 p-4 border rounded-lg ${
                  selectedRegistration.status === 'not_registered' 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : selectedRegistration.attendance_status === 'attended'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-primary-50 border-primary-200'
                }`}>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {selectedRegistration.status === 'not_registered' 
                      ? 'Existing Member (Not Registered)' 
                      : selectedRegistration.attendance_status === 'attended'
                        ? 'Selected Registration (Already Attended)'
                        : 'Selected Registration'
                    }
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Member Name</div>
                      <div className="font-medium">{selectedRegistration.user.full_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        {selectedRegistration.status === 'not_registered' 
                          ? 'Status' 
                          : selectedRegistration.attendance_status === 'attended'
                            ? 'Attendance Status'
                            : 'Registered Guests'
                        }
                      </div>
                      <div className="font-medium">
                        {selectedRegistration.status === 'not_registered' 
                          ? 'Existing Member (will be registered)' 
                          : selectedRegistration.attendance_status === 'attended'
                            ? `Attended (${selectedRegistration.actual_attendance_count || selectedRegistration.guest_count} people)`
                            : `${selectedRegistration.guest_count} people`
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-sm">{selectedRegistration.user.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium">{selectedRegistration.user.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  {/* Attendance Count */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How many people actually attended?
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setAttendanceCount(Math.max(1, attendanceCount - 1))}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-semibold"
                        disabled={attendanceCount <= 1}
                      >
                        -
                      </button>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{attendanceCount}</div>
                        <div className="text-sm text-gray-500">
                          {attendanceCount === 1 ? 'person' : 'people'}
                        </div>
                      </div>
                      <button
                        onClick={() => setAttendanceCount(Math.min(10, attendanceCount + 1))}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-semibold"
                        disabled={attendanceCount >= 10}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum: 10 people per attendance
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {selectedRegistration.attendance_status === 'attended' ? (
                    /* Two buttons for attended members */
                    <div className="space-y-3">
                      <button
                        onClick={handleMarkAttendance}
                        disabled={updating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {updating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Updating Count...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Update Attendance Count ({attendanceCount} people)
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleUndoAttendance(selectedRegistration.id)}
                        disabled={updating}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {updating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Undoing Attendance...
                          </>
                        ) : (
                          <>
                            <Clock className="h-5 w-5" />
                            Undo Attendance
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Mark Attendance Button */
                    <button
                      onClick={handleMarkAttendance}
                      disabled={updating}
                      className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        selectedRegistration.status === 'not_registered'
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {selectedRegistration.status === 'not_registered' ? 'Registering & Marking...' : 'Marking Attendance...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          {selectedRegistration.status === 'not_registered' 
                            ? `Register & Mark Attended (${attendanceCount} people)`
                            : `Mark as Attended (${attendanceCount} people)`
                          }
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Walk-in Attendee Section */}
              {searchTerm && !selectedRegistration && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-3">Walk-in Attendee</h4>
                  <p className="text-orange-800 text-sm mb-4">
                    No prior registration found for "{searchTerm}". This appears to be a walk-in attendee.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Attendee Name</div>
                      <div className="font-medium">{searchTerm}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Registration Status</div>
                      <div className="font-medium text-orange-600">Walk-in (will be auto-registered)</div>
                    </div>
                  </div>

                  {/* Attendance Count for Walk-in */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How many people actually attended?
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setAttendanceCount(Math.max(1, attendanceCount - 1))}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-semibold"
                        disabled={attendanceCount <= 1}
                      >
                        -
                      </button>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{attendanceCount}</div>
                        <div className="text-sm text-gray-500">
                          {attendanceCount === 1 ? 'person' : 'people'}
                        </div>
                      </div>
                      <button
                        onClick={() => setAttendanceCount(Math.min(10, attendanceCount + 1))}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-semibold"
                        disabled={attendanceCount >= 10}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum: 10 people per walk-in registration
                    </p>
                  </div>

                  {/* Mark Walk-in Attendance Button */}
                  <button
                    onClick={handleMarkWalkInAttendance}
                    disabled={updating}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing Walk-in...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Mark Walk-in as Attended ({attendanceCount} people)
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Recent Attendance Actions */}
              {registrations.filter(reg => reg.attendance_status === 'attended').length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Attendance Actions
                  </h4>
                  <p className="text-red-800 text-sm mb-4">
                    Recently marked attendees. You can undo attendance if marked by mistake.
                  </p>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {registrations
                      .filter(reg => reg.attendance_status === 'attended')
                      .sort((a, b) => new Date(b.attendance_updated_at || 0).getTime() - new Date(a.attendance_updated_at || 0).getTime())
                      .slice(0, 10) // Show only last 10 actions
                      .map(reg => (
                        <div key={reg.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {reg.user?.full_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {reg.actual_attendance_count || reg.guest_count || 1} {reg.actual_attendance_count === 1 ? 'person' : 'people'} attended
                            </div>
                            <div className="text-xs text-gray-500">
                              {reg.attendance_updated_at ? new Date(reg.attendance_updated_at).toLocaleString() : 'Just now'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUndoAttendance(reg.id)}
                            disabled={updating}
                            className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <Clock className="h-3 w-3" />
                            Undo
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Quick Stats Summary - COMMENTED OUT FOR NOW */}
              {/* 
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Event Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{activeRegistrations.length}</div>
                    <div className="text-gray-600">Total Registrations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{attendedCount}</div>
                    <div className="text-gray-600">Marked Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{pendingCount}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {activeRegistrations.reduce((sum, reg) => sum + (reg.attendance_status === 'attended' ? (reg.actual_attendance_count || reg.guest_count || 1) : 0), 0)}
                    </div>
                    <div className="text-gray-600">Total People</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Search above to mark attendance for any member or walk-in attendee
                </p>
              </div>
              */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
