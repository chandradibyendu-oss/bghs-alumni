'use client'

import { useState } from 'react'

export default function TestPdfCoverPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      setError(null)
    }
  }

  const handleTest = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/test-pdf-cover', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Test failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">PDF Cover Extraction Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF File
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={!file || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Extraction'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-800 font-semibold mb-4">✅ Test Successful!</h3>
            
            <div className="space-y-2 mb-4">
              <p><strong>Image Size:</strong> {result.imageSizeKB} KB ({result.imageSize} bytes)</p>
              {result.uploadUrl && (
                <p><strong>Upload URL:</strong> <a href={result.uploadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.uploadUrl}</a></p>
              )}
            </div>

            {result.imageBase64 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Extracted Cover Image:</h4>
                <img
                  src={result.imageBase64}
                  alt="Extracted cover"
                  className="max-w-full h-auto border border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-blue-800 font-semibold mb-2">Instructions</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Select a PDF file using the file input above</li>
            <li>Click "Test Extraction" button</li>
            <li>Check the results - you should see the extracted cover image</li>
            <li>If successful, the image will also be uploaded to R2 storage</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

