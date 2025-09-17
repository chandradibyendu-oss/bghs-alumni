'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Image as ImageIcon, AlertCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PhotoCategory {
  id: string
  name: string
  description: string
}

interface Event {
  id: string
  title: string
  date: string
  category: string
}

export default function UploadPage() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<PhotoCategory[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [canUpload, setCanUpload] = useState(false)
  const [checkingPermissions, setCheckingPermissions] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    eventId: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    checkPermissions()
    fetchCategories()
    fetchEvents()
  }, [])

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check user role directly from profiles table instead of RPC
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error fetching profile:', error)
          setCanUpload(false)
        } else {
          // Check if user has upload permissions based on role
          const allowedRoles = ['content_creator', 'content_moderator', 'super_admin']
          const hasUploadPermission = profile?.role && allowedRoles.includes(profile.role)
          setCanUpload(hasUploadPermission)
          
          if (!hasUploadPermission) {
            // Redirect after we finish checking to avoid flicker
            setTimeout(() => router.push('/gallery'), 0)
          }
        }
      } else {
        // Redirect after we finish checking to avoid flicker
        setTimeout(() => router.push('/login'), 0)
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setCanUpload(false)
      setTimeout(() => router.push('/gallery'), 0)
    } finally {
      setCheckingPermissions(false)
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
        .select('id, title, date, category')
        .order('date', { ascending: false })
        .limit(20) // Get recent events

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate files
    const maxFiles = 10
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const invalidFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return true
      if (file.size > maxSize) return true
      return false
    })

    if (invalidFiles.length > 0) {
      setError('All files must be images under 10MB')
      return
    }

    setSelectedFiles(files)
    setError('')

    // Create previews
    const previewPromises = files.map(file => 
      new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
    )

    Promise.all(previewPromises).then(setPreviews)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedFiles.length === 0 || !formData.title || !formData.categoryId) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // For now, upload files one by one (we'll optimize this later)
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const uploadData = new FormData()
        uploadData.append('file', file)
        uploadData.append('title', `${formData.title} - ${index + 1}`)
        uploadData.append('description', formData.description)
        uploadData.append('categoryId', formData.categoryId)
        uploadData.append('eventId', formData.eventId || '')

        // Attach Supabase access token
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token

        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: uploadData,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Upload failed')
        }

        return response.json()
      })

      await Promise.all(uploadPromises)

      setSuccess(`${selectedFiles.length} photo(s) uploaded successfully! They will be reviewed before being published.`)
      
      // Reset form
      setSelectedFiles([])
      setPreviews([])
      setFormData({ title: '', description: '', categoryId: '', eventId: '' })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Redirect to gallery after 3 seconds
      setTimeout(() => {
        router.push('/gallery')
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = files
        handleFileSelect({ target: { files } } as any)
      }
    }
  }

  if (checkingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Checking permissions…</div>
      </div>
    )
  }

  if (!canUpload) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to upload photos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Photo</h1>
              <p className="text-gray-600">
                Share your school memories with the alumni community
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => router.push('/gallery')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Gallery
            </button>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multiple File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos * (up to 10 files)
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
              >
                {previews.length > 0 ? (
                  <div className="space-y-4">
                    {/* Preview Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFiles([])
                          setPreviews([])
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                        className="text-red-600 hover:text-red-800 flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remove All
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedFiles.length} photo(s) selected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600">
                        Drag and drop your photos here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports JPG, PNG, GIF (max 10MB each, up to 10 files)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Photo Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter a descriptive title for your photo"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Selection */}
            <div>
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
                Related Event (Optional)
              </label>
              <select
                id="event"
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">No specific event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({new Date(event.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Select an event if these photos are from a specific school event
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us about this photo (optional)"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/gallery')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedFiles.length === 0 || !formData.title || !formData.categoryId}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
