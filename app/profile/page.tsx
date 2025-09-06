'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  full_name: string
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  batch_year: number
  profession: string | null
  company: string | null
  location: string | null
  bio: string | null
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
    setSaving(true)
    try {
      const updates = {
        first_name: profile.first_name || null,
        middle_name: profile.middle_name || null,
        last_name: profile.last_name || null,
        full_name: profile.full_name,
        batch_year: profile.batch_year,
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
      toast.success('Profile updated')
    } catch (e) {
      toast.error('Update failed')
    } finally {
      setSaving(false)
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {!profile.is_approved && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending approval</span>
            )}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
              <input type="number" className="input-field" value={profile.batch_year}
                onChange={(e)=>updateField('batch_year', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
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

          <div className="mt-6 flex justify-end">
            <button onClick={save} disabled={saving} className="btn-primary px-6 py-2 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


