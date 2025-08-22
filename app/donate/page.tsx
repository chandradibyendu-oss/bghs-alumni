import Link from 'next/link'
import { ArrowLeft, Heart, Target, Users, BookOpen, Building, GraduationCap, CreditCard, Shield, CheckCircle } from 'lucide-react'

const donationCauses = [
  {
    id: 1,
    title: "Student Scholarship Fund",
    description: "Support deserving students from underprivileged backgrounds to continue their education at BGHS.",
    target: 500000,
    raised: 320000,
    donors: 156,
    icon: GraduationCap,
    category: "Education"
  },
  {
    id: 2,
    title: "School Infrastructure Development",
    description: "Help us build modern classrooms, laboratories, and sports facilities for better learning environment.",
    target: 1000000,
    raised: 750000,
    donors: 89,
    icon: Building,
    category: "Infrastructure"
  },
  {
    id: 3,
    title: "Library Enhancement",
    description: "Expand our library with modern books, digital resources, and study materials for students.",
    target: 200000,
    raised: 120000,
    donors: 67,
    icon: BookOpen,
    category: "Resources"
  },
  {
    id: 4,
    title: "Sports Equipment & Facilities",
    description: "Provide quality sports equipment and maintain sports facilities for physical development.",
    target: 300000,
    raised: 180000,
    donors: 45,
    icon: Target,
    category: "Sports"
  }
]

const donationAmounts = [500, 1000, 2500, 5000, 10000, 25000]

export default function DonatePage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Support Your Alma Mater</h1>
              <p className="text-gray-600">Make a difference in the lives of current and future BGHS students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Impact Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-primary-600">₹13.7L+</div>
            <div className="text-sm text-gray-600">Total Raised</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-accent-600" />
            </div>
            <div className="text-2xl font-bold text-accent-600">357</div>
            <div className="text-sm text-gray-600">Total Donors</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">45</div>
            <div className="text-sm text-gray-600">Students Helped</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-sm text-gray-600">Projects Funded</div>
          </div>
        </div>

        {/* Donation Causes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Cause</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {donationCauses.map((cause) => {
              const progress = (cause.raised / cause.target) * 100
              const IconComponent = cause.icon
              
              return (
                <div key={cause.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {cause.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{cause.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{cause.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>₹{cause.raised.toLocaleString()} raised</span>
                      <span>₹{cause.target.toLocaleString()} goal</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      <Users className="h-4 w-4 inline mr-1" />
                      {cause.donors} donors
                    </div>
                    <div className="text-sm font-medium text-primary-600">
                      {progress.toFixed(1)}% complete
                    </div>
                  </div>

                  <button className="btn-primary w-full">Donate to This Cause</button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Donation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Make a Quick Donation</h2>
          
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Amount (₹)</label>
              <div className="grid grid-cols-3 gap-3">
                {donationAmounts.map((amount) => (
                  <button
                    key={amount}
                    className="border-2 border-gray-300 rounded-lg py-3 px-4 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="number"
                  placeholder="Or enter custom amount"
                  className="input-field"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Cause</label>
              <select className="input-field">
                <option>General Fund (Most Needed)</option>
                {donationCauses.map(cause => (
                  <option key={cause.id}>{cause.title}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
              <textarea
                placeholder="Leave a message for the school community..."
                rows={3}
                className="input-field"
              ></textarea>
            </div>

            <button className="btn-primary w-full text-lg py-3">
              <CreditCard className="h-5 w-5 inline mr-2" />
              Donate Securely
            </button>
          </div>
        </div>

        {/* Why Donate */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Your Donation Matters</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transform Lives</h3>
              <p className="text-gray-600 text-sm">
                Your donation directly impacts students' lives, providing opportunities they might not otherwise have.
              </p>
            </div>
            <div className="card text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Legacy</h3>
              <p className="text-gray-600 text-sm">
                Help maintain and enhance the school that shaped your future and continues to shape others.
              </p>
            </div>
            <div className="card text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Impact</h3>
              <p className="text-gray-600 text-sm">
                Strengthen the BGHS community and create lasting positive change in Barasat and beyond.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Transparency */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Secure & Transparent</h2>
          <p className="text-primary-100 mb-6">
            All donations are processed securely and we provide complete transparency on how your contributions are used.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Tax Deductible</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Regular Updates</span>
            </div>
          </div>
        </div>

        {/* Other Ways to Help */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Other Ways to Help</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Volunteer Your Time</h3>
              <p className="text-gray-600 mb-4">
                Share your expertise, mentor students, or help organize events. Your time and skills are invaluable.
              </p>
              <button className="btn-secondary">Learn More</button>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Spread the Word</h3>
              <p className="text-gray-600 mb-4">
                Help us reach more alumni by sharing our donation campaigns on social media and with your network.
              </p>
              <button className="btn-secondary">Share Campaign</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
