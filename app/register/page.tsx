'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Mail, Phone, User, GraduationCap, Lock, Eye, EyeOff, CheckCircle2, Send } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [lastClass, setLastClass] = useState('')
  const [yearOfLeaving, setYearOfLeaving] = useState('')
  const [startClass, setStartClass] = useState('')
  const [startYear, setStartYear] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
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
  const [lastEmailSentTo, setLastEmailSentTo] = useState('')
  const [lastPhoneSentTo, setLastPhoneSentTo] = useState('')
  const emailOtpRef = useRef<HTMLInputElement|null>(null)
  const phoneOtpRef = useRef<HTMLInputElement|null>(null)
  const emailFieldRef = useRef<HTMLDivElement|null>(null)
  const phoneFieldRef = useRef<HTMLDivElement|null>(null)
  const emailInputRef = useRef<HTMLInputElement|null>(null)
  const phoneInputRef = useRef<HTMLInputElement|null>(null)
  const firstNameRef = useRef<HTMLInputElement|null>(null)
  const lastNameRef = useRef<HTMLInputElement|null>(null)
  const lastClassRef = useRef<HTMLSelectElement|null>(null)
  const yearRef = useRef<HTMLInputElement|null>(null)
  const passwordRef = useRef<HTMLInputElement|null>(null)

  const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  const contactProvided = !!(email || phone)
  const oneVerified = (email && emailVerified) || (phone && phoneVerified)

  // Decrement cooldown timers every second while active
  useEffect(() => {
    if (emailCooldown <= 0) return
    const id = setInterval(() => {
      setEmailCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [emailCooldown])

  useEffect(() => {
    if (phoneCooldown <= 0) return
    const id = setInterval(() => {
      setPhoneCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [phoneCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setMessage('')

    // Aggregate validation
    let firstInvalid: HTMLElement | null = null
    const nextFieldErrors: Record<string,string> = {}

    if (!firstName.trim()) { nextFieldErrors.firstName = 'Enter first name'; if (!firstInvalid) firstInvalid = firstNameRef.current }
    if (!lastName.trim()) { nextFieldErrors.lastName = 'Enter last name'; if (!firstInvalid) firstInvalid = lastNameRef.current }
    if (!email && !phone) {
      nextFieldErrors.contact = 'Provide at least an email or a phone number'
      if (!firstInvalid) firstInvalid = (emailInputRef.current || phoneInputRef.current) as unknown as HTMLElement
    }
    if (!/^(?:[1-9]|1[0-2])$/.test(lastClass)) { nextFieldErrors.lastClass = 'Select last class (1-12)'; if (!firstInvalid) firstInvalid = lastClassRef.current }
    if (!/^[0-9]{4}$/.test(yearOfLeaving)) { nextFieldErrors.yearOfLeaving = 'Enter a valid 4-digit year'; if (!firstInvalid) firstInvalid = yearRef.current }
    if (!strongPw.test(password)) { nextFieldErrors.password = 'Password must be 8+ chars and include upper, lower, number, and symbol'; if (!firstInvalid) firstInvalid = passwordRef.current }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError('Please complete the highlighted fields.')
      setTimeout(() => {
        firstInvalid?.focus()
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
      return
    }

    const atLeastOneVerified = (email && emailVerified) || (phone && phoneVerified)
    if (!atLeastOneVerified) {
      setError('Verify email or phone with OTP')
      if (phone) {
        setShowPhoneOTP(true)
        if (!lastPhoneSentTo || lastPhoneSentTo !== phone) { try { await sendPhoneOtp() } catch {} }
        setTimeout(() => { phoneOtpRef.current?.focus(); phoneFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 0)
      } else if (email) {
        setShowEmailOTP(true)
        if (!lastEmailSentTo || lastEmailSentTo !== email) { try { await sendEmailOtp() } catch {} }
        setTimeout(() => { emailOtpRef.current?.focus(); emailFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 0)
      }
      return
    }

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
          last_class: lastClass,
          year_of_leaving: yearOfLeaving,
          start_class: startClass || undefined,
          start_year: startYear || undefined,
          // Send OTPs only for the contact(s) verified/entered
          email_otp: emailVerified ? emailOtp : undefined,
          phone_otp: phoneVerified ? phoneOtp : undefined,
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
      setLastEmailSentTo(email)
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
      setLastPhoneSentTo(phone)
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
        <div>
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 hover:underline">← Back to Home</Link>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-2">Registration requires admin approval.</p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input ref={firstNameRef} className={`input-field pl-10 ${fieldErrors.firstName ? 'border-red-300' : ''}`} value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" aria-invalid={!!fieldErrors.firstName} />
              </div>
              {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input ref={lastNameRef} className={`input-field ${fieldErrors.lastName ? 'border-red-300' : ''}`} value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" aria-invalid={!!fieldErrors.lastName} />
              {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (required if phone not provided)</label>
            <div className="space-y-2" ref={emailFieldRef}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input ref={emailInputRef} type="email" className={`input-field pl-10 pr-28 ${fieldErrors.contact ? 'border-red-300' : ''}`} value={email} onChange={e=>{ setEmail(e.target.value); setEmailVerified(false); setShowEmailOTP(false); setEmailCooldown(0); setEmailOtp('') }} placeholder="you@example.com" aria-invalid={!!fieldErrors.contact} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {!emailVerified ? (
                    <button type="button" onClick={sendEmailOtp} disabled={!email || sendingEmailOtp || (emailCooldown>0 && email===lastEmailSentTo)} className="px-3 py-1 text-sm rounded border">
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
                    ref={emailOtpRef}
                  />
                  <button type="button" onClick={verifyEmailOtp} className="px-3 py-2 border rounded text-sm">Confirm</button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (required if email not provided)</label>
            <p className="text-xs text-blue-600 mb-2">📱 Include country code (e.g., +91XXXXXXXXXX)</p>
            <div className="space-y-2" ref={phoneFieldRef}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input ref={phoneInputRef} className={`input-field pl-10 pr-28 ${fieldErrors.contact ? 'border-red-300' : ''}`} value={phone} onChange={e=>{ setPhone(e.target.value); setPhoneVerified(false); setShowPhoneOTP(false); setPhoneCooldown(0); setPhoneOtp('') }} placeholder="e.g. +91 98765 43210" aria-invalid={!!fieldErrors.contact} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {!phoneVerified ? (
                    <button type="button" onClick={sendPhoneOtp} disabled={!phone || sendingPhoneOtp || (phoneCooldown>0 && phone===lastPhoneSentTo)} className="px-3 py-1 text-sm rounded border">
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
                    ref={phoneOtpRef}
                  />
                  <button type="button" onClick={verifyPhoneOtp} className="px-3 py-2 border rounded text-sm">Confirm</button>
                </div>
              )}
            </div>
          </div>

          {!contactProvided && (
            <p className="text-sm text-red-600">Provide at least one contact: email or phone.</p>
          )}

          <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Class Attended</label>
              <select
                id="last_class"
                aria-invalid={!!fieldErrors.lastClass}
                className={`input-field h-12 ${fieldErrors.lastClass ? 'border-red-300' : ''}`}
                value={lastClass}
                onChange={e=>setLastClass(e.target.value)}
                ref={lastClassRef}
              >
                <option value="">Select class</option>
                {Array.from({length:12}).map((_,i)=>i+1).map(n=> (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {fieldErrors.lastClass && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastClass}</p>}
              <p className="text-xs text-gray-500 mt-1">Class you last studied at BGHS (1–12).</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Leaving (YYYY)</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="year_of_leaving"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  aria-invalid={!!fieldErrors.yearOfLeaving}
                  className={`input-field pl-10 h-12 ${fieldErrors.yearOfLeaving ? 'border-red-300' : ''}`}
                  value={yearOfLeaving}
                  onChange={e=>setYearOfLeaving(e.target.value.replace(/\D/g,'').slice(0,4))}
                  ref={yearRef}
                  placeholder="2005"
                />
              </div>
              {fieldErrors.yearOfLeaving && <p className="text-xs text-red-600 mt-1">{fieldErrors.yearOfLeaving}</p>}
              <p className="text-xs text-gray-500 mt-1">Year you stopped attending BGHS.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Class (optional)</label>
              <select className="input-field h-12" value={startClass} onChange={e=>setStartClass(e.target.value)}>
                <option value="">Select class</option>
                {Array.from({length:12}).map((_,i)=>i+1).map(n=> (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">If you joined BGHS at a later class.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Year (optional)</label>
              <input type="text" inputMode="numeric" maxLength={4} className="input-field h-12" value={startYear} onChange={e=>setStartYear(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="1998" />
              <p className="text-xs text-gray-500 mt-1">If known; helps alumni search.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <p className="text-xs text-gray-500 mb-1">8+ chars with uppercase, lowercase, number, and symbol.</p>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input ref={passwordRef} type={showPassword ? 'text' : 'password'} className={`input-field pl-10 pr-10 ${fieldErrors.password ? 'border-red-300' : ''}`} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" aria-invalid={!!fieldErrors.password} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={()=>setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <div className="h-5 mt-1">
              {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{error}</div>}
          {message && <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded">{message}</div>}

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold disabled:opacity-50">{loading ? 'Submitting...' : 'Register'}</button>
          {!oneVerified && (
            <p className="text-xs text-gray-600 mt-2">Verify email or phone with OTP to complete registration.</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-600">Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Login</Link></p>
      </div>
    </div>
  )
}


