'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, User, GraduationCap, Lock, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [batchYear, setBatchYear] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

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

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, first_name: firstName.trim(), middle_name: middleName.trim() || undefined, last_name: lastName.trim(), full_name: `${firstName.trim()} ${middleName ? middleName.trim() + ' ' : ''}${lastName.trim()}`.trim(), batch_year: batchYear })
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name (optional)</label>
              <input className="input-field" value={middleName} onChange={e=>setMiddleName(e.target.value)} placeholder="Middle name" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="input-field" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="email" className="input-field pl-10" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
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

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold disabled:opacity-50">{loading ? 'Submitting...' : 'Register'}</button>
        </form>

        <p className="text-center text-sm text-gray-600">Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Login</Link></p>
      </div>
    </div>
  )
}


