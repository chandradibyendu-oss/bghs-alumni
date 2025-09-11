'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Reunion',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    venue_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_region: '',
    postal_code: '',
    country: 'India',
    is_virtual: false,
    meeting_platform: '',
    meeting_url: '',
    visibility: 'public',
    registration_required: true,
    registration_open_at: '',
    registration_close_at: '',
    capacity_max: '100',
    ticketing_type: 'free',
    price_base: '',
    currency: 'INR',
    contact_email: '',
    contact_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    dress_code: '',
    parking_info: '',
    accessibility_notes: '',
    terms_ack_required: false,
    photo_consent_required: false,
    wheelchair_accessible: false,
    cover_image_url: '',
    featured: false,
    // Sponsor fields
    sponsors: [
      { name: '', logo_url: '', website_url: '', banner_url: '', description: '', tier: 'Platinum' }
    ]
  })

  useEffect(() => {
    checkAuthorization()
    fetchEvent()
  }, [params.id])

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      let canManage = false
      try {
        const perms = await getUserPermissions(user.id)
        console.log('User permissions:', perms)
        canManage = hasPermission(perms, 'can_manage_events') || hasPermission(perms, 'can_access_admin')
        console.log('Can manage from permissions:', canManage)
      } catch (error) {
        console.log('Permission check failed, trying role check:', error)
        // Fallback: check role directly
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        console.log('User role:', data?.role)
        canManage = data?.role === 'super_admin' || data?.role === 'event_manager'
        console.log('Can manage from role:', canManage)
      }

      setIsAuthorized(canManage)

      if (!canManage) {
        alert('You do not have permission to edit events.')
        router.push('/admin/events')
        return
      }
    } catch (error) {
      console.error('Error checking authorization:', error)
      router.push('/login')
    }
  }

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setEvent(data)

      // Populate form with existing data
      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'Reunion',
          start_date: data.date || '',
          start_time: data.time || '',
          end_date: data.metadata?.end_date || '',
          end_time: data.metadata?.end_time || '',
          venue_name: data.metadata?.venue_name || '',
          address_line1: data.metadata?.address?.line1 || '',
          address_line2: data.metadata?.address?.line2 || '',
          city: data.metadata?.address?.city || '',
          state_region: data.metadata?.address?.state || '',
          postal_code: data.metadata?.address?.postal_code || '',
          country: data.metadata?.address?.country || 'India',
          is_virtual: data.metadata?.is_virtual || false,
          meeting_platform: data.metadata?.meeting_platform || '',
          meeting_url: data.metadata?.meeting_url || '',
          visibility: data.metadata?.visibility || 'public',
          registration_required: data.metadata?.registration_required || true,
          registration_open_at: data.metadata?.registration_open_at || '',
          registration_close_at: data.metadata?.registration_close_at || '',
          capacity_max: data.max_attendees?.toString() || '100',
          ticketing_type: data.metadata?.ticketing_type || 'free',
          price_base: data.metadata?.price_base?.toString() || '',
          currency: data.metadata?.currency || 'INR',
          contact_email: data.metadata?.contact_email || '',
          contact_phone: data.metadata?.contact_phone || '',
          emergency_contact_name: data.metadata?.emergency_contact?.name || '',
          emergency_contact_phone: data.metadata?.emergency_contact?.phone || '',
          dress_code: data.metadata?.logistics?.dress_code || '',
          parking_info: data.metadata?.logistics?.parking_info || '',
          accessibility_notes: data.metadata?.logistics?.accessibility_notes || '',
          terms_ack_required: data.metadata?.policies?.terms_ack_required || false,
          photo_consent_required: data.metadata?.policies?.photo_consent_required || false,
          wheelchair_accessible: data.metadata?.policies?.wheelchair_accessible || false,
          cover_image_url: data.image_url || '',
          featured: data.metadata?.featured || false,
          sponsors: data.metadata?.sponsors || [{ name: '', logo_url: '', website_url: '', banner_url: '', description: '', tier: 'Platinum' }]
        })
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      alert('Error loading event data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Event title is required')
      return false
    }
    if (!formData.description.trim()) {
      alert('Event description is required')
      return false
    }
    if (!formData.start_date) {
      alert('Start date is required')
      return false
    }
    if (!formData.start_time) {
      alert('Start time is required')
      return false
    }
    return true
  }

  const addSponsor = () => {
    setFormData(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, { name: '', logo_url: '', website_url: '', banner_url: '', description: '', tier: 'Silver' }]
    }))
  }

  const removeSponsor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== index)
    }))
  }

  const updateSponsor = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.map((sponsor, i) => 
        i === index ? { ...sponsor, [field]: value } : sponsor
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.start_date,
        time: formData.start_time,
        location: formData.is_virtual ? 'Virtual Event' : `${formData.venue_name}, ${formData.city}`,
        max_attendees: formData.capacity_max ? parseInt(formData.capacity_max) : 100,
        image_url: formData.cover_image_url || null,
        // Only include created_by if the column exists
        ...(event.created_by && { created_by: event.created_by }),
        metadata: {
          end_date: formData.end_date,
          end_time: formData.end_time,
          venue_name: formData.venue_name,
          address: {
            line1: formData.address_line1,
            line2: formData.address_line2,
            city: formData.city,
            state: formData.state_region,
            postal_code: formData.postal_code,
            country: formData.country
          },
          is_virtual: formData.is_virtual,
          meeting_platform: formData.meeting_platform,
          meeting_url: formData.meeting_url,
          visibility: formData.visibility,
          registration_required: formData.registration_required,
          registration_open_at: formData.registration_open_at,
          registration_close_at: formData.registration_close_at,
          ticketing_type: formData.ticketing_type,
          price_base: formData.price_base ? parseFloat(formData.price_base) : null,
          currency: formData.currency,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          emergency_contact: {
            name: formData.emergency_contact_name,
            phone: formData.emergency_contact_phone
          },
          logistics: {
            dress_code: formData.dress_code,
            parking_info: formData.parking_info,
            accessibility_notes: formData.accessibility_notes
          },
          policies: {
            terms_ack_required: formData.terms_ack_required,
            photo_consent_required: formData.photo_consent_required,
            wheelchair_accessible: formData.wheelchair_accessible
          },
          featured: formData.featured,
          sponsors: formData.sponsors.filter(sponsor => sponsor.name.trim() !== '')
        }
      }

      console.log('Updating event with data:', eventData)
      console.log('Event ID:', params.id)

      const { data: updateData, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', params.id)
        .select()

      console.log('Update result:', { updateData, error })

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      if (!updateData || updateData.length === 0) {
        throw new Error('No event was updated. Event may not exist or you may not have permission.')
      }

      alert('Event updated successfully!')
      router.push('/admin/events')
    } catch (error) {
      console.error('Error updating event:', error)
      alert(`Error updating event: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to edit events.</p>
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/events" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
                <p className="text-gray-600">Update event details and settings</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/events" className="btn-secondary flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  placeholder="Describe the event in detail"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="Reunion">Reunion</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Sports">Sports</option>
                  <option value="Fundraiser">Fundraiser</option>
                  <option value="Cultural">Cultural</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  name="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Date & Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_virtual"
                  checked={formData.is_virtual}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  This is a virtual event
                </label>
              </div>
              
              {formData.is_virtual ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Platform
                    </label>
                    <input
                      type="text"
                      name="meeting_platform"
                      value={formData.meeting_platform}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Zoom, Google Meet, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting URL
                    </label>
                    <input
                      type="url"
                      name="meeting_url"
                      value={formData.meeting_url}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      name="venue_name"
                      value={formData.venue_name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter venue name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Region
                    </label>
                    <input
                      type="text"
                      name="state_region"
                      value={formData.state_region}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="State or region"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Postal code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Country"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration & Capacity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration & Capacity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Capacity
                </label>
                <input
                  type="number"
                  name="capacity_max"
                  value={formData.capacity_max}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="100"
                  min="1"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="registration_required"
                  checked={formData.registration_required}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Registration required
                </label>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="events@alumnibghs.org"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Sponsors Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Event Sponsors</h3>
              <button
                type="button"
                onClick={addSponsor}
                className="btn-secondary text-sm"
              >
                + Add Sponsor
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.sponsors.map((sponsor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Sponsor #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSponsor(index)}
                      className="btn-danger text-sm px-3 py-2"
                    >
                      Remove Sponsor
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor Name *</label>
                      <input
                        type="text"
                        value={sponsor.name}
                        onChange={(e) => updateSponsor(index, 'name', e.target.value)}
                        className="input-field"
                        placeholder="Enter sponsor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
                      <select
                        value={sponsor.tier}
                        onChange={(e) => updateSponsor(index, 'tier', e.target.value)}
                        className="input-field"
                      >
                        <option value="Platinum">Platinum (Large Banner)</option>
                        <option value="Gold">Gold (Medium Banner)</option>
                        <option value="Silver">Silver (Small Logo)</option>
                        <option value="Bronze">Bronze (Small Logo)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                      <input
                        type="url"
                        value={sponsor.logo_url}
                        onChange={(e) => updateSponsor(index, 'logo_url', e.target.value)}
                        className="input-field"
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">Square logo for Silver/Bronze tiers</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Banner/Poster URL</label>
                      <input
                        type="url"
                        value={sponsor.banner_url}
                        onChange={(e) => updateSponsor(index, 'banner_url', e.target.value)}
                        className="input-field"
                        placeholder="https://example.com/banner.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">Banner/poster for Platinum/Gold tiers (16:9 or 4:3 ratio)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                      <input
                        type="url"
                        value={sponsor.website_url}
                        onChange={(e) => updateSponsor(index, 'website_url', e.target.value)}
                        className="input-field"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        value={sponsor.description}
                        onChange={(e) => updateSponsor(index, 'description', e.target.value)}
                        className="input-field"
                        placeholder="Brief description of sponsor"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.sponsors.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No sponsors added yet. Click "Add Sponsor" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/events" className="btn-secondary">
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
