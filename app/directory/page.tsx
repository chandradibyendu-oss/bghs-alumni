'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Search, Filter, MapPin, Briefcase, GraduationCap, Mail, Linkedin, Globe, User } from 'lucide-react'

interface UserProfile {
  id: string
  email?: string
  full_name: string
  batch_year: number
  year_of_leaving: number
  last_class: number
  profession?: string
  company?: string
  location?: string
  bio?: string
  avatar_url?: string
  linkedin_url?: string
  website_url?: string
  phone?: string
  created_at: string
  updated_at?: string
  professional_title_id?: number
  professional_title?: string
  professional_title_category?: string
  is_deceased?: boolean
  deceased_year?: number | null
}

interface ViewerPermissions {
  can_view_full_directory: boolean
  is_authenticated: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface DirectoryStats {
  totalAlumni: number
  totalProfessions: number
  totalYearDecades: number
  totalClasses: number
  professions: string[]
  yearDecades: string[]
  classes: number[]
}

const anonymizeName = (fullName: string): string => {
  if (!fullName) return 'Alumni Member'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return `${parts[0].slice(0, 1)}. Alumni`
  const first = parts[0]
  const lastInitial = parts[parts.length - 1].slice(0, 1)
  return `${first} ${lastInitial}.`
}

// Helper function to format name with professional title (from database)
const formatNameWithTitle = (person: UserProfile, isAuthenticated: boolean) => {
  if (!isAuthenticated) {
    return anonymizeName(person.full_name)
  }
  
  // Display professional title from database before the name
  if (person.professional_title) {
    return `${person.professional_title} ${person.full_name}`
  }
  
  return person.full_name
}

export default function DirectoryPage() {
  const [alumni, setAlumni] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('All')
  const [filterClass, setFilterClass] = useState('All')
  const [filterProfession, setFilterProfession] = useState('All')
  const [isAuthed, setIsAuthed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [viewerPermissions, setViewerPermissions] = useState<ViewerPermissions>({
    can_view_full_directory: false,
    is_authenticated: false
  })
  const [stats, setStats] = useState<DirectoryStats>({
    totalAlumni: 0,
    totalProfessions: 0,
    totalYearDecades: 0,
    totalClasses: 0,
    professions: [],
    yearDecades: [],
    classes: []
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load stats and initial data on mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthed(!!user)
      await loadStats()
      await loadPage(1, '', 'All', 'All', 'All')
      setLoading(false)
    }
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load data when filters or search change (skip initial mount)
  useEffect(() => {
    // Skip if still loading initial data
    if (loading) return
    
    setCurrentPage(1) // Reset to first page when filters change
    loadPage(1, debouncedSearchTerm, filterYear, filterClass, filterProfession)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, filterYear, filterClass, filterProfession])

  useEffect(() => {
    if (currentPage > 1 && !loading) {
      loadPage(currentPage, debouncedSearchTerm, filterYear, filterClass, filterProfession)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/directory/stats', {
        method: 'GET',
        cache: 'no-store'
      })
      
      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadPage = async (
    page: number, 
    search: string = '', 
    year: string = 'All', 
    classFilter: string = 'All', 
    profession: string = 'All'
  ) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setSearchLoading(true)
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthed(!!user)
      
      // Include access token for authorized users so the API can return full details
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (search.trim()) {
        params.append('search', search.trim())
      }
      if (year && year !== 'All') {
        params.append('year', year)
      }
      if (classFilter && classFilter !== 'All') {
        params.append('class', classFilter)
      }
      if (profession && profession !== 'All') {
        params.append('profession', profession)
      }
      
      const response = await fetch(`/api/directory-fallback?${params.toString()}`, {
        method: 'GET',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : undefined,
        cache: 'no-store'
      })
      
      if (response.ok) {
        const { users, pagination: paginationData, viewer_permissions } = await response.json()
        
        if (page === 1) {
          // First page - replace data
          setAlumni(users || [])
        } else {
          // Subsequent pages - append data
          setAlumni(prev => [...prev, ...(users || [])])
        }
        
        setPagination(paginationData || {
          page: 1,
          limit: 12,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        })
        
        setViewerPermissions(viewer_permissions || {
          can_view_full_directory: false,
          is_authenticated: false
        })
      }
    } catch (error) {
      console.error('Error fetching alumni:', error)
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  // Generate filter options from stats
  const yearDecades = ['All', ...stats.yearDecades]
  
  const generateClassOptions = () => {
    const allClasses = ['All']
    const existingClasses = stats.classes
    
    // Add specific class options based on existing data
    if (existingClasses.includes(12)) allClasses.push('Class 12')
    if (existingClasses.includes(10)) allClasses.push('Class 10')
    
    // Add range options if classes in those ranges exist
    const midSchoolClasses = existingClasses.filter(c => c >= 6 && c <= 9)
    if (midSchoolClasses.length > 0) allClasses.push('Class 6-9')
    
    const primaryClasses = existingClasses.filter(c => c >= 1 && c <= 5)
    if (primaryClasses.length > 0) allClasses.push('Class 1-5')
    
    return allClasses
  }
  
  const classOptions = generateClassOptions()
  const allProfessions = ['All', ...stats.professions]

  // No client-side filtering - all filtering is done server-side
  const filteredAlumni = alumni

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alumni directory...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Alumni Directory</h1>
              <p className="text-gray-600">Connect with fellow alumni and expand your professional network</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, profession, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="input-field"
              >
                {yearDecades.map(year => (
                  <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                ))}
              </select>
              <select 
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="input-field"
              >
                {classOptions.map(classOption => (
                  <option key={classOption} value={classOption}>{classOption === 'All' ? 'All Classes' : classOption}</option>
                ))}
              </select>
              <select 
                value={filterProfession}
                onChange={(e) => setFilterProfession(e.target.value)}
                className="input-field"
              >
                {allProfessions.map(profession => (
                  <option key={profession} value={profession}>{profession}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Public User Notice */}
        {!isAuthed && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  🔍 Sample Profiles Preview
                </h3>
                <p className="text-blue-800 mb-4">
                  The profiles shown below are <strong>sample examples</strong> to demonstrate our alumni directory features. 
                  To find and connect with <strong>real BGHS alumni members</strong>, batchmates, and classmates, 
                  please register for full access to our exclusive alumni network.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    href="/register" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Join Alumni Network
                  </Link>
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  >
                    Already a Member? Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Directory Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {statsLoading ? '...' : (searchTerm || filterYear !== 'All' || filterClass !== 'All' || filterProfession !== 'All' ? pagination.totalCount : stats.totalAlumni)}
            </div>
            <div className="text-sm text-gray-600">Total Alumni</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {statsLoading ? '...' : stats.totalAlumni}
            </div>
            <div className="text-sm text-gray-600">Active Profiles</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {statsLoading ? '...' : stats.totalProfessions}
            </div>
            <div className="text-sm text-gray-600">Professions</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {statsLoading ? '...' : stats.totalYearDecades}
            </div>
            <div className="text-sm text-gray-600">Year Decades</div>
          </div>
        </div>

        {/* Alumni Grid */}
        {filteredAlumni.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-500">
              {searchTerm || filterYear !== 'All' || filterClass !== 'All' || filterProfession !== 'All' 
                ? 'Try adjusting your search or filters.' 
                : 'No alumni profiles have been added yet.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Sample Profiles Header for Public Users */}
            {!isAuthed && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-sm font-medium">
                  <span className="mr-2">📋</span>
                  Sample Profiles - Register to see real alumni
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isAuthed ? filteredAlumni : filteredAlumni.slice(0, 6)).map((person) => (
              <div key={person.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 relative ${person.is_deceased ? 'ring-2 ring-gray-400' : ''}`}>
                    {person.avatar_url ? (
                      <img 
                        src={person.avatar_url} 
                        alt={person.full_name}
                        className={`w-16 h-16 rounded-full object-cover ${person.is_deceased ? 'opacity-70' : ''}`}
                      />
                    ) : (
                      <User className={`h-8 w-8 ${person.is_deceased ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                    {person.is_deceased && (
                      <div className="absolute -top-1 -right-1 bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        🕯️
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{formatNameWithTitle(person, isAuthed)}</h3>
                    <p className="text-sm text-gray-600">Left in {person.year_of_leaving} (Class {person.last_class})</p>
                    <p className="text-sm font-medium text-primary-600">
                      {isAuthed ? (
                        <>
                          {person.professional_title_category && (
                            <span className="text-xs text-gray-500 mr-1">({person.professional_title_category})</span>
                          )}
                          {person.profession || 'Not specified'}
                        </>
                      ) : 'BGHS Alumni'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {isAuthed && person.company && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="truncate">{person.company}</span>
                    </div>
                  )}
                  {isAuthed && person.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{person.location}</span>
                    </div>
                  )}
                </div>

                {person.bio && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Bio:</h4>
                    <p className="text-xs text-gray-600 line-clamp-3">{person.bio}</p>
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  {viewerPermissions.is_authenticated ? (
                    <>
                      {/* Connect Button - Show if user has contact info */}
                      {(person.email || person.linkedin_url) && (
                        <button className="btn-primary flex-1">
                          {person.email ? 'Email' : 'Connect'}
                        </button>
                      )}
                      {/* View Profile Button - Always show for authenticated users */}
                      <Link 
                        href={`/profile/${person.id}`}
                        className="btn-secondary"
                      >
                        View Profile
                      </Link>
                    </>
                  ) : (
                    <Link href="/login" className="btn-primary w-full text-center">
                      Login to View Profile
                    </Link>
                  )}
                </div>

                {viewerPermissions.is_authenticated && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex space-x-3">
                      {person.email && (
                        <a href={`mailto:${person.email}`} className="text-gray-500 hover:text-primary-600" title="Send Email">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {person.linkedin_url && (
                        <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600" title="LinkedIn Profile">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {person.website_url && (
                        <a href={person.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600" title="Personal Website">
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {pagination.hasNextPage && (
            <div className="text-center mt-8">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={searchLoading}
                className="btn-secondary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  `Load More Alumni (${pagination.totalCount - alumni.length} remaining)`
                )}
              </button>
            </div>
          )}
          
          {/* Pagination Info */}
          {pagination.totalCount > 0 && (
            <div className="text-center mt-4 text-gray-600">
              Showing {alumni.length} of {pagination.totalCount} alumni
              {(searchTerm || filterYear !== 'All' || filterClass !== 'All' || filterProfession !== 'All') && (
                <span className="ml-2 text-sm text-gray-500">
                  (filtered results)
                </span>
              )}
            </div>
          )}
          </div>
        )}

        {/* Join / Sign-in CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
          {viewerPermissions.is_authenticated ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Connect with Alumni</h2>
              <p className="text-primary-100 mb-6">
                {viewerPermissions.can_view_full_directory 
                  ? "View full profiles and connect with your fellow alumni."
                  : "Your account is pending approval. Once approved, you'll have full access to connect with alumni."
                }
              </p>
              {viewerPermissions.can_view_full_directory && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    Go to Dashboard
                  </Link>
                  <Link href="/profile" className="border border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    Edit Your Profile
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">🎓 Find Your BGHS Batchmates & Alumni</h2>
              <p className="text-primary-100 mb-6">
                The profiles above are sample examples. Join our exclusive alumni network to discover and connect with 
                <strong> real BGHS graduates</strong>, find your batchmates, and expand your professional network!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Join Alumni Network
                </Link>
                <Link href="/login" className="border border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
                  <span className="mr-2">👋</span>
                  Already a Member? Login
                </Link>
              </div>
              <div className="mt-6 text-primary-200 text-sm">
                ✨ Connect with classmates • 🤝 Professional networking • 📈 Career opportunities
              </div>
            </>
          )}
        </div>

        {/* Networking Tips */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Networking Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Be Professional</h3>
              <p className="text-gray-600 text-sm">
                When reaching out to fellow alumni, maintain a professional tone and clearly state your purpose.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Offer Value</h3>
              <p className="text-gray-600 text-sm">
                Think about how you can help others in your network, not just what you can get from them.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Connected</h3>
              <p className="text-gray-600 text-sm">
                Regularly engage with your network through events, social media, and meaningful conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
