'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Filter, MapPin, Briefcase, GraduationCap, Mail, Linkedin, Globe, User } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  batch_year: number
  profession: string
  company: string
  location: string
  bio: string
  avatar_url: string
  linkedin_url: string
  website_url: string
  created_at: string
  updated_at: string
}

export default function DirectoryPage() {
  const [alumni, setAlumni] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBatch, setFilterBatch] = useState('All')
  const [filterProfession, setFilterProfession] = useState('All')

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/directory')
      
      if (response.ok) {
        const { users } = await response.json()
        setAlumni(users || [])
      } else {
        console.error('Failed to fetch alumni')
      }
    } catch (error) {
      console.error('Error fetching alumni:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate batch decades dynamically
  const batchDecades = ['All', ...Array.from(new Set(alumni.map(u => Math.floor(u.batch_year / 10) * 10 + 's'))).sort()]
  
  // Generate professions dynamically
  const allProfessions = ['All', ...Array.from(new Set(alumni.map(u => u.profession).filter(Boolean))).sort()]

  // Filter alumni based on search and filters
  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBatch = filterBatch === 'All' || 
                        (filterBatch === '1980s' && person.batch_year >= 1980 && person.batch_year < 1990) ||
                        (filterBatch === '1990s' && person.batch_year >= 1990 && person.batch_year < 2000) ||
                        (filterBatch === '2000s' && person.batch_year >= 2000 && person.batch_year < 2010) ||
                        (filterBatch === '2010s' && person.batch_year >= 2010 && person.batch_year < 2020) ||
                        (filterBatch === '2020s' && person.batch_year >= 2020)
    
    const matchesProfession = filterProfession === 'All' || person.profession === filterProfession
    
    return matchesSearch && matchesBatch && matchesProfession
  })

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
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="input-field"
              >
                {batchDecades.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
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

        {/* Directory Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{filteredAlumni.length}</div>
            <div className="text-sm text-gray-600">Total Alumni</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{alumni.length > 0 ? 'Active' : '0'}</div>
            <div className="text-sm text-gray-600">Profiles</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{allProfessions.length - 1}</div>
            <div className="text-sm text-gray-600">Professions</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{batchDecades.length - 1}</div>
            <div className="text-sm text-gray-600">Batch Decades</div>
          </div>
        </div>

        {/* Alumni Grid */}
        {filteredAlumni.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-500">
              {searchTerm || filterBatch !== 'All' || filterProfession !== 'All' 
                ? 'Try adjusting your search or filters.' 
                : 'No alumni profiles have been added yet.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((person) => (
              <div key={person.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {person.avatar_url ? (
                      <img 
                        src={person.avatar_url} 
                        alt={person.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{person.full_name}</h3>
                    <p className="text-sm text-gray-600">Batch of {person.batch_year}</p>
                    <p className="text-sm font-medium text-primary-600">{person.profession || 'Not specified'}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {person.company && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="truncate">{person.company}</span>
                    </div>
                  )}
                  {person.location && (
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
                  <button className="btn-primary flex-1">Connect</button>
                  <button className="btn-secondary">View Profile</button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex space-x-3">
                    {person.email && (
                      <a href={`mailto:${person.email}`} className="text-gray-500 hover:text-primary-600">
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    {person.linkedin_url && (
                      <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {person.website_url && (
                      <a href={person.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600">
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Join Directory CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Join Our Directory</h2>
          <p className="text-primary-100 mb-6">
            Are you a BGHS alumnus? Join our directory to connect with fellow alumni and expand your network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Login to Add Profile
            </Link>
            <button className="border border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Contact Admin
            </button>
          </div>
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
