'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'auto'>('auto')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // First, determine if we need to look up the user
      let actualEmail = identifier
      
      if (loginMethod === 'auto' || !identifier.includes('@')) {
        // Look up user to get their email for Supabase auth
        const lookupResponse = await fetch('/api/auth/login-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier })
        })
        
        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json()
          actualEmail = lookupData.email
          setLoginMethod(lookupData.loginMethod)
        } else {
          const errorData = await lookupResponse.json()
          setError(errorData.error || 'Account not found')
          return
        }
      }

      // Now login with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: actualEmail,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        const mustChange = (data.user.user_metadata as any)?.must_change_password
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push(mustChange ? '/reset-initial-password' : '/dashboard')
        }, 800)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
                         <img 
               src="/bghs-logo.jpg" 
               alt="BGHS Alumni Association" 
               className="h-10 md:h-12 lg:h-14 w-auto"
             />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your BGHS Alumni account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            {/* Email or Phone Field */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your email address or phone number"
                />
              </div>
                <p className="mt-1 text-xs text-gray-500">
                  You can use either your email address or phone number to sign in
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  📱 For phone numbers, include country code (e.g., +91XXXXXXXXXX)
                </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Additional Links */}
          <div className="text-center space-y-2">
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary-600 hover:text-primary-500 hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-primary-600 hover:text-primary-500 hover:underline font-medium"
              >
                Sign up here
              </Link>
            </div>
          </div>
        </form>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
