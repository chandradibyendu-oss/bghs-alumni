'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  full_name: string
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  batch_year: number
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
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (error) throw error
        setProfile(data as Profile)
      } catch (e) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const updateField = (key: keyof Profile, value: any) => {
    if (!profile) return
    setProfile({ ...profile, [key]: value })
  }

  const save = async () => {
    if (!profile) return
    if (!profile.phone || !profile.phone.trim()) {
      toast.error('Phone is required')
      return
    }
    setSaving(true)
    try {
      const updates = {
        first_name: profile.first_name || null,
        middle_name: profile.middle_name || null,
        last_name: profile.last_name || null,
        full_name: profile.full_name,
        batch_year: profile.batch_year,
        last_class: profile.last_class ?? null,
        year_of_leaving: profile.year_of_leaving ?? null,
        start_class: profile.start_class ?? null,
        start_year: profile.start_year ?? null,
        profession: profile.profession,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        website_url: profile.website_url,
        phone: profile.phone
      }
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
      if (error) throw error
      toast.success('Profile updated successfully!')
      
      // Show success message with navigation options
      setTimeout(() => {
        toast.success('Profile saved! You can continue editing or go back to home.', {
          duration: 4000,
        })
      }, 500)
    } catch (e) {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

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
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">My Profile</span>
          </nav>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <div className="flex items-center gap-3">
              {!profile.is_approved && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending approval</span>
              )}
              <Link href="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>

          {/* Avatar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-20 h-20 object-cover" />
              ) : (
                <span className="text-gray-500 text-sm">No Photo</span>
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input className="input-field" value={profile.first_name || ''}
                onChange={(e)=>updateField('first_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input className="input-field" value={profile.middle_name || ''}
                onChange={(e)=>updateField('middle_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="input-field" value={profile.last_name || ''}
                onChange={(e)=>updateField('last_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (derived)</label>
              <input className="input-field" value={profile.full_name} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input-field" value={profile.email} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year (10th Standard)</label>
              <input type="number" className="input-field" value={profile.batch_year}
                onChange={(e)=>updateField('batch_year', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <p className="text-xs text-blue-600 mb-2">📱 Include country code (e.g., +91XXXXXXXXXX)</p>
              <input className="input-field" placeholder="+91XXXXXXXXXX" value={profile.phone || ''}
                onChange={(e)=>updateField('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
              <input className="input-field" value={profile.profession || ''}
                onChange={(e)=>updateField('profession', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input className="input-field" value={profile.company || ''}
                onChange={(e)=>updateField('company', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input className="input-field" value={profile.location || ''}
                onChange={(e)=>updateField('location', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea className="input-field" rows={3} value={profile.bio || ''}
                onChange={(e)=>updateField('bio', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input className="input-field" value={profile.linkedin_url || ''}
                onChange={(e)=>updateField('linkedin_url', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input className="input-field" value={profile.website_url || ''}
                onChange={(e)=>updateField('website_url', e.target.value)} />
            </div>
          </div>

          {/* Education at BGHS */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Education at BGHS</h2>
            <p className="text-sm text-gray-600 mb-4">Specify the last class you studied at BGHS and the year you left. Optionally, add when you started.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last class attended (1–12)</label>
                <select
                  className="input-field"
                  value={profile.last_class ?? ''}
                  onChange={(e)=>updateField('last_class', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select class</option>
                  {Array.from({length:12}).map((_,i)=>i+1).map(n=> (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of leaving (YYYY)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g., 2002"
                  value={profile.year_of_leaving ?? ''}
                  onChange={(e)=>updateField('year_of_leaving', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start class (optional)</label>
                <select
                  className="input-field"
                  value={profile.start_class ?? ''}
                  onChange={(e)=>updateField('start_class', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select class</option>
                  {Array.from({length:12}).map((_,i)=>i+1).map(n=> (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start year (optional)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g., 1994"
                  value={profile.start_year ?? ''}
                  onChange={(e)=>updateField('start_year', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 text-sm">
                ← Back to Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/directory" className="text-gray-600 hover:text-gray-800 text-sm">
                View Alumni Directory
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="btn-secondary">
                Go to Home
              </Link>
              <button onClick={save} disabled={saving} className="btn-primary px-6 py-2 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showCamera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="mb-3">
              <p className="font-medium text-gray-900 mb-2">Capture Profile Photo</p>
              <div className="aspect-[4/3] bg-black rounded overflow-hidden">
                <video id="avatar-video" autoPlay playsInline className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={closeCamera}>Cancel</button>
              <button className="btn-primary" onClick={capturePhoto}>Capture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


