'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, LogOut, User, Calendar, Users, BookOpen, Heart } from 'lucide-react'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [canManageUsers, setCanManageUsers] = useState(false)
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
        try {
          const perms = await getUserPermissions(user.id)
          setCanManageUsers(hasPermission(perms, 'can_access_admin') || hasPermission(perms, 'can_manage_users'))
        } catch {
          // Fallback: allow only super_admin
          const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
          setCanManageUsers(data?.role === 'super_admin')
        }
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
                  src="/bghs-logo.jpg" 
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {canManageUsers && (
            <Link href="/admin/users" className="card text-center hover:shadow-lg transition-shadow group">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600">Add, edit, and manage alumni profiles</p>
            </Link>
          )}
          
          <Link href="/events" className="card text-center hover:shadow-lg transition-shadow group">
            <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Events</h3>
            <p className="text-gray-600">View and register for upcoming events</p>
          </Link>
          
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
