'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, MapPin, Users, ArrowLeft, Filter, Search, Plus, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
// Removed getUserPermissions import - using direct role check for performance

const categories = ["All", "Reunion", "Workshop", "Sports", "Fundraiser", "Cultural"]

export default function EventsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set())
  const [registeringEvents, setRegisteringEvents] = useState<Set<string>>(new Set())
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [guestCount, setGuestCount] = useState<number>(1)
  const [userRegistrationDetails, setUserRegistrationDetails] = useState<Map<string, any>>(new Map())
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    checkAdminStatus()
    fetchEvents()
  }, [])

  useEffect(() => {
    if (currentUserId) {
      fetchUserRegistrations()
    }
  }, [currentUserId])

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        // Quick admin check based on role (no additional database queries)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'super_admin' || profile?.role === 'event_manager'
        setIsAdmin(isAdmin)
        setUserRole(profile?.role || null)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      const isAuthenticated = !!user

      // Fetch all events
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error

      // Filter events based on visibility
      const filteredEvents = (data || []).filter((event: any) => {
        const visibility = event.metadata?.visibility || 'public'
        
        // Public events: visible to everyone
        if (visibility === 'public') {
          return true
        }
        
        // Alumni only events: visible only to authenticated users
        if (visibility === 'alumni_only') {
          return isAuthenticated
        }
        
        // Invite only events: visible only to authenticated users (can be enhanced later with actual invite system)
        if (visibility === 'invite_only') {
          return isAuthenticated
        }
        
        // Default: show public events only
        return visibility === 'public'
      })

      setEvents(filteredEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRegistrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('event_id, status, guest_count, registration_date')
        .eq('user_id', user.id)

      if (!error && registrations) {
        const registrationSet = new Set(registrations.map(r => r.event_id))
        setUserRegistrations(registrationSet)
        
        // Store registration details for management
        const detailsMap = new Map()
        registrations.forEach(reg => {
          detailsMap.set(reg.event_id, reg)
        })
        setUserRegistrationDetails(detailsMap)
      }
    } catch (error) {
      console.error('Error fetching user registrations:', error)
    }
  }

  const handleRegister = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login to register for events')
        return
      }

      // Check if already registered
      if (userRegistrations.has(eventId)) {
        alert('You are already registered for this event')
        return
      }

      // Set loading state
      setRegisteringEvents(prev => new Set(prev).add(eventId))

      // Get session for API call
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        alert('Authentication error. Please login again.')
        return
      }

      // Call registration API
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ eventId, guestCount })
      })

      const data = await response.json()

      if (response.ok) {
        // Add to user registrations
        setUserRegistrations(prev => new Set(prev).add(eventId))
        
        // Update event attendee count
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, current_attendees: event.current_attendees + guestCount }
            : event
        ))

        alert(data.status === 'waitlist' 
          ? `Registered ${guestCount} people for waitlist successfully!` 
          : `Registered ${guestCount} people for event successfully!`)
      } else {
        alert(data.error || 'Failed to register for event')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('An error occurred while registering')
    } finally {
      // Remove loading state
      setRegisteringEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  const handleRegisterClick = (eventId: string) => {
    setExpandedEventId(eventId)
    setGuestCount(1) // Reset to default
  }

  const handleConfirmRegistration = async (eventId: string) => {
    await handleRegister(eventId)
    setExpandedEventId(null) // Close the form
  }

  const handleCancelRegistration = () => {
    setExpandedEventId(null)
    setGuestCount(1)
  }

  const handleCancelEventRegistration = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login to manage registrations')
        return
      }

      if (!confirm('Are you sure you want to cancel your registration?')) {
        return
      }

      // Get session for API call
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        alert('Authentication error. Please login again.')
        return
      }

      // Call cancellation API
      const response = await fetch('/api/events/register', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ eventId })
      })

      const data = await response.json()

      if (response.ok) {
        // Remove from user registrations
        setUserRegistrations(prev => {
          const newSet = new Set(prev)
          newSet.delete(eventId)
          return newSet
        })
        
        // Remove from registration details
        setUserRegistrationDetails(prev => {
          const newMap = new Map(prev)
          newMap.delete(eventId)
          return newMap
        })

        // Update event attendee count
        const registration = userRegistrationDetails.get(eventId)
        const cancelledCount = registration?.guest_count || 1
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, current_attendees: Math.max(0, event.current_attendees - cancelledCount) }
            : event
        ))

        alert('Registration cancelled successfully!')
      } else {
        alert(data.error || 'Failed to cancel registration')
      }
    } catch (error) {
      console.error('Cancellation error:', error)
      alert('An error occurred while cancelling registration')
    }
  }

  const handleModifyRegistration = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login to modify registrations')
        return
      }

      const currentRegistration = userRegistrationDetails.get(eventId)
      const currentCount = currentRegistration?.guest_count || 1

      // Get session for API call
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        alert('Authentication error. Please login again.')
        return
      }

      // Call registration API with new guest count
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ eventId, guestCount })
      })

      const data = await response.json()

      if (response.ok) {
        // Update registration details
        setUserRegistrationDetails(prev => {
          const newMap = new Map(prev)
          newMap.set(eventId, {
            ...currentRegistration,
            guest_count: guestCount,
            status: data.status
          })
          return newMap
        })

        // Update event attendee count (adjust for the difference)
        const countDifference = guestCount - currentCount
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, current_attendees: event.current_attendees + countDifference }
            : event
        ))

        alert(`Registration updated to ${guestCount} people successfully!`)
        setExpandedEventId(null) // Close the form
      } else {
        alert(data.error || 'Failed to update registration')
      }
    } catch (error) {
      console.error('Modification error:', error)
      alert('An error occurred while updating registration')
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
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
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Events & Reunions</h1>
                <p className="text-gray-600">Stay connected with your alma mater through our exciting events</p>
              </div>
            </div>
            {isAdmin && (
              <Link href="/admin/events" className="btn-primary flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Manage Events
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                className="input-field"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <button className="btn-secondary flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    width={400}
                    height={225}
                    className="rounded-lg object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Calendar className="h-12 w-12 mb-2" />
                    <span className="text-sm">No Image</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {event.category}
                  </span>
                  {event.metadata?.visibility && event.metadata.visibility !== 'public' && (
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      event.metadata.visibility === 'alumni_only' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {event.metadata.visibility === 'alumni_only' ? 'Alumni Only' : 'Invite Only'}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{event.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.current_attendees}/{event.max_attendees} attendees
                </div>
              </div>

                {/* Registration Section */}
                {userRegistrations.has(event.id) ? (
                  expandedEventId === event.id ? (
                    /* Registration Management Form */
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">Manage Registration</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Currently registered for {userRegistrationDetails.get(event.id)?.guest_count || 1} people
                        </p>
                        <p className="text-xs text-gray-500 mb-4">Status: {userRegistrationDetails.get(event.id)?.status || 'confirmed'}</p>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <button 
                          onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-semibold"
                          disabled={guestCount <= 1}
                        >
                          -
                        </button>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-600">{guestCount}</div>
                          <div className="text-xs text-gray-500">
                            {guestCount === 1 ? 'person' : 'people'}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-semibold"
                          disabled={guestCount >= 10}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-center text-xs text-gray-500">
                        Including yourself • Max 10 people per registration
                      </div>

                      <div className="flex gap-2">
                        <button 
                          className="btn-primary flex-1" 
                          onClick={() => handleModifyRegistration(event.id)}
                          disabled={registeringEvents.has(event.id)}
                        >
                          {registeringEvents.has(event.id) ? 'Updating...' : `Update to ${guestCount} ${guestCount === 1 ? 'Person' : 'People'}`}
                        </button>
                        <button 
                          className="btn-secondary" 
                          onClick={() => handleCancelRegistration()}
                          disabled={registeringEvents.has(event.id)}
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          className="btn-danger flex-1" 
                          onClick={() => handleCancelEventRegistration(event.id)}
                          disabled={registeringEvents.has(event.id)}
                        >
                          Cancel Registration
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Registered State - Show Management Options */
                    <div className="flex flex-col gap-2">
                      <button 
                        className="btn-secondary w-full flex items-center justify-center gap-2 whitespace-nowrap text-sm" 
                        onClick={() => {
                          setExpandedEventId(event.id)
                          setGuestCount(userRegistrationDetails.get(event.id)?.guest_count || 1)
                        }}
                      >
                        <span className="flex-shrink-0">✓</span>
                        <span className="flex flex-col items-center min-w-0">
                          <span className="text-sm">Manage Registration</span>
                          <span className="text-xs opacity-75">({userRegistrationDetails.get(event.id)?.guest_count || 1} people)</span>
                        </span>
                      </button>
                      <div className="flex gap-2">
                        <Link href={`/events/${event.id}`} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm">
                          <Eye className="h-4 w-4" />
                          Details
                        </Link>
                        {/* Admin Options */}
                        {(userRole === 'super_admin' || event.created_by === currentUserId) && (
                          <Link 
                            href={`/admin/events/${event.id}/edit`}
                            className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                ) : expandedEventId === event.id ? (
                  /* Expanded Registration Form */
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Register for Event</h4>
                      <p className="text-sm text-gray-600 mb-4">How many people will attend?</p>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4">
                      <button 
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-semibold"
                        disabled={guestCount <= 1}
                      >
                        -
                      </button>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">{guestCount}</div>
                        <div className="text-xs text-gray-500">
                          {guestCount === 1 ? 'person' : 'people'}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-semibold"
                        disabled={guestCount >= 10}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-center text-xs text-gray-500">
                      Including yourself • Max 10 people per registration
                    </div>

                    <div className="flex gap-2">
                      <button 
                        className="btn-primary flex-1" 
                        onClick={() => handleConfirmRegistration(event.id)}
                        disabled={registeringEvents.has(event.id)}
                      >
                        {registeringEvents.has(event.id) ? 'Registering...' : `Register ${guestCount} ${guestCount === 1 ? 'Person' : 'People'}`}
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={handleCancelRegistration}
                        disabled={registeringEvents.has(event.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button 
                      className="btn-primary w-full" 
                      onClick={() => handleRegisterClick(event.id)}
                    >
                      Register
                    </button>
                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}`} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm">
                        <Eye className="h-4 w-4" />
                        Details
                      </Link>
                      {/* Admin Options */}
                      {(userRole === 'super_admin' || event.created_by === currentUserId) && (
                        <Link 
                          href={`/admin/events/${event.id}/edit`}
                          className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                )}
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No events are currently scheduled. Check back later!'}
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Have an Event Idea?</h2>
          <p className="text-primary-100 mb-6">
            We're always looking for new ways to bring our alumni community together. 
            Share your event ideas with us!
          </p>
          <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            Suggest an Event
          </button>
        </div>

        {/* Past Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Events</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No past events to display</p>
              <p className="text-sm">Check back later for event archives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
