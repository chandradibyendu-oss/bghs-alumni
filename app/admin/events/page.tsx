'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  Search,
} from 'lucide-react'

type EventRow = {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  max_attendees: number
  current_attendees: number
  image_url?: string | null
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const router = useRouter()

  useEffect(() => {
    verifyAccess()
    fetchEvents()
  }, [])

  const verifyAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const perms = await getUserPermissions(user.id)
    const allowed = hasPermission(perms, 'can_manage_events') || hasPermission(perms, 'can_access_admin')
    if (!allowed) {
      alert('You do not have permission to manage events.')
      router.push('/dashboard')
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      setEvents((data || []) as EventRow[])
    } catch (e) {
      console.error('Failed to load events', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const s = search.trim().toLowerCase()
      const matchSearch = !s || e.title.toLowerCase().includes(s) || e.description.toLowerCase().includes(s) || e.location.toLowerCase().includes(s)
      const matchCategory = !category || e.category === category
      return matchSearch && matchCategory
    })
  }, [events, search, category])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading events...</p>
      </div>
    )
  }

  const categories = Array.from(new Set(events.map(e => e.category))).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/bghs-logo.png" alt="BGHS Alumni" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900">Admin - Events</span>
          </div>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-600">Create and manage events & reunions</p>
          </div>
          <div className="flex gap-3">
            <Link href="/events" className="btn-secondary">
              View Public Events
            </Link>
            <Link href="/admin/events/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-5 w-5" /> Create Event
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search by title, location, or description"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((e) => (
            <div key={e.id} className="card border border-gray-200">
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {e.image_url ? (
                  <Image
                    src={e.image_url}
                    alt={e.title}
                    width={400}
                    height={225}
                    className="rounded-lg object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Calendar className="h-12 w-12 mb-2" />
                    <span className="text-sm">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{e.title}</h3>
              <p className="text-gray-600 line-clamp-2 mb-3">{e.description}</p>
              <div className="space-y-1 text-sm text-gray-700 mb-4">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /> {new Date(e.date).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /> {e.time}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {e.location}</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" /> {e.current_attendees}/{e.max_attendees}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/events/${e.id}`} className="btn-secondary flex-1 text-center">View</Link>
                <Link href={`/admin/events/${e.id}/edit`} className="btn-primary flex-1 text-center">Edit</Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No events found.</div>
          )}
        </div>
      </div>
    </div>
  )
}


