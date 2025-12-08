'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  UserPlus,
  Award,
  Calendar,
  Mail,
  Phone,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  History,
  Settings,
  GripVertical,
  Search,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface CommitteePosition {
  id: string
  name: string
  display_order: number
  description?: string
  is_active: boolean
}

interface CommitteeMember {
  id: string
  profile_id: string // REQUIRED: All members must have a profile
  committee_type: 'advisory' | 'executive'
  position_type_id?: string | null
  position_name?: string | null
  start_date: string
  end_date?: string | null
  is_current: boolean
  display_order: number
  metadata?: any
  profile: {
    id: string
    full_name: string
    email?: string
    phone?: string
    avatar_url?: string
    bio?: string
    profession?: string
    company?: string
    location?: string
    professional_title_id?: number | null
    professional_title?: string | null
    professional_title_category?: string | null
  }
}

export default function AdminCommitteePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<CommitteeMember[]>([])
  const [positions, setPositions] = useState<CommitteePosition[]>([])
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [showPositionForm, setShowPositionForm] = useState(false)
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null)
  const [editingPosition, setEditingPosition] = useState<CommitteePosition | null>(null)
  const [selectedType, setSelectedType] = useState<'advisory' | 'executive'>('executive')
  const [profiles, setProfiles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [profileSearchTerm, setProfileSearchTerm] = useState('')
  const [draggedMember, setDraggedMember] = useState<CommitteeMember | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null) // Track which index we're hovering over
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)

  const [memberForm, setMemberForm] = useState({
    profile_id: '', // REQUIRED: Must select from profiles
    committee_type: 'executive' as 'advisory' | 'executive',
    position_type_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_current: true,
    display_order: 0
  })

  const [positionForm, setPositionForm] = useState({
    name: '',
    description: '',
    display_order: 0
  })

  useEffect(() => {
    checkAuth()
    loadData()
    // Load initial profiles (without search term to show all)
    loadProfiles()
  }, [])

  // Reload profiles when search term changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showAddMemberModal) {
        loadProfiles(profileSearchTerm)
      }
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timer)
  }, [profileSearchTerm, showAddMemberModal])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const canAccess = data?.role === 'super_admin' || data?.role === 'event_manager' || data?.role === 'content_moderator'
      if (!canAccess) {
        alert('You do not have permission to access Committee Management.')
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      // Load members and positions in parallel
      await Promise.all([
        loadMembers(),
        loadPositions()
        // loadProfiles is called separately in useEffect to support search
      ])
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 50))
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading committee data')
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('committee_members')
      .select(`
        *,
        position_type:committee_position_types(name),
        profile:profiles!profile_id(
          id, 
          full_name, 
          email, 
          phone, 
          avatar_url, 
          bio, 
          profession, 
          company, 
          location,
          professional_title_id,
          professional_titles(title, category)
        )
      `)
      .order('is_current', { ascending: false })
      .order('display_order', { ascending: true })

    if (error) throw error

    const formatted = data?.map(m => {
      const positionType = Array.isArray(m.position_type) ? m.position_type[0] : m.position_type
      const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile
      
      // Extract professional title from joined data
      const professionalTitle = profile?.professional_titles
        ? (Array.isArray(profile.professional_titles) 
            ? profile.professional_titles[0] 
            : profile.professional_titles)
        : null
      
      return {
        ...m,
        position_name: positionType?.name || null,
        position_type: positionType,
        profile: profile ? {
          ...profile,
          professional_title: professionalTitle?.title || null,
          professional_title_category: professionalTitle?.category || null
        } : null
      }
    }).filter(m => m.profile !== null) || [] // Filter out any members without profiles

    // Sort by display_order first (to maintain drag-and-drop order), then by name for same order
    formatted.sort((a, b) => {
      // First sort by display_order
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order
      }
      // If display_order is the same, sort by name
      const nameA = a.profile?.full_name || ''
      const nameB = b.profile?.full_name || ''
      return nameA.localeCompare(nameB)
    })

    // Force state update with new array reference
    setMembers([...formatted])
  }

  const loadPositions = async () => {
    const { data, error } = await supabase
      .from('committee_position_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    setPositions(data || [])
  }

  const loadProfiles = async (searchTerm?: string) => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          email, 
          avatar_url,
          professional_title_id,
          professional_titles(title, category)
        `)
        .eq('is_approved', true)

      // If search term provided, use server-side search with ilike (case-insensitive pattern matching)
      // Search in name, email, and professional title
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.trim().toLowerCase()
        // Note: We can't directly search in joined table, so we search in name/email
        // and then filter by title client-side if needed
        query = query.or(`full_name.ilike.%${searchLower}%,email.ilike.%${searchLower}%`)
        // When searching, limit to 500 results
        query = query.order('full_name', { ascending: true }).limit(500)
      } else {
        // When no search term, load more profiles (up to 2000) for browsing
        query = query.order('full_name', { ascending: true }).limit(2000)
      }

      const { data, error } = await query
      if (error) throw error
      
      // Process profiles to extract professional titles and add client-side title search
      const processedProfiles = (data || []).map(p => {
        const professionalTitle = p.professional_titles
          ? (Array.isArray(p.professional_titles) ? p.professional_titles[0] : p.professional_titles)
          : null
        
        return {
          ...p,
          professional_title: professionalTitle?.title || null,
          professional_title_category: professionalTitle?.category || null
        }
      })
      
      // If search term exists, also filter by professional title client-side
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.trim().toLowerCase()
        const filtered = processedProfiles.filter(p => 
          p.full_name.toLowerCase().includes(searchLower) ||
          p.email?.toLowerCase().includes(searchLower) ||
          p.professional_title?.toLowerCase().includes(searchLower)
        )
        setProfiles(filtered)
      } else {
        setProfiles(processedProfiles)
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
      setProfiles([])
    }
  }

  const handleProfileSelect = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setMemberForm(prev => ({
        ...prev,
        profile_id: profileId
      }))
    }
  }

  const handleSaveMember = async () => {
    try {
      if (!memberForm.profile_id) {
        alert('Please select an alumni profile. All committee members must be existing alumni.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const memberData = {
        profile_id: memberForm.profile_id, // REQUIRED
        committee_type: memberForm.committee_type,
        position_type_id: memberForm.position_type_id || null,
        start_date: memberForm.start_date,
        end_date: memberForm.end_date || null,
        is_current: memberForm.is_current,
        display_order: memberForm.display_order,
        created_by: user.id,
        updated_by: user.id
      }

      if (editingMember) {
        const { error } = await supabase
          .from('committee_members')
          .update(memberData)
          .eq('id', editingMember.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('committee_members')
          .insert([memberData])
        if (error) throw error
      }

      await loadData()
      setShowMemberForm(false)
      setEditingMember(null)
      resetMemberForm()
    } catch (error: any) {
      console.error('Error saving member:', error)
      alert(`Error saving member: ${error.message}`)
    }
  }

  const handleSavePosition = async () => {
    try {
      const positionData = {
        ...positionForm,
        is_active: true
      }

      if (editingPosition) {
        const { error } = await supabase
          .from('committee_position_types')
          .update(positionData)
          .eq('id', editingPosition.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('committee_position_types')
          .insert([positionData])
        if (error) throw error
      }

      await loadPositions()
      setShowPositionForm(false)
      setEditingPosition(null)
      resetPositionForm()
    } catch (error: any) {
      console.error('Error saving position:', error)
      alert(`Error saving position: ${error.message}`)
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this committee member?')) return

    try {
      const { error } = await supabase
        .from('committee_members')
        .delete()
        .eq('id', id)
      if (error) throw error
      await loadData()
    } catch (error: any) {
      console.error('Error deleting member:', error)
      alert(`Error deleting member: ${error.message}`)
    }
  }

  const handleEndTenure = async (member: CommitteeMember) => {
    const endDate = prompt('Enter end date (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!endDate) return

    try {
      const { error } = await supabase
        .from('committee_members')
        .update({ 
          end_date: endDate,
          is_current: false
        })
        .eq('id', member.id)
      if (error) throw error
      await loadData()
    } catch (error: any) {
      console.error('Error ending tenure:', error)
      alert(`Error ending tenure: ${error.message}`)
    }
  }

  const handleMoveOrder = async (member: CommitteeMember, direction: 'up' | 'down') => {
    const currentMembers = members
      .filter(m => m.committee_type === member.committee_type && m.is_current === member.is_current)
      .sort((a, b) => a.display_order - b.display_order)

    const currentIndex = currentMembers.findIndex(m => m.id === member.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= currentMembers.length) return

    const otherMember = currentMembers[newIndex]
    const tempOrder = member.display_order

    try {
      await supabase
        .from('committee_members')
        .update({ display_order: otherMember.display_order })
        .eq('id', member.id)

      await supabase
        .from('committee_members')
        .update({ display_order: tempOrder })
        .eq('id', otherMember.id)

      await loadData()
    } catch (error: any) {
      console.error('Error moving order:', error)
      alert(`Error updating order: ${error.message}`)
    }
  }

  const resetMemberForm = () => {
    setMemberForm({
      profile_id: '',
      committee_type: 'executive',
      position_type_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_current: true,
      display_order: 0
    })
  }

  const resetPositionForm = () => {
    setPositionForm({
      name: '',
      description: '',
      display_order: positions.length
    })
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, member: CommitteeMember) => {
    setDraggedMember(member)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, targetPositionId?: string | null) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverPosition(targetPositionId !== undefined ? targetPositionId : null)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // Clear drag state after a short delay to allow drop handler to complete
    // This prevents race conditions
    setTimeout(() => {
      setDraggedMember(null)
      setDragOverPosition(null)
      setDragOverIndex(null)
    }, 100)
  }

  const handleDrop = async (e: React.DragEvent, targetPositionId?: string | null, targetIndex?: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedMember) {
      return
    }

    try {
      // Determine target position (null means General Members, undefined means same position)
      const isMovingToGeneral = targetPositionId === null
      const isMovingToPosition = targetPositionId !== undefined && targetPositionId !== null
      
      // Get ALL members in the target group (including dragged member if already there)
      // Use the same filtering logic as the UI uses for display
      const allTargetGroupMembers = members
        .filter(m => {
          // Match committee type and current status
          if (m.committee_type !== draggedMember.committee_type || !m.is_current) {
            return false
          }
          
          if (isMovingToGeneral) {
            // General Members: no position
            return !m.position_type_id
          } else if (isMovingToPosition) {
            // Specific position
            return m.position_type_id === targetPositionId
          } else {
            // Same position - keep in current position group
            return m.position_type_id === draggedMember.position_type_id
          }
        })
        .sort((a, b) => a.display_order - b.display_order)

      // Find the dragged member's current index in the target group (if it's already there)
      const draggedMemberCurrentIndex = allTargetGroupMembers.findIndex(m => m.id === draggedMember.id)
      const isMovingWithinSameGroup = draggedMemberCurrentIndex >= 0

      // Get members excluding the dragged member (for calculating insertion point)
      const targetGroupMembersWithoutDragged = allTargetGroupMembers.filter(m => m.id !== draggedMember.id)

      // Calculate the correct insertion index
      // The targetIndex from UI is the visual position (including dragged member)
      // We need to convert it to the position in the list without the dragged member
      let insertionIndex: number
      
      if (targetIndex === undefined || targetIndex === null) {
        // No specific index - append to end
        insertionIndex = targetGroupMembersWithoutDragged.length
      } else if (isMovingWithinSameGroup) {
        // Dragging within the same group - need to adjust for the removed item
        if (draggedMemberCurrentIndex < targetIndex) {
          // Moving forward: targetIndex already accounts for the dragged member's position
          // But when we remove it, everything shifts left by 1
          insertionIndex = targetIndex - 1
        } else {
          // Moving backward: targetIndex doesn't account for the dragged member yet
          insertionIndex = targetIndex
        }
      } else {
        // Moving to a different group - index is correct as-is
        insertionIndex = targetIndex
      }
      
      // Ensure insertionIndex is within valid bounds
      insertionIndex = Math.max(0, Math.min(insertionIndex, targetGroupMembersWithoutDragged.length))

      // Calculate new display order
      let newDisplayOrder: number
      
      if (insertionIndex <= 0) {
        // Insert at beginning
        const firstMember = targetGroupMembersWithoutDragged[0]
        newDisplayOrder = firstMember ? Math.max(0, firstMember.display_order - 10) : 0
      } else if (insertionIndex >= targetGroupMembersWithoutDragged.length) {
        // Insert at end
        const lastMember = targetGroupMembersWithoutDragged[targetGroupMembersWithoutDragged.length - 1]
        newDisplayOrder = lastMember ? lastMember.display_order + 10 : 0
      } else {
        // Insert between two members
        const prevMember = targetGroupMembersWithoutDragged[insertionIndex - 1]
        const nextMember = targetGroupMembersWithoutDragged[insertionIndex]
        
        if (prevMember && nextMember) {
          const prevOrder = prevMember.display_order
          const nextOrder = nextMember.display_order
          const gap = nextOrder - prevOrder
          
          if (gap > 1) {
            // There's space between them - use the middle
            newDisplayOrder = Math.floor((prevOrder + nextOrder) / 2)
          } else {
            // No space - need to shift members after insertion point
            // First, update the dragged member with a temporary high order
            newDisplayOrder = nextOrder
            
            // Shift all members from insertion point onwards
            const membersToShift = targetGroupMembersWithoutDragged.slice(insertionIndex)
            if (membersToShift.length > 0) {
              // Update all members after insertion to have higher display_order
              const shiftAmount = 10
              for (const member of membersToShift) {
                await supabase
                  .from('committee_members')
                  .update({ display_order: member.display_order + shiftAmount })
                  .eq('id', member.id)
              }
              // Recalculate newDisplayOrder after shift
              newDisplayOrder = prevOrder + Math.floor(shiftAmount / 2)
            }
          }
        } else if (prevMember) {
          newDisplayOrder = prevMember.display_order + 10
        } else if (nextMember) {
          newDisplayOrder = Math.max(0, nextMember.display_order - 10)
        } else {
          newDisplayOrder = 0
        }
      }

      // Update member
      const updateData: any = {
        display_order: newDisplayOrder
      }

      // Update position if moving to a different position or General Members
      if (isMovingToGeneral) {
        // Moving to General Members (no position)
        updateData.position_type_id = null
      } else if (isMovingToPosition) {
        // Moving to a specific position
        updateData.position_type_id = targetPositionId
      }
      // If isSamePosition, we only update display_order (position stays the same)

      const { error: updateError } = await supabase
        .from('committee_members')
        .update(updateData)
        .eq('id', draggedMember.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      // Clear drag state immediately to prevent visual glitches
      setDraggedMember(null)
      setDragOverPosition(null)
      setDragOverIndex(null)

      // Reload data to refresh UI
      await loadData()
      
      // Force a small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error: any) {
      console.error('Error moving member:', error)
      alert(`Error moving member: ${error.message}`)
      // Clear drag state even on error
      setDraggedMember(null)
      setDragOverPosition(null)
      setDragOverIndex(null)
    }
  }

  const handleQuickAdd = async (profileId: string, positionId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get max display order for this position
      const sameGroupMembers = currentMembers.filter(m => 
        m.committee_type === selectedType &&
        (positionId ? m.position_type_id === positionId : !m.position_type_id)
      )
      const maxOrder = sameGroupMembers.length > 0 
        ? Math.max(...sameGroupMembers.map(m => m.display_order))
        : 0

      const memberData = {
        profile_id: profileId,
        committee_type: selectedType,
        position_type_id: positionId || null,
        start_date: new Date().toISOString().split('T')[0],
        is_current: true,
        display_order: maxOrder + 1,
        created_by: user.id,
        updated_by: user.id
      }

      const { error } = await supabase
        .from('committee_members')
        .insert([memberData])

      if (error) throw error

      await loadData()
      setShowAddMemberModal(false)
      setProfileSearchTerm('')
      loadProfiles() // Reset profile list
    } catch (error: any) {
      console.error('Error adding member:', error)
      alert(`Error adding member: ${error.message}`)
    }
  }

  const filteredMembers = members.filter(m => {
    const matchesType = m.committee_type === selectedType
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      m.profile?.full_name.toLowerCase().includes(searchLower) ||
      m.profile?.professional_title?.toLowerCase().includes(searchLower) ||
      m.position_name?.toLowerCase().includes(searchLower) ||
      m.profile?.email?.toLowerCase().includes(searchLower)
    return matchesType && matchesSearch
  })

  const currentMembers = filteredMembers.filter(m => m.is_current)
  const pastMembers = filteredMembers.filter(m => !m.is_current)

  // Group executive members by position
  const groupedExecutiveMembers = selectedType === 'executive' ? positions.reduce((acc, position) => {
    const membersInPosition = currentMembers
      .filter(m => m.position_type_id === position.id)
      .sort((a, b) => a.display_order - b.display_order)
    if (membersInPosition.length > 0) {
      acc[position.id] = {
        position,
        members: membersInPosition
      }
    }
    return acc
  }, {} as Record<string, { position: CommitteePosition; members: CommitteeMember[] }>) : {}

  // Members without position
  const membersWithoutPosition = currentMembers.filter(m => !m.position_type_id)

  // Filter available profiles (exclude already added members)
  // Note: Server-side search is already applied in loadProfiles, so we just filter out existing members
  const existingMemberProfileIds = new Set(members.filter(m => m.is_current && m.committee_type === selectedType).map(m => m.profile_id))
  const filteredAvailableProfiles = profiles.filter(p => !existingMemberProfileIds.has(p.id))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Committee Management</h1>
          <p className="text-gray-600">Manage advisory and executive committee members</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setSelectedType('executive')}
            className={`px-4 py-2 font-medium ${
              selectedType === 'executive'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Executive Committee
          </button>
          <button
            onClick={() => setSelectedType('advisory')}
            className={`px-4 py-2 font-medium ${
              selectedType === 'advisory'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Advisory Members
          </button>
          <button
            onClick={() => setShowPositionForm(true)}
            className="ml-auto px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Positions
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => {
              setShowAddMemberModal(true)
              setProfileSearchTerm('')
              loadProfiles() // Load all profiles when opening modal
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {selectedType === 'executive' ? 'Executive' : 'Advisory'} Member
          </button>
        </div>

        {/* Current Members - Organized by Position for Executive */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Members</h2>
          
          {selectedType === 'executive' ? (
            <div className="space-y-6">
              {/* Members grouped by position */}
              {positions.map((position) => {
                const group = groupedExecutiveMembers[position.id]
                if (!group || group.members.length === 0) return null

                return (
                  <div key={position.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary-600" />
                      {position.name}
                    </h3>
                    <div className="space-y-2">
                      {group.members.map((member, index) => (
                        <div key={member.id} className="relative">
                          {/* Drop zone before this member (for reordering) - More visible */}
                          <div
                            className={`absolute -top-3 left-0 right-0 h-6 z-20 transition-all rounded pointer-events-auto ${
                              dragOverPosition === position.id && 
                              dragOverIndex === index && 
                              draggedMember?.id !== member.id
                                ? 'bg-primary-200 border-2 border-primary-500 border-dashed' 
                                : draggedMember ? 'bg-transparent' : 'bg-transparent'
                            }`}
                            onDragEnter={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (draggedMember && draggedMember.id !== member.id) {
                                setDragOverPosition(position.id)
                                setDragOverIndex(index)
                              }
                            }}
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (draggedMember && draggedMember.id !== member.id) {
                                setDragOverPosition(position.id)
                                setDragOverIndex(index)
                              }
                            }}
                            onDragLeave={(e) => {
                              // Only clear if we're actually leaving the drop zone
                              const rect = e.currentTarget.getBoundingClientRect()
                              const x = e.clientX
                              const y = e.clientY
                              if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                                setDragOverIndex(null)
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (draggedMember) {
                                handleDrop(e, position.id, index)
                              }
                            }}
                          >
                            {dragOverPosition === position.id && 
                             dragOverIndex === index && 
                             draggedMember?.id !== member.id && (
                              <div className="flex items-center justify-center h-full">
                                <div className="w-full h-0.5 bg-primary-500"></div>
                              </div>
                            )}
                          </div>
                          <div
                            onDragOver={(e) => {
                              if (draggedMember && draggedMember.id !== member.id) {
                                e.preventDefault()
                                e.stopPropagation()
                                setDragOverPosition(position.id)
                                setDragOverIndex(index + 1) // Insert after this card
                              }
                            }}
                            onDrop={(e) => {
                              if (draggedMember && draggedMember.id !== member.id) {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDrop(e, position.id, index + 1)
                              }
                            }}
                          >
                            <MemberCardDraggable
                              member={member}
                              index={index}
                              onDragStart={handleDragStart}
                              onDragEnd={(e) => handleDragEnd(e)}
                              onEdit={() => {
                                setEditingMember(member)
                                setMemberForm({
                                  profile_id: member.profile_id,
                                  committee_type: member.committee_type,
                                  position_type_id: member.position_type_id || '',
                                  start_date: member.start_date,
                                  end_date: member.end_date || '',
                                  is_current: member.is_current,
                                  display_order: member.display_order
                                })
                                setShowMemberForm(true)
                              }}
                              onDelete={() => handleDeleteMember(member.id)}
                              onEndTenure={() => handleEndTenure(member)}
                              isDragging={draggedMember?.id === member.id}
                              isDragOver={dragOverPosition === position.id && (dragOverIndex === index || dragOverIndex === index + 1)}
                            />
                          </div>
                        </div>
                      ))}
                      {/* Drop zone at the end of this position (for reordering) - More visible */}
                      <div
                        className={`relative h-8 transition-all rounded ${
                          dragOverPosition === position.id && 
                          dragOverIndex === group.members.length
                            ? 'bg-primary-200 border-2 border-primary-500 border-dashed' 
                            : 'bg-transparent'
                        }`}
                        onDragEnter={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDragOverPosition(position.id)
                          setDragOverIndex(group.members.length)
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDragOverPosition(position.id)
                          setDragOverIndex(group.members.length)
                        }}
                        onDragLeave={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const x = e.clientX
                          const y = e.clientY
                          if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                            setDragOverIndex(null)
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (draggedMember) {
                            handleDrop(e, position.id, group.members.length)
                          }
                        }}
                      >
                        {dragOverPosition === position.id && 
                         dragOverIndex === group.members.length && (
                          <div className="flex items-center justify-center h-full">
                            <div className="w-full h-0.5 bg-primary-500"></div>
                          </div>
                        )}
                      </div>
                      {/* Drop zone for adding to this position from other positions */}
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm hover:border-primary-400 transition-colors"
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDragOver(e, position.id)
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDrop(e, position.id)
                        }}
                      >
                        Drop member here to add to {position.name}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Members without position */}
              {membersWithoutPosition.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    General Members
                  </h3>
                  <div className="space-y-2">
                    {membersWithoutPosition.map((member, index) => (
                      <div key={member.id} className="relative">
                        {/* Drop zone before this member (for reordering) - More visible */}
                        <div
                          className={`absolute -top-3 left-0 right-0 h-6 z-10 transition-all rounded ${
                            dragOverPosition === null && 
                            dragOverIndex === index && 
                            draggedMember?.id !== member.id
                              ? 'bg-primary-200 border-2 border-primary-500 border-dashed' 
                              : 'bg-transparent'
                          }`}
                          onDragEnter={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDragOverPosition(null)
                            setDragOverIndex(index)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDragOverPosition(null)
                            setDragOverIndex(index)
                          }}
                          onDragLeave={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = e.clientX
                            const y = e.clientY
                            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                              setDragOverIndex(null)
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDrop(e, null, index)
                          }}
                        >
                          {dragOverPosition === null && 
                           dragOverIndex === index && 
                           draggedMember?.id !== member.id && (
                            <div className="flex items-center justify-center h-full">
                              <div className="w-full h-0.5 bg-primary-500"></div>
                            </div>
                          )}
                        </div>
                        <div
                          onDragOver={(e) => {
                            if (draggedMember && draggedMember.id !== member.id) {
                              e.preventDefault()
                              e.stopPropagation()
                              setDragOverPosition(null)
                              setDragOverIndex(index + 1) // Insert after this card
                            }
                          }}
                          onDrop={(e) => {
                            if (draggedMember && draggedMember.id !== member.id) {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDrop(e, null, index + 1)
                            }
                          }}
                        >
                          <MemberCardDraggable
                            member={member}
                            index={index}
                            onDragStart={handleDragStart}
                            onDragEnd={(e) => handleDragEnd(e)}
                            onEdit={() => {
                              setEditingMember(member)
                              setMemberForm({
                                profile_id: member.profile_id,
                                committee_type: member.committee_type,
                                position_type_id: member.position_type_id || '',
                                start_date: member.start_date,
                                end_date: member.end_date || '',
                                is_current: member.is_current,
                                display_order: member.display_order
                              })
                              setShowMemberForm(true)
                            }}
                            onDelete={() => handleDeleteMember(member.id)}
                            onEndTenure={() => handleEndTenure(member)}
                            isDragging={draggedMember?.id === member.id}
                            isDragOver={dragOverPosition === null && (dragOverIndex === index || dragOverIndex === index + 1)}
                          />
                        </div>
                      </div>
                    ))}
                    {/* Drop zone at the end of General Members - More visible */}
                      <div
                        className={`relative h-8 transition-all rounded pointer-events-auto ${
                          dragOverPosition === null && 
                          dragOverIndex === membersWithoutPosition.length
                            ? 'bg-primary-200 border-2 border-primary-500 border-dashed' 
                            : draggedMember ? 'bg-transparent' : 'bg-transparent'
                        }`}
                        onDragEnter={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (draggedMember) {
                            setDragOverPosition(null)
                            setDragOverIndex(membersWithoutPosition.length)
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (draggedMember) {
                            setDragOverPosition(null)
                            setDragOverIndex(membersWithoutPosition.length)
                          }
                        }}
                        onDragLeave={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const x = e.clientX
                          const y = e.clientY
                          if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                            setDragOverIndex(null)
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (draggedMember) {
                            handleDrop(e, null, membersWithoutPosition.length)
                          }
                        }}
                      >
                      {dragOverPosition === null && 
                       dragOverIndex === membersWithoutPosition.length && (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-full h-0.5 bg-primary-500"></div>
                        </div>
                      )}
                    </div>
                    {/* Drop zone for moving from positions to General Members */}
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm hover:border-primary-400 transition-colors"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDragOver(e, null)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDrop(e, null)
                      }}
                    >
                      Drop member here to move to General Members
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Advisory Members - Simple List */
            <div className="space-y-2">
              {currentMembers.map((member, index) => (
                <MemberCardDraggable
                  key={member.id}
                  member={member}
                  index={index}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onEdit={() => {
                    setEditingMember(member)
                    setMemberForm({
                      profile_id: member.profile_id,
                      committee_type: member.committee_type,
                      position_type_id: member.position_type_id || '',
                      start_date: member.start_date,
                      end_date: member.end_date || '',
                      is_current: member.is_current,
                      display_order: member.display_order
                    })
                    setShowMemberForm(true)
                  }}
                  onDelete={() => handleDeleteMember(member.id)}
                  onEndTenure={() => handleEndTenure(member)}
                  isDragging={draggedMember?.id === member.id}
                  isDragOver={false}
                />
              ))}
            </div>
          )}

          {currentMembers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No current {selectedType} members</p>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="mt-4 btn-primary"
              >
                Add First Member
              </button>
            </div>
          )}
        </div>

        {/* Past Members */}
        {pastMembers.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Past Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-75">
                  <div className="flex items-center gap-4 mb-4">
                    {member.profile?.avatar_url ? (
                      <Image
                        src={member.profile.avatar_url}
                        alt={member.profile.professional_title 
                          ? `${member.profile.professional_title} ${member.profile.full_name}`
                          : member.profile.full_name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.profile?.professional_title 
                          ? `${member.profile.professional_title} ${member.profile.full_name}`
                          : member.profile?.full_name}
                      </h3>
                      {member.position_name && (
                        <p className="text-sm text-primary-600">{member.position_name}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(member.start_date).getFullYear()} - {member.end_date ? new Date(member.end_date).getFullYear() : 'Present'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Add {selectedType === 'executive' ? 'Executive' : 'Advisory'} Member
                </h2>
                <button onClick={() => {
                  setShowAddMemberModal(false)
                  setProfileSearchTerm('')
                  loadProfiles() // Reset to show all profiles when closing
                }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search alumni by name or email..."
                      value={profileSearchTerm}
                      onChange={(e) => {
                        setProfileSearchTerm(e.target.value)
                        // Search will be triggered by useEffect with debounce
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Select a member from the list below. {selectedType === 'executive' && 'You can assign a position after adding.'}
                  </p>
                </div>

                {selectedType === 'executive' && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Quick Add with Position:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {positions.map(position => (
                        <button
                          key={position.id}
                          onClick={() => {
                            // This will be handled by clicking the profile card
                          }}
                          className="text-xs px-3 py-2 bg-white border border-blue-200 rounded hover:bg-blue-100 text-blue-700"
                          disabled
                        >
                          {position.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-2">Select member first, then assign position by dragging or editing</p>
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAvailableProfiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {profileSearchTerm ? 'No members found' : 'No available members to add'}
                    </div>
                  ) : (
                    filteredAvailableProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleQuickAdd(profile.id)}
                      >
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.professional_title 
                              ? `${profile.professional_title} ${profile.full_name}`
                              : profile.full_name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {profile.professional_title 
                              ? `${profile.professional_title} ${profile.full_name}`
                              : profile.full_name}
                          </p>
                          {profile.email && (
                            <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                          )}
                          {profile.professional_title_category && (
                            <p className="text-xs text-blue-600 truncate">
                              {profile.professional_title_category}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleQuickAdd(profile.id)
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Member Form Modal */}
        {showMemberForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingMember ? 'Edit' : 'Add'} Committee Member
                </h2>
                <button onClick={() => {
                  setShowMemberForm(false)
                  setEditingMember(null)
                  resetMemberForm()
                }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Alumni Profile *
                  </label>
                  <select
                    value={memberForm.profile_id}
                    onChange={(e) => handleProfileSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select alumni profile...</option>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.professional_title 
                          ? `${profile.professional_title} ${profile.full_name}`
                          : profile.full_name} {profile.email ? `(${profile.email})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    All committee members must be existing alumni in the system. Member information will be pulled from their profile.
                  </p>
                  {memberForm.profile_id && (() => {
                    const selectedProfile = profiles.find(p => p.id === memberForm.profile_id)
                    return selectedProfile ? (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{selectedProfile.full_name}</p>
                        {selectedProfile.email && <p className="text-xs text-gray-600">{selectedProfile.email}</p>}
                        {selectedProfile.profession && <p className="text-xs text-gray-600">{selectedProfile.profession}</p>}
                      </div>
                    ) : null
                  })()}
                </div>
                {memberForm.committee_type === 'executive' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <select
                      value={memberForm.position_type_id}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, position_type_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">No specific position</option>
                      {positions.map(pos => (
                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={memberForm.start_date}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (if past member)</label>
                    <input
                      type="date"
                      value={memberForm.end_date}
                      onChange={(e) => setMemberForm(prev => ({ 
                        ...prev, 
                        end_date: e.target.value,
                        is_current: !e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={memberForm.is_current}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, is_current: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="is_current" className="text-sm text-gray-700">Current Member</label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowMemberForm(false)
                    setEditingMember(null)
                    resetMemberForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMember}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Position Form Modal */}
        {showPositionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingPosition ? 'Edit' : 'Add'} Position
                </h2>
                <button onClick={() => {
                  setShowPositionForm(false)
                  setEditingPosition(null)
                  resetPositionForm()
                }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position Name *</label>
                  <input
                    type="text"
                    value={positionForm.name}
                    onChange={(e) => setPositionForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={positionForm.description}
                    onChange={(e) => setPositionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={positionForm.display_order}
                    onChange={(e) => setPositionForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowPositionForm(false)
                    setEditingPosition(null)
                    resetPositionForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePosition}
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Draggable Member Card Component
function MemberCardDraggable({
  member,
  index,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onEndTenure,
  isDragging,
  isDragOver
}: {
  member: CommitteeMember
  index: number
  onDragStart: (e: React.DragEvent, member: CommitteeMember) => void
  onDragEnd: (e: React.DragEvent) => void
  onEdit: () => void
  onDelete: () => void
  onEndTenure: () => void
  isDragging: boolean
  isDragOver: boolean
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, member)}
      onDragEnd={onDragEnd}
      className={`
        bg-white rounded-lg border-2 p-4 flex items-center gap-4 cursor-move
        transition-all duration-200
        ${isDragging ? 'opacity-50 border-primary-400' : 'border-gray-200 hover:border-primary-300 hover:shadow-md'}
        ${isDragOver ? 'border-primary-500 bg-primary-50' : ''}
      `}
    >
      <div className="text-gray-400 hover:text-gray-600">
        <GripVertical className="h-5 w-5" />
      </div>
      
      {member.profile?.avatar_url ? (
        <Image
          src={member.profile.avatar_url}
          alt={member.profile.professional_title 
            ? `${member.profile.professional_title} ${member.profile.full_name}`
            : member.profile.full_name}
          width={56}
          height={56}
          className="rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <Users className="h-7 w-7 text-gray-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {member.profile?.professional_title 
            ? `${member.profile.professional_title} ${member.profile.full_name}`
            : member.profile?.full_name}
        </h3>
        {member.position_name && (
          <p className="text-sm text-primary-600 font-medium">{member.position_name}</p>
        )}
        {member.profile?.email && (
          <p className="text-xs text-gray-500 truncate">{member.profile.email}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Since {new Date(member.start_date).getFullYear()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={onEndTenure}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          title="End Tenure"
        >
          End
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

