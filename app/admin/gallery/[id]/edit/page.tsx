'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Image as ImageIcon, X, Star, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface PhotoCategory {
  id: string
  name: string
  description: string
}

interface Event {
  id: string
  title: string
  date: string
}

export default function EditGalleryPhotoPage() {
  const params = useParams()
  const router = useRouter()
  const photoId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [categories, setCategories] = useState<PhotoCategory[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    is_featured: false,
    is_approved: false,
    event_id: '' as string | null
  })
  const [photoData, setPhotoData] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    verifyAccess()
    fetchCategories()
    fetchEvents()
    fetchPhoto()
  }, [photoId])

  const verifyAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        router.push('/login')
        return 
      }
      
      // Check if user has content management permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const allowedRoles = ['content_moderator', 'super_admin']
      const hasPermission = profile?.role && allowedRoles.includes(profile.role)
      
      if (!hasPermission) {
        alert('You do not have permission to edit gallery photos.')
        router.push('/gallery')
        return
      }

      setIsAuthorized(true)
    } catch (error) {
      console.error('Error verifying access:', error)
      router.push('/gallery')
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_categories')
        .select('*')
        .order('display_order')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
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

  const fetchPhoto = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('id', photoId)
        .single()

      if (error) throw error

      if (data) {
        setPhotoData(data)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category_id: data.category_id || '',
          is_featured: data.is_featured || false,
          is_approved: data.is_approved || false,
          event_id: data.event_id || ''
        })
      }
    } catch (error) {
      console.error('Error fetching photo:', error)
      alert('Failed to load photo. It may not exist or you may not have permission to edit it.')
      router.push('/gallery')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category_id: formData.category_id || null,
        is_featured: formData.is_featured,
        is_approved: formData.is_approved,
        updated_at: new Date().toISOString()
      }

      // Only include event_id if the column exists (check if photoData has it)
      if (photoData?.event_id !== undefined || formData.event_id) {
        updateData.event_id = formData.event_id || null
      }

      const { error } = await supabase
        .from('gallery_photos')
        .update(updateData)
        .eq('id', photoId)

      if (error) throw error

      alert('Photo updated successfully!')
      router.push('/gallery')
    } catch (error: any) {
      console.error('Error updating photo:', error)
      alert(error.message || 'Failed to update photo')
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

  if (!photoData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Photo Not Found</h1>
          <Link href="/gallery" className="btn-primary">
            Back to Gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/gallery" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Gallery Photo</h1>
                <p className="text-sm text-gray-600 mt-1">Update photo details and metadata</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Photo Preview
            </h2>
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={photoData.file_url}
                alt={photoData.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Dimensions:</span> {photoData.width} × {photoData.height}
              </div>
              <div>
                <span className="font-medium">File Size:</span> {photoData.file_size ? `${(photoData.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Uploaded:</span> {new Date(photoData.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Views:</span> {photoData.view_count || 0}
              </div>
            </div>
          </div>

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
                  placeholder="Enter photo title"
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Enter photo description (optional)"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Event */}
              {events.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Event (Optional)
                  </label>
                  <select
                    value={formData.event_id || ''}
                    onChange={(e) => handleInputChange('event_id', e.target.value || null)}
                    className="input-field"
                  >
                    <option value="">No specific event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({new Date(event.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Status & Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Status & Settings</h2>
            
            <div className="space-y-4">
              {/* Featured */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-900">Featured Photo</label>
                    <p className="text-xs text-gray-500">Show this photo prominently in the gallery</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Approved */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-900">Approved</label>
                    <p className="text-xs text-gray-500">Make this photo visible to all users</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_approved}
                    onChange={(e) => handleInputChange('is_approved', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Link
              href="/gallery"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


