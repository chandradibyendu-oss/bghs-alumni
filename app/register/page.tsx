'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Phone, User, GraduationCap, Lock, Eye, EyeOff, CheckCircle2, Send } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [batchYear, setBatchYear] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false)
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false)
  const [showEmailOTP, setShowEmailOTP] = useState(false)
  const [showPhoneOTP, setShowPhoneOTP] = useState(false)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [phoneCooldown, setPhoneCooldown] = useState(0)

  const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  const contactProvided = !!(email || phone)
  const oneVerified = (email && emailVerified) || (phone && phoneVerified)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email && !phone) {
      setError('Provide at least an email or a phone number')
      return
    }

    if (!strongPw.test(password)) {
      setError('Password must be 8+ chars and include upper, lower, number, and symbol')
      return
    }
    if (!/^[0-9]{4}$/.test(batchYear)) {
      setError('Enter a valid 4-digit batch year')
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    if (email && !emailVerified) { setError('Verify email with OTP'); return }
    if (phone && !phoneVerified) { setError('Verify phone with OTP'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || null,
          phone: phone || null,
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          batch_year: batchYear,
          email_otp: email ? emailOtp : undefined,
          phone_otp: phone ? phoneOtp : undefined,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      setMessage('Registration submitted. An admin will review and approve your account.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sendEmailOtp = async () => {
    if (!email) { setError('Enter email to send OTP'); return }
    setError('')
    setSendingEmailOtp(true)
    try {
      const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to send email OTP'); return }
      setMessage('Email OTP sent')
      setShowEmailOTP(true)
      setEmailCooldown(60)
    } finally {
      setSendingEmailOtp(false)
    }
  }

  const verifyEmailOtp = async () => {
    if (!email || !emailOtp) { setError('Enter email and OTP'); return }
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp: emailOtp }) })
      const data = await res.json()
      if (!res.ok || !data.verified) { setError(data.error || 'Invalid email OTP'); setEmailVerified(false); return }
      setEmailVerified(true)
      setMessage('Email verified')
    } catch { setError('Verification failed') }
  }

  const sendPhoneOtp = async () => {
    if (!phone) { setError('Enter phone to send OTP'); return }
    setError('')
    setSendingPhoneOtp(true)
    try {
      const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to send phone OTP'); return }
      setMessage('Phone OTP sent')
      setShowPhoneOTP(true)
      setPhoneCooldown(60)
    } finally {
      setSendingPhoneOtp(false)
    }
  }

  const verifyPhoneOtp = async () => {
    if (!phone || !phoneOtp) { setError('Enter phone and OTP'); return }
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, otp: phoneOtp }) })
      const data = await res.json()
      if (!res.ok || !data.verified) { setError(data.error || 'Invalid phone OTP'); setPhoneVerified(false); return }
      setPhoneVerified(true)
      setMessage('Phone verified')
    } catch { setError('Verification failed') }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-2">Registration requires admin approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input className="input-field pl-10" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" required />
              </div>
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="input-field" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (required if phone not provided)</label>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" className="input-field pl-10 pr-28" value={email} onChange={e=>{ setEmail(e.target.value); setEmailVerified(false); setShowEmailOTP(false) }} placeholder="you@example.com" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {!emailVerified ? (
                    <button type="button" onClick={sendEmailOtp} disabled={!email || sendingEmailOtp || emailCooldown>0} className="px-3 py-1 text-sm rounded border">
                      {emailCooldown>0 ? `Resend in ${emailCooldown}s` : 'Verify'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 className="h-4 w-4" /> Verified</span>
                  )}
                </div>
              </div>
              {email && showEmailOTP && !emailVerified && (
                <div className="flex items-center gap-2">
                  <input
                    maxLength={6}
                    className="input-field"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Email OTP"
                    placeholder={emailOtp ? '' : 'Enter 6-digit email OTP'}
                    value={emailOtp}
                    onFocus={() => !emailOtp && setEmailOtp('')}
                    onChange={e=>setEmailOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  />
                  <button type="button" onClick={verifyEmailOtp} className="px-3 py-2 border rounded text-sm">Confirm</button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (required if email not provided)</label>
            <p className="text-xs text-blue-600 mb-2">📱 Include country code (e.g., +91XXXXXXXXXX)</p>
            <div className="space-y-2">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input className="input-field pl-10 pr-28" value={phone} onChange={e=>{ setPhone(e.target.value); setPhoneVerified(false); setShowPhoneOTP(false) }} placeholder="e.g. +91 98765 43210" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {!phoneVerified ? (
                    <button type="button" onClick={sendPhoneOtp} disabled={!phone || sendingPhoneOtp || phoneCooldown>0} className="px-3 py-1 text-sm rounded border">
                      {phoneCooldown>0 ? `Resend in ${phoneCooldown}s` : 'Verify'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 className="h-4 w-4" /> Verified</span>
                  )}
                </div>
              </div>
              {phone && showPhoneOTP && !phoneVerified && (
                <div className="flex items-center gap-2">
                  <input
                    maxLength={6}
                    className="input-field"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Phone OTP"
                    placeholder={phoneOtp ? '' : 'Enter 6-digit phone OTP'}
                    value={phoneOtp}
                    onFocus={() => !phoneOtp && setPhoneOtp('')}
                    onChange={e=>setPhoneOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  />
                  <button type="button" onClick={verifyPhoneOtp} className="px-3 py-2 border rounded text-sm">Confirm</button>
                </div>
              )}
            </div>
          </div>

          {!contactProvided && (
            <p className="text-sm text-red-600">Provide at least one contact: email or phone.</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year (10th Standard)</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="number" className="input-field pl-10" value={batchYear} onChange={e=>setBatchYear(e.target.value)} placeholder="2005" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <p className="text-xs text-gray-500 mb-1">8+ chars with uppercase, lowercase, number, and symbol.</p>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} className="input-field pl-10 pr-10" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" required />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={()=>setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{error}</div>}
          {message && <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded">{message}</div>}

          <button type="submit" disabled={loading || !oneVerified} className="w-full btn-primary py-3 font-semibold disabled:opacity-50">{loading ? 'Submitting...' : 'Register'}</button>
        </form>

        <p className="text-center text-sm text-gray-600">Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Login</Link></p>
      </div>
    </div>
  )
}


