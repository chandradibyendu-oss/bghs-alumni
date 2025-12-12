'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import {
  Award,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  Save,
  User,
  Search,
  Upload,
  Image as ImageIcon
} from 'lucide-react'

interface NotableAlumnus {
  id: string
  name: string
  batch_year?: number | null
  achievement: string
  field?: string | null
  description?: string | null
  photo_url?: string | null
  profile_id?: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function NotableAlumniPage() {
  const [notableAlumni, setNotableAlumni] = useState<NotableAlumnus[]>([])
  const [loading, setLoading] = useState(true)
  const [canManage, setCanManage] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAlumnus, setEditingAlumnus] = useState<NotableAlumnus | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    batch_year: '',
    achievement: '',
    field: '',
    description: '',
    photo_url: '',
    profile_id: '',
    is_active: true
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Start both operations in parallel, but don't block UI
    const init = async () => {
      // Start fetching data immediately (non-blocking)
      fetchNotableAlumni()
      // Verify access in parallel
      verifyAccess()
    }
    init()
  }, [])

  const verifyAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const perms = await getUserPermissions(user.id)
      const hasAccess = hasPermission(perms, 'can_manage_content') ||
                       hasPermission(perms, 'can_access_admin')

      if (!hasAccess) {
        alert('You do not have permission to manage notable alumni.')
        router.push('/dashboard')
        return
      }

      setCanManage(true)
    } catch (error) {
      console.error('Error verifying access:', error)
      router.push('/login')
    }
  }

  const fetchNotableAlumni = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notable_alumni')
        .select('id, name, batch_year, achievement, field, description, photo_url, profile_id, display_order, is_active, created_at, updated_at')
        .order('display_order', { ascending: true })

      if (error) throw error
      setNotableAlumni(data || [])
    } catch (error) {
      console.error('Error fetching notable alumni:', error)
      alert('Failed to fetch notable alumni')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (alumnus?: NotableAlumnus) => {
    if (alumnus) {
      setEditingAlumnus(alumnus)
      setFormData({
        name: alumnus.name || '',
        batch_year: alumnus.batch_year?.toString() || '',
        achievement: alumnus.achievement || '',
        field: alumnus.field || '',
        description: alumnus.description || '',
        photo_url: alumnus.photo_url || '',
        profile_id: alumnus.profile_id || '',
        is_active: alumnus.is_active ?? true
      })
    } else {
      setEditingAlumnus(null)
      setFormData({
        name: '',
        batch_year: '',
        achievement: '',
        field: '',
        description: '',
        photo_url: '',
        profile_id: '',
        is_active: true
      })
    }
    setModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      batch_year: '',
      achievement: '',
      field: '',
      description: '',
      photo_url: '',
      profile_id: '',
      is_active: true
    })
    setEditingAlumnus(null)
    setSelectedImageFile(null)
    setImagePreview(null)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setSelectedImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = async () => {
    if (!selectedImageFile) return

    try {
      setUploadingImage(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to upload')
        return
      }

      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedImageFile)

      const response = await fetch('/api/notable-alumni/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: uploadFormData
      })

      const result = await response.json()

      if (result.success) {
        setFormData({ ...formData, photo_url: result.url })
        alert('Image uploaded successfully!')
        setSelectedImageFile(null)
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.achievement) {
      alert('Name and Achievement are required')
      return
    }

    // Validate field lengths (VARCHAR(255) constraint)
    // Note: maxLength attribute prevents typing beyond 255, but we validate for safety
    if (formData.name.trim().length > 255) {
      alert(`Name must be 255 characters or less. Current length: ${formData.name.trim().length}`)
      return
    }
    if (formData.achievement.trim().length > 255) {
      alert(`Achievement must be 255 characters or less. Current length: ${formData.achievement.trim().length}`)
      return
    }
    if (formData.field && formData.field.trim().length > 255) {
      alert(`Field must be 255 characters or less. Current length: ${formData.field.trim().length}`)
      return
    }

    if (saving) return // Prevent double submission

    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const payload: any = {
        name: formData.name.trim(),
        achievement: formData.achievement.trim(),
        field: formData.field?.trim() || null,
        description: formData.description?.trim() || null,
        photo_url: formData.photo_url?.trim() || null,
        profile_id: formData.profile_id?.trim() || null,
        is_active: formData.is_active
      }

      if (formData.batch_year) {
        const year = parseInt(formData.batch_year)
        if (!isNaN(year) && year > 1900 && year <= new Date().getFullYear()) {
          payload.batch_year = year
        }
      }

      if (editingAlumnus) {
        // Update existing - use optimistic update
        const updatedAlumnus: NotableAlumnus = {
          ...editingAlumnus,
          ...payload,
          updated_at: new Date().toISOString()
        }

        // Optimistically update UI immediately
        setNotableAlumni(prev => 
          prev.map(a => a.id === editingAlumnus.id ? updatedAlumnus : a)
            .sort((a, b) => a.display_order - b.display_order)
        )

        // Update database - don't wait for select response to improve perceived performance
        const { error } = await supabase
          .from('notable_alumni')
          .update(payload)
          .eq('id', editingAlumnus.id)

        if (error) {
          // Revert on error
          setNotableAlumni(prev => 
            prev.map(a => a.id === editingAlumnus.id ? editingAlumnus : a)
              .sort((a, b) => a.display_order - b.display_order)
          )
          console.error('Update error:', error)
          throw error
        }

        // Success - optimistic update is already applied, no need to wait for server response
        // The updated_at will be set by the database trigger
      } else {
        // Create new - set display_order to end
        const maxOrder = notableAlumni.length > 0
          ? Math.max(...notableAlumni.map(a => a.display_order))
          : -1
        payload.display_order = maxOrder + 1
        // created_by is optional, but we'll set it if user is available
        if (user?.id) {
          payload.created_by = user.id
        }

        // Optimistically add to UI first
        const tempId = `temp-${Date.now()}`
        const newAlumnus: NotableAlumnus = {
          id: tempId,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as NotableAlumnus

        setNotableAlumni(prev => 
          [...prev, newAlumnus].sort((a, b) => a.display_order - b.display_order)
        )

        const { data, error } = await supabase
          .from('notable_alumni')
          .insert(payload)
          .select()
          .single()

        if (error) {
          // Revert optimistic update on error
          setNotableAlumni(prev => prev.filter(a => a.id !== tempId))
          throw error
        }

        // Replace temp entry with real data from server
        setNotableAlumni(prev => 
          prev.map(a => a.id === tempId ? data : a)
            .sort((a, b) => a.display_order - b.display_order)
        )
      }

      setModalOpen(false)
      resetForm()
      // Show success message without blocking
      setTimeout(() => {
        // Optional: Show a subtle success indicator
      }, 100)
    } catch (error: any) {
      console.error('Error saving notable alumnus:', error)
      
      // Extract error message from Supabase error object
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.error?.message) {
        errorMessage = error.error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.hint) {
        errorMessage = error.hint
      }
      
      console.error('Full error object:', JSON.stringify(error, null, 2))
      alert(`Failed to save notable alumnus: ${errorMessage}`)
      
      // Refetch to ensure consistency only on error
      await fetchNotableAlumni()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notable alumnus?')) {
      return
    }

    try {
      // Optimistically remove from UI
      const deletedAlumnus = notableAlumni.find(a => a.id === id)
      setNotableAlumni(prev => prev.filter(a => a.id !== id))

      const { error } = await supabase
        .from('notable_alumni')
        .delete()
        .eq('id', id)

      if (error) {
        // Revert on error
        if (deletedAlumnus) {
          setNotableAlumni(prev => [...prev, deletedAlumnus].sort((a, b) => a.display_order - b.display_order))
        }
        throw error
      }
    } catch (error) {
      console.error('Error deleting notable alumnus:', error)
      alert('Failed to delete notable alumnus')
      // Refetch to ensure consistency
      fetchNotableAlumni()
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = notableAlumni.findIndex(a => a.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= notableAlumni.length) return

    const current = notableAlumni[index]
    const target = notableAlumni[newIndex]

    try {
      // Optimistically update UI
      const updatedList = [...notableAlumni]
      const tempOrder = current.display_order
      updatedList[index] = { ...current, display_order: target.display_order }
      updatedList[newIndex] = { ...target, display_order: tempOrder }
      setNotableAlumni(updatedList.sort((a, b) => a.display_order - b.display_order))

      // Swap display_order values
      const { error: error1 } = await supabase
        .from('notable_alumni')
        .update({ display_order: target.display_order })
        .eq('id', current.id)

      if (error1) {
        // Revert on error
        fetchNotableAlumni()
        throw error1
      }

      const { error: error2 } = await supabase
        .from('notable_alumni')
        .update({ display_order: current.display_order })
        .eq('id', target.id)

      if (error2) {
        // Revert on error
        fetchNotableAlumni()
        throw error2
      }
    } catch (error) {
      console.error('Error moving notable alumnus:', error)
      alert('Failed to reorder notable alumni')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistically update UI
      setNotableAlumni(prev => 
        prev.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a)
      )

      const { error } = await supabase
        .from('notable_alumni')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        // Revert on error
        setNotableAlumni(prev => 
          prev.map(a => a.id === id ? { ...a, is_active: currentStatus } : a)
        )
        throw error
      }
      // Success - no need to refetch, optimistic update is sufficient
    } catch (error) {
      console.error('Error toggling active status:', error)
      alert('Failed to update status')
      // Only refetch on error to ensure consistency
      fetchNotableAlumni()
    }
  }

  const filteredAlumni = notableAlumni.filter(alumnus => {
    const searchLower = search.toLowerCase()
    return (
      alumnus.name.toLowerCase().includes(searchLower) ||
      alumnus.achievement.toLowerCase().includes(searchLower) ||
      (alumnus.field && alumnus.field.toLowerCase().includes(searchLower)) ||
      (alumnus.batch_year && alumnus.batch_year.toString().includes(searchLower))
    )
  })

  // Show loading state only if we're still verifying AND haven't loaded data yet
  // This allows the page to render faster while access is being verified
  if (!canManage && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // If access denied and not loading, redirect (handled by verifyAccess)
  if (!canManage && !loading) {
    return null // verifyAccess will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notable Alumni</h1>
              <p className="text-gray-600 mt-1">Manage distinguished alumni displayed on About page</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Notable Alumnus
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, achievement, field, or batch year..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Alumni List */}
            {filteredAlumni.length > 0 ? (
              <div className="space-y-4">
                {filteredAlumni.map((alumnus, index) => (
                  <div
                    key={alumnus.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMove(alumnus.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <span className="text-xs text-gray-500 text-center px-1">
                            {alumnus.display_order + 1}
                          </span>
                          <button
                            onClick={() => handleMove(alumnus.id, 'down')}
                            disabled={index === filteredAlumni.length - 1}
                            className="p-1 text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Photo */}
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                          {alumnus.photo_url ? (
                            <img
                              src={alumnus.photo_url}
                              alt={alumnus.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <User className="h-8 w-8 text-primary-600" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{alumnus.name}</h3>
                            {!alumnus.is_active && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-primary-600 mb-1">
                            {alumnus.achievement}
                          </p>
                          {alumnus.field && (
                            <p className="text-sm text-gray-600 mb-1">{alumnus.field}</p>
                          )}
                          {alumnus.batch_year && (
                            <p className="text-xs text-gray-500">Batch: {alumnus.batch_year}</p>
                          )}
                          {alumnus.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {alumnus.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(alumnus.id, alumnus.is_active)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title={alumnus.is_active ? 'Hide from About page' : 'Show on About page'}
                        >
                          {alumnus.is_active ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal(alumnus)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(alumnus.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {search ? 'No notable alumni found matching your search' : 'No notable alumni added yet'}
                </p>
                {!search && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary"
                  >
                    Add First Notable Alumnus
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAlumnus ? 'Edit Notable Alumnus' : 'Add Notable Alumnus'}
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({formData.name.length}/255 characters)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={255}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formData.name.length >= 250 ? 'border-yellow-400' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formData.name.length >= 250 && formData.name.length < 255 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        {255 - formData.name.length} characters remaining
                      </p>
                    )}
                  </div>

                  {/* Achievement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Achievement <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({formData.achievement.length}/255 characters)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.achievement}
                      onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                      placeholder="e.g., Dadasaheb Phalke Awardee, IAS Officer"
                      maxLength={255}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formData.achievement.length >= 250 ? 'border-yellow-400' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formData.achievement.length >= 250 && formData.achievement.length < 255 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        {255 - formData.achievement.length} characters remaining
                      </p>
                    )}
                  </div>

                  {/* Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field (Optional)
                      {formData.field && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({formData.field.length}/255 characters)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      placeholder="e.g., Indian Cinema, Civil Services, Physics"
                      maxLength={255}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formData.field && formData.field.length >= 250 ? 'border-yellow-400' : 'border-gray-300'
                      }`}
                    />
                    {formData.field && formData.field.length >= 250 && formData.field.length < 255 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        {255 - formData.field.length} characters remaining
                      </p>
                    )}
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Year (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.batch_year}
                      onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                      placeholder="e.g., 1988"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of achievements..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo (Optional)
                    </label>
                    
                    {/* Image Preview */}
                    {(imagePreview || formData.photo_url) && (
                      <div className="mb-4">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                          <img
                            src={imagePreview || formData.photo_url || ''}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {selectedImageFile ? selectedImageFile.name : 'Choose Image File'}
                            </span>
                          </div>
                        </label>
                        {selectedImageFile && (
                          <button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            className="btn-primary flex items-center gap-2 whitespace-nowrap"
                          >
                            {uploadingImage ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Upload
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Manual URL Input */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>

                      <input
                        type="url"
                        value={formData.photo_url}
                        onChange={(e) => {
                          setFormData({ ...formData, photo_url: e.target.value })
                          setImagePreview(e.target.value || null)
                        }}
                        placeholder="Enter image URL (e.g., https://example.com/photo.jpg or /notable-alumni/photo.png)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500">
                        Upload image file (max 5MB) or enter external URL / public folder path
                      </p>
                    </div>
                  </div>

                  {/* Profile ID (Optional - link to registered member) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.profile_id}
                      onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
                      placeholder="UUID of registered member (if applicable)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Link to a registered member profile (optional)
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-700">
                      Show on About page
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {editingAlumnus ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {editingAlumnus ? 'Update' : 'Add'} Notable Alumnus
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

