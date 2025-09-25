'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CleanupResults {
  orphanedPdfs: number
  orphanedEvidence: number
  deletedPdfs: number
  deletedEvidence: number
  errors: string[]
}

interface StorageStats {
  totalPdfs: number
  totalEvidenceFiles: number
  totalSize: number
}

export default function CleanupPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CleanupResults | null>(null)
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getAuthHeaders = () => {
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  const scanOrphanedFiles = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/cleanup-r2', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cleanupType: 'scan' })
      })

      const data = await response.json()
      if (data.success) {
        setResults(data.results)
        setMessage(`Found ${data.results.orphanedPdfs} orphaned PDFs and ${data.results.orphanedEvidence} orphaned evidence files`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const cleanupOrphanedFiles = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/cleanup-r2', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cleanupType: 'cleanup' })
      })

      const data = await response.json()
      if (data.success) {
        setResults(data.results)
        setMessage(`Cleanup completed: Deleted ${data.results.deletedPdfs} PDFs and ${data.results.deletedEvidence} evidence files`)
        if (data.results.errors.length > 0) {
          setMessage(prev => prev + ` (${data.results.errors.length} errors)`)
        }
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getStorageStats = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/cleanup-r2', {
        method: 'GET',
        headers: getAuthHeaders()
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
        setMessage('Storage statistics loaded')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the cleanup utility.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">R2 Storage Cleanup Utility</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Storage Statistics</h2>
            <button
              onClick={getStorageStats}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Storage Stats'}
            </button>
            
            {stats && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-700">Total PDFs</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPdfs}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-700">Evidence Files</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.totalEvidenceFiles}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-700">Total Size</h3>
                  <p className="text-2xl font-bold text-purple-600">{formatBytes(stats.totalSize)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Orphaned Files Cleanup</h2>
            <p className="text-gray-600 mb-4">
              Orphaned files are R2 storage objects that belong to deleted users but weren't cleaned up.
            </p>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={scanOrphanedFiles}
                disabled={loading}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? 'Scanning...' : 'Scan for Orphaned Files'}
              </button>
              
              <button
                onClick={cleanupOrphanedFiles}
                disabled={loading || !results}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Cleaning...' : 'Clean Up Orphaned Files'}
              </button>
            </div>

            {results && (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-700 mb-2">Scan Results</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Orphaned PDFs:</p>
                    <p className="text-lg font-semibold text-yellow-600">{results.orphanedPdfs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Orphaned Evidence:</p>
                    <p className="text-lg font-semibold text-yellow-600">{results.orphanedEvidence}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deleted PDFs:</p>
                    <p className="text-lg font-semibold text-red-600">{results.deletedPdfs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deleted Evidence:</p>
                    <p className="text-lg font-semibold text-red-600">{results.deletedEvidence}</p>
                  </div>
                </div>
                
                {results.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded ${
              message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">How to Access This Utility</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>URL:</strong> <code>/admin/cleanup</code></p>
              <p><strong>API Endpoint:</strong> <code>POST /api/admin/cleanup-r2</code></p>
              <p><strong>Required:</strong> Admin authentication (super_admin or content_moderator role)</p>
              <p><strong>Usage:</strong> Scan first to see orphaned files, then cleanup to delete them</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
