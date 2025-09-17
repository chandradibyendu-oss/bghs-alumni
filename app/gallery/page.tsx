'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { Upload, Filter, Grid, List, Search, Plus, Eye, Download, Trash2, Edit, Check, X, ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PhotoCategory {
  id: string
  name: string
  description: string
  display_order: number
}

interface GalleryPhoto {
  id: string
  title: string
  description: string
  category_id: string
  uploaded_by: string
  file_url: string
  thumbnail_url: string
  file_size: number
  width: number
  height: number
  is_featured: boolean
  is_approved: boolean
  view_count: number
  created_at: string
  updated_at: string
  photo_categories?: PhotoCategory
  profiles?: {
    full_name: string
  }
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [categories, setCategories] = useState<PhotoCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [canUpload, setCanUpload] = useState(false)
  const [canManage, setCanManage] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePhotos, setHasMorePhotos] = useState(true)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const PHOTOS_PER_PAGE = 24 // Load 24 photos at a time

  useEffect(() => {
    checkPermissions()
    fetchCategories()
    fetchPhotos()
  }, [])

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const permissions = await getUserPermissions(user.id)
        setCanUpload(hasPermission(permissions, 'can_upload_media') || hasPermission(permissions, 'can_edit_public_content') || hasPermission(permissions, 'can_access_admin'))
        setCanManage(hasPermission(permissions, 'can_edit_public_content') || hasPermission(permissions, 'can_access_admin'))
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_categories')
        .select('*')
        .order('display_order')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPhotos = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // First get the total count
      let countQuery = supabase
        .from('gallery_photos')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)

      if (selectedCategory !== 'all') {
        countQuery = countQuery.eq('category_id', selectedCategory)
      }

      if (searchTerm) {
        countQuery = countQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      const { count: totalCount } = await countQuery

      // Then get the actual data
      let query = supabase
        .from('gallery_photos')
        .select(`
          *,
          photo_categories(name),
          profiles(full_name)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * PHOTOS_PER_PAGE, page * PHOTOS_PER_PAGE - 1)

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      
      if (append) {
        setPhotos(prev => [...prev, ...(data || [])])
      } else {
        setPhotos(data || [])
      }
      
      setTotalPhotos(totalCount || 0)
      setHasMorePhotos((data?.length || 0) === PHOTOS_PER_PAGE)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePhotos = async () => {
    if (!loadingMore && hasMorePhotos) {
      await fetchPhotos(currentPage + 1, true)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    setHasMorePhotos(true)
    fetchPhotos(1, false)
  }, [selectedCategory, searchTerm])

  const filteredPhotos = photos.filter(photo => {
    if (searchTerm) {
      return photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             photo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  const handlePhotoClick = (photo: GalleryPhoto) => {
    const index = filteredPhotos.findIndex(p => p.id === photo.id)
    setCurrentPhotoIndex(index)
    setSelectedPhoto(photo)
    resetView()
    // Increment view count
    incrementViewCount(photo.id)
  }

  const incrementViewCount = async (photoId: string) => {
    try {
      const photo = photos.find(p => p.id === photoId)
      const newCount = (photo?.view_count || 0) + 1
      await supabase
        .from('gallery_photos')
        .update({ view_count: newCount })
        .eq('id', photoId)
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const resetView = useCallback(() => {
    setZoom(1)
    setRotation(0)
  }, [])

  // Ensure 100% means "fit to screen" by computing a base scale
  const computeBaseScale = useCallback(() => {
    if (!selectedPhoto || !containerRef.current) {
      setBaseScale(1)
      return
    }

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    const containerWidth = Math.max(0, rect.width - 32) // minus padding
    const containerHeight = Math.max(0, rect.height - 32)

    // Account for rotation: swap width/height for 90/270 degrees
    const isRotated = Math.abs(rotation % 180) === 90
    const imageNaturalWidth = selectedPhoto.width || 1920
    const imageNaturalHeight = selectedPhoto.height || 1080
    const imgW = isRotated ? imageNaturalHeight : imageNaturalWidth
    const imgH = isRotated ? imageNaturalWidth : imageNaturalHeight

    if (imgW <= 0 || imgH <= 0 || containerWidth <= 0 || containerHeight <= 0) {
      setBaseScale(1)
      return
    }

    const scaleToFit = Math.min(containerWidth / imgW, containerHeight / imgH)
    // Add a small margin so it never touches edges
    setBaseScale(Math.min(scaleToFit * 0.98, 1))
  }, [selectedPhoto, rotation])

  useEffect(() => {
    computeBaseScale()
  }, [computeBaseScale])

  useEffect(() => {
    const onResize = () => computeBaseScale()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [computeBaseScale])

  const navigatePhoto = useCallback((direction: 'prev' | 'next') => {
    if (filteredPhotos.length === 0) return
    
    let newIndex = currentPhotoIndex
    if (direction === 'prev') {
      newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : filteredPhotos.length - 1
    } else {
      newIndex = currentPhotoIndex < filteredPhotos.length - 1 ? currentPhotoIndex + 1 : 0
    }
    
    setCurrentPhotoIndex(newIndex)
    setSelectedPhoto(filteredPhotos[newIndex])
    resetView()
    incrementViewCount(filteredPhotos[newIndex].id)
  }, [currentPhotoIndex, filteredPhotos, resetView])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedPhoto) return
    
    switch (e.key) {
      case 'Escape':
        setSelectedPhoto(null)
        break
      case 'ArrowLeft':
        navigatePhoto('prev')
        break
      case 'ArrowRight':
        navigatePhoto('next')
        break
      case '+':
      case '=':
        setZoom(prev => Math.min(prev + 0.5, 3))
        break
      case '-':
        setZoom(prev => Math.max(prev - 0.5, 0.5))
        break
      case 'r':
        setRotation(prev => (prev + 90) % 360)
        break
    }
  }, [selectedPhoto, navigatePhoto])

  useEffect(() => {
    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedPhoto, handleKeyDown])

  const handleApprovePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('gallery_photos')
        .update({ is_approved: true })
        .eq('id', photoId)

      if (error) throw error
      fetchPhotos()
    } catch (error) {
      console.error('Error approving photo:', error)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error
      fetchPhotos()
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
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
              <h1 className="text-3xl font-bold text-gray-900">School Gallery</h1>
              <p className="text-gray-600">
                Memories from Barasat Peary Charan Sarkar Government High School
              </p>
            </div>
          </div>
          {canUpload && (
            <div className="mt-6">
              <Link
                href="/gallery/upload"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 inline-flex"
              >
                <Plus className="h-4 w-4" />
                Upload Photos
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Photos</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or photographer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="lg:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  title="List View"
                >
                  <List className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(selectedCategory !== 'all' || searchTerm) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Active filters:</span>
                {selectedCategory !== 'all' && (
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                    "{searchTerm}"
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSearchTerm('')
                  }}
                  className="text-primary-600 hover:text-primary-700 text-xs underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Photos Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No photos found</p>
            {canUpload && (
              <Link
                href="/gallery/upload"
                className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 inline-block"
              >
                Upload First Photo
              </Link>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              /* Google Photos Style Masonry Layout */
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-1 space-y-1">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] break-inside-avoid mb-1"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    {/* Dynamic Aspect Ratio Container */}
                    <div className="relative overflow-hidden">
                      <Image
                        src={photo.thumbnail_url || photo.file_url}
                        alt={photo.title}
                        width={photo.width || 400}
                        height={photo.height || 300}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white bg-opacity-90 rounded-full p-2">
                            <ZoomIn className="h-5 w-5 text-gray-800" />
                          </div>
                        </div>
                      </div>
                      
                      {/* View count badge */}
                      {(photo.view_count || 0) > 0 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{photo.view_count}</span>
                        </div>
                      )}
                      
                      {/* Featured badge */}
                      {photo.is_featured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Minimalist Photo Info - Only show on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-medium text-sm mb-1 line-clamp-1">
                          {photo.title}
                        </h3>
                        {photo.description && (
                          <p className="text-xs text-white/80 line-clamp-2">
                            {photo.description}
                          </p>
                        )}
                        <div className="text-xs text-white/70 mt-1">
                          by {photo.profiles?.full_name || 'Anonymous'}
                        </div>
                      </div>
                      
                      {/* Admin controls - only show for admins */}
                      {canManage && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprovePhoto(photo.id)
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white p-1 rounded"
                            title="Approve"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePhoto(photo.id)
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex p-4"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="w-32 h-24 mr-4 flex-shrink-0 relative rounded-lg overflow-hidden">
                      <Image
                        src={photo.thumbnail_url || photo.file_url}
                        alt={photo.title}
                        fill
                        className="object-cover"
                      />
                      {photo.is_featured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{photo.title}</h3>
                      {photo.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{photo.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>by {photo.profiles?.full_name || 'Anonymous'}</span>
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          <span>{photo.view_count || 0}</span>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprovePhoto(photo.id)
                            }}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePhoto(photo.id)
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Load More Button */}
        {!loading && hasMorePhotos && photos.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMorePhotos}
              disabled={loadingMore}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading more photos...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Load More Photos
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Photos Count Display */}
        {!loading && photos.length > 0 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            {totalPhotos > 0 ? (
              <>
                Showing {photos.length} of {totalPhotos} photos
                {hasMorePhotos && (
                  <span className="ml-2 text-primary-600">
                    • Click "Load More" to see more
                  </span>
                )}
              </>
            ) : (
              `Showing ${photos.length} photos`
            )}
          </div>
        )}
      </div>

      {/* Enhanced Photo Modal - Google Photos Style */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black z-50 flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPhoto(null)
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">{selectedPhoto.title}</h2>
              <span className="text-sm text-gray-300">
                {currentPhotoIndex + 1} of {filteredPhotos.length}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigatePhoto('prev')}
                  className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
                  disabled={filteredPhotos.length <= 1}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => navigatePhoto('next')}
                  className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
                  disabled={filteredPhotos.length <= 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              
              {/* Zoom Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.5))}
                  className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
                  className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={resetView}
                  className="px-3 py-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all text-xs"
                  title="Reset zoom and rotation"
                >
                  Reset
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
                  title="Rotate 90°"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center overflow-hidden relative" style={{ minHeight: 0 }}>
            <div ref={containerRef} className="relative w-full h-full flex items-center justify-center p-4">
              <div className="relative flex items-center justify-center">
                <Image
                  src={selectedPhoto.file_url}
                  alt={selectedPhoto.title}
                  width={selectedPhoto.width || 1920}
                  height={selectedPhoto.height || 1080}
                  className="max-w-none max-h-none object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${baseScale * zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                  priority
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-black bg-opacity-50 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {selectedPhoto.description && (
                  <p className="text-gray-300 mb-2">{selectedPhoto.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Uploaded by {selectedPhoto.profiles?.full_name}</span>
                  <span>•</span>
                  <span>{selectedPhoto.view_count} views</span>
                  <span>•</span>
                  <span>{selectedPhoto.photo_categories?.name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-black bg-opacity-50 px-3 py-2 rounded">
            <div>← → Navigate • +/- Zoom • R Rotate • Esc Close</div>
          </div>
        </div>
      )}

    </div>
  )
}
