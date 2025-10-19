'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Eye, EyeOff, Mail, Lock, Phone, Smartphone } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'auto'>('auto')
  const [useOTP, setUseOTP] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const router = useRouter()

  // Country code to flag mapping
  const countryFlags: { [key: string]: string } = {
    '+91': '🇮🇳', // India
    '+1': '🇺🇸',  // USA
    '+44': '🇬🇧', // UK
    '+33': '🇫🇷', // France
    '+49': '🇩🇪', // Germany
    '+81': '🇯🇵', // Japan
    '+86': '🇨🇳', // China
    '+61': '🇦🇺', // Australia
    '+55': '🇧🇷', // Brazil
    '+52': '🇲🇽', // Mexico
  }

  // Supported countries for OTP (easily configurable)
  const supportedOTPCountries = ['+91'] // Currently only India

  // Helper functions
  const isPhoneNumber = (input: string) => input.trim().startsWith('+') || /^\d/.test(input.trim())
  const getCountryCode = (input: string) => {
    const trimmed = input.trim()
    if (trimmed.startsWith('+')) {
      // Find the longest matching country code
      const sortedCodes = Object.keys(countryFlags).sort((a, b) => b.length - a.length)
      for (const code of sortedCodes) {
        if (trimmed.startsWith(code)) {
          return code
        }
      }
    }
    return null
  }
  const getInputIcon = () => {
    if (isPhoneNumber(identifier)) {
      return <Phone className="h-5 w-5 text-gray-400" />
    }
    return <Mail className="h-5 w-5 text-gray-400" />
  }
  const getCountryFlag = () => {
    const countryCode = getCountryCode(identifier)
    return countryCode ? countryFlags[countryCode] : null
  }
  const canUseOTP = () => {
    const countryCode = getCountryCode(identifier)
    return !!(countryCode && supportedOTPCountries.includes(countryCode) && isPhoneNumber(identifier))
  }

  const handleSendOTP = async () => {
    if (!identifier) {
      setError('Please enter your phone number')
      return
    }

    setOtpLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/send-native-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: identifier })
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setSuccess('OTP sent successfully! Please check your phone.')
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Use Supabase native OTP login endpoint
      const otpLoginResponse = await fetch('/api/auth/otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: identifier, otp })
      })

      const otpLoginData = await otpLoginResponse.json()

      if (otpLoginResponse.ok) {
        // OTP is verified - navigate to magic link to complete authentication
        setSuccess('OTP verified! Completing login...')
        
        if (otpLoginData.magicLink) {
          // Navigate to the magic link to complete the authentication
          window.location.href = otpLoginData.magicLink
        } else {
          setError('Failed to get authentication link')
        }
      } else {
        setError(otpLoginData.error || 'OTP login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

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
          router.push(mustChange ? '/reset-initial-password' : '/')
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
               src="/bghs-logo.png" 
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
        <form className="mt-8 space-y-6" onSubmit={useOTP ? handleOTPLogin : handleLogin}>
          <div className="space-y-4">
            {/* Email or Phone Field */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {getInputIcon()}
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
                {/* Country Flag Display */}
                {getCountryFlag() && (
                  <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none">
                    <span className="text-lg">{getCountryFlag()}</span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                You can use either your email address or phone number to sign in
              </p>
              <p className="mt-1 text-xs text-blue-600">
                📱 For phone numbers, include country code (e.g., +91XXXXXXXXXX)
              </p>
              
              {/* OTP Toggle for Indian Phone Numbers */}
              {canUseOTP() && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">Login with OTP</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useOTP}
                        onChange={(e) => {
                          setUseOTP(e.target.checked)
                          setOtpSent(false)
                          setOtp('')
                          setError('')
                          setSuccess('')
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-blue-600">
                    Enable to receive OTP on your phone for quick login
                  </p>
                </div>
              )}
            </div>

            {/* Password Field - Only show when not using OTP */}
            {!useOTP && (
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
            )}

            {/* OTP Input Field - Only show when using OTP */}
            {useOTP && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="input-field text-center text-lg tracking-widest"
                      placeholder="000000"
                      required
                    />
                  </div>
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  )}
                </div>
                {otpSent && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ OTP sent! Check your phone for the 6-digit code.
                  </p>
                )}
              </div>
            )}
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
            disabled={loading || otpLoading}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (useOTP ? 'Verifying OTP...' : 'Signing in...') : (useOTP ? 'Verify OTP & Login' : 'Sign In')}
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
