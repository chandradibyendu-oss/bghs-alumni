'use client'

import Link from 'next/link'
import { Calendar, Users, BookOpen, Heart, GraduationCap, MapPin, ChevronLeft, ChevronRight, Star, Menu as MenuIcon, X, User as UserIcon, LucideIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Blog posts will be fetched from database

// Removed getUserPermissions import - using direct role check for performance

// Type definitions for slides
type BaseSlide = {
  id: number
  type: string
  title: string
  subtitle: string
  description: string
  backgroundImage: string
  cta: {
    primary: { text: string; href: string }
    secondary: { text: string; href: string }
  }
  icon?: LucideIcon
}

type EventSlide = BaseSlide & {
  type: 'upcoming-event'
  location?: string
  eventDate?: string
  eventTime?: string
  eventId?: number | string
}

type BlogSlide = BaseSlide & {
  type: 'blog'
  blogId?: number
  author?: string
  date?: string
}

type RegularSlide = BaseSlide & {
  type: 'welcome' | 'event' | 'gallery' | 'hall-of-fame' | 'achievement' | 'blog'
}

type Slide = EventSlide | BlogSlide | RegularSlide

// Helper function to create blog slide from fetched blog data
const createBlogSlide = (blog: any): BlogSlide | null => {
  if (!blog) return null
  
  const readTime = blog.read_time ? `${blog.read_time} min read` : '5 min read'
  
  return {
    id: 20000 + (typeof blog.id === 'string' ? parseInt(blog.id.slice(0, 8), 16) : blog.id || 0),
    type: 'blog',
    title: blog.title,
    subtitle: `📝 ${blog.category} • ${readTime}`,
    description: blog.excerpt,
    backgroundImage: blog.image_url || '/hero-images/hero-2.jpg',
    icon: BookOpen,
    cta: {
      primary: { text: 'Read Article', href: `/blog/${blog.id}` },
      secondary: { text: 'View All Posts', href: '/blog' }
    },
    blogId: blog.id,
    author: blog.author?.full_name || 'Unknown Author',
    date: blog.created_at
  }
}

// Slideshow data
const slideshowData = [
  {
    id: 1,
    type: 'welcome',
    title: 'Welcome to BGHS Alumni',
    subtitle: 'Connect with fellow alumni from Barasat Peary Charan Sarkar Government High School',
    description: 'Stay updated with school events, network with former classmates, and contribute to your alma mater\'s legacy.',
    backgroundImage: '/hero-images/hero-1.jpg',
    cta: {
      primary: { text: 'Join Our Community', href: '/register' },
      secondary: { text: 'Learn More', href: '/about' }
    }
  },
  {
    id: 5,
    type: 'gallery',
    title: 'School Memories',
    subtitle: 'Browse Our Photo Gallery',
    description: 'Explore photos from school events, reunions, and memorable moments shared by our alumni community.',
    backgroundImage: '/hero-images/hero-5.jpg',
    icon: Star,
    cta: {
      primary: { text: 'View Gallery', href: '/gallery' },
      secondary: { text: 'Upload Photos', href: '/gallery' }
    }
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [allSlides, setAllSlides] = useState<Slide[]>(slideshowData as Slide[])
  const [latestBlog, setLatestBlog] = useState<any>(null)

  // Fetch latest blog post
  useEffect(() => {
    const fetchLatestBlog = async () => {
      try {
        // First try to get featured blog, if none, get the latest published blog
        let { data: featuredBlogs, error: featuredError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            author:profiles!blog_posts_author_id_fkey(full_name)
          `)
          .eq('published', true)
          .eq('status', 'published')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(1)

        let featuredBlog = null
        if (!featuredError && featuredBlogs && featuredBlogs.length > 0) {
          featuredBlog = featuredBlogs[0]
        }

        // If no featured blog, get the latest published blog
        if (!featuredBlog) {
          const { data: latestBlogs, error: latestError } = await supabase
            .from('blog_posts')
            .select(`
              *,
              author:profiles!blog_posts_author_id_fkey(full_name)
            `)
            .eq('published', true)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(1)
          
          if (!latestError && latestBlogs && latestBlogs.length > 0) {
            featuredBlog = latestBlogs[0]
          }
        }

        if (featuredBlog) {
          // Process author data if it's an array
          if (Array.isArray(featuredBlog.author) && featuredBlog.author.length > 0) {
            featuredBlog.author = featuredBlog.author[0]
          }
          setLatestBlog(featuredBlog)
        }
      } catch (error) {
        console.error('Error fetching latest blog:', error)
        // If error, latestBlog remains null and no blog slide will be shown
      }
    }

    fetchLatestBlog()
  }, [])

  // Fetch upcoming events and build slides (can be disabled via env var)
  useEffect(() => {
    const showEventsInHero = process.env.NEXT_PUBLIC_SHOW_EVENTS_IN_HERO !== 'false'
    
    if (!showEventsInHero) {
      // Events disabled, but still show Welcome first, then blog, then other slides
      const welcomeSlide = slideshowData.find(slide => slide.type === 'welcome')
      const otherStaticSlides = slideshowData.filter(slide => slide.type !== 'welcome')
      
      const orderedSlides: Slide[] = []
      if (welcomeSlide) orderedSlides.push(welcomeSlide as Slide)
      
      const blogSlide = createBlogSlide(latestBlog)
      if (blogSlide) {
        orderedSlides.push(blogSlide)
      }
      
      orderedSlides.push(...otherStaticSlides as Slide[])
      setAllSlides(orderedSlides)
      return
    }

    const fetchUpcomingEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(3) // Show up to 3 upcoming events

        if (error) throw error

        if (data && data.length > 0) {
          setUpcomingEvents(data)
          
          // Create event slides
          const eventSlides = data.map((event, idx) => ({
            id: 10000 + (typeof event.id === 'number' ? event.id : parseInt(event.id) || idx),
            type: 'upcoming-event',
            title: event.title,
            subtitle: `📅 ${new Date(event.date).toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} at ${event.time}`,
            description: event.description || `Join us at ${event.location}`,
            location: event.location,
            eventDate: event.date,
            eventTime: event.time,
            eventId: event.id,
            backgroundImage: event.image_url || '/school-building.jpg',
            icon: Calendar,
            cta: {
              primary: { text: 'Register Now', href: `/events/${event.id}` },
              secondary: { text: 'View All Events', href: '/events' }
            }
          }))
          
          // Add blog slide if available
          let dynamicSlides: Slide[] = [...eventSlides] as Slide[]
          const blogSlide = createBlogSlide(latestBlog)
          if (blogSlide) {
            dynamicSlides.push(blogSlide)
          }
          
          // Separate Welcome slide from other static slides
          const welcomeSlide = slideshowData.find(slide => slide.type === 'welcome')
          const otherStaticSlides = slideshowData.filter(slide => slide.type !== 'welcome')
          
          // Combine in order: Welcome, Events, Blog, Other Static Slides
          const orderedSlides: Slide[] = []
          if (welcomeSlide) orderedSlides.push(welcomeSlide as Slide)
          orderedSlides.push(...dynamicSlides)
          orderedSlides.push(...otherStaticSlides as Slide[])
          
          setAllSlides(orderedSlides)
        } else {
          // No events, but still add blog slide
          const welcomeSlide = slideshowData.find(slide => slide.type === 'welcome')
          const otherStaticSlides = slideshowData.filter(slide => slide.type !== 'welcome')
          
          const orderedSlides: Slide[] = []
          if (welcomeSlide) orderedSlides.push(welcomeSlide as Slide)
          
          const blogSlide = createBlogSlide(latestBlog)
          if (blogSlide) {
            orderedSlides.push(blogSlide)
          }
          
          orderedSlides.push(...otherStaticSlides as Slide[])
          setAllSlides(orderedSlides)
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error)
        // On error, still show Welcome first, then blog, then other slides
        const welcomeSlide = slideshowData.find(slide => slide.type === 'welcome')
        const otherStaticSlides = slideshowData.filter(slide => slide.type !== 'welcome')
        
        const orderedSlides: Slide[] = []
        if (welcomeSlide) orderedSlides.push(welcomeSlide as Slide)
        
        const blogSlide = createBlogSlide(latestBlog)
        if (blogSlide) {
          orderedSlides.push(blogSlide)
        }
        
        orderedSlides.push(...otherStaticSlides as Slide[])
        setAllSlides(orderedSlides)
      }
    }
    fetchUpcomingEvents()
  }, [latestBlog]) // Re-run when latestBlog changes

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, allSlides.length]);


  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + allSlides.length) % allSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % allSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = allSlides[currentSlide];
  const IconComponent = currentSlideData.icon;

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)
      if (user) {
        // Quick admin check based on role (no additional database queries)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'super_admin' || profile?.role === 'donation_manager' || profile?.role === 'event_manager' || profile?.role === 'content_moderator' || profile?.role === 'blog_moderator' || profile?.role === 'content_creator'
        setIsAdmin(isAdmin)
      } else {
        setIsAdmin(false)
      }
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (session?.user) {
        // Quick admin check based on role (no additional database queries)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          const isAdmin = profile?.role === 'super_admin' || profile?.role === 'donation_manager' || profile?.role === 'event_manager' || profile?.role === 'content_moderator'
          setIsAdmin(isAdmin)
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
                <MenuIcon className="h-6 w-6 text-gray-700" />
              </button>
              <img 
                src="/bghs-logo.png" 
                alt="BGHS Alumni Association" 
                className="h-14 w-auto object-contain shrink-0 flex-none"
              />
              <div className="flex flex-col min-w-0 max-w-[60vw] sm:max-w-none">
                <span className="text-2xl font-bold text-gray-900 truncate">BGHS Alumni</span>
                <span className="text-sm text-gray-600 truncate">বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">About</Link>
              <Link href="/events" className="text-gray-700 hover:text-primary-600 transition-colors">Events</Link>
              <Link href="/directory" className="text-gray-700 hover:text-primary-600 transition-colors">Directory</Link>
              <Link href="/gallery" className="text-gray-700 hover:text-primary-600 transition-colors">Gallery</Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">Blog</Link>
              {userEmail ? (
                <div className="relative">
                  <button onClick={() => setAccountOpen(!accountOpen)} className="flex items-center space-x-2 px-3 py-1 border rounded-md text-gray-700 hover:text-gray-900">
                    <UserIcon className="h-4 w-4" />
                    <span className="text-sm">Account</span>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-3 text-sm text-gray-600 border-b">{userEmail}</div>
                      <div className="py-1">
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                        {isAdmin && (
                          <>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
                            <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Users</Link>
                            <Link href="/admin/events" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Events</Link>
                            <Link href="/admin/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Blog Management</Link>
                          </>
                        )}
                        <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary">Login</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="h-6 w-6" /></button>
            </div>
            <nav className="space-y-2">
              <Link href="/about" className="block px-2 py-2 rounded hover:bg-gray-50">About</Link>
              <Link href="/events" className="block px-2 py-2 rounded hover:bg-gray-50">Events</Link>
              <Link href="/directory" className="block px-2 py-2 rounded hover:bg-gray-50">Directory</Link>
              <Link href="/gallery" className="block px-2 py-2 rounded hover:bg-gray-50">Gallery</Link>
              <Link href="/blog" className="block px-2 py-2 rounded hover:bg-gray-50">Blog</Link>
              <div className="pt-2 border-t mt-2">
                {userEmail ? (
                  <>
                    <Link href="/dashboard" className="block px-2 py-2 rounded hover:bg-gray-50">Dashboard</Link>
                    <Link href="/profile" className="block px-2 py-2 rounded hover:bg-gray-50">My Profile</Link>
                    {isAdmin && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
                        <Link href="/admin/users" className="block px-2 py-2 rounded hover:bg-gray-50">Users</Link>
                        <Link href="/admin/events" className="block px-2 py-2 rounded hover:bg-gray-50">Events</Link>
                        <Link href="/admin/blog" className="block px-2 py-2 rounded hover:bg-gray-50">Blog Management</Link>
                      </>
                    )}
                    <button onClick={handleSignOut} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">Logout</button>
                  </>
                ) : (
                  <Link href="/login" className="block px-2 py-2 rounded hover:bg-gray-50">Login</Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Slideshow Section - Responsive height for mobile and desktop */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh] xl:h-[85vh] overflow-hidden mt-0">
        {/* Background - Slide-specific images with smooth transitions */}
        <div className="absolute inset-0 z-0 -mt-0">
          {/* Show slide-specific background image with fade and zoom transitions (Ken Burns effect) */}
          <div className="relative w-full h-full overflow-hidden">
            {currentSlideData.backgroundImage && (
              <div 
                key={currentSlideData.id}
                className="absolute inset-0 opacity-100 z-10 ken-burns-zoom-out"
                style={{
                  backgroundImage: `url('${currentSlideData.backgroundImage}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#000',
                  transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform, opacity'
                }}
              />
            )}
          </div>
          {/* Enhanced Overlay to match About page */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/50 z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent-900/20 z-20"></div>
        </div>
        
        {/* Event Badge - Positioned absolutely at top for always visibility */}
        {currentSlideData.type === 'upcoming-event' && (
          <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-30">
            <span className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-accent-500/95 backdrop-blur-md text-white rounded-full text-xs sm:text-sm font-bold shadow-2xl ring-2 ring-accent-400/50">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Upcoming Event</span>
            </span>
          </div>
        )}
        
        {/* Content */}
        <div className={`relative z-10 h-full flex items-center justify-center pb-28 sm:pb-0 ${currentSlideData.type === 'upcoming-event' ? 'pt-12 sm:pt-16' : 'pt-12 sm:pt-0'}`}>
          <div className="max-w-7xl mx-auto px-12 sm:px-6 lg:px-8 text-center w-full py-4 sm:py-0">
            {/* Icon for non-welcome slides (hide for event slides since we have the badge at top) */}
            {IconComponent && currentSlideData.type !== 'upcoming-event' && (
              <div className="mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 backdrop-blur-sm rounded-full bg-white/20">
                  <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
            )}
            
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-accent-100 bg-clip-text text-transparent">
                {currentSlideData.title}
              </span>
            </h1>
            
            <h2 className="text-sm sm:text-xl md:text-2xl text-white mb-4 sm:mb-6 drop-shadow-lg font-medium">
              {currentSlideData.subtitle}
            </h2>
            
            {currentSlideData.type === 'upcoming-event' && (currentSlideData as EventSlide).location && (
              <div className="mb-3 sm:mb-4 flex items-center justify-center gap-2 text-white/90">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-lg drop-shadow-md">{(currentSlideData as EventSlide).location}</span>
              </div>
            )}
            
            <p className="text-base sm:text-lg text-white mb-6 sm:mb-8 max-w-3xl mx-auto drop-shadow-md px-2">
              {currentSlideData.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={currentSlideData.cta.primary.href} 
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {currentSlideData.cta.primary.text}
              </Link>
              <Link 
                href={currentSlideData.cta.secondary.href} 
                className="bg-transparent text-white border-2 border-white/90 hover:bg-white hover:text-primary-600 font-semibold text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {currentSlideData.cta.secondary.text}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-200"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {allSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? slide.type === 'upcoming-event'
                    ? 'bg-accent-400 scale-125 ring-2 ring-accent-300'
                    : 'bg-white scale-125'
                  : slide.type === 'upcoming-event'
                    ? 'bg-accent-400/50 hover:bg-accent-400/75'
                    : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* School Info */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Barasat Govt. High School</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Established in 1856, BGHS has been shaping young minds and building character for over 165 years. 
              Our alumni network spans across the globe, representing excellence in various fields. Barasat Government High School's name was officially changed to Barasat Peary Charan Sarkar Government High School in 1996 to honor its founder, Peary Charan Sarkar. The change was made by the order of the Governor, to immortalize his contribution to the school, and it coincided with the institution's 150th anniversary
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence in Education</h3>
              <p className="text-gray-600">Providing quality education and fostering academic excellence since 1856</p>
            </div>
            <div className="text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Located in Barasat</h3>
              <p className="text-gray-600">Situated in the heart of North 24 Parganas, West Bengal</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Strong Alumni Network</h3>
              <p className="text-gray-600">Thousands of successful alumni across various professions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-lg text-gray-600">Discover the features that make our alumni community special</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center hover:shadow-lg transition-shadow">
              <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Events & Reunions</h3>
              <p className="text-gray-600">Stay updated with school events, reunions, and networking opportunities</p>
            </div>
            <div className="card text-center hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Alumni Directory</h3>
              <p className="text-gray-600">Connect with former classmates and expand your professional network</p>
            </div>
            <div className="card text-center hover:shadow-lg transition-shadow">
              <BookOpen className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog & News</h3>
              <p className="text-gray-600">Read stories, achievements, and updates from our alumni community</p>
            </div>
            <div className="card text-center hover:shadow-lg transition-shadow">
              <Heart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Donations</h3>
              <p className="text-gray-600">Support your alma mater through various donation programs</p>
            </div>
          </div>
        </div>
      </section>

             {/* CTA Section - Only show for non-logged-in users */}
       {!userEmail && (
         <section className="py-16 bg-primary-600">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <h2 className="text-3xl font-bold text-white mb-4">Ready to Reconnect?</h2>
             <p className="text-xl text-primary-100 mb-4">
               Join thousands of BGHS alumni who are already part of our growing community
             </p>
             <p className="text-lg text-primary-200 mb-8">
               বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়
             </p>

             <Link href="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
               Get Started Today
             </Link>
           </div>
         </section>
       )}

             {/* Footer */}
       <footer className="bg-gray-900 text-white py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-4 gap-8">
             <div>
               <div className="flex items-center space-x-3 mb-4">
                 <img 
                   src="/bghs-logo.png" 
                   alt="BGHS Alumni Association" 
                   className="h-14 w-auto object-contain shrink-0"
                 />
                 <div className="flex flex-col">
                   <span className="text-lg font-semibold">BGHS Alumni</span>
                   <span className="text-xs text-gray-400">বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়</span>
                 </div>
               </div>
               <p className="text-gray-400">
                 Connecting alumni from Barasat Govt. High School (Now Barasat Peary Charan Sarkar Government High School) since 1856
               </p>
             </div>
                         <div>
               <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
               <ul className="space-y-2">
                 <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                 <li><Link href="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
                 <li><Link href="/directory" className="text-gray-400 hover:text-white transition-colors">Directory</Link></li>
                 <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
               </ul>
             </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Barasat, North 24 Parganas</li>
                <li>West Bengal, India</li>
                <li>Email: admin@alumnibghs.org</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BGHS Alumni Association. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
