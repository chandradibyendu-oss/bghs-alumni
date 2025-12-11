'use client'

import { useState, useEffect } from 'react'
import { Users, Award, Calendar, Mail, Phone, MapPin, Building, History, Menu as MenuIcon, X, User as UserIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { getUserPermissions, hasPermission, UserPermissions } from '@/lib/auth-utils'

interface CommitteePosition {
  id: string
  name: string
  display_order: number
}

interface CommitteeMemberProfile {
  id: string
  full_name: string
  email?: string
  phone?: string
  avatar_url?: string
  bio?: string
  profession?: string
  company?: string
  location?: string
  professional_title_id?: number | null
  professional_title?: string | null
  professional_title_category?: string | null
}

interface CommitteeMember {
  id: string
  profile_id: string // REQUIRED: All members must have a profile
  committee_type: 'advisory' | 'executive'
  position_name?: string | null
  position_display_order?: number | null
  position_type_id?: string | null
  display_order: number // Member's display order within their position/group
  start_date: string
  profile: CommitteeMemberProfile | null
}

// Type for members with guaranteed profiles (after filtering)
interface CommitteeMemberWithProfile extends Omit<CommitteeMember, 'profile'> {
  profile: CommitteeMemberProfile
}

export default function CommitteePage() {
  const [loading, setLoading] = useState(true)
  const [advisoryMembers, setAdvisoryMembers] = useState<CommitteeMemberWithProfile[]>([])
  const [executiveMembers, setExecutiveMembers] = useState<CommitteeMemberWithProfile[]>([])
  const [positions, setPositions] = useState<CommitteePosition[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    loadCommitteeMembers()
    loadPositions()
    initAuth()
  }, [])

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('.account-dropdown-container')) {
          setAccountOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [accountOpen])

  const initAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUserEmail(user?.email ?? null)
    if (user) {
      try {
        const perms = await getUserPermissions(user.id)
        setUserPermissions(perms)
      } catch (error) {
        console.error('Error fetching permissions:', error)
        setUserPermissions(null)
      }
    } else {
      setUserPermissions(null)
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (session?.user) {
        try {
          const perms = await getUserPermissions(session.user.id)
          setUserPermissions(perms)
        } catch (error) {
          console.error('Error fetching permissions:', error)
          setUserPermissions(null)
        }
      } else {
        setUserPermissions(null)
      }
    })
    return () => subscription.unsubscribe()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
    window.location.href = '/'
  }

  // Admin menu items configuration with permission requirements
  const getAdminMenuItems = () => {
    if (!userPermissions) return []
    
    const menuItems = []
    
    // User Management
    if (hasPermission(userPermissions, 'can_manage_user_profiles') || hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Users', href: '/admin/users' })
    }
    
    // Event Management
    if (hasPermission(userPermissions, 'can_create_events') || 
        hasPermission(userPermissions, 'can_manage_events') || 
        hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Events', href: '/admin/events' })
    }
    
    // Committee Management
    if (hasPermission(userPermissions, 'can_manage_committee') || 
        hasPermission(userPermissions, 'can_manage_events') || 
        hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Committee Management', href: '/admin/committee' })
    }
    
    // Blog Management
    if (hasPermission(userPermissions, 'can_create_blog') || 
        hasPermission(userPermissions, 'can_moderate_blog') || 
        hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Blog Management', href: '/admin/blog' })
    }
    
    // Role Management
    if (hasPermission(userPermissions, 'can_manage_roles') || hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Role Management', href: '/admin/roles-simple' })
    }
    
    // Notices Management
    if (hasPermission(userPermissions, 'can_manage_notices') || hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Notices Management', href: '/admin/notices' })
    }
    
    return menuItems
  }

  const adminMenuItems = getAdminMenuItems()
  const hasAdminAccess = adminMenuItems.length > 0

  const loadPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('committee_position_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setPositions(data || [])
    } catch (error) {
      console.error('Error loading positions:', error)
    }
  }

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
          display_order,
          position_type_id,
          position_type:committee_position_types(name, display_order),
          profile:profiles!profile_id(
            id, 
            full_name, 
            email, 
            phone, 
            avatar_url, 
            bio, 
            profession, 
            company, 
            location,
            professional_title_id,
            professional_titles(title, category)
          )
        `)
        .eq('is_current', true)
        .order('committee_type', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) throw error

      const formatted = (data?.map(m => {
        const positionType = Array.isArray(m.position_type) 
          ? m.position_type[0] 
          : m.position_type
        const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile
        
        // Extract professional title from joined data
        const professionalTitle = profile?.professional_titles
          ? (Array.isArray(profile.professional_titles) 
              ? profile.professional_titles[0] 
              : profile.professional_titles)
          : null
        
        if (!profile) {
          return null
        }
        
        return {
          id: m.id,
          profile_id: m.profile_id,
          committee_type: m.committee_type,
          position_name: positionType?.name || null,
          position_display_order: positionType?.display_order || null,
          position_type_id: m.position_type_id || null,
          display_order: m.display_order || 0,
          start_date: m.start_date,
          profile: {
            ...profile,
            professional_title: professionalTitle?.title || null,
            professional_title_category: professionalTitle?.category || null
          }
        } as CommitteeMemberWithProfile
      }).filter(m => m !== null) || []) as CommitteeMemberWithProfile[]

      // Separate by committee type
      const advisory = formatted.filter(m => m.committee_type === 'advisory')
      const executive = formatted.filter(m => m.committee_type === 'executive')

      // Sort advisory members by display_order (as set in admin)
      advisory.sort((a, b) => a.display_order - b.display_order)

      // Sort executive by position order first, then by display_order within each position
      executive.sort((a, b) => {
        // First sort by position display order
        const aPosOrder = a.position_display_order ?? null
        const bPosOrder = b.position_display_order ?? null
        if (aPosOrder !== null && bPosOrder !== null) {
          const positionDiff = aPosOrder - bPosOrder
          if (positionDiff !== 0) return positionDiff
          // If same position, sort by member display_order
          return a.display_order - b.display_order
        }
        if (aPosOrder !== null) return -1
        if (bPosOrder !== null) return 1
        // Both have no position - sort by display_order
        return a.display_order - b.display_order
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
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <img 
                  src="/bghs-logo.png" 
                  alt="BGHS Alumni Association" 
                  className="h-12 sm:h-14 w-auto object-contain shrink-0 flex-none"
                />
                <div className="flex flex-col min-w-0 flex-1 pr-2">
                  <span className="text-lg sm:text-2xl font-bold text-gray-900 truncate">BGHS Alumni</span>
                  <span className="text-[10px] sm:text-sm text-gray-600 leading-tight line-clamp-2">বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">About</Link>
              <Link href="/events" className="text-gray-700 hover:text-primary-600 transition-colors">Events</Link>
              <Link href="/directory" className="text-gray-700 hover:text-primary-600 transition-colors">Directory</Link>
              <Link href="/committee" className="text-primary-600 font-semibold">Committee</Link>
              <Link href="/gallery" className="text-gray-700 hover:text-primary-600 transition-colors">Gallery</Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">Blog</Link>
              {userEmail ? (
                <div className="relative account-dropdown-container">
                  <button onClick={() => setAccountOpen(!accountOpen)} className="flex items-center space-x-2 px-3 py-1 border rounded-md text-gray-700 hover:text-gray-900">
                    <UserIcon className="h-4 w-4" />
                    <span className="text-sm">Account</span>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-3 text-sm text-gray-600 border-b">{userEmail}</div>
                      <div className="py-1">
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                        {hasAdminAccess && (
                          <>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
                            {adminMenuItems.map((item) => (
                              <Link key={item.href} href={item.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                {item.label}
                              </Link>
                            ))}
                          </>
                        )}
                        <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary">Login</Link>
              )}
              </div>
              {/* Mobile menu button - moved to top right */}
              <button className="md:hidden p-2 -mr-2" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
                <MenuIcon className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="h-6 w-6" /></button>
            </div>
            <nav className="space-y-2">
              <Link href="/about" className="block px-2 py-2 rounded hover:bg-gray-50">About</Link>
              <Link href="/events" className="block px-2 py-2 rounded hover:bg-gray-50">Events</Link>
              <Link href="/directory" className="block px-2 py-2 rounded hover:bg-gray-50">Directory</Link>
              <Link href="/committee" className="block px-2 py-2 rounded bg-primary-50 text-primary-600 font-semibold">Committee</Link>
              <Link href="/gallery" className="block px-2 py-2 rounded hover:bg-gray-50">Gallery</Link>
              <Link href="/blog" className="block px-2 py-2 rounded hover:bg-gray-50">Blog</Link>
              <div className="pt-2 border-t mt-2">
                {userEmail ? (
                  <>
                    <div className="px-2 py-2 text-sm text-gray-600">{userEmail}</div>
                    <Link href="/dashboard" className="block px-2 py-2 rounded hover:bg-gray-50">Dashboard</Link>
                    <Link href="/profile" className="block px-2 py-2 rounded hover:bg-gray-50">My Profile</Link>
                    {hasAdminAccess && (
                      <>
                        <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase">Admin</div>
                        {adminMenuItems.map((item) => (
                          <Link key={item.href} href={item.href} className="block px-2 py-2 rounded hover:bg-gray-50">
                            {item.label}
                          </Link>
                        ))}
                      </>
                    )}
                    <button onClick={handleSignOut} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Logout</button>
                  </>
                ) : (
                  <Link href="/login" className="block px-2 py-2 rounded bg-primary-600 text-white text-center font-semibold">Login</Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

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
            <div className="space-y-12">
              {/* Group executive members by position */}
              {positions.map((position) => {
                const membersInPosition = executiveMembers
                  .filter(m => m.position_type_id === position.id)
                  .sort((a, b) => a.display_order - b.display_order)

                if (membersInPosition.length === 0) return null

                return (
                  <div key={position.id}>
                    <h3 className="text-xl font-semibold text-primary-700 mb-6 flex items-center gap-2">
                      <Award className="h-5 w-5" /> {position.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {membersInPosition.map((member) => (
                        <MemberCard key={member.id} member={member} positions={positions} />
                      ))}
                    </div>
                  </div>
                )
              })}
              
              {/* Members without position (General Members) */}
              {executiveMembers.filter(m => !m.position_type_id).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" /> Other Executive Members
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {executiveMembers
                      .filter(m => !m.position_type_id)
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((member) => (
                        <MemberCard key={member.id} member={member} positions={positions} />
                      ))}
                  </div>
                </div>
              )}
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
                <MemberCard key={member.id} member={member} positions={positions} />
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

// Helper function to format name with professional title
const formatNameWithTitle = (fullName: string, professionalTitle?: string | null): string => {
  if (professionalTitle) {
    return `${professionalTitle} ${fullName}`
  }
  return fullName
}

function MemberCard({ member, positions }: { member: CommitteeMemberWithProfile, positions?: CommitteePosition[] }) {
  // Get position name - first try from member.position_name, then from positions array if position_type_id exists
  const getPositionName = () => {
    if (member.position_name) {
      return member.position_name
    }
    // Fallback: if position_name is missing but position_type_id exists, look it up in positions array
    if (member.position_type_id && positions) {
      const position = positions.find(p => p.id === member.position_type_id)
      return position?.name || null
    }
    return null
  }

  const positionName = getPositionName()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        {/* Photo */}
        <div className="mb-4">
          {member.profile.avatar_url ? (
            <Image
              src={member.profile.avatar_url}
              alt={formatNameWithTitle(member.profile.full_name, member.profile.professional_title)}
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
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {formatNameWithTitle(member.profile.full_name, member.profile.professional_title)}
        </h3>
        {positionName && (
          <p className="text-primary-600 font-medium mb-3">{positionName}</p>
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
      </div>
    </div>
  )
}

