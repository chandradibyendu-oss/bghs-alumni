'use client'

import { useState } from 'react'
import { Upload, FileImage, Download, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface ExtractionResult {
  success: boolean
  extractedText?: string
  alumniRecords?: any[]
  csvData?: string
  error?: string
}

export default function ImageExtractionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

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
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp']
    
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, BMP)')
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

  const handleExtract = async () => {
    if (!file) return

    setExtracting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/image-extraction/extract', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Extraction failed')
      }

      setResult(data)
    } catch (error) {
      console.error('Extraction error:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Extraction failed'
      })
    } finally {
      setExtracting(false)
    }
  }

  const downloadCSV = () => {
    if (!result?.csvData) return

    const blob = new Blob([result.csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `extracted_alumni_${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Bengali Image Text Extraction</h1>
            <p className="text-gray-600 mt-1">Upload Bengali alumni images to extract and convert text to CSV format</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">📋 Instructions</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Upload images containing Bengali text with alumni names, titles, and information</p>
                <p>• Supported formats: JPEG, PNG, GIF, BMP (max 10MB)</p>
                <p>• The system will extract Bengali text and convert it to English transliteration</p>
                <p>• Extracted data will be formatted as CSV for migration</p>
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Bengali Image
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
                <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  {file ? file.name : 'Drag and drop your Bengali image here, or click to browse'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports JPEG, PNG, GIF, BMP files up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Choose Image
                </label>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FileImage className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Extract Button */}
            {file && !result && (
              <div className="flex justify-center">
                <button
                  onClick={handleExtract}
                  disabled={extracting}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {extracting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Extracting Text...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Extract Text
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Extraction Results</h3>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Extract Another Image
                  </button>
                </div>

                {result.success ? (
                  <div className="space-y-4">
                    {/* Success Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Extraction Successful</p>
                          <p className="text-sm text-green-700">
                            Found {result.alumniRecords?.length || 0} alumni records
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Text Preview */}
                    {result.extractedText && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Extracted Text</h4>
                        <div className="text-sm text-gray-700 max-h-40 overflow-y-auto bg-white p-3 rounded border">
                          <pre className="whitespace-pre-wrap">{result.extractedText}</pre>
                        </div>
                      </div>
                    )}

                    {/* Alumni Records Preview */}
                    {result.alumniRecords && result.alumniRecords.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Parsed Alumni Records</h4>
                        <div className="text-sm text-gray-700 max-h-60 overflow-y-auto">
                          <div className="grid grid-cols-1 gap-2">
                            {result.alumniRecords.map((record, index) => (
                              <div key={index} className="bg-white p-3 rounded border">
                                <div className="font-medium">
                                  {record.title_prefix && `${record.title_prefix} `}
                                  {record.first_name} {record.middle_name && `${record.middle_name} `}
                                  {record.last_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Class: {record.last_class || 'N/A'} | 
                                  Year: {record.year_of_leaving || 'N/A'} |
                                  {record.is_deceased === 'true' ? ' Deceased' : ' Living'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Download CSV Button */}
                    {result.csvData && (
                      <div className="flex justify-center">
                        <button
                          onClick={downloadCSV}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download CSV
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Extraction Failed</p>
                        <p className="text-sm text-red-700">{result.error}</p>
                      </div>
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


