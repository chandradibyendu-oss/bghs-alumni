'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, LogOut, User, Calendar, Users, BookOpen, Heart, Shield, CreditCard, Mail } from 'lucide-react'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [canManageUsers, setCanManageUsers] = useState(false)
  const [canManageRoles, setCanManageRoles] = useState(false)
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
        
        // Quick permission check based on role (no additional database queries)
        const isSuperAdmin = profile?.role === 'super_admin'
        const isAdmin = isSuperAdmin || profile?.role === 'alumni_premium' || profile?.role === 'content_moderator'
        
        setCanManageUsers(isAdmin)
        setCanManageRoles(isSuperAdmin)
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
          {canManageUsers && (
            <>
              <Link href="/admin/users" className="card text-center hover:shadow-lg transition-shadow group">
                <Users className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600">Add, edit, and manage alumni profiles</p>
              </Link>
              
              <Link href="/admin/payments" className="card text-center hover:shadow-lg transition-shadow group">
                <CreditCard className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Settings</h3>
                <p className="text-gray-600">Configure payment amounts and categories</p>
              </Link>
              
              <Link href="/admin/payment-queue" className="card text-center hover:shadow-lg transition-shadow group">
                <Mail className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Queue</h3>
                <p className="text-gray-600">View queued payment emails (testing)</p>
              </Link>
            </>
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

          {(userProfile?.role === 'super_admin' || userProfile?.role === 'event_manager') && (
            <Link href="/admin/events/attendance" className="card text-center hover:shadow-lg transition-shadow group">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Take Attendance</h3>
              <p className="text-gray-600">Quick attendance capture for events</p>
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
