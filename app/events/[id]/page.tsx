'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Share2,
  Info,
  Phone,
  Mail,
  Camera,
  Eye,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'


function TierSection({
  title,
  sponsors,
}: {
  title: string
  sponsors: { name: string; logo_url: string; website_url: string; banner_url?: string; description?: string; tier: string }[]
}) {
  if (!sponsors || sponsors.length === 0) return null
  
  // Different layouts based on tier
  const isPlatinum = title === 'Platinum'
  const isGold = title === 'Gold'
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></span>
        {title} Sponsors
      </h3>
      
      {isPlatinum ? (
        // Platinum: Large banner display
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sponsors.map((sponsor) => (
            <div key={sponsor.name} className="group">
              <Link
                href={sponsor.website_url || '#'}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="block bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[16/9] bg-gray-50 rounded-lg overflow-hidden mb-4">
                  {(sponsor.banner_url || sponsor.logo_url) ? (
                    <Image
                      src={sponsor.banner_url || sponsor.logo_url}
                      alt={`${sponsor.name} — ${title} Sponsor`}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🏢</div>
                        <div className="text-sm font-medium">{sponsor.name}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-1">{sponsor.name}</h4>
                  {sponsor.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{sponsor.description}</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : isGold ? (
        // Gold: Medium banner display
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor) => (
            <div key={sponsor.name} className="group">
              <Link
                href={sponsor.website_url || '#'}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden mb-3">
                  {(sponsor.banner_url || sponsor.logo_url) ? (
                    <Image
                      src={sponsor.banner_url || sponsor.logo_url}
                      alt={`${sponsor.name} — ${title} Sponsor`}
                      width={300}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🏢</div>
                        <div className="text-xs font-medium">{sponsor.name}</div>
                      </div>
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 text-sm text-center">{sponsor.name}</h4>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        // Silver/Bronze: Compact logo display
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sponsors.map((sponsor) => (
            <div key={sponsor.name} className="group">
              <Link
                href={sponsor.website_url || '#'}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-primary-300 hover:shadow-sm transition-all duration-300"
              >
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  {(sponsor.banner_url || sponsor.logo_url) ? (
                    <Image
                      src={sponsor.banner_url || sponsor.logo_url}
                      alt={`${sponsor.name} — ${title} Sponsor`}
                      width={120}
                      height={120}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-2xl mb-1">🏢</div>
                      <div className="text-xs font-medium">{sponsor.name}</div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null)
  const [eventPhotos, setEventPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [photosLoading, setPhotosLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get sponsors from event metadata, fallback to mock data if none
  const eventSponsors = event?.metadata?.sponsors || []
  const mockSponsors = [
    { name: 'Acme Foundation', logo_url: '/bghs-logo.png', website_url: 'https://example.com', tier: 'Platinum' },
    { name: 'Globex Corp', logo_url: '/school-building.jpg', website_url: 'https://example.com', tier: 'Gold' },
    { name: 'Initech Inc', logo_url: '/school-building.jpg', website_url: 'https://example.com', tier: 'Gold' },
    { name: 'Umbrella Corp', logo_url: '/school-building.jpg', website_url: 'https://example.com', tier: 'Silver' },
    { name: 'Hooli Inc', logo_url: '/school-building.jpg', website_url: 'https://example.com', tier: 'Silver' },
    { name: 'Wonka Industries', logo_url: '/school-building.jpg', website_url: 'https://example.com', tier: 'Silver' },
  ]
  
  // Use event sponsors if available, otherwise use mock data
  const displaySponsors = eventSponsors.length > 0 ? eventSponsors : mockSponsors

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  useEffect(() => {
    if (event) {
      fetchEventPhotos()
    }
  }, [event])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error('Error fetching event:', error)
      setError('Event not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchEventPhotos = async () => {
    try {
      setPhotosLoading(true)
      const { data, error } = await supabase
        .from('gallery_photos')
        .select(`
          id,
          title,
          description,
          file_url,
          thumbnail_url,
          created_at,
          profiles(full_name)
        `)
        .eq('event_id', params.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(12) // Show first 12 photos

      if (error) throw error
      setEventPhotos(data || [])
    } catch (error) {
      console.error('Error fetching event photos:', error)
    } finally {
      setPhotosLoading(false)
    }
  }

  const handlePhotoClick = (photo: any) => {
    // Redirect to gallery with event filter
    window.location.href = `/gallery?event=${params.id}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/events" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const dateText = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar & breadcrumbs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/events" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" /> Back to Events
          </Link>
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
            <span>Events & Reunions</span>
            <span>/</span>
            <span className="text-gray-700 font-medium">{event.title}</span>
          </div>
        </div>
      </div>

      {/* Hero section */}
      <section className="relative text-white overflow-hidden min-h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-600 to-primary-700"></div>
          )}
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Top Section - Event Title & Description */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl leading-tight">
              {event.title}
            </h1>
            <p className="text-xl text-white/90 max-w-4xl mx-auto drop-shadow-lg leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Bottom Section - Event Details & Actions */}
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            {/* Left Side - Event Info Cards */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/25 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20">
                  <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white/80 text-sm font-medium">Date</div>
                    <div className="text-white font-semibold text-sm leading-tight">{dateText}</div>
                  </div>
                </div>
                <div className="bg-white/25 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20">
                  <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white/80 text-sm font-medium">Time</div>
                    <div className="text-white font-semibold text-sm">{event.time}</div>
                  </div>
                </div>
                <div className="bg-white/25 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20">
                  <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white/80 text-sm font-medium">Location</div>
                    <div className="text-white font-semibold text-sm leading-tight break-words">{event.location}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <button className="bg-white text-primary-700 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl flex items-center gap-3 text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                  <Ticket className="h-5 w-5" /> 
                  Register Now
                </button>
                <button className="bg-white/20 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/30 font-semibold px-8 py-4 rounded-xl flex items-center gap-3 text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                  <Share2 className="h-5 w-5" /> 
                  Share Event
                </button>
              </div>
            </div>

            {/* Right Side - Attendee Counter */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-2xl">
                <div className="text-5xl font-bold text-white mb-2">{event.current_attendees}</div>
                <div className="text-white/90 text-lg font-medium mb-1">Attendees</div>
                <div className="text-white/70 text-sm">of {event.max_attendees} maximum</div>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500" 
                    style={{ width: `${Math.min((event.current_attendees / event.max_attendees) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Sponsors section — inline on detail page */}
          <section aria-labelledby="sponsors-heading" className="scroll-mt-20" id="sponsors">
            <h2 id="sponsors-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Sponsors
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <TierSection title="Platinum" sponsors={displaySponsors.filter((s: any) => s.tier === 'Platinum')} />
                        <TierSection title="Gold" sponsors={displaySponsors.filter((s: any) => s.tier === 'Gold')} />
                        <TierSection title="Silver" sponsors={displaySponsors.filter((s: any) => s.tier === 'Silver')} />
                        <TierSection title="Bronze" sponsors={displaySponsors.filter((s: any) => s.tier === 'Bronze')} />

                        {(!displaySponsors.length) && (
                          <p className="text-gray-500">Sponsor roster will be announced soon.</p>
                        )}

              <div className="mt-6 text-center">
                <Link href="#" className="btn-secondary inline-block">
                  Become a sponsor
                </Link>
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About this event</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          </section>

          {/* Event Photos */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary-600" />
                Event Photos
              </h2>
              {eventPhotos.length > 0 && (
                <Link 
                  href={`/gallery?event=${params.id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View All
                </Link>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {photosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600">Loading photos...</span>
                </div>
              ) : eventPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {eventPhotos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="group relative cursor-pointer"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={photo.thumbnail_url || photo.file_url}
                          alt={photo.title}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Hover overlay with photo details */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <h3 className="font-medium text-sm mb-1 line-clamp-1">
                            {photo.title}
                          </h3>
                          <p className="text-xs text-white/80">
                            by {photo.profiles?.full_name || 'Anonymous'}
                          </p>
                        </div>
                        
                        {/* View icon in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Eye className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No photos uploaded yet</p>
                  <p className="text-sm text-gray-400">
                    Photos from this event will appear here once uploaded
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Schedule (sample) */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Schedule</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
              {[
                { t: '5:30 PM', d: 'Registration & Welcome Tea' },
                { t: '6:00 PM', d: 'Opening Ceremony & School Song' },
                { t: '6:30 PM', d: 'Alumni Awards & Speeches' },
                { t: '7:30 PM', d: 'Cultural Program' },
                { t: '9:00 PM', d: 'Dinner & Networking' },
              ].map((row) => (
                <div key={row.t} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{row.t}</span>
                  </div>
                  <span className="text-gray-600">{row.d}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Venue & map placeholder */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Venue</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 text-gray-700 mb-4">
                <MapPin className="h-5 w-5 text-primary-600" />
                <span>{event.location}</span>
              </div>
              <div className="aspect-video bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                Map preview coming soon
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">FAQs</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
              {[
                { q: 'Is prior registration required?', a: 'Yes, please register to help us plan seating and catering.' },
                { q: 'Can I bring family members?', a: 'Family members are welcome for the reunion dinner.' },
                { q: 'Is there a dress code?', a: 'Smart casual or school colors are encouraged.' },
              ].map((f) => (
                <div key={f.q} className="p-4">
                  <p className="font-medium text-gray-900 flex items-center gap-2"><Info className="h-4 w-4 text-primary-600" /> {f.q}</p>
                  <p className="text-gray-600 mt-1">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Event details</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /> {dateText}</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /> 6:00 PM</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {event.location}</li>
            </ul>
            <button className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              <Ticket className="h-4 w-4" /> Register
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Contact</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> events@alumnibghs.org</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}


