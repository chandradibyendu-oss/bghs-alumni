'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function ResetInitialPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

  const submit = async () => {
    if (!strongPw.test(password)) { toast.error('Use 8+ chars with upper, lower, number, and symbol'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Update password directly via current session
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      // Clear the flag and sign out to force fresh login
      await supabase.auth.updateUser({ data: { must_change_password: false } as any })
      await supabase.auth.signOut()
      toast.success('Password updated. Please sign in again.')
      router.push('/login')
    } catch (e) {
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Set a new password</h1>
        <p className="text-sm text-gray-600 mb-4">For security, please change the temporary password provided by the administrator.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" className="input-field" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" />
            <p className="text-xs text-gray-500 mt-1">8+ chars with uppercase, lowercase, number, and symbol.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" className="input-field" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" />
          </div>
          <button onClick={submit} disabled={loading} className="btn-primary w-full py-2 disabled:opacity-50">{loading ? 'Updating...' : 'Update Password'}</button>
        </div>
      </div>
    </div>
  )
}


