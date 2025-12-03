'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Tag, BookOpen, TrendingUp, Heart, MessageCircle, Share2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'

type BlogPost = {
  id: string
  title: string
  excerpt: string
  content: string
  author_id: string
  category: string
  tags: string[]
  image_url?: string | null
  views: number
  likes: number
  comments: number
  featured: boolean
  published: boolean
  status: 'draft' | 'pending_review' | 'published' | 'rejected'
  read_time?: number | null
  created_at: string
  updated_at: string
  author?: {
    full_name: string
  }
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [canCreateBlog, setCanCreateBlog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  useEffect(() => {
    checkPermissions()
    fetchBlogs()
  }, [])

  const checkPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const perms = await getUserPermissions(user.id)
      setCanCreateBlog(hasPermission(perms, 'can_create_blog') || hasPermission(perms, 'can_access_admin'))
    }
  }

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles!blog_posts_author_id_fkey(full_name)
        `)
        .eq('published', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error

      setBlogs((data || []) as BlogPost[])
    } catch (e) {
      console.error('Failed to load blogs', e)
    } finally {
      setLoading(false)
    }
  }

  // Separate featured and regular posts
  const featuredPosts = useMemo(() => {
    return blogs.filter(blog => blog.featured)
  }, [blogs])

  const regularPosts = useMemo(() => {
    return blogs.filter(blog => !blog.featured)
  }, [blogs])

  // Filter by category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') {
      return regularPosts
    }
    return regularPosts.filter(blog => blog.category === selectedCategory)
  }, [regularPosts, selectedCategory])

  // Get unique categories from published blogs
  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogs.map(b => b.category))).sort()
    return ['All', ...cats]
  }, [blogs])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading blog posts...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blog & News</h1>
                <p className="text-gray-600">Stay updated with stories, achievements, and insights from our alumni community</p>
              </div>
            </div>
            {canCreateBlog && (
              <Link 
                href="/admin/blog/new" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Blog Post
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Post */}
        {featuredPosts.length > 0 && featuredPosts.slice(0, 1).map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-16 w-16 text-gray-400" />
                  )}
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
                      {post.author?.full_name || 'Anonymous'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.created_at)}
                    </div>
                    {post.read_time && (
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {post.read_time} min read
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {post.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/blog/${post.id}`} className="btn-primary">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Categories Filter */}
        {categories.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="card hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  )}
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
                    {post.author?.full_name || 'Anonymous'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatShortDate(post.created_at)}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {post.views || 0}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes || 0}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {post.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'All' 
                ? 'No published blog posts are available at the moment. Check back soon!'
                : `No blog posts found in the "${selectedCategory}" category.`
              }
            </p>
          </div>
        )}

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
          {canCreateBlog ? (
            <Link href="/admin/blog/new" className="btn-primary">
              Submit Your Article
            </Link>
          ) : (
            <button className="btn-primary">Contact Us</button>
          )}
        </div>
      </div>
    </div>
  )
}
