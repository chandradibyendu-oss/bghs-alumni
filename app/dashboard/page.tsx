'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, LogOut, User, Calendar, Users, BookOpen, Heart, Shield, CreditCard, Mail, Upload, Award, Download, Bell } from 'lucide-react'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  // Granular permission states for each dashboard card
  const [canManageUserProfiles, setCanManageUserProfiles] = useState(false)
  const [canManagePaymentSettings, setCanManagePaymentSettings] = useState(false)
  const [canViewPaymentQueue, setCanViewPaymentQueue] = useState(false)
  const [canManageAlumniMigration, setCanManageAlumniMigration] = useState(false)
  const [canManageNotices, setCanManageNotices] = useState(false)
  const [canExportAlumniData, setCanExportAlumniData] = useState(false)
  const [canManageRoles, setCanManageRoles] = useState(false)
  const [canTakeAttendance, setCanTakeAttendance] = useState(false)
  const [canManageEvents, setCanManageEvents] = useState(false)
  const [canManageBlog, setCanManageBlog] = useState(false)
  const [canManageCommittee, setCanManageCommittee] = useState(false)
  const [canManageContent, setCanManageContent] = useState(false)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        
        // Fetch user profile including payment status
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, payment_status, is_approved, first_name, last_name, full_name')
          .eq('id', user.id)
          .single()
        
        setUserProfile(profile)
        
        // Check permissions using the permission system
        const perms = await getUserPermissions(user.id)
        setUserPermissions(perms)
        
        // Clean granular permission checks - each card has its own permission
        // NO can_access_admin bypass - cards only show if specific permission is granted
        // User Management Group
        setCanManageUserProfiles(hasPermission(perms, 'can_manage_user_profiles'))
        setCanManagePaymentSettings(hasPermission(perms, 'can_manage_payment_settings'))
        setCanViewPaymentQueue(hasPermission(perms, 'can_view_payment_queue'))
        setCanManageAlumniMigration(hasPermission(perms, 'can_manage_alumni_migration'))
        setCanManageNotices(hasPermission(perms, 'can_manage_notices'))
        setCanExportAlumniData(hasPermission(perms, 'can_export_alumni_data'))
        
        // Other Admin Cards
        setCanManageRoles(hasPermission(perms, 'can_manage_roles'))
        setCanManageEvents(hasPermission(perms, 'can_create_events') || hasPermission(perms, 'can_manage_events'))
        setCanTakeAttendance(hasPermission(perms, 'can_take_attendance') || hasPermission(perms, 'can_manage_events'))
        setCanManageBlog(hasPermission(perms, 'can_create_blog') || hasPermission(perms, 'can_moderate_blog'))
        setCanManageCommittee(hasPermission(perms, 'can_manage_committee') || hasPermission(perms, 'can_manage_events'))
        setCanManageContent(hasPermission(perms, 'can_manage_content') || hasPermission(perms, 'can_access_admin'))
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-90">
                <img 
                  src="/bghs-logo.png" 
                  alt="BGHS Alumni Association" 
                  className="h-14 w-auto object-contain shrink-0"
                />
                <span className="text-xl font-bold text-gray-900">Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="btn-secondary hidden sm:inline-flex" title="Go to website home">Home</Link>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Manage your BGHS Alumni account and stay connected with your community.
          </p>
        </div>

        {/* Payment Pending Banner */}
        {userProfile?.payment_status === 'pending' && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Payment Pending
                </h3>
                <p className="text-amber-800 mb-4">
                  Your registration has been approved! Please complete the payment to activate your account and access all features.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    href="/profile/payments" 
                    className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Payment Details
                  </Link>
                  <p className="text-sm text-amber-700 flex items-center">
                    Check your email for the payment link or contact support if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Management Card */}
          {canManageUserProfiles && (
            <Link href="/admin/users" className="card text-center hover:shadow-lg transition-shadow group">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600">Add, edit, and manage alumni profiles</p>
            </Link>
          )}
          
          {/* Payment Settings Card */}
          {canManagePaymentSettings && (
            <Link href="/admin/payments" className="card text-center hover:shadow-lg transition-shadow group">
              <CreditCard className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Settings</h3>
              <p className="text-gray-600">Configure payment amounts and categories</p>
            </Link>
          )}
          
          {/* Payment Queue Card */}
          {canViewPaymentQueue && (
            <Link href="/admin/payment-queue" className="card text-center hover:shadow-lg transition-shadow group">
              <Mail className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Queue</h3>
              <p className="text-gray-600">View queued payment emails (testing)</p>
            </Link>
          )}
          
          {/* Alumni Migration Card */}
          {canManageAlumniMigration && (
            <Link href="/admin/alumni-migration" className="card text-center hover:shadow-lg transition-shadow group">
              <Upload className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Alumni Migration</h3>
              <p className="text-gray-600">Upload Excel files to migrate alumni data</p>
            </Link>
          )}
          
          {/* Notices Management Card */}
          {canManageNotices && (
            <div className="card text-center hover:shadow-lg transition-shadow group">
              <Bell className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notices Management</h3>
              <p className="text-gray-600 mb-4">Create and manage notices and announcements</p>
              <div className="flex gap-2">
                <Link href="/admin/notices/new" className="btn-primary flex-1 text-sm">
                  Create Notice
                </Link>
                <Link href="/admin/notices" className="btn-secondary flex-1 text-sm">
                  View All
                </Link>
              </div>
            </div>
          )}
          
          {/* Export Alumni Data Card */}
          {canExportAlumniData && (
            <div className="card text-center hover:shadow-lg transition-shadow group">
              <Download className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Alumni Data</h3>
              <p className="text-gray-600 mb-4">Download all alumni in migration template format</p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/alumni-export')
                    if (!response.ok) {
                      throw new Error('Export failed')
                    }
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `alumni-export-${new Date().toISOString().split('T')[0]}.csv`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                  } catch (error) {
                    alert('Failed to export alumni data. Please try again.')
                    console.error('Export error:', error)
                  }
                }}
                className="btn-primary w-full"
              >
                Download CSV
              </button>
            </div>
          )}
          
          {canManageRoles && (
            <Link href="/admin/roles-simple" className="card text-center hover:shadow-lg transition-shadow group">
              <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role Management</h3>
              <p className="text-gray-600">Create, edit, and manage user roles and permissions</p>
            </Link>
          )}
          
          <Link href="/events" className="card text-center hover:shadow-lg transition-shadow group">
            <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Events</h3>
            <p className="text-gray-600">View and register for upcoming events</p>
          </Link>

          {canManageEvents && (
            <Link href="/admin/events" className="card text-center hover:shadow-lg transition-shadow group">
              <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Management</h3>
              <p className="text-gray-600">Create, edit, and manage events</p>
            </Link>
          )}

          {canTakeAttendance && (
            <Link href="/admin/events/attendance" className="card text-center hover:shadow-lg transition-shadow group">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Take Attendance</h3>
              <p className="text-gray-600">Quick attendance capture for events</p>
            </Link>
          )}

          {canManageBlog && (
            <Link href="/admin/blog" className="card text-center hover:shadow-lg transition-shadow group">
              <BookOpen className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Management</h3>
              <p className="text-gray-600">Create, edit, and moderate blog posts</p>
            </Link>
          )}

          {canManageCommittee && (
            <Link href="/admin/committee" className="card text-center hover:shadow-lg transition-shadow group">
              <Award className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Committee Management</h3>
              <p className="text-gray-600">Manage advisory and executive committee members</p>
            </Link>
          )}

          {canManageContent && (
            <Link href="/admin/souvenirs" className="card text-center hover:shadow-lg transition-shadow group">
              <BookOpen className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Souvenir Books</h3>
              <p className="text-gray-600">Upload and manage annual souvenir publications</p>
            </Link>
          )}
          
          <Link href="/directory" className="card text-center hover:shadow-lg transition-shadow group">
            <Users className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Directory</h3>
            <p className="text-gray-600">Connect with fellow alumni</p>
          </Link>
          
          <Link href="/blog" className="card text-center hover:shadow-lg transition-shadow group">
            <BookOpen className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog</h3>
            <p className="text-gray-600">Read latest news and stories</p>
          </Link>
          
          <Link href="/profile/payments" className="card text-center hover:shadow-lg transition-shadow group">
            <CreditCard className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Payments</h3>
            <p className="text-gray-600">View payment history and receipts</p>
          </Link>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <p className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
