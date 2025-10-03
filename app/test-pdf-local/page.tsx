'use client'

import { useState } from 'react'

export default function TestPDFLocalPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: 'John',
    middle_name: 'William',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    last_class: 10,
    year_of_leaving: 2020,
    start_class: 5,
    start_year: 2015,
    reference_1: 'BGHSA-2005-00025',
    reference_2: 'BGHSA-2005-00125',
    reference_1_valid: true,
    reference_2_valid: false,
    registrationId: 'test-user-456',
    includeEvidence: true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const generatePDF = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-pdf-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('PDF generation failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'test-registration-local.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error:', error)
      alert('PDF generation failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = () => {
    setFormData({
      first_name: 'John',
      middle_name: 'William',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      last_class: 10,
      year_of_leaving: 2020,
      start_class: 5,
      start_year: 2015,
      reference_1: 'BGHSA-2005-00025',
      reference_2: 'BGHSA-2005-00125',
      reference_1_valid: true,
      reference_2_valid: false,
      registrationId: 'test-user-456',
      includeEvidence: true
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Local PDF Template Tester</h1>
          
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Development Only</h3>
            <p className="text-sm text-yellow-700">
              This is a local testing tool that uses a different PDF generation approach than production. 
              It's for development testing only and won't be deployed to production.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Academic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Class</label>
                <input
                  type="number"
                  name="last_class"
                  value={formData.last_class}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Year of Leaving</label>
                <input
                  type="number"
                  name="year_of_leaving"
                  value={formData.year_of_leaving}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Start Class</label>
                <input
                  type="number"
                  name="start_class"
                  value={formData.start_class}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Start Year</label>
                <input
                  type="number"
                  name="start_year"
                  value={formData.start_year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Registration ID</label>
                <input
                  type="text"
                  name="registrationId"
                  value={formData.registrationId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* References */}
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">References</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reference 1</label>
                <input
                  type="text"
                  name="reference_1"
                  value={formData.reference_1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="reference_1_valid"
                      checked={formData.reference_1_valid}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Valid</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reference 2</label>
                <input
                  type="text"
                  name="reference_2"
                  value={formData.reference_2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="reference_2_valid"
                      checked={formData.reference_2_valid}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Valid</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Evidence</h2>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="includeEvidence"
                  checked={formData.includeEvidence}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Include Evidence Documents</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                When checked, includes sample marksheet and school certificate in the PDF
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={generatePDF}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating PDF...' : 'Generate & Download PDF (Local)'}
            </button>
            
            <button
              onClick={resetToDefaults}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">Local Testing Workflow:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• This uses local puppeteer (different from production)</li>
              <li>• Modify template logic in <code className="bg-blue-100 px-1 rounded">app/api/test-pdf-local/route.ts</code></li>
              <li>• Test different scenarios and data combinations</li>
              <li>• Once satisfied, apply changes to production <code className="bg-blue-100 px-1 rounded">lib/pdf-generator.ts</code></li>
              <li>• This local endpoint won't be deployed to production</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
