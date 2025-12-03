'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Filter
} from 'lucide-react'

type BlogPost = {
  id: string
  title: string
  excerpt: string
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

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const router = useRouter()
  const [canCreate, setCanCreate] = useState(false)
  const [canModerate, setCanModerate] = useState(false)

  useEffect(() => {
    // Run both in parallel for faster loading
    Promise.all([verifyAccess(), fetchBlogs()])
  }, [])

  const verifyAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { 
      router.push('/login')
      return 
    }
    const perms = await getUserPermissions(user.id)
    const hasAccess = hasPermission(perms, 'can_create_blog') || 
                     hasPermission(perms, 'can_moderate_blog') || 
                     hasPermission(perms, 'can_access_admin')
    
    if (!hasAccess) {
      alert('You do not have permission to access blog management.')
      router.push('/dashboard')
      return
    }

    setCanCreate(hasPermission(perms, 'can_create_blog') || hasPermission(perms, 'can_access_admin'))
    setCanModerate(hasPermission(perms, 'can_moderate_blog') || hasPermission(perms, 'can_access_admin'))
  }

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      // Don't fetch content field - it's large and not needed for listing
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          author_id,
          category,
          tags,
          image_url,
          views,
          likes,
          comments,
          featured,
          published,
          status,
          read_time,
          created_at,
          updated_at,
          author:profiles!blog_posts_author_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100) // Limit to 100 posts for performance
      
      if (error) throw error
      
      // Process the data to handle author relationship properly
      const processedData = (data || []).map((blog: any) => ({
        ...blog,
        author: Array.isArray(blog.author) && blog.author.length > 0 
          ? blog.author[0] 
          : blog.author || null
      })) as BlogPost[]
      
      setBlogs(processedData)
    } catch (e) {
      console.error('Failed to load blogs', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return blogs.filter((blog) => {
      const s = search.trim().toLowerCase()
      const matchSearch = !s || 
        blog.title.toLowerCase().includes(s) || 
        blog.excerpt.toLowerCase().includes(s)
      const matchStatus = !statusFilter || blog.status === statusFilter
      const matchCategory = !categoryFilter || blog.category === categoryFilter
      return matchSearch && matchStatus && matchCategory
    })
  }, [blogs, search, statusFilter, categoryFilter])

  const handlePublish = async (blogId: string, publish: boolean) => {
    if (!canModerate) {
      alert('You do not have permission to publish blogs.')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const updates: any = {
        published: publish,
        status: publish ? 'published' : 'draft'
      }

      if (publish) {
        updates.reviewed_by = user.id
        updates.reviewed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', blogId)

      if (error) throw error

      await fetchBlogs()
      alert(publish ? 'Blog published successfully!' : 'Blog unpublished successfully!')
    } catch (error) {
      console.error('Error updating blog status:', error)
      alert('Failed to update blog status')
    }
  }

  const handleApprove = async (blogId: string) => {
    if (!canModerate) {
      alert('You do not have permission to approve blogs.')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: 'published',
          published: true,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', blogId)

      if (error) throw error

      await fetchBlogs()
      alert('Blog approved and published successfully!')
    } catch (error) {
      console.error('Error approving blog:', error)
      alert('Failed to approve blog')
    }
  }

  const handleReject = async (blogId: string) => {
    if (!canModerate) {
      alert('You do not have permission to reject blogs.')
      return
    }

    const notes = prompt('Enter rejection reason (optional):')
    if (notes === null) return // User cancelled

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: 'rejected',
          published: false,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || null
        })
        .eq('id', blogId)

      if (error) throw error

      await fetchBlogs()
      alert('Blog rejected successfully!')
    } catch (error) {
      console.error('Error rejecting blog:', error)
      alert('Failed to reject blog')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading blogs...</p>
      </div>
    )
  }

  const categories = Array.from(new Set(blogs.map(b => b.category))).sort()
  const statusCounts = {
    draft: blogs.filter(b => b.status === 'draft').length,
    pending_review: blogs.filter(b => b.status === 'pending_review').length,
    published: blogs.filter(b => b.status === 'published').length,
    rejected: blogs.filter(b => b.status === 'rejected').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/bghs-logo.png" alt="BGHS Alumni" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900">Admin - Blog Management</span>
          </div>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600">Create, edit, and moderate blog posts</p>
          </div>
          <div className="flex gap-3">
            <Link href="/blog" className="btn-secondary">
              View Public Blog
            </Link>
            {canCreate && (
              <Link href="/admin/blog/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="h-5 w-5" /> Create Blog Post
              </Link>
            )}
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.draft}</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending_review}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.published}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search by title, excerpt, or Bengali title"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)} 
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((blog) => (
            <div key={blog.id} className="card border border-gray-200">
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {blog.image_url ? (
                  <Image
                    src={blog.image_url}
                    alt={blog.title}
                    width={400}
                    height={225}
                    className="rounded-lg object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <BookOpen className="h-12 w-12 mb-2" />
                    <span className="text-sm">No Image</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[blog.status]}`}>
                  {blog.status.replace('_', ' ').toUpperCase()}
                </span>
                {blog.featured && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                    Featured
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{blog.excerpt}</p>
              
              <div className="space-y-1 text-sm text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" /> 
                  {blog.category}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" /> 
                  {blog.views} views
                </div>
                {blog.read_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" /> 
                    {blog.read_time} min read
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Link href={`/admin/blog/${blog.id}/edit`} className="btn-secondary flex-1 text-center text-sm">
                  <Edit className="h-4 w-4 inline mr-1" />
                  Edit
                </Link>
                {canModerate && blog.status === 'pending_review' && (
                  <>
                    <button
                      onClick={() => handleApprove(blog.id)}
                      className="btn-primary text-sm px-3"
                    >
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(blog.id)}
                      className="btn-danger text-sm px-3"
                    >
                      <XCircle className="h-4 w-4 inline mr-1" />
                      Reject
                    </button>
                  </>
                )}
                {canModerate && blog.status === 'published' && !blog.published && (
                  <button
                    onClick={() => handlePublish(blog.id, true)}
                    className="btn-primary text-sm px-3"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No blog posts found.</p>
              {canCreate && (
                <Link href="/admin/blog/new" className="btn-primary mt-4 inline-flex items-center gap-2">
                  <Plus className="h-5 w-5" /> Create Your First Blog Post
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

