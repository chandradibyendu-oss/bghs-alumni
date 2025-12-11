'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Download,
  Eye,
  Upload,
  X,
  CheckCircle,
  FileText,
  ArrowLeft
} from 'lucide-react'

interface SouvenirBook {
  id: string
  year: number
  title?: string | null
  description?: string | null
  pdf_url: string
  cover_image_url?: string | null
  file_size?: number | null
  is_public: boolean
  allow_download: boolean
  created_at: string
  updated_at: string
}

export default function AdminSouvenirsPage() {
  const [souvenirBooks, setSouvenirBooks] = useState<SouvenirBook[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [canManage, setCanManage] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    year: new Date().getFullYear().toString(),
    title: '',
    description: '',
    is_public: true,
    allow_download: true
  })

  useEffect(() => {
    Promise.all([verifyAccess(), fetchSouvenirBooks()])
  }, [])

  const verifyAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { 
      router.push('/login')
      return 
    }
    const perms = await getUserPermissions(user.id)
    const hasAccess = hasPermission(perms, 'can_manage_content') || 
                     hasPermission(perms, 'can_access_admin')
    
    if (!hasAccess) {
      alert('You do not have permission to manage souvenir books.')
      router.push('/dashboard')
      return
    }

    setCanManage(true)
  }

  const fetchSouvenirBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/souvenirs')
      const result = await response.json()
      
      if (result.success) {
        setSouvenirBooks(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching souvenir books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadForm.file) {
      alert('Please select a PDF file')
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('year', uploadForm.year)
      if (uploadForm.title) formData.append('title', uploadForm.title)
      if (uploadForm.description) formData.append('description', uploadForm.description)
      formData.append('is_public', uploadForm.is_public.toString())
      formData.append('allow_download', uploadForm.allow_download.toString())

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login to upload')
        return
      }

      const response = await fetch('/api/souvenirs/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        alert('Souvenir book uploaded successfully!')
        setUploadModalOpen(false)
        setUploadForm({
          file: null,
          year: new Date().getFullYear().toString(),
          title: '',
          description: '',
          is_public: true,
          allow_download: true
        })
        fetchSouvenirBooks()
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload souvenir book')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this souvenir book?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('souvenir_books')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('Souvenir book deleted successfully')
      fetchSouvenirBooks()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete souvenir book')
    }
  }

  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const filteredBooks = souvenirBooks.filter(book => {
    const searchLower = search.toLowerCase()
    return (
      book.year.toString().includes(searchLower) ||
      (book.title && book.title.toLowerCase().includes(searchLower)) ||
      (book.description && book.description.toLowerCase().includes(searchLower))
    )
  })

  if (!canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Souvenir Books</h1>
              <p className="text-gray-600 mt-1">Manage annual souvenir book publications</p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Upload New Book
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by year, title, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Cover */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={`Souvenir ${book.year}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <BookOpen className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                          <div className="text-4xl font-bold text-primary-700">{book.year}</div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {book.title || `Souvenir ${book.year}`}
                        </h3>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      {book.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{formatFileSize(book.file_size)}</span>
                        <div className="flex gap-2">
                          {book.is_public ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Public</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Members Only</span>
                          )}
                          {book.allow_download && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Downloadable</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <a
                          href={book.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 btn-secondary text-center flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </a>
                        <a
                          href={book.pdf_url}
                          download
                          className="flex-1 btn-secondary text-center flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No souvenir books found</p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="mt-4 btn-primary"
                >
                  Upload First Book
                </button>
              </div>
            )}
          </>
        )}

        {/* Upload Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Upload Souvenir Book</h2>
                  <button
                    onClick={() => setUploadModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PDF File <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 100 * 1024 * 1024) {
                            alert('File size must be less than 100MB')
                            return
                          }
                          setUploadForm({ ...uploadForm, file })
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">Max file size: 100MB</p>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      placeholder="e.g., Annual Souvenir 2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of the souvenir book..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={uploadForm.is_public}
                        onChange={(e) => setUploadForm({ ...uploadForm, is_public: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Public (visible to everyone)</span>
                    </label>
                  </div>

                  {/* Download */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={uploadForm.allow_download}
                        onChange={(e) => setUploadForm({ ...uploadForm, allow_download: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Allow download</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(false)}
                      className="flex-1 btn-secondary"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

