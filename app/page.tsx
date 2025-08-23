import Link from 'next/link'
import { Calendar, Users, BookOpen, Heart, GraduationCap, MapPin } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">BGHS Alumni</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/events" className="text-gray-700 hover:text-primary-600 transition-colors">Events</Link>
              <Link href="/directory" className="text-gray-700 hover:text-primary-600 transition-colors">Directory</Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">Blog</Link>
              <Link href="/donate" className="text-gray-700 hover:text-primary-600 transition-colors">Donate</Link>
              <Link href="/login" className="btn-primary">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-90"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          {/* Elegant Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 via-primary-800/75 to-accent-900/65"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">BGHS Alumni</span>
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto drop-shadow-md">
            Connect with fellow alumni from Barasat Govt. High School. Stay updated with school events, 
            network with former classmates, and contribute to your alma mater's legacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Join Our Community
            </Link>
            <Link href="/about" className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary-600 font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Learn More
            </Link>
          </div>
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
              Our alumni network spans across the globe, representing excellence in various fields.
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

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Reconnect?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of BGHS alumni who are already part of our growing community
          </p>
          <Link href="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <GraduationCap className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">BGHS Alumni</span>
              </div>
              <p className="text-gray-400">
                Connecting alumni from Barasat Govt. High School (Now Barasat Peary Charan Sarkar Government High School) since 1856
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
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
                <li>Email: alumni@bghs.edu.in</li>
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
