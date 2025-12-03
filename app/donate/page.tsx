import Link from 'next/link'
import { ArrowLeft, Construction, Clock } from 'lucide-react'

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 rounded-t-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donation Portal</h1>
              <p className="text-gray-600">Support your alma mater</p>
            </div>
          </div>
        </div>

        {/* Under Construction Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="h-12 w-12 text-primary-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Under Construction</h2>
          
          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
            We're working hard to bring you a seamless donation experience. 
            The donation portal will be available soon with multiple payment options and transparent tracking.
          </p>

          <div className="flex items-center justify-center space-x-2 text-gray-500 mb-8">
            <Clock className="h-5 w-5" />
            <span className="text-sm">Coming Soon</span>
          </div>

          <div className="space-y-4">
            <Link href="/" className="btn-primary inline-block">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
