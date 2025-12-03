'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserPermissions, hasPermission } from '@/lib/auth-utils'
import { ArrowLeft, Save, BookOpen, Image, Globe, FileText, Tag } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

const BLOG_CATEGORIES = [
  'Success Stories',
  'School History',
  'Events',
  'Career Guidance',
  'Sports',
  'Technology',
  'Community',
  'Alumni Spotlight',
  'News',
  'Other'
]

export default function CreateBlogPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Success Stories',
    tags: [] as string[],
    image_url: '',
    featured: false,
    status: 'draft' as 'draft' | 'pending_review' | 'published',
    content_type: 'html' as 'html' | 'markdown' | 'plain'
  })
  const [blogId, setBlogId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [tagInput, setTagInput] = useState('')
  const [canPublish, setCanPublish] = useState(false)
  const router = useRouter()

  useEffect(() => {
    verifyAccess()
  }, [])

  const verifyAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { 
      router.push('/login')
      return 
    }
    const perms = await getUserPermissions(user.id)
    const allowed = hasPermission(perms, 'can_create_blog') || hasPermission(perms, 'can_access_admin')
    
    if (!allowed) {
      alert('You do not have permission to create blog posts.')
      router.push('/dashboard')
      return
    }

    // Check if user can publish directly (moderator/admin)
    const canPub = hasPermission(perms, 'can_publish_blog') || hasPermission(perms, 'can_access_admin')
    setCanPublish(canPub)
    
    // If can publish, default to draft, otherwise pending_review
    if (!canPub) {
      setFormData(prev => ({ ...prev, status: 'pending_review' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'English title is required'
    if (!formData.excerpt.trim()) newErrors.excerpt = 'English excerpt is required'
    if (!formData.content.trim()) newErrors.content = 'English content is required'
    if (!formData.category) newErrors.category = 'Category is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image_url: 'Please select an image file' }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image_url: 'Image size must be less than 10MB' }))
      return
    }

    setUploadingImage(true)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.image_url
      return newErrors
    })

    try {
      // Get session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Upload image using the blog image upload API
      const formDataPayload = new FormData()
      formDataPayload.append('file', file)
      // If blogId is available (for existing blog), append it, otherwise use temp
      if (blogId) {
        formDataPayload.append('blogId', blogId)
      }

      const response = await fetch('/api/blog/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formDataPayload
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload image')
      }

      // Update the image URL with the uploaded image URL
      handleInputChange('image_url', result.url)
      setImagePreview(result.url)
    } catch (error) {
      console.error('Image upload error:', error)
      setErrors(prev => ({ 
        ...prev, 
        image_url: error instanceof Error ? error.message : 'Failed to upload image' 
      }))
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(t => t !== tagToRemove))
  }

  const calculateReadTime = (content: string): number => {
    // Average reading speed: 200 words per minute
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Calculate read time
      const readTime = calculateReadTime(formData.content)

      const blogData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        image_url: formData.image_url.trim() || null,
        author_id: user.id,
        featured: formData.featured,
        published: canPublish && formData.status === 'published',
        status: formData.status,
        content_type: formData.content_type,
        read_time: readTime,
        views: 0,
        likes: 0,
        comments: 0
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([blogData])
        .select()
        .single()

      if (error) throw error

      // Set blog ID for future image uploads
      if (data?.id) {
        setBlogId(data.id)
      }

      alert(canPublish && formData.status === 'published' 
        ? 'Blog post created and published successfully!'
        : 'Blog post created successfully! It will be reviewed by a moderator.')
      
      router.push('/admin/blog')
    } catch (error) {
      console.error('Error creating blog post:', error)
      alert(error instanceof Error ? error.message : 'Failed to create blog post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/bghs-logo.png" alt="BGHS Alumni" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900">Create Blog Post</span>
          </div>
          <Link href="/admin/blog" className="text-gray-600 hover:text-gray-800">← Back to Blog Management</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="mr-2"
                />
                <span>Save as Draft</span>
              </label>
              {canPublish ? (
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'pending_review' | 'published')}
                    className="mr-2"
                  />
                  <span>Publish Now</span>
                </label>
              ) : (
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pending_review"
                    checked={formData.status === 'pending_review'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="mr-2"
                  />
                  <span>Submit for Review</span>
                </label>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter blog post title (English, Bengali, or both)"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className={`input-field ${errors.excerpt ? 'border-red-500' : ''}`}
                  placeholder="Short description/summary (supports English and Bengali text)"
                />
                {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                >
                  {BLOG_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Content
            </h2>
            
            <div className="space-y-4">
              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  placeholder="Write your blog post content here... Use the toolbar to format text, add images, links, and more."
                  blogId={blogId || 'temp'}
                  error={errors.content}
                />
                <p className="mt-2 text-sm text-gray-500">
                  💡 Tip: Click the image icon in the toolbar to upload and insert images directly into your content.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Estimated read time: ~{calculateReadTime(formData.content)} minutes
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="h-5 w-5" />
              Featured Image
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => {
                    handleInputChange('image_url', e.target.value)
                    setImagePreview(e.target.value)
                  }}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter image URL or upload an image file
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image (Max 10MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="input-field"
                />
                {uploadingImage && <p className="mt-1 text-sm text-blue-600">Uploading...</p>}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                    onError={() => setImagePreview('')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className="input-field flex-1"
                  placeholder="Enter a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary"
                >
                  Add Tag
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="mr-2"
                />
                <span>Mark as Featured Post</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/admin/blog" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {formData.status === 'published' ? 'Publish' : formData.status === 'pending_review' ? 'Submit for Review' : 'Save as Draft'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

