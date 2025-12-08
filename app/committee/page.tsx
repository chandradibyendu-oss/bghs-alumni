'use client'

import { useState, useEffect } from 'react'
import { Users, Award, Calendar, Mail, Phone, MapPin, Building, History } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

interface CommitteePosition {
  id: string
  name: string
  display_order: number
}

interface CommitteeMember {
  id: string
  profile_id: string // REQUIRED: All members must have a profile
  committee_type: 'advisory' | 'executive'
  position_name?: string | null
  position_display_order?: number | null
  start_date: string
  profile: {
    id: string
    full_name: string
    email?: string
    phone?: string
    avatar_url?: string
    bio?: string
    profession?: string
    company?: string
    location?: string
  }
}

export default function CommitteePage() {
  const [loading, setLoading] = useState(true)
  const [advisoryMembers, setAdvisoryMembers] = useState<CommitteeMember[]>([])
  const [executiveMembers, setExecutiveMembers] = useState<CommitteeMember[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  useEffect(() => {
    loadCommitteeMembers()
  }, [])

  const loadCommitteeMembers = async () => {
    try {
      setLoading(true)
      
      // Load current committee members
      const { data, error } = await supabase
        .from('committee_members')
        .select(`
          id,
          profile_id,
          committee_type,
          start_date,
          position_type:committee_position_types(name, display_order),
          profile:profiles!profile_id(id, full_name, email, phone, avatar_url, bio, profession, company, location)
        `)
        .eq('is_current', true)
        .order('committee_type', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) throw error

      const formatted = data?.map(m => {
        const positionType = Array.isArray(m.position_type) 
          ? m.position_type[0] 
          : m.position_type
        const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile
        return {
          ...m,
          position_name: positionType?.name || null,
          position_display_order: positionType?.display_order || null,
          profile: profile || null
        }
      }).filter(m => m.profile !== null) || [] // Filter out any members without profiles

      // Separate by committee type
      const advisory = formatted.filter(m => m.committee_type === 'advisory')
      const executive = formatted.filter(m => m.committee_type === 'executive')

      // Sort executive by position order, then name
      executive.sort((a, b) => {
        if (a.position_display_order !== null && b.position_display_order !== null) {
          return a.position_display_order - b.position_display_order
        }
        if (a.position_display_order !== null) return -1
        if (b.position_display_order !== null) return 1
        const nameA = a.profile?.full_name || ''
        const nameB = b.profile?.full_name || ''
        return nameA.localeCompare(nameB)
      })

      setAdvisoryMembers(advisory)
      setExecutiveMembers(executive)
    } catch (error) {
      console.error('Error loading committee members:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Committee Members</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Meet the dedicated members who guide and lead the BGHS Alumni Association
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Executive Committee Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Award className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Executive Committee</h2>
          </div>
          
          {executiveMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No executive committee members to display</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {executiveMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </section>

        {/* Advisory Members Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Advisory Members</h2>
          </div>
          
          {advisoryMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No advisory members to display</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advisoryMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </section>

        {/* History Section (Optional - can be enabled later) */}
        {showHistory && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <History className="h-8 w-8 text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-900">Committee History</h2>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">
                Historical records of past committee members will be displayed here.
                This feature can be enabled in the admin panel.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function MemberCard({ member }: { member: CommitteeMember }) {
  if (!member.profile) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        {/* Photo */}
        <div className="mb-4">
          {member.profile.avatar_url ? (
            <Image
              src={member.profile.avatar_url}
              alt={member.profile.full_name}
              width={120}
              height={120}
              className="rounded-full object-cover border-4 border-primary-100"
            />
          ) : (
            <div className="w-30 h-30 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-4 border-primary-100">
              <Users className="h-16 w-16 text-primary-400" />
            </div>
          )}
        </div>

        {/* Name and Position */}
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.profile.full_name}</h3>
        {member.position_name && (
          <p className="text-primary-600 font-medium mb-3">{member.position_name}</p>
        )}
        {member.profile.profession && (
          <p className="text-sm text-gray-500 mb-2">{member.profile.profession}</p>
        )}

        {/* Bio */}
        {member.profile.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{member.profile.bio}</p>
        )}

        {/* Contact Info */}
        <div className="w-full space-y-2 mt-4 pt-4 border-t border-gray-100">
          {member.profile.email && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${member.profile.email}`} className="hover:text-primary-600">
                {member.profile.email}
              </a>
            </div>
          )}
          {member.profile.phone && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${member.profile.phone}`} className="hover:text-primary-600">
                {member.profile.phone}
              </a>
            </div>
          )}
        </div>

        {/* Profile Link */}
        <Link
          href={`/profile/${member.profile.id}`}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View Full Profile →
        </Link>

        {/* Tenure */}
        <div className="mt-4 pt-4 border-t border-gray-100 w-full">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Member since {new Date(member.start_date).getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

