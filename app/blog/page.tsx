import Link from 'next/link'
import { ArrowLeft, Calendar, User, Tag, BookOpen, TrendingUp, Heart, MessageCircle, Share2 } from 'lucide-react'

const blogPosts = [
  {
    id: 1,
    title: "BGHS Alumni Success Story: From Barasat to Silicon Valley",
    excerpt: "Meet Priya Sen, a 2000 batch graduate who went from our humble school in Barasat to becoming a senior software engineer at Google in Silicon Valley. Her journey is an inspiration for all current students.",
    author: "Alumni Association",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Success Stories",
    tags: ["Technology", "Career", "Inspiration"],
    image: "/blog/priya-sen.jpg",
    featured: true,
    views: 1250,
    likes: 89,
    comments: 23
  },
  {
    id: 2,
    title: "The Evolution of BGHS: 165 Years of Educational Excellence",
    excerpt: "From its establishment in 1856 to the present day, Barasat Govt. High School has been at the forefront of educational innovation and excellence in West Bengal.",
    author: "Dr. Smita Banerjee",
    date: "2024-01-10",
    readTime: "8 min read",
    category: "School History",
    tags: ["History", "Education", "BGHS"],
    image: "/blog/school-history.jpg",
    featured: false,
    views: 890,
    likes: 67,
    comments: 15
  },
  {
    id: 3,
    title: "Annual Alumni Reunion 2023: A Grand Success",
    excerpt: "The 2023 annual reunion brought together over 200 alumni from different batches, creating unforgettable memories and strengthening our community bonds.",
    author: "Reunion Committee",
    date: "2024-01-05",
    readTime: "4 min read",
    category: "Events",
    tags: ["Reunion", "Community", "Memories"],
    image: "/blog/reunion-2023.jpg",
    featured: false,
    views: 756,
    likes: 45,
    comments: 12
  },
  {
    id: 4,
    title: "Career Opportunities in Emerging Technologies",
    excerpt: "A comprehensive guide for current students and recent graduates on the most promising career paths in AI, machine learning, and renewable energy sectors.",
    author: "Career Guidance Team",
    date: "2024-01-01",
    readTime: "6 min read",
    category: "Career Guidance",
    tags: ["Technology", "Career", "Future"],
    image: "/blog/career-tech.jpg",
    featured: false,
    views: 634,
    likes: 38,
    comments: 8
  },
  {
    id: 5,
    title: "BGHS Sports Legacy: Champions Then and Now",
    excerpt: "Exploring the rich sports tradition of our school and how it continues to produce state and national level athletes across various sports disciplines.",
    author: "Sports Department",
    date: "2023-12-28",
    readTime: "7 min read",
    category: "Sports",
    tags: ["Sports", "Athletics", "Legacy"],
    image: "/blog/sports-legacy.jpg",
    featured: false,
    views: 567,
    likes: 42,
    comments: 11
  },
  {
    id: 6,
    title: "Alumni Spotlight: Dr. Amit Kumar's Medical Journey",
    excerpt: "Dr. Amit Kumar shares his inspiring journey from BGHS to becoming a renowned cardiologist, and how his school days shaped his approach to medicine.",
    author: "Alumni Association",
    date: "2023-12-20",
    readTime: "5 min read",
    category: "Success Stories",
    tags: ["Medicine", "Healthcare", "Inspiration"],
    image: "/blog/dr-amit.jpg",
    featured: false,
    views: 445,
    likes: 31,
    comments: 7
  }
]

const categories = ["All", "Success Stories", "School History", "Events", "Career Guidance", "Sports", "Technology", "Community"]

export default function BlogPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Blog & News</h1>
              <p className="text-gray-600">Stay updated with stories, achievements, and insights from our alumni community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Post */}
        {blogPosts.filter(post => post.featured).map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Featured
                  </span>
                  <span className="bg-accent-100 text-accent-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
                <p className="text-gray-600 mb-6">{post.excerpt}</p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="btn-primary">Read More</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Categories Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === "All" 
                    ? "bg-primary-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {blogPosts.filter(post => !post.featured).map((post) => (
            <div key={post.id} className="card hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {post.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {post.views}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="btn-primary">Read More</button>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-primary-100 mb-6">
            Subscribe to our newsletter to receive the latest blog posts, alumni news, and event updates directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>

        {/* Write for Us CTA */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Story</h2>
          <p className="text-gray-600 mb-6">
            Are you a BGHS alumnus with an interesting story to share? We'd love to feature your journey, 
            achievements, or insights on our blog.
          </p>
          <button className="btn-primary">Submit Your Article</button>
        </div>
      </div>
    </div>
  )
}
