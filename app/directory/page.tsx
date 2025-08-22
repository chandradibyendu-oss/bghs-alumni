import Link from 'next/link'
import { ArrowLeft, Search, Filter, MapPin, Briefcase, GraduationCap, Mail, Linkedin, Globe } from 'lucide-react'

const alumni = [
  {
    id: 1,
    name: "Dr. Amit Kumar",
    batch: "1995",
    profession: "Cardiologist",
    company: "Apollo Hospitals",
    location: "Kolkata, West Bengal",
    email: "amit.kumar@email.com",
    linkedin: "linkedin.com/in/amitkumar",
    website: "drkumar.com",
    avatar: "/avatars/amit.jpg",
    achievements: ["MBBS from AIIMS Delhi", "Fellowship in Cardiology", "Published 25+ research papers"]
  },
  {
    id: 2,
    name: "Priya Sen",
    batch: "2000",
    profession: "Software Engineer",
    company: "Google",
    location: "Bangalore, Karnataka",
    email: "priya.sen@google.com",
    linkedin: "linkedin.com/in/priyasen",
    website: "",
    avatar: "/avatars/priya.jpg",
    achievements: ["B.Tech from IIT Kharagpur", "10+ years in tech industry", "Led 5 major projects"]
  },
  {
    id: 3,
    name: "Rajesh Das",
    batch: "1988",
    profession: "Business Owner",
    company: "Das Enterprises",
    location: "Barasat, West Bengal",
    email: "rajesh@dasenterprises.com",
    linkedin: "linkedin.com/in/rajeshdas",
    website: "dasenterprises.com",
    avatar: "/avatars/rajesh.jpg",
    achievements: ["Built successful manufacturing business", "Employs 100+ people", "Community leader"]
  },
  {
    id: 4,
    name: "Dr. Smita Banerjee",
    batch: "1992",
    profession: "Professor",
    company: "Jadavpur University",
    location: "Kolkata, West Bengal",
    email: "smita.banerjee@jadavpur.edu",
    linkedin: "linkedin.com/in/smitabanerjee",
    website: "",
    avatar: "/avatars/smita.jpg",
    achievements: ["PhD in Physics", "20+ years teaching experience", "Published 50+ papers"]
  },
  {
    id: 5,
    name: "Arjun Ghosh",
    batch: "2005",
    profession: "Marketing Manager",
    company: "Hindustan Unilever",
    location: "Mumbai, Maharashtra",
    email: "arjun.ghosh@unilever.com",
    linkedin: "linkedin.com/in/arjunghosh",
    website: "",
    avatar: "/avatars/arjun.jpg",
    achievements: ["MBA from IIM Ahmedabad", "Led successful brand campaigns", "Award-winning marketer"]
  },
  {
    id: 6,
    name: "Meera Chatterjee",
    batch: "1998",
    profession: "Architect",
    company: "Chatterjee & Associates",
    location: "Delhi, NCR",
    email: "meera@chatterjeearchitects.com",
    linkedin: "linkedin.com/in/meerachatterjee",
    website: "chatterjeearchitects.com",
    avatar: "/avatars/meera.jpg",
    achievements: ["B.Arch from SPA Delhi", "Designed 100+ buildings", "Sustainable architecture expert"]
  }
]

const batches = ["All", "1980s", "1990s", "2000s", "2010s", "2020s"]
const professions = ["All", "Healthcare", "Technology", "Business", "Education", "Engineering", "Arts", "Other"]

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alumni Directory</h1>
              <p className="text-gray-600">Connect with fellow alumni and expand your professional network</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, profession, or company..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="input-field">
                {batches.map(batch => (
                  <option key={batch}>{batch}</option>
                ))}
              </select>
              <select className="input-field">
                {professions.map(profession => (
                  <option key={profession}>{profession}</option>
                ))}
              </select>
              <button className="btn-secondary flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Directory Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{alumni.length}</div>
            <div className="text-sm text-gray-600">Total Alumni</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">25+</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">50+</div>
            <div className="text-sm text-gray-600">Professions</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">1000+</div>
            <div className="text-sm text-gray-600">Network Size</div>
          </div>
        </div>

        {/* Alumni Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((person) => (
            <div key={person.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{person.name}</h3>
                  <p className="text-sm text-gray-600">Batch of {person.batch}</p>
                  <p className="text-sm font-medium text-primary-600">{person.profession}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="truncate">{person.company}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{person.location}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Achievements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {person.achievements.slice(0, 2).map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 mb-4">
                <button className="btn-primary flex-1">Connect</button>
                <button className="btn-secondary">View Profile</button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex space-x-3">
                  {person.email && (
                    <a href={`mailto:${person.email}`} className="text-gray-500 hover:text-primary-600">
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                  {person.linkedin && (
                    <a href={`https://${person.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {person.website && (
                    <a href={`https://${person.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600">
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Directory CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Join Our Directory</h2>
          <p className="text-primary-100 mb-6">
            Are you a BGHS alumnus? Join our directory to connect with fellow alumni and expand your network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Add Your Profile
            </button>
            <button className="border border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Update Profile
            </button>
          </div>
        </div>

        {/* Networking Tips */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Networking Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Be Professional</h3>
              <p className="text-gray-600 text-sm">
                When reaching out to fellow alumni, maintain a professional tone and clearly state your purpose.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Offer Value</h3>
              <p className="text-gray-600 text-sm">
                Think about how you can help others in your network, not just what you can get from them.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Connected</h3>
              <p className="text-gray-600 text-sm">
                Regularly engage with your network through events, social media, and meaningful conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
