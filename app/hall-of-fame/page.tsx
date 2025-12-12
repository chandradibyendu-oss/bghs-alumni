'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Award, GraduationCap, ArrowLeft, Search, Calendar } from 'lucide-react'

interface NotableAlumnus {
  id: string
  name: string
  batch_year?: number | null
  achievement: string
  field?: string | null
  description?: string | null
  photo_url?: string | null
  display_order: number
}

export default function HallOfFamePage() {
  const [notableAlumni, setNotableAlumni] = useState<NotableAlumnus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterField, setFilterField] = useState<string>('')

  useEffect(() => {
    fetchNotableAlumni()
  }, [])

  const fetchNotableAlumni = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notable_alumni')
        .select('id, name, batch_year, achievement, field, description, photo_url, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setNotableAlumni(data || [])
    } catch (error) {
      console.error('Error fetching notable alumni:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique fields for filter
  const uniqueFields = Array.from(
    new Set(notableAlumni.map(a => a.field).filter((f): f is string => Boolean(f)))
  ).sort()

  // Filter alumni
  const filteredAlumni = notableAlumni.filter(alumnus => {
    const searchLower = search.toLowerCase()
    const matchesSearch = 
      alumnus.name.toLowerCase().includes(searchLower) ||
      alumnus.achievement.toLowerCase().includes(searchLower) ||
      (alumnus.field && alumnus.field.toLowerCase().includes(searchLower)) ||
      (alumnus.description && alumnus.description.toLowerCase().includes(searchLower)) ||
      (alumnus.batch_year && alumnus.batch_year.toString().includes(searchLower))
    
    const matchesField = !filterField || alumnus.field === filterField
    
    return matchesSearch && matchesField
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to About
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hall of Fame</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Celebrating our distinguished alumni who have made significant contributions to society
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, achievement, field, or batch year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Field Filter */}
            {uniqueFields.length > 0 && (
              <div className="md:w-64">
                <select
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Fields</option>
                  {uniqueFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAlumni.length} of {notableAlumni.length} notable alumni
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredAlumni.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlumni.map((alumnus) => (
              <div
                key={alumnus.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Profile Photo */}
                <div className="relative h-64 bg-gradient-to-br from-primary-100 to-primary-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {alumnus.photo_url ? (
                        <img
                          src={alumnus.photo_url}
                          alt={alumnus.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full bg-primary-100 flex items-center justify-center"><svg class="h-16 w-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg></div>'
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                          <GraduationCap className="h-16 w-16 text-primary-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Achievement Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-semibold text-primary-600">★</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{alumnus.name}</h3>
                  <p className="text-sm text-gray-600 font-semibold mb-2">{alumnus.achievement}</p>
                  {alumnus.field && (
                    <p className="text-xs text-gray-500 mb-2">{alumnus.field}</p>
                  )}
                  {alumnus.batch_year && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>Batch: {alumnus.batch_year}</span>
                    </div>
                  )}
                  {alumnus.description && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {alumnus.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {search || filterField ? 'No notable alumni found matching your filters' : 'No notable alumni to display at this time.'}
            </p>
            {(search || filterField) && (
              <button
                onClick={() => {
                  setSearch('')
                  setFilterField('')
                }}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

