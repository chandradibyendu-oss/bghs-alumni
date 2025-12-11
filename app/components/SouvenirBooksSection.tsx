'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Download, Eye, Calendar, ArrowLeft, X } from 'lucide-react'
import Image from 'next/image'

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
}

interface SouvenirBooksSectionProps {
  limit?: number
  showHeader?: boolean
}

export default function SouvenirBooksSection({ limit, showHeader = true }: SouvenirBooksSectionProps) {
  const [souvenirBooks, setSouvenirBooks] = useState<SouvenirBook[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<SouvenirBook | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSouvenirBooks()
  }, [])

  const fetchSouvenirBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/souvenirs')
      const result = await response.json()
      
      if (result.success) {
        const books = limit ? result.data.slice(0, limit) : result.data
        setSouvenirBooks(books)
      }
    } catch (error) {
      console.error('Error fetching souvenir books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBook = (book: SouvenirBook) => {
    setSelectedBook(book)
    setViewerOpen(true)
  }

  const handleDownload = (book: SouvenirBook, e: React.MouseEvent) => {
    e.stopPropagation()
    if (book.allow_download) {
      window.open(book.pdf_url, '_blank')
    }
  }

  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Souvenir Books</h2>
              <p className="text-gray-600">Browse our annual souvenir publications</p>
            </div>
          )}
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (souvenirBooks.length === 0) {
    return null // Don't show section if no books
  }

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Souvenir Books</h2>
              <p className="text-gray-600">Browse our annual souvenir publications</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {souvenirBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleViewBook(book)}
              >
                {/* Cover Image or Placeholder */}
                <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative overflow-hidden">
                  {book.cover_image_url && !imageErrors.has(book.id) ? (
                    <img
                      src={book.cover_image_url}
                      alt={`Souvenir Book ${book.year}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => {
                        // Mark this image as failed to load
                        setImageErrors(prev => new Set(prev).add(book.id))
                      }}
                    />
                  ) : (
                    <div className="text-center p-6 absolute inset-0 flex flex-col items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <div className="text-4xl font-bold text-primary-700">{book.year}</div>
                    </div>
                  )}
                </div>

                {/* Book Info */}
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

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(book.file_size)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleViewBook(book)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="View PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {book.allow_download && (
                        <button
                          onClick={(e) => handleDownload(book, e)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {viewerOpen && selectedBook && (
        <PDFViewerModal
          book={selectedBook}
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false)
            setSelectedBook(null)
          }}
        />
      )}
    </>
  )
}

// PDF Viewer Modal Component
interface PDFViewerModalProps {
  book: SouvenirBook
  isOpen: boolean
  onClose: () => void
}

function PDFViewerModal({ book, isOpen, onClose }: PDFViewerModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
              title="Close"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {book.title || `Souvenir ${book.year}`}
              </h3>
              <p className="text-sm text-gray-500">Year: {book.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {book.allow_download && (
              <a
                href={book.pdf_url}
                download
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${book.pdf_url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={`Souvenir Book ${book.year}`}
          />
        </div>
      </div>
    </div>
  )
}

