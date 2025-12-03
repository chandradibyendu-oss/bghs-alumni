'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Tag, BookOpen, TrendingUp, Heart, MessageCircle, Share2, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
    avatar_url?: string | null
  }
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const blogId = params.id as string

  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (blogId) {
      fetchBlog()
      incrementViewCount()
    }
  }, [blogId])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles!blog_posts_author_id_fkey(full_name, avatar_url)
        `)
        .eq('id', blogId)
        .eq('published', true)
        .eq('status', 'published')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Blog post not found')
        } else {
          throw error
        }
        return
      }

      if (!data) {
        setError('Blog post not found')
        return
      }

      setBlog(data as BlogPost)
    } catch (e) {
      console.error('Error fetching blog:', e)
      setError('Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async () => {
    try {
      // Try to increment view count
      const { data: currentBlog } = await supabase
        .from('blog_posts')
        .select('views')
        .eq('id', blogId)
        .single()

      if (currentBlog) {
        await supabase
          .from('blog_posts')
          .update({ views: (currentBlog.views || 0) + 1 })
          .eq('id', blogId)
      }
    } catch (e) {
      // Silently fail - view count increment is not critical
      console.warn('Failed to increment view count:', e)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        })
      } catch (e) {
        // User cancelled or error - ignore
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading blog post...</p>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The blog post you are looking for does not exist or has been removed.'}
            </p>
            <Link href="/blog" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Image */}
        {blog.image_url && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={blog.image_url}
              alt={blog.title}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Header Section */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            {blog.featured && (
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Featured
              </span>
            )}
            <span className="bg-accent-100 text-accent-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {blog.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{blog.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              {blog.author?.avatar_url ? (
                <Image
                  src={blog.author.avatar_url}
                  alt={blog.author.full_name || 'Author'}
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
              ) : (
                <User className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">{blog.author?.full_name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {formatDate(blog.created_at)}
            </div>
            {blog.read_time && (
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {blog.read_time} min read
              </div>
            )}
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              {blog.views || 0} views
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Social Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                <Heart className="h-5 w-5" />
                <span>{blog.likes || 0}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span>{blog.comments || 0}</span>
              </button>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Excerpt */}
          <p className="text-xl text-gray-700 mb-8 font-medium leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Main Content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          
          <style jsx global>{`
            .blog-content {
              font-size: 18px;
              line-height: 1.8;
              color: #374151;
            }
            .blog-content h1,
            .blog-content h2,
            .blog-content h3,
            .blog-content h4,
            .blog-content h5,
            .blog-content h6 {
              font-weight: bold;
              margin-top: 2em;
              margin-bottom: 1em;
              color: #111827;
            }
            .blog-content h1 { font-size: 2.25em; }
            .blog-content h2 { font-size: 1.875em; }
            .blog-content h3 { font-size: 1.5em; }
            .blog-content p {
              margin-bottom: 1.5em;
            }
            .blog-content img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 2em 0;
            }
            .blog-content ul,
            .blog-content ol {
              margin-bottom: 1.5em;
              padding-left: 2em;
            }
            .blog-content li {
              margin-bottom: 0.5em;
            }
            .blog-content a {
              color: #2563eb;
              text-decoration: underline;
            }
            .blog-content a:hover {
              color: #1d4ed8;
            }
            .blog-content blockquote {
              border-left: 4px solid #e5e7eb;
              padding-left: 1.5em;
              margin: 2em 0;
              font-style: italic;
              color: #6b7280;
            }
            .blog-content code {
              background-color: #f3f4f6;
              padding: 0.2em 0.4em;
              border-radius: 4px;
              font-size: 0.9em;
            }
            .blog-content pre {
              background-color: #1f2937;
              color: #f9fafb;
              padding: 1.5em;
              border-radius: 8px;
              overflow-x: auto;
              margin: 2em 0;
            }
            .blog-content pre code {
              background-color: transparent;
              padding: 0;
              color: inherit;
            }
          `}</style>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blog
          </Link>
          <button
            onClick={handleShare}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            Share This Post
          </button>
        </div>

        {/* Related Posts Section - Can be added later */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </article>
    </div>
  )
}

