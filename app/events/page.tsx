import Link from 'next/link'
import { Calendar, Clock, MapPin, Users, ArrowLeft, Filter, Search } from 'lucide-react'

const events = [
  {
    id: 1,
    title: "Annual Alumni Reunion 2024",
    date: "2024-12-15",
    time: "6:00 PM",
    location: "BGHS Main Campus, Barasat",
    description: "Join us for our biggest annual reunion event. Network with fellow alumni, enjoy cultural programs, and reminisce about your school days.",
    attendees: 150,
    maxAttendees: 200,
    category: "Reunion",
    image: "/images/reunion.jpg"
  },
  {
    id: 2,
    title: "Career Guidance Workshop",
    date: "2024-11-20",
    time: "2:00 PM",
    location: "Online (Zoom)",
    description: "A special session for current students featuring successful alumni sharing career insights and guidance.",
    attendees: 45,
    maxAttendees: 100,
    category: "Workshop",
    image: "/images/workshop.jpg"
  },
  {
    id: 3,
    title: "Sports Meet & Alumni Tournament",
    date: "2024-10-25",
    time: "9:00 AM",
    location: "BGHS Sports Ground",
    description: "Annual sports meet where alumni compete in various sports events. Cricket, football, and athletics competitions.",
    attendees: 80,
    maxAttendees: 120,
    category: "Sports",
    image: "/images/sports.jpg"
  },
  {
    id: 4,
    title: "Charity Fundraiser Dinner",
    date: "2024-12-01",
    time: "7:00 PM",
    location: "Grand Hotel, Barasat",
    description: "Elegant dinner event to raise funds for school infrastructure development and scholarships.",
    attendees: 60,
    maxAttendees: 80,
    category: "Fundraiser",
    image: "/images/dinner.jpg"
  }
]

const categories = ["All", "Reunion", "Workshop", "Sports", "Fundraiser", "Cultural"]

export default function EventsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Events & Reunions</h1>
              <p className="text-gray-600">Stay connected with your alma mater through our exciting events</p>
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
                  placeholder="Search events..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="input-field">
                <option>All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <button className="btn-secondary flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="card hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              
              <div className="mb-4">
                <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                  {event.category}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{event.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.attendees}/{event.maxAttendees} attendees
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn-primary flex-1">Register</button>
                <button className="btn-secondary">Details</button>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Events CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Have an Event Idea?</h2>
          <p className="text-primary-100 mb-6">
            We're always looking for new ways to bring our alumni community together. 
            Share your event ideas with us!
          </p>
          <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            Suggest an Event
          </button>
        </div>

        {/* Past Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Events</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No past events to display</p>
              <p className="text-sm">Check back later for event archives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
