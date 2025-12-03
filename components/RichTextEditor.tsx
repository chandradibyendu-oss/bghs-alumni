'use client'

import { useMemo, useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    return RQ
  },
  { ssr: false }
)
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  blogId?: string
  error?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  blogId,
  error
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null)
  const quillRef = useRef<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const resizeRef = useRef<{
    img: HTMLImageElement | null
    overlay: HTMLDivElement | null
    handles: HTMLDivElement[]
    isResizing: boolean
  }>({
    img: null,
    overlay: null,
    handles: [],
    isResizing: false
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Custom image resize implementation for Quill 2.0
  const setupImageResize = useCallback(() => {
    if (!isMounted) return

    const editorId = `quill-editor-${blogId || 'new'}`
    const editorElement = document.querySelector(`#${editorId} .ql-editor`) as HTMLElement
    if (!editorElement) {
      setTimeout(setupImageResize, 100)
      return
    }

    const createResizeHandles = (img: HTMLImageElement) => {
      // Remove existing overlay
      if (resizeRef.current.overlay) {
        resizeRef.current.overlay.remove()
      }

      // Create overlay
      const overlay = document.createElement('div')
      overlay.className = 'ql-image-resize-overlay'
      overlay.style.cssText = `
        position: absolute;
        border: 2px dashed #4299e1;
        pointer-events: none;
        box-sizing: border-box;
        z-index: 1000;
      `

      // Create resize handles
      const handles: HTMLDivElement[] = []
      const positions = [
        { pos: 'nw', cursor: 'nwse-resize', top: '-8px', left: '-8px' },
        { pos: 'ne', cursor: 'nesw-resize', top: '-8px', right: '-8px' },
        { pos: 'sw', cursor: 'nesw-resize', bottom: '-8px', left: '-8px' },
        { pos: 'se', cursor: 'nwse-resize', bottom: '-8px', right: '-8px' }
      ]

      positions.forEach(({ pos, cursor, ...style }) => {
        const handle = document.createElement('div')
        handle.className = `ql-image-resize-handle ql-image-resize-handle-${pos}`
        handle.style.cssText = `
          position: absolute;
          width: 16px;
          height: 16px;
          background: #4299e1;
          border: 2px solid white;
          border-radius: 50%;
          cursor: ${cursor};
          pointer-events: all;
          z-index: 1001;
          ${Object.entries(style).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
        `
        overlay.appendChild(handle)
        handles.push(handle)
      })

      // Position overlay
      const container = editorElement.parentElement
      if (!container) return

      const updateOverlayPosition = () => {
        const rect = img.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        overlay.style.left = `${rect.left - containerRect.left + container.scrollLeft}px`
        overlay.style.top = `${rect.top - containerRect.top + container.scrollTop}px`
        overlay.style.width = `${rect.width}px`
        overlay.style.height = `${rect.height}px`
      }

      updateOverlayPosition()
      container.appendChild(overlay)

      // Add resize functionality
      let startX = 0
      let startY = 0
      let startWidth = 0
      let startHeight = 0
      let aspectRatio = 0

      const handleMouseDown = (e: MouseEvent, corner: string) => {
        e.preventDefault()
        e.stopPropagation()
        resizeRef.current.isResizing = true

        startX = e.clientX
        startY = e.clientY
        startWidth = img.offsetWidth
        startHeight = img.offsetHeight
        aspectRatio = startWidth / startHeight

        const handleMouseMove = (e: MouseEvent) => {
          if (!resizeRef.current.isResizing) return

          const deltaX = e.clientX - startX
          const deltaY = e.clientY - startY

          let newWidth = startWidth
          let newHeight = startHeight

          if (corner.includes('e')) newWidth = startWidth + deltaX
          if (corner.includes('w')) newWidth = startWidth - deltaX
          if (corner.includes('s')) newHeight = startHeight + deltaY
          if (corner.includes('n')) newHeight = startHeight - deltaY

          // Maintain aspect ratio
          if (corner === 'se' || corner === 'nw') {
            newHeight = newWidth / aspectRatio
          } else if (corner === 'sw' || corner === 'ne') {
            newHeight = newWidth / aspectRatio
          }

          // Minimum size
          newWidth = Math.max(50, newWidth)
          newHeight = Math.max(50, newHeight)

          // Update image dimensions directly
          img.style.width = `${newWidth}px`
          img.style.height = `${newHeight}px`
          img.setAttribute('width', String(newWidth))
          img.setAttribute('height', String(newHeight))
          
          updateOverlayPosition()
        }

        const handleMouseUp = () => {
          resizeRef.current.isResizing = false
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }

      handles[0].addEventListener('mousedown', (e) => handleMouseDown(e, 'nw'))
      handles[1].addEventListener('mousedown', (e) => handleMouseDown(e, 'ne'))
      handles[2].addEventListener('mousedown', (e) => handleMouseDown(e, 'sw'))
      handles[3].addEventListener('mousedown', (e) => handleMouseDown(e, 'se'))

      resizeRef.current = {
        img,
        overlay,
        handles,
        isResizing: false
      }

      // Update overlay on scroll
      const scrollHandler = () => updateOverlayPosition()
      editorElement.parentElement?.addEventListener('scroll', scrollHandler)

      // Store cleanup
      ;(overlay as any)._cleanup = () => {
        editorElement.parentElement?.removeEventListener('scroll', scrollHandler)
      }
    }

    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' && target.closest('.ql-editor')) {
        const img = target as HTMLImageElement
        
        // Remove existing overlay if clicking different image
        if (resizeRef.current.img !== img && resizeRef.current.overlay) {
          const cleanup = (resizeRef.current.overlay as any)?._cleanup
          if (cleanup) cleanup()
          resizeRef.current.overlay.remove()
          resizeRef.current.overlay = null
        }

        // Create resize handles for clicked image
        if (resizeRef.current.img !== img) {
          createResizeHandles(img)
        } else {
          // Clicking same image - remove handles
          if (resizeRef.current.overlay) {
            const cleanup = (resizeRef.current.overlay as any)?._cleanup
            if (cleanup) cleanup()
            resizeRef.current.overlay.remove()
            resizeRef.current.overlay = null
          }
          resizeRef.current.img = null
        }
      } else {
        // Click outside - remove handles
        if (resizeRef.current.overlay) {
          const cleanup = (resizeRef.current.overlay as any)?._cleanup
          if (cleanup) cleanup()
          resizeRef.current.overlay.remove()
          resizeRef.current.overlay = null
        }
        resizeRef.current.img = null
      }
    }

    editorElement.addEventListener('click', handleImageClick)

    return () => {
      editorElement.removeEventListener('click', handleImageClick)
      if (resizeRef.current.overlay) {
        const cleanup = (resizeRef.current.overlay as any)?._cleanup
        if (cleanup) cleanup()
        resizeRef.current.overlay.remove()
      }
    }
  }, [isMounted, blogId])

  useEffect(() => {
    if (!isMounted) return
    return setupImageResize()
  }, [isMounted, setupImageResize])

  // Upload image helper function
  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return null
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB')
      return null
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const formData = new FormData()
      formData.append('file', file)
      if (blogId) {
        formData.append('blogId', blogId)
      }

      const response = await fetch('/api/blog/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload image')
      }

      return result.url
    } catch (error) {
      console.error('Image upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
      return null
    }
  }, [blogId])

  // Custom image handler for React Quill toolbar button
  const imageHandler = useCallback(async () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const quill = quillRef.current
      if (!quill) {
        alert('Editor not ready. Please try again.')
        return
      }

      const range = quill.getSelection(true) || { index: quill.getLength() }
      
      quill.insertText(range.index, 'Uploading image...', 'user')
      quill.setSelection(range.index + 18)

      const imageUrl = await uploadImage(file)

      if (imageUrl) {
        quill.deleteText(range.index, 18)
        quill.insertEmbed(range.index, 'image', imageUrl, 'user')
        quill.setSelection(range.index + 1)
      } else {
        quill.deleteText(range.index, 18)
      }
    }
  }, [uploadImage])

  // Handle drag and drop
  useEffect(() => {
    if (!isMounted) return

    const editorId = `quill-editor-${blogId || 'new'}`
    
    const setupDragDrop = () => {
      const editorContainer = document.querySelector(`#${editorId} .ql-container`) as HTMLElement
      const editorElement = document.querySelector(`#${editorId} .ql-editor`) as HTMLElement
      
      if (!editorContainer || !editorElement) {
        setTimeout(setupDragDrop, 100)
        return
      }

      const container = editorContainer as any
      const quill = container.__quill || (window as any).Quill?.find(container)
      if (quill) {
        quillRef.current = quill
      }

      const handleDragOver = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'copy'
        }
      }

      const handleDrop = async (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        const file = e.dataTransfer?.files?.[0]
        if (!file || !file.type.startsWith('image/')) {
          return false
        }

        let quill = quillRef.current
        if (!quill) {
          const container = editorContainer as any
          quill = container.__quill || (window as any).Quill?.find(container)
          if (!quill) {
            alert('Editor not ready. Please try again.')
            return false
          }
          quillRef.current = quill
        }

        const clipboard = quill.getModule('clipboard')
        const originalMatchers = clipboard?.matchers ? [...clipboard.matchers] : []
        if (clipboard) {
          clipboard.matchers = []
        }

        const range = quill.getSelection(true) || { index: quill.getLength() }
        
        quill.insertText(range.index, 'Uploading image...', 'user')
        quill.setSelection(range.index + 18)

        const imageUrl = await uploadImage(file)

        if (imageUrl) {
          quill.deleteText(range.index, 18)
          quill.insertEmbed(range.index, 'image', imageUrl, 'user')
          quill.setSelection(range.index + 1)
        } else {
          quill.deleteText(range.index, 18)
        }

        if (clipboard && originalMatchers.length > 0) {
          clipboard.matchers = originalMatchers
        }

        return false
      }

      editorContainer.addEventListener('dragover', handleDragOver, true)
      editorContainer.addEventListener('drop', handleDrop, true)
      editorElement.addEventListener('dragover', handleDragOver, true)
      editorElement.addEventListener('drop', handleDrop, true)

      return () => {
        editorContainer.removeEventListener('dragover', handleDragOver, true)
        editorContainer.removeEventListener('drop', handleDrop, true)
        editorElement.removeEventListener('dragover', handleDragOver, true)
        editorElement.removeEventListener('drop', handleDrop, true)
      }
    }

    const cleanup = setupDragDrop()
    return cleanup
  }, [uploadImage, blogId, isMounted])

  // Store Quill instance when editor is ready
  const handleEditorReady = useCallback(() => {
    setTimeout(() => {
      const editorId = `quill-editor-${blogId || 'new'}`
      const container = document.querySelector(`#${editorId} .ql-container`) as any
      if (container) {
        const quillInstance = container.__quill || (window as any).Quill?.find(container)
        if (quillInstance) {
          quillRef.current = quillInstance
        }
      }
    }, 100)
  }, [blogId])

  // Configure Quill modules
  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'font': [] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['blockquote', 'code-block'],
          ['clean']
        ],
        handlers: {
          image: imageHandler
        }
      },
      clipboard: {
        matchVisual: false,
        matchers: []
      }
    }
  }, [imageHandler])

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ]

  return (
    <div>
      <div 
        ref={editorRef}
        id={`quill-editor-${blogId || 'new'}`}
        className={`border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={(content) => {
            onChange(content)
            if (!quillRef.current && isMounted) {
              handleEditorReady()
            }
          }}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{
            minHeight: '400px'
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-sm text-gray-500">
        💡 Tip: Click on an image to see resize handles. Drag the corners to resize.
      </p>
      <style jsx global>{`
        .ql-container {
          min-height: 400px;
          font-size: 16px;
          position: relative;
        }
        .ql-editor {
          min-height: 400px;
        }
        .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        .ql-snow .ql-tooltip {
          z-index: 1000;
        }
        .ql-container.ql-snow {
          border: none;
        }
        .ql-toolbar.ql-snow {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: none;
        }
        .ql-editor img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
          display: inline-block;
        }
        .ql-image-resize-overlay {
          position: absolute;
          border: 2px dashed #4299e1;
          pointer-events: none;
          box-sizing: border-box;
          z-index: 1000;
        }
        .ql-image-resize-handle {
          position: absolute;
          width: 16px;
          height: 16px;
          background: #4299e1;
          border: 2px solid white;
          border-radius: 50%;
          cursor: nwse-resize;
          pointer-events: all;
          z-index: 1001;
        }
      `}</style>
    </div>
  )
}
