'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Copy, Check, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface QueuedEmail {
  id: string
  recipient_user_id: string
  notification_type: string
  status: string
  created_at: string
  metadata: {
    payment_link?: string
    email?: string
    subject?: string
    amount?: number
    currency?: string
    token?: string
  }
}

export default function PaymentQueuePage() {
  const [emails, setEmails] = useState<QueuedEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchQueuedEmails()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
      alert('Unauthorized access')
      router.push('/dashboard')
    }
  }

  const fetchQueuedEmails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payment_notification_queue')
        .select('*')
        .eq('status', 'queued')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setEmails(data || [])
    } catch (error) {
      console.error('Error fetching queued emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      alert('Failed to copy')
    }
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/users" 
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Email Queue</h1>
              <p className="text-gray-600 mt-2">
                Queued payment emails (for localhost testing - emails not actually sent)
              </p>
            </div>
            <button
              onClick={fetchQueuedEmails}
              className="btn-primary"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">Localhost Testing Mode</h3>
              <p className="mt-2 text-sm text-blue-800">
                In localhost, emails are queued but not sent. Use the payment links below to test the payment flow manually.
                Copy the payment link and open it in an incognito browser to simulate the user experience.
              </p>
            </div>
          </div>
        </div>

        {/* Queued Emails */}
        {emails.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Queued Emails</h3>
            <p className="text-gray-600 mb-4">
              Approve a user to trigger a payment email and see it here.
            </p>
            <Link href="/admin/users" className="btn-primary inline-flex items-center">
              Go to User Management
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <div key={email.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {email.metadata.subject || 'Payment Link Email'}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                        {email.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">To:</span>{' '}
                        <span className="font-medium text-gray-900">{email.metadata.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {email.metadata.currency} {email.metadata.amount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>{' '}
                        <span className="font-medium text-gray-900">{email.notification_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Queued:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {new Date(email.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Link */}
                {email.metadata.payment_link && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Link (for testing):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={email.metadata.payment_link}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(email.metadata.payment_link!, email.id)}
                        className="btn-secondary flex items-center gap-2"
                        title="Copy link"
                      >
                        {copiedId === email.id ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openInNewTab(email.metadata.payment_link!)}
                        className="btn-primary flex items-center gap-2"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Test
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Copy this link and open in incognito browser to test the payment flow without logging in.
                    </p>
                  </div>
                )}

                {/* Token Info */}
                {email.metadata.token && (
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">Token: </span>
                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {email.metadata.token.substring(0, 16)}...
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Testing Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Approve a user in <Link href="/admin/users" className="text-primary-600 hover:underline">User Management</Link></li>
            <li>Refresh this page to see the queued email</li>
            <li>Click "Copy" to copy the payment link</li>
            <li>Open an incognito/private browser window</li>
            <li>Paste the payment link (no login required!)</li>
            <li>Complete test payment with card: <code className="bg-gray-100 px-2 py-0.5 rounded">4111 1111 1111 1111</code></li>
            <li>Verify user account is activated in database</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

