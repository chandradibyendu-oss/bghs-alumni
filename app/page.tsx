'use client'

import Link from 'next/link'
import { Calendar, Users, BookOpen, Heart, GraduationCap, MapPin, ChevronLeft, ChevronRight, Star, Trophy, Award, Menu as MenuIcon, X, User as UserIcon, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
// Removed getUserPermissions import - using direct role check for performance

// Slideshow data
const slideshowData = [
  {
    id: 1,
    type: 'welcome',
    title: 'Welcome to BGHS Alumni',
    subtitle: 'Connect with fellow alumni from Barasat Peary Charan Sarkar Government High School',
    description: 'Stay updated with school events, network with former classmates, and contribute to your alma mater\'s legacy.',
    backgroundImage: '/school-building.jpg',
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
    backgroundImage: '/school-building.jpg',
    icon: Star,
    cta: {
      primary: { text: 'View Gallery', href: '/gallery' },
      secondary: { text: 'Upload Photos', href: '/gallery' }
    }
  },
  {
    id: 2,
    type: 'event',
    title: 'Annual Alumni Reunion 2024',
    subtitle: 'Save the Date: December 15, 2024',
    description: 'Join us for our biggest reunion event of the year. Reconnect with old friends, meet new alumni, and celebrate our shared memories.',
    backgroundImage: '/school-building.jpg',
    icon: Calendar,
    cta: {
      primary: { text: 'Register Now', href: '/events' },
      secondary: { text: 'View Details', href: '/events' }
    }
  },
  {
    id: 3,
    type: 'hall-of-fame',
    title: 'Hall of Fame',
    subtitle: 'Celebrating Our Distinguished Alumni',
    description: 'Meet our alumni who have made significant contributions in their fields - from science and technology to arts and social service.',
    backgroundImage: '/school-building.jpg',
    icon: Trophy,
    cta: {
      primary: { text: 'View Hall of Fame', href: '/hall-of-fame' },
      secondary: { text: 'Nominate Alumni', href: '/nominate' }
    }
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Recent Achievements',
    subtitle: 'Alumni Making Headlines',
    description: 'Dr. Rajesh Kumar (Batch 1995) receives the prestigious Padma Shri award for his contributions to medical research.',
    backgroundImage: '/school-building.jpg',
    icon: Award,
    cta: {
      primary: { text: 'Read More', href: '/blog' },
      secondary: { text: 'Share Achievement', href: '/share' }
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
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)

  // Helper function to detect placeholder email
  const isPlaceholderEmail = (email: string | null | undefined): boolean => {
    if (!email) return false
    const placeholderPattern = /^[A-Za-z0-9]+@alumnibghs\.org$/i
    return placeholderPattern.test(email.trim())
  }

  // Check localStorage for dismissal
  const checkEmailPromptDismissed = (): boolean => {
    if (typeof window === 'undefined') return false
    const dismissed = localStorage.getItem('emailPromptDismissed')
    return dismissed === 'true'
  }

  // Handle dismissing the email prompt
  const handleDismissEmailPrompt = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailPromptDismissed', 'true')
    }
    setShowEmailPrompt(false)
  }

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowData.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowData.length) % slideshowData.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowData.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = slideshowData[currentSlide];
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
        
        const isAdmin = profile?.role === 'super_admin' || profile?.role === 'donation_manager' || profile?.role === 'event_manager' || profile?.role === 'content_moderator'
        setIsAdmin(isAdmin)

        // Check if user has placeholder email and hasn't dismissed the prompt
        if (isPlaceholderEmail(user.email) && !checkEmailPromptDismissed()) {
          setShowEmailPrompt(true)
        }
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

          // Check if user has placeholder email and hasn't dismissed the prompt
          if (isPlaceholderEmail(session.user.email) && !checkEmailPromptDismissed()) {
            setShowEmailPrompt(true)
          } else {
            setShowEmailPrompt(false)
          }
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
        setShowEmailPrompt(false)
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
              <Link href="/donate" className="text-gray-700 hover:text-primary-600 transition-colors">Donate</Link>
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

      {/* Placeholder Email Prompt Banner */}
      {showEmailPrompt && userEmail && (
        <div className="bg-amber-50 border-b border-amber-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  <Mail className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">
                    Update Your Email Address
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    You're currently using a placeholder email address. Please update it to your real email to receive important notifications and stay connected with the alumni community.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Update Email Now
                  </Link>
                </div>
              </div>
              <button
                onClick={handleDismissEmailPrompt}
                className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

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
              <Link href="/donate" className="block px-2 py-2 rounded hover:bg-gray-50">Donate</Link>
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

      {/* Hero Slideshow Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Video with Overlay */}
        <div className="absolute inset-0 z-0">
          <video 
            className="w-full h-full min-w-full min-h-full object-cover opacity-95"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            style={{
              objectFit: 'cover',
              objectPosition: 'center 10%'
            }}
          >
            <source src="/bghs-5mb.mp4" type="video/mp4" />
            {/* Fallback image if video fails to load */}
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${currentSlideData.backgroundImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </video>
          {/* Enhanced Overlay to match About page */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent-900/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
            {/* Icon for non-welcome slides */}
            {IconComponent && (
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-white to-accent-100 bg-clip-text text-transparent">
                {currentSlideData.title}
              </span>
            </h1>
            
            <h2 className="text-xl md:text-2xl text-white mb-6 drop-shadow-lg font-medium">
              {currentSlideData.subtitle}
            </h2>
            
            <p className="text-lg text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
              {currentSlideData.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={currentSlideData.cta.primary.href} 
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {currentSlideData.cta.primary.text}
              </Link>
              <Link 
                href={currentSlideData.cta.secondary.href} 
                className="bg-transparent text-white border-2 border-white/90 hover:bg-white hover:text-primary-600 font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {currentSlideData.cta.secondary.text}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {slideshowData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
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
                 <li><Link href="/donate" className="text-gray-400 hover:text-white transition-colors">Donate</Link></li>
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
