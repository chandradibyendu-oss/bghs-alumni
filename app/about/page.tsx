'use client'

import Link from 'next/link'
import { Calendar, Users, BookOpen, Heart, GraduationCap, MapPin, Award, Clock, Building, Star, Trophy, ChevronRight, Menu as MenuIcon, X, User as UserIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission, UserPermissions } from '@/lib/auth-utils'

// Language content
const content = {
  en: {
    // Navigation
    about: 'About',
    events: 'Events',
    directory: 'Directory',
    gallery: 'Gallery',
    blog: 'Blog',
    donate: 'Donate',
    account: 'Account',
    dashboard: 'Dashboard',
    profile: 'My Profile',
    admin: 'Admin',
    users: 'Users',
    logout: 'Logout',
    login: 'Login',
    menu: 'Menu',
    
    // Hero Section
    heroTitle: 'About Our School',
    heroSubtitle: 'Barasat Peary Charan Sarkar Government High School',
    heroBengali: 'বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়',
    
    // School Overview
    heritageTitle: 'Our Rich Heritage',
    heritageText1: 'Established in 1856 by the visionary educator Peary Charan Sarkar, Barasat Government High School has been a beacon of educational excellence for over 168 years. Originally founded as a small institution, it has grown into one of West Bengal\'s most prestigious educational establishments.',
    heritageText2: 'In 1996, on the occasion of its 150th anniversary, the school was officially renamed to "Barasat Peary Charan Sarkar Government High School" to honor its founder\'s immense contribution to education and social reform.',
    heritageText3: 'Today, our school continues to uphold the values of academic excellence, character building, and community service that were instilled by our founder over a century and a half ago.',
    established: 'Established 1856',
    yearsExcellence: 'Over 168 years of educational excellence',
    
    // Timeline
    timelineTitle: 'Our Journey Through Time',
    timelineSubtitle: 'A timeline of key milestones in our school\'s illustrious history',
    timeline: [
      {
        year: '1856',
        title: 'Foundation',
        description: 'Barasat Government High School was established by Peary Charan Sarkar, a visionary educator and social reformer.',
        icon: Building
      },
      {
        year: '1860s',
        title: 'Early Growth',
        description: 'The school quickly gained recognition for its quality education and became a beacon of learning in North 24 Parganas.',
        icon: BookOpen
      },
      {
        year: '1900s',
        title: 'Expansion Era',
        description: 'The school expanded its curriculum and facilities, establishing itself as one of the premier educational institutions in West Bengal.',
        icon: GraduationCap
      },
      {
        year: '1996',
        title: 'Name Change',
        description: 'Officially renamed to "Barasat Peary Charan Sarkar Government High School" to honor its founder on the 150th anniversary.',
        icon: Award
      },
      {
        year: '2000s',
        title: 'Modern Era',
        description: 'Continued excellence in education with modern facilities and updated curriculum while maintaining traditional values.',
        icon: Star
      },
      {
        year: '2024',
        title: 'Present Day',
        description: 'Over 168 years of educational excellence, producing thousands of successful alumni across various fields.',
        icon: Trophy
      }
    ],
    
    // Achievements
    achievementsTitle: 'Our Achievements',
    achievementsSubtitle: 'Celebrating our legacy of excellence and impact',
    achievements: [
      {
        title: '168+ Years of Excellence',
        description: 'One of the oldest and most prestigious schools in West Bengal',
        icon: Clock
      },
      {
        title: '5000+ Alumni',
        description: 'Thousands of successful graduates across various professions',
        icon: Users
      },
      {
        title: 'Academic Excellence',
        description: 'Consistently high academic performance and board results',
        icon: GraduationCap
      },
      {
        title: 'Cultural Heritage',
        description: 'Rich tradition of cultural activities and sports achievements',
        icon: Trophy
      }
    ],
    
    // Notable Alumni
    alumniTitle: 'Notable Alumni',
    alumniSubtitle: 'Our distinguished graduates who have made significant contributions to society',
    alumni: [
      {
        name: 'Soumitra Chatterjee',
        batch: '',
        achievement: 'Dadasaheb Phalke Awardee',
        field: 'Indian Cinema',
        description: 'Renowned  actor, play-director, playwright, writer, thespian and poet',
        photo: '/notable-alumni/soumitra-chatterjee.png' // Placeholder - replace with actual alumni photos
      },
      {
        name: 'Prof. Anjali Chatterjee',
        batch: '1988',
        achievement: 'National Science Award',
        field: 'Physics',
        description: 'Leading physicist and academician',
        photo: '/bghs-logo.png' // Placeholder - replace with actual alumni photos
      },
      {
        name: 'Mr. Suresh Mondal',
        batch: '1992',
        achievement: 'IAS Officer',
        field: 'Civil Services',
        description: 'Distinguished civil servant and administrator',
        photo: '/bghs-logo.png' // Placeholder - replace with actual alumni photos
      },
      {
        name: 'Dr. Priya Sen',
        batch: '2001',
        achievement: 'Entrepreneur of the Year',
        field: 'Technology',
        description: 'Successful tech entrepreneur and innovator',
        photo: '/bghs-logo.png' // Placeholder - replace with actual alumni photos
      }
    ],
    viewAllAlumni: 'View All Notable Alumni',
    
    // Mission & Vision
    missionTitle: 'Alumni Mission',
    missionText: 'To connect, support, and celebrate our alumni community while fostering lifelong relationships and professional networks. We are committed to maintaining strong ties with our alma mater, supporting current students, and contributing to the continued excellence of Barasat Peary Charan Sarkar Government High School.',
    visionTitle: 'Alumni Vision',
    visionText: 'To build a vibrant, engaged alumni community that serves as a bridge between past and present students, fostering mentorship, collaboration, and mutual support. We envision our alumni association as a catalyst for positive change, both within our school community and in the broader society, carrying forward the values and legacy of our beloved institution.',
    
    // Call to Action
    ctaTitle: 'Be Part of Our Legacy',
    ctaText: 'Join thousands of alumni who are proud to be part of this rich educational heritage. Stay connected, contribute to our community, and help us continue our mission of excellence.',
    joinCommunity: 'Join Our Community',
    attendEvents: 'Attend Events',
    
    // Footer
    footerDescription: 'Connecting alumni from Barasat Govt. High School (Now Barasat Peary Charan Sarkar Government High School) since 1856',
    quickLinks: 'Quick Links',
    aboutUs: 'About Us',
    contact: 'Contact',
    followUs: 'Follow Us',
    copyright: '© 2024 BGHS Alumni Association. All rights reserved.'
  },
  bn: {
    // Navigation
    about: 'আমাদের সম্পর্কে',
    events: 'ইভেন্ট',
    directory: 'ডিরেক্টরি',
    gallery: 'গ্যালারি',
    blog: 'ব্লগ',
    donate: 'দান করুন',
    account: 'অ্যাকাউন্ট',
    dashboard: 'ড্যাশবোর্ড',
    profile: 'আমার প্রোফাইল',
    admin: 'অ্যাডমিন',
    users: 'ব্যবহারকারী',
    logout: 'লগআউট',
    login: 'লগইন',
    menu: 'মেনু',
    
    // Hero Section
    heroTitle: 'আমাদের স্কুল সম্পর্কে',
    heroSubtitle: 'বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়',
    heroBengali: 'বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়',
    
    // School Overview
    heritageTitle: 'আমাদের ঐতিহ্য',
    heritageText1: '১৮৫৬ সালে দূরদর্শী শিক্ষাবিদ প্যারীচরণ সরকার দ্বারা প্রতিষ্ঠিত, বারাসাত সরকারি উচ্চ বিদ্যালয় ১৬৮ বছরেরও বেশি সময় ধরে শিক্ষার উৎকর্ষের আলোকবর্তিকা হিসেবে কাজ করে আসছে। মূলত একটি ছোট প্রতিষ্ঠান হিসেবে প্রতিষ্ঠিত, এটি পশ্চিমবঙ্গের অন্যতম প্রাচীন ও মর্যাদাপূর্ণ শিক্ষা প্রতিষ্ঠানে পরিণত হয়েছে।',
    heritageText2: '১৯৯৬ সালে, এর ১৫০তম বার্ষিকী উপলক্ষে, প্রতিষ্ঠাতার শিক্ষা ও সামাজিক সংস্কারে অসামান্য অবদানের সম্মানে স্কুলটির নাম আনুষ্ঠানিকভাবে "বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়" রাখা হয়।',
    heritageText3: 'আজও আমাদের স্কুল এক শতাব্দীরও বেশি সময় আগে আমাদের প্রতিষ্ঠাতা যে শিক্ষার উৎকর্ষ, চরিত্র গঠন এবং সমাজসেবার মূল্যবোধ স্থাপন করেছিলেন, তা বজায় রাখতে অব্যাহত রয়েছে।',
    established: 'প্রতিষ্ঠিত ১৮৫৬',
    yearsExcellence: '১৬৮ বছরেরও বেশি সময়ের শিক্ষার উৎকর্ষ',
    
    // Timeline
    timelineTitle: 'সময়ের সাথে আমাদের যাত্রা',
    timelineSubtitle: 'আমাদের স্কুলের গৌরবময় ইতিহাসের মূল মাইলফলকগুলির একটি সময়রেখা',
    timeline: [
      {
        year: '১৮৫৬',
        title: 'প্রতিষ্ঠা',
        description: 'দূরদর্শী শিক্ষাবিদ ও সমাজ সংস্কারক প্যারীচরণ সরকার দ্বারা বারাসাত সরকারি উচ্চ বিদ্যালয় প্রতিষ্ঠিত হয়।',
        icon: Building
      },
      {
        year: '১৮৬০-এর দশক',
        title: 'প্রাথমিক বৃদ্ধি',
        description: 'স্কুলটি দ্রুত তার মানসম্পন্ন শিক্ষার জন্য স্বীকৃতি লাভ করে এবং উত্তর ২৪ পরগণায় শিক্ষার আলোকবর্তিকা হয়ে ওঠে।',
        icon: BookOpen
      },
      {
        year: '১৯০০-এর দশক',
        title: 'সম্প্রসারণ যুগ',
        description: 'স্কুলটি তার পাঠ্যক্রম ও সুবিধা সম্প্রসারিত করে, পশ্চিমবঙ্গের অন্যতম প্রধান শিক্ষা প্রতিষ্ঠান হিসেবে নিজেকে প্রতিষ্ঠিত করে।',
        icon: GraduationCap
      },
      {
        year: '১৯৯৬',
        title: 'নাম পরিবর্তন',
        description: '১৫০তম বার্ষিকীতে প্রতিষ্ঠাতার সম্মানে আনুষ্ঠানিকভাবে "বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়" নামে নামকরণ করা হয়।',
        icon: Award
      },
      {
        year: '২০০০-এর দশক',
        title: 'আধুনিক যুগ',
        description: 'ঐতিহ্যবাহী মূল্যবোধ বজায় রেখে আধুনিক সুবিধা ও আপডেট করা পাঠ্যক্রমের সাথে শিক্ষায় উৎকর্ষ অব্যাহত রাখে।',
        icon: Star
      },
      {
        year: '২০২৪',
        title: 'বর্তমান দিন',
        description: '১৬৮ বছরেরও বেশি সময়ের শিক্ষার উৎকর্ষ, বিভিন্ন ক্ষেত্রে হাজার হাজার সফল প্রাক্তন ছাত্র তৈরি করেছে।',
        icon: Trophy
      }
    ],
    
    // Achievements
    achievementsTitle: 'আমাদের অর্জন',
    achievementsSubtitle: 'উৎকর্ষ ও প্রভাবের আমাদের উত্তরাধিকার উদযাপন',
    achievements: [
      {
        title: '১৬৮+ বছরের উৎকর্ষ',
        description: 'পশ্চিমবঙ্গের প্রাচীনতম ও মর্যাদাপূর্ণ স্কুলগুলির মধ্যে একটি',
        icon: Clock
      },
      {
        title: '৫০০০+ প্রাক্তন ছাত্র',
        description: 'বিভিন্ন পেশায় হাজার হাজার সফল স্নাতক',
        icon: Users
      },
      {
        title: 'শিক্ষার উৎকর্ষ',
        description: 'নিয়মিত উচ্চ শিক্ষার পারফরম্যান্স ও বোর্ড ফলাফল',
        icon: GraduationCap
      },
      {
        title: 'সাংস্কৃতিক ঐতিহ্য',
        description: 'সাংস্কৃতিক কার্যক্রম ও ক্রীড়া অর্জনের সমৃদ্ধ ঐতিহ্য',
        icon: Trophy
      }
    ],
    
    // Notable Alumni
    alumniTitle: 'উল্লেখযোগ্য প্রাক্তন ছাত্র',
    alumniSubtitle: 'আমাদের বিশিষ্ট স্নাতক যারা সমাজে গুরুত্বপূর্ণ অবদান রেখেছেন',
    alumni: [
      {
        name: 'ডাঃ রাজেশ কুমার',
        batch: '১৯৯৫',
        achievement: 'পদ্মশ্রী পুরস্কার প্রাপক',
        field: 'চিকিৎসা গবেষণা',
        description: 'খ্যাতনামা হৃদরোগ বিশেষজ্ঞ ও চিকিৎসা গবেষক',
        photo: '/bghs-logo.png' // Placeholder - replace with actual alumni photos
      },
      {
        name: 'প্রফেসর অঞ্জলি চ্যাটার্জি',
        batch: '১৯৮৮',
        achievement: 'জাতীয় বিজ্ঞান পুরস্কার',
        field: 'পদার্থবিদ্যা',
        description: 'প্রতিষ্ঠিত পদার্থবিদ ও শিক্ষাবিদ',
        photo: '/bghs-logo.png' // Placeholder - replace with actual alumni photos
      },
      {
        name: 'মিঃ সুরেশ মন্ডল',
        batch: '১৯৯২',
        achievement: 'আইএএস অফিসার',
        field: 'সিভিল সার্ভিস',
        description: 'বিশিষ্ট সরকারি কর্মচারী ও প্রশাসক',
        photo: '/bghs-logo.png' // Placeholder - replace with actual alumni photos
      },
      {
        name: 'ডাঃ প্রিয়া সেন',
        batch: '২০০১',
        achievement: 'বছরের উদ্যোক্তা',
        field: 'প্রযুক্তি',
        description: 'সফল প্রযুক্তি উদ্যোক্তা ও উদ্ভাবক',
        photo: '/bghs-logo.png' // Placeholder - replace with actual alumni photos
      }
    ],
    viewAllAlumni: 'সব উল্লেখযোগ্য প্রাক্তন ছাত্র দেখুন',
    
    // Mission & Vision
    missionTitle: 'প্রাক্তন ছাত্র মিশন',
    missionText: 'আজীবন সম্পর্ক ও পেশাগত নেটওয়ার্ক গড়ে তুলে আমাদের প্রাক্তন ছাত্র সম্প্রদায়কে সংযুক্ত, সহায়তা ও উদযাপন করতে। আমরা আমাদের আলমা ম্যাটারের সাথে শক্তিশালী বন্ধন বজায় রাখতে, বর্তমান ছাত্রদের সহায়তা করতে এবং বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়ের অব্যাহত উৎকর্ষে অবদান রাখতে প্রতিশ্রুতিবদ্ধ।',
    visionTitle: 'প্রাক্তন ছাত্র ভিশন',
    visionText: 'একটি প্রাণবন্ত, সক্রিয় প্রাক্তন ছাত্র সম্প্রদায় গড়ে তুলতে যা অতীত ও বর্তমান ছাত্রদের মধ্যে সেতুবন্ধন হিসেবে কাজ করে, পরামর্শদান, সহযোগিতা ও পারস্পরিক সহায়তা গড়ে তুলতে। আমরা আমাদের প্রাক্তন ছাত্র সমিতিকে ইতিবাচক পরিবর্তনের অনুঘটক হিসেবে কল্পনা করি, আমাদের স্কুল সম্প্রদায়ের মধ্যে এবং বৃহত্তর সমাজে, আমাদের প্রিয় প্রতিষ্ঠানের মূল্যবোধ ও উত্তরাধিকার বহন করে।',
    
    // Call to Action
    ctaTitle: 'আমাদের উত্তরাধিকারের অংশ হন',
    ctaText: 'হাজার হাজার প্রাক্তন ছাত্রের সাথে যোগ দিন যারা এই সমৃদ্ধ শিক্ষার উত্তরাধিকারের অংশ হতে গর্বিত। সংযুক্ত থাকুন, আমাদের সম্প্রদায়ে অবদান রাখুন এবং আমাদের উৎকর্ষের মিশন অব্যাহত রাখতে সাহায্য করুন।',
    joinCommunity: 'আমাদের সম্প্রদায়ে যোগ দিন',
    attendEvents: 'ইভেন্টে অংশ নিন',
    
    // Footer
    footerDescription: '১৮৫৬ সাল থেকে বারাসাত সরকারি উচ্চ বিদ্যালয় (এখন বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়) থেকে প্রাক্তন ছাত্রদের সংযুক্ত করছে',
    quickLinks: 'দ্রুত লিঙ্ক',
    aboutUs: 'আমাদের সম্পর্কে',
    contact: 'যোগাযোগ',
    followUs: 'আমাদের অনুসরণ করুন',
    copyright: '© ২০২৪ বিজিএইচএস প্রাক্তন ছাত্র সমিতি। সমস্ত অধিকার সংরক্ষিত।'
  }
};


export default function About() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const t = content.en

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)
      if (user) {
        try {
          const perms = await getUserPermissions(user.id)
          setUserPermissions(perms)
        } catch (error) {
          console.error('Error fetching permissions:', error)
          setUserPermissions(null)
        }
      } else {
        setUserPermissions(null)
      }
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (session?.user) {
        try {
          const perms = await getUserPermissions(session.user.id)
          setUserPermissions(perms)
        } catch (error) {
          console.error('Error fetching permissions:', error)
          setUserPermissions(null)
        }
      } else {
        setUserPermissions(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
    window.location.href = '/'
  }

  // Admin menu items configuration with permission requirements
  const getAdminMenuItems = () => {
    if (!userPermissions) return []
    
    const menuItems = []
    
    // User Management
    if (hasPermission(userPermissions, 'can_manage_user_profiles') || hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Users', href: '/admin/users' })
    }
    
    // Event Management
    if (hasPermission(userPermissions, 'can_create_events') || 
        hasPermission(userPermissions, 'can_manage_events') || 
        hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Events', href: '/admin/events' })
    }
    
    // Committee Management
    if (hasPermission(userPermissions, 'can_manage_committee') || 
        hasPermission(userPermissions, 'can_manage_events') || 
        hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Committee Management', href: '/admin/committee' })
    }
    
    // Blog Management
    if (hasPermission(userPermissions, 'can_create_blog') || 
        hasPermission(userPermissions, 'can_moderate_blog') || 
        hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Blog Management', href: '/admin/blog' })
    }
    
    // Role Management
    if (hasPermission(userPermissions, 'can_manage_roles') || hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Role Management', href: '/admin/roles-simple' })
    }
    
    // Notices Management
    if (hasPermission(userPermissions, 'can_manage_notices') || hasPermission(userPermissions, 'can_access_admin')) {
      menuItems.push({ label: 'Notices Management', href: '/admin/notices' })
    }
    
    return menuItems
  }

  const adminMenuItems = getAdminMenuItems()
  const hasAdminAccess = adminMenuItems.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <img 
                  src="/bghs-logo.png" 
                  alt="BGHS Alumni Association" 
                  className="h-12 sm:h-14 w-auto object-contain shrink-0 flex-none"
                />
                <div className="flex flex-col min-w-0 flex-1 pr-2">
                  <span className="text-lg sm:text-2xl font-bold text-gray-900 truncate">BGHS Alumni</span>
                  <span className="text-[10px] sm:text-sm text-gray-600 leading-tight line-clamp-2">বারাসাত প্যারীচরণ সরকার রাষ্ট্রীয় উচ্চ বিদ্যালয়</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-primary-600 font-semibold">About</Link>
              <Link href="/events" className="text-gray-700 hover:text-primary-600 transition-colors">Events</Link>
              <Link href="/directory" className="text-gray-700 hover:text-primary-600 transition-colors">Directory</Link>
              <Link href="/committee" className="text-gray-700 hover:text-primary-600 transition-colors">Committee</Link>
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
                        {hasAdminAccess && (
                          <>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
                            {adminMenuItems.map((item) => (
                              <Link key={item.href} href={item.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                {item.label}
                              </Link>
                            ))}
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
              {/* Mobile menu button - moved to top right */}
              <button className="md:hidden p-2 -mr-2" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
                <MenuIcon className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="h-6 w-6" /></button>
            </div>
            <nav className="space-y-2">
              <Link href="/about" className="block px-2 py-2 rounded bg-primary-50 text-primary-600 font-semibold">About</Link>
              <Link href="/events" className="block px-2 py-2 rounded hover:bg-gray-50">Events</Link>
              <Link href="/directory" className="block px-2 py-2 rounded hover:bg-gray-50">Directory</Link>
              <Link href="/gallery" className="block px-2 py-2 rounded hover:bg-gray-50">Gallery</Link>
              <Link href="/blog" className="block px-2 py-2 rounded hover:bg-gray-50">Blog</Link>
              <div className="pt-2 border-t mt-2">
                {userEmail ? (
                  <>
                    <Link href="/dashboard" className="block px-2 py-2 rounded hover:bg-gray-50">Dashboard</Link>
                    <Link href="/profile" className="block px-2 py-2 rounded hover:bg-gray-50">My Profile</Link>
                    {hasAdminAccess && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
                        {adminMenuItems.map((item) => (
                          <Link key={item.href} href={item.href} className="block px-2 py-2 rounded hover:bg-gray-50">
                            {item.label}
                          </Link>
                        ))}
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

      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-95 transition-all duration-1000"
            style={{
              backgroundImage: `url('/school-building.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          {/* Enhanced Overlay for Better Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/50"></div>
          {/* Subtle accent overlay for warmth */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent-900/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-white to-accent-100 bg-clip-text text-transparent">
                {t.heroTitle}
              </span>
            </h1>
            
            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl text-white mb-6 drop-shadow-lg font-medium">
              {t.heroSubtitle}
            </h2>
            
            {/* Bengali Text */}
            <p className="text-lg text-white mb-8 max-w-3xl mx-auto drop-shadow-md font-medium">
              {t.heroBengali}
            </p>
            
            {/* Decorative Elements */}
            <div className="mt-8 flex justify-center space-x-4">
              <div className="w-16 h-1 bg-white/60 rounded-full"></div>
              <div className="w-8 h-1 bg-white/40 rounded-full"></div>
              <div className="w-16 h-1 bg-white/60 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* School Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.heritageTitle}</h2>
              <p className="text-lg text-gray-600 mb-6">
                {t.heritageText1}
              </p>
              <p className="text-lg text-gray-600 mb-6">
                {t.heritageText2}
              </p>
              <p className="text-lg text-gray-600">
                {t.heritageText3}
              </p>
            </div>
            <div className="relative">
              <img 
                src="/school-building.jpg" 
                alt="Barasat Peary Charan Sarkar Government High School" 
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-semibold">{t.established}</p>
                <p className="text-xs">{t.yearsExcellence}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.timelineTitle}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.timelineSubtitle}
            </p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200"></div>
            
            <div className="space-y-12">
              {t.timeline.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="relative flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center relative z-10">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-8 flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl font-bold text-primary-600 mr-4">{item.year}</span>
                        {item.title && (
                          <span className="text-xl font-semibold text-gray-900">{item.title}</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-lg">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* School Achievements */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.achievementsTitle}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.achievementsSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notable Alumni */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.alumniTitle}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.alumniSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.alumni.map((alumnus, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Profile Photo */}
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={alumnus.photo} 
                        alt={alumnus.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to graduation cap icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full bg-primary-100 flex items-center justify-center"><svg class="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                  </div>
                  {/* Achievement Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-semibold text-primary-600">★</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{alumnus.name}</h3>
                  <p className="text-sm text-gray-600 font-semibold mb-2">{alumnus.achievement}</p>
                  <p className="text-xs text-gray-500 mb-3">{alumnus.field}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{alumnus.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              href="/hall-of-fame" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
            >
              {t.viewAllAlumni}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="text-center lg:text-left">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.missionTitle}</h3>
              <p className="text-lg text-gray-600">
                {t.missionText}
              </p>
            </div>
            <div className="text-center lg:text-left">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <Trophy className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.visionTitle}</h3>
              <p className="text-lg text-gray-600">
                {t.visionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t.ctaTitle}</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            {t.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              {t.joinCommunity}
            </Link>
            <Link 
              href="/events" 
              className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              {t.attendEvents}
            </Link>
          </div>
        </div>
      </section>

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
                {t.footerDescription}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.quickLinks}</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">{t.aboutUs}</Link></li>
                <li><Link href="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
                <li><Link href="/directory" className="text-gray-400 hover:text-white transition-colors">Directory</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.contact}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Barasat, North 24 Parganas</li>
                <li>West Bengal, India</li>
                <li>Email: admin@alumnibghs.org</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.followUs}</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
