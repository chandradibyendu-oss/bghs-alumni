'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User, Mail, Phone, MapPin, Briefcase, Building, Globe, Linkedin, Camera, Save, Edit3, Award, Upload, X } from 'lucide-react'

// Helper function to format name with professional title (from database)
const formatNameWithTitle = (fullName: string, professionalTitle?: string | null): string => {
  // Display professional title from database before the name
  if (professionalTitle) {
    return `${professionalTitle} ${fullName}`
  }
  
  return fullName
}

interface Profile {
  id: string
  email: string
  full_name: string
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  batch_year: number | null
  last_class?: number | null
  year_of_leaving?: number | null
  start_class?: number | null
  start_year?: number | null
  profession: string | null
  company: string | null
  location: string | null
  bio: string | null
  avatar_url?: string | null
  linkedin_url: string | null
  website_url: string | null
  phone: string | null
  is_approved?: boolean
  registration_id?: string | null
  professional_title_id?: number | null
  professional_title?: string | null
  professional_title_category?: string | null
  is_deceased?: boolean
  deceased_year?: number | null
}

interface ProfessionalTitle {
  id: number
  title: string
  title_prefix?: string
  category: string
  description: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [professionalTitles, setProfessionalTitles] = useState<ProfessionalTitle[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showTitleHelp, setShowTitleHelp] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    loadProfile()
    loadProfessionalTitles()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          professional_titles!professional_title_id(title, category)
        `)
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      // Process the data to include professional title information
      const processedData = {
        ...data,
        professional_title: data.professional_titles?.title || null,
        professional_title_category: data.professional_titles?.category || null
      }
      
      setProfile(processedData)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadProfessionalTitles = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_titles')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) {
        // If table doesn't exist yet, use empty array
        console.log('Professional titles table not found, using empty list')
        setProfessionalTitles([])
        return
      }
      setProfessionalTitles(data || [])
    } catch (error) {
      console.error('Error loading professional titles:', error)
      // Fallback to empty array if there's any error
      setProfessionalTitles([])
    }
  }

  const handleSave = async () => {
    if (!profile) return

    // Validate batch year vs year of leaving
    if (profile.batch_year && profile.year_of_leaving && profile.batch_year > profile.year_of_leaving) {
      toast.error('Batch year cannot be greater than year of leaving')
      setSaving(false)
      return
    }

    // Validate batch year is not 0 (invalid year)
    if (profile.batch_year === 0) {
      toast.error('Batch year cannot be 0. Please enter a valid year or leave it blank.')
      setSaving(false)
      return
    }

    setSaving(true)
    try {
      // Prepare update data
      const updateData: any = {
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        full_name: `${profile.first_name || ''} ${profile.middle_name || ''} ${profile.last_name || ''}`.trim(),
        batch_year: profile.batch_year,
        last_class: profile.last_class ?? null,
        year_of_leaving: profile.year_of_leaving ?? null,
        start_class: profile.start_class ?? null,
        start_year: profile.start_year ?? null,
        profession: profile.profession,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        phone: profile.phone,
        linkedin_url: profile.linkedin_url,
        website_url: profile.website_url,
        updated_at: new Date().toISOString()
      }

      // Only include professional_title_id if the field exists
      if (profile.professional_title_id !== undefined) {
        updateData.professional_title_id = profile.professional_title_id
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Profile, value: string | number | null) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null)
  }

  const getTitleCategories = () => {
    const categories = Array.from(new Set(professionalTitles.map(t => t.category)))
    return categories.sort()
  }

  const getTitlesByCategory = (category: string) => {
    return professionalTitles.filter(t => t.category === category)
  }

  const getSelectedTitle = () => {
    if (!profile?.professional_title_id) return null
    return professionalTitles.find(t => t.id === profile.professional_title_id)
  }

  // Avatar management functions
  const uploadAvatar = async (file: File) => {
    if (!file) return
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: form
      })
      if (!res.ok) throw new Error('Upload failed')
      const { avatar_url } = await res.json()
      if (profile) setProfile({ ...profile, avatar_url })
      toast.success('Profile photo updated')
    } catch (e) {
      toast.error('Failed to upload photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatar(file)
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setVideoStream(stream)
      setShowCamera(true)
    } catch (e) {
      toast.error('Cannot access camera')
    }
  }

  const closeCamera = () => {
    videoStream?.getTracks().forEach(t => t.stop())
    setVideoStream(null)
    setShowCamera(false)
  }

  useEffect(() => {
    if (!showCamera) return
    const video = document.getElementById('avatar-video') as HTMLVideoElement | null
    if (video && videoStream) {
      try {
        // @ts-ignore - srcObject is supported in modern browsers
        video.srcObject = videoStream
      } catch {
        video.src = URL.createObjectURL(new Blob([new Uint8Array()], { type: 'video/webm' }))
      }
    }
  }, [showCamera, videoStream])

  const capturePhoto = async () => {
    try {
      const video = document.getElementById('avatar-video') as HTMLVideoElement | null
      if (!video) return
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
      if (!blob) return
      const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' })
      await uploadAvatar(file)
      closeCamera()
    } catch (e) {
      toast.error('Failed to capture photo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
          <Link href="/dashboard" className="btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">My Profile</span>
        </nav>

        {/* Header Section - Matching Original Design */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formatNameWithTitle(profile.full_name, profile.professional_title)}
            </h1>
            {profile.professional_title_category && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {profile.professional_title_category}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!profile.is_approved && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending approval</span>
            )}
            <Link href="/profile/payments" className="btn-secondary">
              My Payments
            </Link>
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {profile.is_approved && profile.registration_id && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-sm">
              <span className="font-semibold">Member ID:</span>
              <span className="font-mono tracking-wider">{profile.registration_id}</span>
            </div>
          </div>
        )}

        {/* Avatar Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className={`w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative ${profile.is_deceased ? 'ring-2 ring-gray-400' : ''}`}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className={`w-20 h-20 object-cover ${profile.is_deceased ? 'opacity-70' : ''}`} />
            ) : (
              <span className={`text-sm ${profile.is_deceased ? 'text-gray-500' : 'text-gray-500'}`}>No Photo</span>
            )}
            {profile.is_deceased && (
              <div className="absolute -top-1 -right-1 bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                🕯️
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="btn-secondary cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
            </label>
            <button type="button" className="btn-secondary" onClick={openCamera} disabled={uploadingAvatar}>Use Camera</button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Fields marked with <span className="text-red-500">*</span> are required
        </p>

        {/* Profile Content */}
        <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                {/* Name Prefix - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name Prefix
                    <button
                      onClick={() => setShowTitleHelp(!showTitleHelp)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                    >
                      (Help)
                    </button>
                  </label>
                  {professionalTitles.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">
                        <strong>Name prefix feature coming soon!</strong> This feature will allow you to display name prefixes like Dr., Shri, Smt., Mr., Ms., etc. alongside your name.
                      </p>
                    </div>
                  ) : (
                    <>
                      {isEditing ? (
                        <div className="space-y-2">
                          <select
                            value={profile.professional_title_id || ''}
                            onChange={(e) => handleInputChange('professional_title_id', e.target.value ? parseInt(e.target.value) : null)}
                            className="input-field w-32"
                          >
                            <option value="">Select prefix</option>
                          {getTitleCategories().map(category => (
                            <optgroup key={category} label={category}>
                              {getTitlesByCategory(category).map(title => (
                                <option key={title.id} value={title.id}>
                                  {title.title_prefix || title.title}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          </select>
                          {showTitleHelp && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                              <p className="text-blue-800">
                                <strong>Name Prefix:</strong> Select a prefix that you commonly use with your name. 
                                This will be displayed alongside your name in the alumni directory and your profile.
                              </p>
                              <p className="text-blue-700 mt-1">
                                Examples: Dr., Shri, Smt., Mr., Ms., Prof., Adv., etc. You can change this anytime.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900 py-2">
                            {getSelectedTitle()?.title_prefix || getSelectedTitle()?.title || 'No prefix selected'}
                          </p>
                          {getSelectedTitle() && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {getSelectedTitle()?.category}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Name Fields - Balanced Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.first_name || ''}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="input-field"
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.first_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.middle_name || ''}
                        onChange={(e) => handleInputChange('middle_name', e.target.value)}
                        className="input-field"
                        placeholder="Enter middle name (optional)"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.middle_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.last_name || ''}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="input-field"
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.last_name || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Full Name (derived) and Batch Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (derived)</label>
                    <input 
                      className="input-field bg-gray-50" 
                      value={profile.full_name} 
                      disabled 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year (10th Standard)</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={profile.batch_year ? profile.batch_year.toString() : ''}
                          onChange={(e) => {
                            const value = e.target.value
                            // Allow typing any digits, but only save if it's a valid 4-digit year or empty
                            if (value === '' || /^\d{0,4}$/.test(value)) {
                              const numValue = value !== '' ? Number(value) : null
                              // Don't allow 0 as a batch year value
                              if (numValue === 0) {
                                handleInputChange('batch_year', null)
                              } else {
                                handleInputChange('batch_year', numValue)
                              }
                            }
                          }}
                          className={`input-field ${profile.batch_year && profile.year_of_leaving && profile.batch_year > profile.year_of_leaving ? 'border-red-500' : ''}`}
                          placeholder="e.g., 2005"
                          maxLength={4}
                        />
                        {profile.batch_year && profile.year_of_leaving && profile.batch_year > profile.year_of_leaving && (
                          <p className="text-red-500 text-xs mt-1">Batch year cannot be greater than year of leaving</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">{profile.batch_year ? profile.batch_year : 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.profession || ''}
                        onChange={(e) => handleInputChange('profession', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Software Engineer, Doctor, Teacher"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.profession || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Google, ABC Hospital, XYZ School"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.company || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Kolkata, West Bengal, India"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.location || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="input-field"
                      rows={4}
                      placeholder="Tell us about yourself, your achievements, and what you're doing now..."
                    />
                  ) : (
                    <p className="text-gray-900 py-2 whitespace-pre-wrap">{profile.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Education at BGHS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Education at BGHS
                </h2>
                <p className="text-sm text-gray-600 mt-1">Specify the last class you studied at BGHS and the year you left. Optionally, add when you started.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last class attended (1–12) <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <select
                        className="input-field"
                        value={profile.last_class ?? ''}
                        onChange={(e) => handleInputChange('last_class', e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">Select class</option>
                        {Array.from({length:12}).map((_,i)=>i+1).map(n=> (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{profile.last_class || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of leaving (YYYY) <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <input
                        type="number"
                        className="input-field"
                        placeholder="e.g., 2002"
                        value={profile.year_of_leaving ?? ''}
                        onChange={(e) => handleInputChange('year_of_leaving', e.target.value ? Number(e.target.value) : null)}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.year_of_leaving || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start class (optional)</label>
                    {isEditing ? (
                      <select
                        className="input-field"
                        value={profile.start_class ?? ''}
                        onChange={(e) => handleInputChange('start_class', e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">Select class</option>
                        {Array.from({length:12}).map((_,i)=>i+1).map(n=> (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{profile.start_class || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start year (optional)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        className="input-field"
                        placeholder="e.g., 1994"
                        value={profile.start_year ?? ''}
                        onChange={(e) => handleInputChange('start_year', e.target.value ? Number(e.target.value) : null)}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.start_year || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 py-2">{profile.email}</p>
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="input-field"
                        placeholder="e.g., +91 98765 43210"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 py-2">{profile.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.linkedin_url || ''}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        className="input-field"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 py-2">
                          {profile.linkedin_url ? (
                            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View Profile
                            </a>
                          ) : 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.website_url || ''}
                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                        className="input-field"
                        placeholder="https://yourwebsite.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 py-2">
                          {profile.website_url ? (
                            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Visit Website
                            </a>
                          ) : 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Capture Profile Photo</h3>
              <button
                onClick={closeCamera}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="aspect-[4/3] bg-black rounded overflow-hidden mb-4">
              <video id="avatar-video" autoPlay playsInline className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeCamera}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}