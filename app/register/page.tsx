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
  const [tempEvidenceFiles, setTempEvidenceFiles] = useState<any[]>([]) // Store temp file data
  const [sessionId, setSessionId] = useState<string>('') // Session ID for temp uploads
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
  const emailProvided = !!email
  const phoneProvided = !!phone
  const emailVerifiedRequired = email && emailVerified
  const phoneVerifiedOptional = !phone || (phone && phoneVerified)
  
  // Verification validation
  const hasEvidence = evidenceFiles.length > 0
  const hasReferences = reference1.trim() && reference2.trim() && reference1Valid && reference2Valid
  const hasPartialReferences = (reference1.trim() && reference1Valid) || (reference2.trim() && reference2Valid)
  const hasVerification = hasEvidence || hasReferences

  // Generate session ID on component mount
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    }
  }, [sessionId])

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
    if (!email.trim()) { 
      nextFieldErrors.email = 'Email is required'; 
      if (!firstInvalid) firstInvalid = emailInputRef.current 
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

    // Email verification is required
    if (!emailVerified) {
      setError('Verify email with OTP')
      setShowEmailOTP(true)
      if (!lastEmailSentTo || lastEmailSentTo !== email) { try { await sendEmailOtp() } catch {} }
      setTimeout(() => { emailOtpRef.current?.focus(); emailFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 0)
      return
    }
    
    // Phone verification is optional - only if phone is provided
    if (phone && !phoneVerified) {
      setError('Verify phone with OTP (optional)')
      setShowPhoneOTP(true)
      if (!lastPhoneSentTo || lastPhoneSentTo !== phone) { try { await sendPhoneOtp() } catch {} }
      setTimeout(() => { phoneOtpRef.current?.focus(); phoneFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 0)
      return
    }

    setLoading(true)
    
    try {
      // Evidence files are already uploaded to temporary storage
      // The backend will move them to permanent location on successful registration

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
          sessionId,
          verification: {
            has_evidence: hasEvidence,
            evidence_files: tempEvidenceFiles, // Use temp file data
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
        // Clean up temporary files on registration failure
        if (sessionId) {
          try {
            await fetch('/api/evidence/temp-upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            })
          } catch (cleanupError) {
            console.error('Failed to cleanup temp files:', cleanupError)
          }
        }
        setError(data.error || 'Registration failed')
        return
      }
      
      setMessage('Registration submitted successfully! An admin will review your verification and approve your account.')
    } catch (error) {
      console.error('Registration error:', error)
      
      // Clean up temporary files on any error
      if (sessionId) {
        try {
          await fetch('/api/evidence/temp-upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          })
        } catch (cleanupError) {
          console.error('Failed to cleanup temp files:', cleanupError)
        }
      }
      
      setError(error instanceof Error ? error.message : 'Network error. Please try again.')
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

  // Verification helper functions
  const handleFileSelect = async (files: FileList | null) => {
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
    
    // Upload files to temporary storage immediately
    if (validFiles.length > 0 && sessionId) {
      setUploading(true)
      try {
        const formData = new FormData()
        validFiles.forEach(file => formData.append('files', file))
        formData.append('sessionId', sessionId)
        
        const response = await fetch('/api/evidence/temp-upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload files')
        }
        
        const result = await response.json()
        
        // Update state with uploaded files
        setEvidenceFiles(prev => [...prev, ...validFiles])
        setTempEvidenceFiles(prev => [...prev, ...result.data.files])
        
        setError('') // Clear any previous errors
      } catch (error) {
        console.error('File upload error:', error)
        setError('Failed to upload files. Please try again.')
      } finally {
        setUploading(false)
      }
    }
  }

  const removeFile = async (index: number) => {
    // Remove from state
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index))
    setTempEvidenceFiles(prev => prev.filter((_, i) => i !== index))
    
    // Note: In a production system, you might want to delete the temp file from R2 here
    // For now, we'll let the cleanup job handle expired temp files
  }

  // Auto-format registration ID as user types: BGHSA-YYYY-XXXXX
  // User only types numbers, we auto-add BGHSA- prefix
  const formatRegistrationId = (value: string): string => {
    // Extract only digits from the input
    const digitsOnly = value.replace(/\D/g, '')
    
    // If empty, return empty
    if (!digitsOnly) return ''
    
    // Limit to 9 digits max (YYYY + XXXXX)
    const limited = digitsOnly.substring(0, 9)
    
    // Format: BGHSA-YYYY-XXXXX
    if (limited.length <= 4) {
      // Just year part: BGHSA-YYYY
      return `BGHSA-${limited}`
    } else {
      // Year + sequence: BGHSA-YYYY-XXXXX
      const year = limited.substring(0, 4)
      const sequence = limited.substring(4)
      return `BGHSA-${year}-${sequence}`
    }
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
    
    // Validate registration ID format: BGHSA-YYYY-XXXXX
    const isValid = /^BGHSA-\d{4}-\d{5}$/.test(refValue.trim())
    
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
          <p className="text-sm text-gray-600 mb-4">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input ref={firstNameRef} className={`input-field pl-10 ${fieldErrors.firstName ? 'border-red-300' : ''}`} value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" aria-invalid={!!fieldErrors.firstName} />
              </div>
              {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input ref={lastNameRef} className={`input-field ${fieldErrors.lastName ? 'border-red-300' : ''}`} value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" aria-invalid={!!fieldErrors.lastName} />
              {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <div className="space-y-2" ref={emailFieldRef}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input ref={emailInputRef} type="email" className={`input-field pl-10 pr-28 ${fieldErrors.email ? 'border-red-300' : ''}`} value={email} onChange={e=>{ setEmail(e.target.value); setEmailVerified(false); setShowEmailOTP(false); setEmailCooldown(0); setEmailOtp('') }} placeholder="you@example.com" aria-invalid={!!fieldErrors.email} />
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
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
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


          <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Class Attended <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Leaving (YYYY) <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
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
                    <h3 className="font-medium text-gray-900">Alumni Verification <span className="text-red-500">*</span></h3>
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
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
                  {/* Evidence Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Evidence
                    </label>
                    <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        <strong>Required Documents:</strong> Please upload a clear copy of your <strong>Admit Card</strong>, <strong>School Leaving Certificate</strong>, or <strong>Transfer Certificate</strong> for alumni verification.
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        ℹ️ These documents help us verify your attendance at BGHS and expedite your registration approval.
                      </p>
                    </div>
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

                  {/* OR Separator - Horizontal on mobile, Vertical on desktop */}
                  <div className="relative py-4 lg:py-0 lg:px-4">
                    {/* Mobile: Horizontal separator */}
                    <div className="lg:hidden">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                      </div>
                    </div>
                    {/* Desktop: Vertical separator */}
                    <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:h-full">
                      <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-px bg-gray-300"></div>
                      <div className="relative bg-white px-3 py-2 text-sm text-gray-500 font-medium">OR</div>
                    </div>
                  </div>

                  {/* Reference Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alumni References
                    </label>
                    <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-900">
                        <strong>Alternative verification:</strong> Provide registration IDs of two existing alumni members who can confirm your identity.
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        💡 Just type the numbers only (e.g., type "200500125" and it will auto-format to "BGHSA-2005-00125")
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Reference 1
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`input-field pr-10 font-mono text-sm ${reference1Valid ? 'border-green-500 bg-green-50' : ''}`}
                          value={reference1}
                          onChange={(e) => {
                            const formatted = formatRegistrationId(e.target.value)
                            setReference1(formatted)
                            setReference1Valid(false)
                            setReference1Touched(false)
                          }}
                          onBlur={() => validateReference(reference1, true)}
                          placeholder="200500125"
                          maxLength={18}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {reference1Checking && (
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          )}
                          {!reference1Checking && reference1 && (
                            <CheckCircle2 className={`h-5 w-5 ${reference1Valid ? 'text-green-600' : 'text-red-500'}`} />
                          )}
                        </div>
                      </div>
                      {reference1Valid && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          ✓ Valid format
                        </p>
                      )}
                      {reference1Touched && reference1 && !reference1Valid && !reference1Checking && (
                        <p className="text-xs text-red-600 mt-1">
                          ✗ Invalid format. Expected 9 digits: YYYY + XXXXX (e.g., type "200500125")
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Reference 2
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`input-field pr-10 font-mono text-sm ${reference2Valid ? 'border-green-500 bg-green-50' : ''}`}
                          value={reference2}
                          onChange={(e) => {
                            const formatted = formatRegistrationId(e.target.value)
                            setReference2(formatted)
                            setReference2Valid(false)
                            setReference2Touched(false)
                          }}
                          onBlur={() => validateReference(reference2, false)}
                          placeholder="201000456"
                          maxLength={18}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {reference2Checking && (
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          )}
                          {!reference2Checking && reference2 && (
                            <CheckCircle2 className={`h-5 w-5 ${reference2Valid ? 'text-green-600' : 'text-red-500'}`} />
                          )}
                        </div>
                      </div>
                      {reference2Valid && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          ✓ Valid format
                        </p>
                      )}
                      {reference2Touched && reference2 && !reference2Valid && !reference2Checking && (
                        <p className="text-xs text-red-600 mt-1">
                          ✗ Invalid format. Expected 9 digits: YYYY + XXXXX (e.g., type "201000456")
                        </p>
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

                {/* Membership Fee Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Life Membership Fee Information</h4>
                      <p className="text-sm text-green-700 mt-1">
                        After your registration is approved, you'll be required to pay a <strong>one-time life membership fee</strong> to activate your alumni membership. 
                        This helps support our alumni association activities and events.
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        💡 Payment details and amount will be shared via email after approval.
                      </p>
                    </div>
                  </div>
                </div>
                
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
          {!emailVerifiedRequired && (
            <p className="text-xs text-gray-600 mt-2">Verify email with OTP to complete registration.</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-600">Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Login</Link></p>
      </div>
    </div>
  )
}


