'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Mail, Phone, User, GraduationCap, Lock, Eye, EyeOff, CheckCircle2, Send, Upload, FileText, Users, X } from 'lucide-react'

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
  
  // Verification fields state
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [reference1, setReference1] = useState('')
  const [reference2, setReference2] = useState('')
  const [reference1Valid, setReference1Valid] = useState(false)
  const [reference2Valid, setReference2Valid] = useState(false)
  const [reference1Checking, setReference1Checking] = useState(false)
  const [reference2Checking, setReference2Checking] = useState(false)
  const [reference1Touched, setReference1Touched] = useState(false)
  const [reference2Touched, setReference2Touched] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
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
  
  // Verification validation
  const hasEvidence = evidenceFiles.length > 0
  const hasReferences = reference1.trim() && reference2.trim() && reference1Valid && reference2Valid
  const hasPartialReferences = (reference1.trim() && reference1Valid) || (reference2.trim() && reference2Valid)
  const hasVerification = hasEvidence || hasReferences

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
    if (!hasVerification) { 
      if (hasPartialReferences && !hasEvidence) {
        nextFieldErrors.verification = 'Please provide both reference IDs or upload evidence files for verification'
      } else {
        nextFieldErrors.verification = 'Provide either evidence files or alumni references for verification'
      }
      if (!firstInvalid) firstInvalid = null 
    }

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
    setUploading(true)
    
    try {
      // Step 1: Upload evidence files if any
      let uploadedEvidenceFiles: any[] = []
      if (hasEvidence && evidenceFiles.length > 0) {
        const formData = new FormData()
        evidenceFiles.forEach(file => formData.append('files', file))
        // Generate temporary user ID for file organization (will be replaced with real user ID after registration)
        const tempUserId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        formData.append('userId', tempUserId)
        
        const uploadRes = await fetch('/api/evidence/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json()
          throw new Error(uploadError.error || 'Failed to upload evidence files')
        }
        
        const uploadData = await uploadRes.json()
        uploadedEvidenceFiles = uploadData.data.files
      }

      // Step 2: Submit registration with verification data
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
          // Verification data with uploaded file URLs
          verification: {
            has_evidence: hasEvidence,
            evidence_files: uploadedEvidenceFiles,
            has_references: hasReferences,
            reference_1: reference1.trim() || null,
            reference_2: reference2.trim() || null,
            reference_1_valid: reference1Valid,
            reference_2_valid: reference2Valid
          }
        })
      })
      
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      
      setMessage('Registration submitted successfully! An admin will review your verification and approve your account.')
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Network error. Please try again.')
    } finally {
      setLoading(false)
      setUploading(false)
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

  // Verification helper functions
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    // Enhanced file validation limits
    const EVIDENCE_LIMITS = {
      maxSizePerFile: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 5, // Maximum 5 files total
      maxTotalSize: 20 * 1024 * 1024, // 20MB total
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    }
    
    // Filter valid files (type and size)
    const validFiles = Array.from(files).filter(file => {
      const isValidType = EVIDENCE_LIMITS.allowedTypes.includes(file.type)
      const isValidSize = file.size <= EVIDENCE_LIMITS.maxSizePerFile
      return isValidType && isValidSize
    })
    
    // Check file count limit
    const totalFiles = evidenceFiles.length + validFiles.length
    if (totalFiles > EVIDENCE_LIMITS.maxFiles) {
      setError(`Maximum ${EVIDENCE_LIMITS.maxFiles} files allowed. You already have ${evidenceFiles.length} files.`)
      return
    }
    
    // Check total size limit
    const currentTotalSize = evidenceFiles.reduce((sum, file) => sum + file.size, 0)
    const newTotalSize = validFiles.reduce((sum, file) => sum + file.size, 0)
    const totalSize = currentTotalSize + newTotalSize
    
    if (totalSize > EVIDENCE_LIMITS.maxTotalSize) {
      const currentSizeMB = (currentTotalSize / 1024 / 1024).toFixed(1)
      const limitSizeMB = EVIDENCE_LIMITS.maxTotalSize / 1024 / 1024
      setError(`Total upload size cannot exceed ${limitSizeMB}MB. Current: ${currentSizeMB}MB`)
      return
    }
    
    // Show warning for skipped files
    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only JPG, PNG, PDF files under 5MB are allowed.')
    }
    
    setEvidenceFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateReference = async (refValue: string, isFirst: boolean) => {
    if (!refValue.trim()) {
      // Mark as touched even if empty so validation message can show
      if (isFirst) {
        setReference1Touched(true)
      } else {
        setReference2Touched(true)
      }
      return
    }
    
    // Mark field as touched when validation starts
    if (isFirst) {
      setReference1Checking(true)
      setReference1Touched(true)
    } else {
      setReference2Checking(true)
      setReference2Touched(true)
    }
    
    // Mock validation - will be replaced with real API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock validation logic
    const isValid = /^[A-Z0-9]{6,12}$/i.test(refValue.trim())
    
    if (isFirst) {
      setReference1Valid(isValid)
      setReference1Checking(false)
    } else {
      setReference2Valid(isValid)
      setReference2Checking(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl w-full space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 hover:underline">← Back to Home</Link>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-2">Registration requires admin approval.</p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input ref={firstNameRef} className={`input-field pl-10 ${fieldErrors.firstName ? 'border-red-300' : ''}`} value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" aria-invalid={!!fieldErrors.firstName} />
              </div>
              {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input ref={lastNameRef} className={`input-field ${fieldErrors.lastName ? 'border-red-300' : ''}`} value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" aria-invalid={!!fieldErrors.lastName} />
              {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="text-xs text-blue-600 mt-2">📱 Include country code (e.g., +91XXXXXXXXXX)</p>
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
              {/* <p className="text-xs text-gray-500 mt-1">Class you last studied at BGHS (1–12).</p> */}
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
              {/* <p className="text-xs text-gray-500 mt-1">Year you stopped attending BGHS.</p> */}
            </div>
            {/* Start Class and Start Year fields hidden as requested */}
            {/* 
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
            */}
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

          {/* Verification Section */}
          <div className={`border rounded-lg ${fieldErrors.verification ? 'border-red-300' : 'border-gray-200'}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Alumni Verification</h3>
                    <p className="text-sm text-gray-500">Upload evidence or provide references for verification</p>
                  </div>
                </div>
                {hasVerification && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Evidence Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Evidence
                    </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 lg:p-8 text-center transition-colors flex flex-col justify-center min-h-[200px] lg:min-h-[240px] ${
                      dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-8 w-8 lg:h-10 lg:w-10 text-gray-400 mb-2 lg:mb-4" />
                    <p className="text-sm lg:text-base text-gray-600 mb-1 lg:mb-2">
                      <span className="lg:hidden">Tap to select files</span>
                      <span className="hidden lg:inline">Drag and drop files here, or{' '}</span>
                      <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                        <span className="lg:hidden">Select Files</span>
                        <span className="hidden lg:inline">browse files</span>
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileSelect(e.target.files)}
                        />
                      </label>
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">JPG, PNG, PDF up to 5MB each • Max 5 files • Total 20MB</p>
                  </div>

                  {/* File Preview */}
                  {evidenceFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {evidenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Status Indicator */}
                  {evidenceFiles.length > 0 && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-800">
                          <strong>{evidenceFiles.length}/5 files</strong> uploaded
                        </span>
                        <span className="text-blue-600">
                          {(evidenceFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)}MB / 20MB
                        </span>
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Reference Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alumni References
                    </label>
                    <p className="text-xs text-gray-500 mb-3">Provide registration IDs of two existing alumni members who can verify your identity</p>
                    
                    <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Reference 1</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="input-field pr-20"
                          value={reference1}
                          onChange={(e) => {
                            setReference1(e.target.value)
                            setReference1Valid(false)
                            setReference1Touched(false)
                          }}
                          onBlur={() => validateReference(reference1, true)}
                          placeholder="Enter registration ID"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {reference1Checking && (
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          )}
                          {!reference1Checking && reference1 && (
                            <CheckCircle2 className={`h-4 w-4 ${reference1Valid ? 'text-green-600' : 'text-red-500'}`} />
                          )}
                        </div>
                      </div>
                      {reference1Touched && reference1 && !reference1Valid && !reference1Checking && (
                        <p className="text-xs text-red-600 mt-1">Invalid registration ID format</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Reference 2</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="input-field pr-20"
                          value={reference2}
                          onChange={(e) => {
                            setReference2(e.target.value)
                            setReference2Valid(false)
                            setReference2Touched(false)
                          }}
                          onBlur={() => validateReference(reference2, false)}
                          placeholder="Enter registration ID"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {reference2Checking && (
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          )}
                          {!reference2Checking && reference2 && (
                            <CheckCircle2 className={`h-4 w-4 ${reference2Valid ? 'text-green-600' : 'text-red-500'}`} />
                          )}
                        </div>
                      </div>
                      {reference2Touched && reference2 && !reference2Valid && !reference2Checking && (
                        <p className="text-xs text-red-600 mt-1">Invalid registration ID format</p>
                      )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                {!hasVerification && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Required:</strong> Please provide either evidence files or alumni references (or both) to complete your registration.
                    </p>
                  </div>
                )}
                
                {/* Partial References Warning */}
                {hasPartialReferences && !hasReferences && !hasEvidence && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Almost there!</strong> You've provided {[reference1.trim() && reference1Valid, reference2.trim() && reference2Valid].filter(Boolean).length} valid reference{([reference1.trim() && reference1Valid, reference2.trim() && reference2Valid].filter(Boolean).length === 1) ? '' : 's'}. Please provide both reference IDs or upload evidence files.
                    </p>
                  </div>
                )}
            </div>
          </div>
          {fieldErrors.verification && <p className="text-xs text-red-600 mt-1">{fieldErrors.verification}</p>}

          {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{error}</div>}
          {message && <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded">{message}</div>}

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold disabled:opacity-50">
            {loading ? (
              uploading ? 'Uploading files...' : 'Submitting...'
            ) : (
              'Register'
            )}
          </button>
          {!oneVerified && (
            <p className="text-xs text-gray-600 mt-2">Verify email or phone with OTP to complete registration.</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-600">Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Login</Link></p>
      </div>
    </div>
  )
}


