'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Upload, FileSpreadsheet, Users, CheckCircle, AlertCircle, X, Download, RefreshCw, Trash2 } from 'lucide-react'

interface MigrationResult {
  success: boolean
  processed: number
  failed: number
  errors: string[]
  details: {
    email: string
    status: 'success' | 'failed'
    error?: string
  }[]
}

export default function AlumniMigrationPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please select a CSV or Excel file (.csv, .xls, .xlsx)')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/alumni-migration/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `Old Registration Number,Registration Number,Email,Phone,Title Prefix,First Name,Middle Name,Last Name,Last Class,Year of Leaving,Start Class,Start Year,Batch Year,Profession,Company,Location,Bio,LinkedIn URL,Website URL,Role,Is Deceased,Deceased Year,Notes
OLD-001,BGHSA-2025-00031,john.doe@example.com,+919876543210,Dr.,John,Kumar,Doe,12,2005,6,1998,2005,Software Engineer,Tech Corp,Bangalore,Alumni member,https://linkedin.com/in/johndoe,https://johndoe.com,alumni_member,false,,Verified alumni
OLD-002,BGHSA-2025-00032,jane.smith@example.com,+919876543211,Prof.,Jane,,Smith,10,2003,8,1995,2003,Teacher,Education Corp,Kolkata,Alumni member,https://linkedin.com/in/janesmith,https://janesmith.com,alumni_member,true,2022,In memoriam`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alumni-migration-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Alumni Data Migration</h1>
                <p className="text-gray-600 mt-1">Upload Excel/CSV file to migrate alumni records to the system. Supports registration numbers (optional), title prefixes, and deceased status.</p>
              </div>
              <Link
                href="/admin/alumni-imports"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Manage Imports
              </Link>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Download Template</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Download the Excel template with required fields and formatting guidelines
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* Field Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">📋 Available Fields</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Old Registration Number:</strong> Optional - Reference field to map old registration IDs with new system registration IDs. This is stored for mapping purposes only.</p>
                <p><strong>Registration Number:</strong> Optional - If your CSV has a "Registration Number" column with values (e.g., BGHSA-2025-00031), those will be used as the registration_id. If not provided or empty, system will auto-generate one.</p>
                <p><strong>Title Prefix:</strong> Add professional titles like Dr., Prof., Adv., Shri, Smt., Mr., Ms., etc.</p>
                <p><strong>Is Deceased:</strong> Mark as "true", "1", or "yes" for deceased alumni members</p>
                <p><strong>Deceased Year:</strong> Optional year when the alumni member passed away</p>
                <p className="text-xs text-green-600 mt-2">
                  💡 <strong>Note:</strong> Registration numbers must be unique. If a registration number already exists, the record will be skipped with an error message.
                  Deceased members will automatically display memorial indicators (🕯️) in the alumni directory.
                </p>
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Alumni Data File
              </label>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  {file ? file.name : 'Drag and drop your file here, or click to browse'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports CSV, XLS, XLSX files up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Choose File
                </button>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            {file && !result && (
              <div className="flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload and Process
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Migration Results</h3>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Upload Another File
                  </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Successful</p>
                        <p className="text-2xl font-bold text-green-600">{result.processed}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Total</p>
                        <p className="text-2xl font-bold text-blue-600">{result.processed + result.failed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Details */}
                {result.failed > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-900 mb-3">Failed Records</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.details
                        .filter(detail => detail.status === 'failed')
                        .map((detail, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                            <span className="text-sm text-gray-700">{detail.email}</span>
                            <span className="text-xs text-red-600">{detail.error}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Success Details */}
                {result.processed > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-3">Successful Records</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.details
                        .filter(detail => detail.status === 'success')
                        .map((detail, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                            <span className="text-sm text-gray-700">{detail.email}</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
