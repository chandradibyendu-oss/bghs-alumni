'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { ArrowLeft, Save, Calendar, MapPin, Clock, Users, Image, DollarSign } from 'lucide-react'

const EVENT_CATEGORIES = [
  'Reunion',
  'Workshop',
  'Sports',
  'Fundraiser',
  'Cultural',
  'Networking',
  'Awards',
  'Conference',
  'Seminar',
  'Other'
]

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public (Everyone can see)' },
  { value: 'alumni_only', label: 'Alumni Only' },
  { value: 'invite_only', label: 'Invite Only' }
]

const TICKETING_OPTIONS = [
  { value: 'free', label: 'Free Event' },
  { value: 'paid', label: 'Paid Event' },
  { value: 'donation', label: 'Donation Based' }
]

export default function CreateEventPage() {
  const [loading, setLoading] = useState(false)
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
    capacity_max: '',
    registration_required: true,
    registration_open_at: '',
    registration_close_at: '',
    ticketing_type: 'free',
    price_base: '',
    currency: 'INR',
    cover_image_url: '',
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
    featured: false,
    // Sponsor fields
    sponsors: [
      { name: '', logo_url: '', website_url: '', banner_url: '', description: '', tier: 'Platinum' }
    ]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    verifyAccess()
    // Set default dates
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setFormData(prev => ({
      ...prev,
      start_date: today,
      end_date: today,
      registration_open_at: today,
      registration_close_at: tomorrow
    }))
  }, [])

  const verifyAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const perms = await getUserPermissions(user.id)
    const allowed = hasPermission(perms, 'can_manage_events') || hasPermission(perms, 'can_access_admin')
    if (!allowed) {
      alert('You do not have permission to create events.')
      router.push('/dashboard')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.start_date) newErrors.start_date = 'Start date is required'
    if (!formData.start_time) newErrors.start_time = 'Start time is required'
    if (!formData.venue_name.trim() && !formData.is_virtual) newErrors.venue_name = 'Venue name is required for in-person events'
    if (!formData.meeting_url.trim() && formData.is_virtual) newErrors.meeting_url = 'Meeting URL is required for virtual events'
    if (formData.registration_required && !formData.registration_open_at) newErrors.registration_open_at = 'Registration open date is required'
    if (formData.registration_required && !formData.registration_close_at) newErrors.registration_close_at = 'Registration close date is required'
    if (formData.ticketing_type === 'paid' && !formData.price_base) newErrors.price_base = 'Price is required for paid events'
    if (formData.capacity_max && parseInt(formData.capacity_max) < 1) newErrors.capacity_max = 'Capacity must be at least 1'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      console.log('User authenticated:', user.id)
      console.log('User email:', user.email)

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.start_date,
        time: formData.start_time,
        location: formData.is_virtual ? 'Virtual Event' : `${formData.venue_name}, ${formData.city}`,
        max_attendees: formData.capacity_max ? parseInt(formData.capacity_max) : 100,
        current_attendees: 0,
        image_url: formData.cover_image_url || null,
        created_by: user.id,
        // Try to include metadata if column exists
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

      let { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      // If metadata column doesn't exist, try without it
      if (error && error.message.includes('metadata')) {
        console.log('Metadata column not found, retrying without metadata...')
        const simpleEventData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          date: formData.start_date,
          time: formData.start_time,
          location: formData.is_virtual ? 'Virtual Event' : `${formData.venue_name}, ${formData.city}`,
          max_attendees: formData.capacity_max ? parseInt(formData.capacity_max) : 100,
          current_attendees: 0,
          image_url: formData.cover_image_url || null
        }
        
        const retryResult = await supabase
          .from('events')
          .insert([simpleEventData])
          .select()
          .single()
        
        data = retryResult.data
        error = retryResult.error
      }

      if (error) throw error

      alert('Event created successfully!')
      router.push('/admin/events')
    } catch (error) {
      console.error('Error creating event:', error)
      console.error('Event form data at error:', formData)
      alert(`Error creating event: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/bghs-logo.png" alt="BGHS Alumni" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900">Create Event</span>
          </div>
          <Link href="/admin/events" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="e.g., Annual Alumni Reunion 2024"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="input-field"
                >
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="input-field"
                >
                  {VISIBILITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>


              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Detailed description of the event..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Date & Time
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={`input-field ${errors.start_date ? 'border-red-500' : ''}`}
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className={`input-field ${errors.start_time ? 'border-red-500' : ''}`}
                />
                {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Location
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_virtual"
                  checked={formData.is_virtual}
                  onChange={(e) => handleInputChange('is_virtual', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_virtual" className="text-sm font-medium text-gray-700">Virtual Event</label>
              </div>

              {formData.is_virtual ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Platform</label>
                    <input
                      type="text"
                      value={formData.meeting_platform}
                      onChange={(e) => handleInputChange('meeting_platform', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Zoom, Google Meet, Teams"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting URL *</label>
                    <input
                      type="url"
                      value={formData.meeting_url}
                      onChange={(e) => handleInputChange('meeting_url', e.target.value)}
                      className={`input-field ${errors.meeting_url ? 'border-red-500' : ''}`}
                      placeholder="https://zoom.us/j/..."
                    />
                    {errors.meeting_url && <p className="text-red-500 text-sm mt-1">{errors.meeting_url}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label>
                    <input
                      type="text"
                      value={formData.venue_name}
                      onChange={(e) => handleInputChange('venue_name', e.target.value)}
                      className={`input-field ${errors.venue_name ? 'border-red-500' : ''}`}
                      placeholder="e.g., BGHS Main Campus, Grand Hotel"
                    />
                    {errors.venue_name && <p className="text-red-500 text-sm mt-1">{errors.venue_name}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                      <input
                        type="text"
                        value={formData.address_line1}
                        onChange={(e) => handleInputChange('address_line1', e.target.value)}
                        className="input-field"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                      <input
                        type="text"
                        value={formData.address_line2}
                        onChange={(e) => handleInputChange('address_line2', e.target.value)}
                        className="input-field"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="input-field"
                        placeholder="Barasat"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State/Region</label>
                      <input
                        type="text"
                        value={formData.state_region}
                        onChange={(e) => handleInputChange('state_region', e.target.value)}
                        className="input-field"
                        placeholder="West Bengal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        className="input-field"
                        placeholder="700124"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration & Capacity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="h-5 w-5" /> Registration & Capacity
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="registration_required"
                  checked={formData.registration_required}
                  onChange={(e) => handleInputChange('registration_required', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="registration_required" className="text-sm font-medium text-gray-700">Registration Required</label>
              </div>

              {formData.registration_required && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Opens *</label>
                    <input
                      type="date"
                      value={formData.registration_open_at}
                      onChange={(e) => handleInputChange('registration_open_at', e.target.value)}
                      className={`input-field ${errors.registration_open_at ? 'border-red-500' : ''}`}
                    />
                    {errors.registration_open_at && <p className="text-red-500 text-sm mt-1">{errors.registration_open_at}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Closes *</label>
                    <input
                      type="date"
                      value={formData.registration_close_at}
                      onChange={(e) => handleInputChange('registration_close_at', e.target.value)}
                      className={`input-field ${errors.registration_close_at ? 'border-red-500' : ''}`}
                    />
                    {errors.registration_close_at && <p className="text-red-500 text-sm mt-1">{errors.registration_close_at}</p>}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Capacity</label>
                <input
                  type="number"
                  value={formData.capacity_max}
                  onChange={(e) => handleInputChange('capacity_max', e.target.value)}
                  className={`input-field ${errors.capacity_max ? 'border-red-500' : ''}`}
                  placeholder="100"
                  min="1"
                />
                {errors.capacity_max && <p className="text-red-500 text-sm mt-1">{errors.capacity_max}</p>}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Pricing
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
                <select
                  value={formData.ticketing_type}
                  onChange={(e) => handleInputChange('ticketing_type', e.target.value)}
                  className="input-field"
                >
                  {TICKETING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {formData.ticketing_type === 'paid' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input
                      type="number"
                      value={formData.price_base}
                      onChange={(e) => handleInputChange('price_base', e.target.value)}
                      className={`input-field ${errors.price_base ? 'border-red-500' : ''}`}
                      placeholder="500"
                      min="0"
                      step="0.01"
                    />
                    {errors.price_base && <p className="text-red-500 text-sm mt-1">{errors.price_base}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="input-field"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Logistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact & Logistics</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className="input-field"
                  placeholder="events@alumnibghs.org"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className="input-field"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  className="input-field"
                  placeholder="Event Coordinator"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  className="input-field"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dress Code</label>
                <input
                  type="text"
                  value={formData.dress_code}
                  onChange={(e) => handleInputChange('dress_code', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Smart Casual, Formal, School Colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parking Info</label>
                <input
                  type="text"
                  value={formData.parking_info}
                  onChange={(e) => handleInputChange('parking_info', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Free parking available, Valet service"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Accessibility Notes</label>
                <textarea
                  value={formData.accessibility_notes}
                  onChange={(e) => handleInputChange('accessibility_notes', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Any accessibility information for attendees..."
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Image className="h-5 w-5" /> Media
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
              <input
                type="url"
                value={formData.cover_image_url}
                onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                className="input-field"
                placeholder="https://example.com/event-image.jpg"
              />
            </div>
          </div>

          {/* Policies */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Policies & Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms_ack_required"
                  checked={formData.terms_ack_required}
                  onChange={(e) => handleInputChange('terms_ack_required', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="terms_ack_required" className="text-sm font-medium text-gray-700">Require Terms & Conditions Acknowledgment</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="photo_consent_required"
                  checked={formData.photo_consent_required}
                  onChange={(e) => handleInputChange('photo_consent_required', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="photo_consent_required" className="text-sm font-medium text-gray-700">Require Photo Consent</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wheelchair_accessible"
                  checked={formData.wheelchair_accessible}
                  onChange={(e) => handleInputChange('wheelchair_accessible', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="wheelchair_accessible" className="text-sm font-medium text-gray-700">Wheelchair Accessible</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Event</label>
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

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/events" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
