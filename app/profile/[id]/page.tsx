'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase, 
  GraduationCap, Globe, Linkedin, MessageCircle, 
  Shield, Eye, EyeOff, Calendar, Building, Award
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'

interface ProfileData {
  id: string
  full_name: string
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  phone?: string
  batch_year: number
  last_class?: number
  year_of_leaving?: number
  start_class?: number
  start_year?: number
  profession?: string
  company?: string
  location?: string
  bio?: string
  avatar_url?: string
  linkedin_url?: string
  website_url?: string
  registration_id?: string
  created_at?: string
  is_approved?: boolean
}

interface PrivacySettings {
  [key: string]: {
    value: boolean
    display_name: string
    description: string
    category: string
  }
}

export default function ProfileViewPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [canViewProfile, setCanViewProfile] = useState(false)
  const [accessLevel, setAccessLevel] = useState<string>('none')
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string

  useEffect(() => {
    loadProfile()
  }, [profileId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (!user) {
        setError('Please login to view profiles')
        return
      }

      // Check if user can view this profile using the new privacy function
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_profile_data_with_privacy', {
          viewer_id: user.id,
          target_id: profileId
        })

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setError('Failed to load profile')
        return
      }

      if (profileData?.error) {
        setError(profileData.reason || 'Access denied')
        return
      }

      // Set profile data and privacy settings
      setProfile(profileData.profile)
      setPrivacySettings(profileData.privacy_settings || {})
      setCanViewProfile(true)

      // Determine access level based on user permissions
      const perms = await getUserPermissions(user.id)
      if (hasPermission(perms, 'can_manage_users') || hasPermission(perms, 'can_access_admin')) {
        setAccessLevel('admin')
      } else if (user.id === profileId) {
        setAccessLevel('self')
      } else {
        setAccessLevel('member')
      }

    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPrivacyIcon = (settingKey: string) => {
    const setting = privacySettings[settingKey]
    if (!setting) return null
    
    return setting.value ? (
      <div title="Visible">
        <Eye className="h-4 w-4 text-green-600" />
      </div>
    ) : (
      <div title="Hidden">
        <EyeOff className="h-4 w-4 text-gray-400" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Link href="/directory" className="btn-primary">
              Back to Directory
            </Link>
            {!currentUser && (
              <Link href="/login" className="btn-secondary">
                Login to View
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
          <Link href="/directory" className="btn-primary">
            Back to Directory
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
          <div className="flex items-center space-x-4">
            <Link href="/directory" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">View alumni member profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                {accessLevel === 'admin' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Admin View
                  </span>
                )}
                {accessLevel === 'self' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Your Profile
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Batch of {profile.batch_year}
                </div>
                {profile.registration_id && (
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {profile.registration_id}
                  </div>
                )}
              </div>

              {/* Professional Info */}
              {profile.profession && (
                <div className="flex items-center text-lg text-primary-600 mb-2">
                  <Briefcase className="h-5 w-5 mr-2" />
                  {profile.profession}
                  {profile.company && ` at ${profile.company}`}
                </div>
              )}

              {profile.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {(profile.email || profile.phone) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {profile.email && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a 
                      href={`mailto:${profile.email}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {profile.email}
                    </a>
                    {getPrivacyIcon('show_email')}
                  </div>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Phone</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a 
                      href={`tel:${profile.phone}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {profile.phone}
                    </a>
                    {getPrivacyIcon('show_phone')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
              {getPrivacyIcon('show_bio')}
            </div>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Social Links */}
        {(profile.linkedin_url || profile.website_url) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
              {getPrivacyIcon('show_social_links')}
            </div>
            <div className="flex space-x-4">
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Linkedin className="h-5 w-5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                >
                  <Globe className="h-5 w-5" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Connect Actions */}
        {accessLevel === 'member' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex space-x-4">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>Connect on LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Admin Information */}
        {accessLevel === 'admin' && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Profile ID:</span>
                <span className="ml-2 text-blue-700">{profile.id}</span>
              </div>
              {profile.registration_id && (
                <div>
                  <span className="font-medium text-blue-800">Registration ID:</span>
                  <span className="ml-2 text-blue-700">{profile.registration_id}</span>
                </div>
              )}
              {profile.created_at && (
                <div>
                  <span className="font-medium text-blue-800">Joined:</span>
                  <span className="ml-2 text-blue-700">{formatDate(profile.created_at)}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-blue-800">Status:</span>
                <span className={`ml-2 ${profile.is_approved ? 'text-green-700' : 'text-red-700'}`}>
                  {profile.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings Info (for self-view) */}
        {accessLevel === 'self' && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <p className="text-gray-600 mb-4">
              This is how your profile appears to other members. You can change these settings in your profile.
            </p>
            <Link href="/profile" className="btn-primary">
              Edit Privacy Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
