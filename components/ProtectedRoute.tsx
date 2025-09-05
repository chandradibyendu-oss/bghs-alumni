'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { UserPermissions, canAccess } from '@/lib/auth-utils'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions: (keyof UserPermissions)[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requiredPermissions,
  fallback = <div>Loading...</div>,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null)
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get current user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          
          // Get user permissions
          const { data: permData } = await supabase
            .rpc('get_user_permissions', { user_uuid: user.id })
          
          setPermissions(permData)
        } else {
          // No user, redirect to login
          router.push(redirectTo)
        }
      } catch (error) {
        console.error('Error in ProtectedRoute:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          
          const { data: permData } = await supabase
            .rpc('get_user_permissions', { user_uuid: session.user.id })
          
          setPermissions(permData)
        } else {
          setUser(null)
          setPermissions(null)
          router.push(redirectTo)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [router, redirectTo])

  if (loading) {
    return <>{fallback}</>
  }

  if (!user || !permissions) {
    return null
  }

  // Check if user has required permissions
  if (!canAccess(permissions, requiredPermissions)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

