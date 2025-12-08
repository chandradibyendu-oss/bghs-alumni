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
  }, [])

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
      await Promise.all([
        loadMembers(),
        loadPositions(),
        loadProfiles()
      ])
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
        profile:profiles!profile_id(id, full_name, email, phone, avatar_url, bio, profession, company, location)
      `)
      .order('is_current', { ascending: false })
      .order('display_order', { ascending: true })

    if (error) throw error

    const formatted = data?.map(m => {
      const positionType = Array.isArray(m.position_type) ? m.position_type[0] : m.position_type
      const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile
      return {
        ...m,
        position_name: positionType?.name || null,
        position_type: positionType,
        profile: profile || null
      }
    }).filter(m => m.profile !== null) || [] // Filter out any members without profiles

    // Sort by profile name
    formatted.sort((a, b) => {
      const nameA = a.profile?.full_name || ''
      const nameB = b.profile?.full_name || ''
      return nameA.localeCompare(nameB)
    })

    setMembers(formatted)
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

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('is_approved', true)
      .order('full_name', { ascending: true })
      .limit(1000)

    if (error) throw error
    setProfiles(data || [])
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

  const handleDragOver = (e: React.DragEvent, targetPositionId?: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverPosition(targetPositionId || null)
  }

  const handleDragEnd = () => {
    setDraggedMember(null)
    setDragOverPosition(null)
  }

  const handleDrop = async (e: React.DragEvent, targetPositionId?: string, targetIndex?: number) => {
    e.preventDefault()
    if (!draggedMember) return

    try {
      // Get all members in the same group (same position or no position)
      const sameGroupMembers = currentMembers
        .filter(m => 
          m.committee_type === draggedMember.committee_type &&
          (targetPositionId 
            ? m.position_type_id === targetPositionId 
            : !m.position_type_id)
        )
        .filter(m => m.id !== draggedMember.id)
        .sort((a, b) => a.display_order - b.display_order)

      // Calculate new display order
      let newDisplayOrder: number
      if (targetIndex !== undefined) {
        // Insert at specific index
        if (targetIndex === 0) {
          newDisplayOrder = sameGroupMembers[0]?.display_order ? sameGroupMembers[0].display_order - 1 : 0
        } else if (targetIndex >= sameGroupMembers.length) {
          newDisplayOrder = sameGroupMembers[sameGroupMembers.length - 1]?.display_order 
            ? sameGroupMembers[sameGroupMembers.length - 1].display_order + 1 
            : sameGroupMembers.length
        } else {
          const prevOrder = sameGroupMembers[targetIndex - 1]?.display_order || 0
          const nextOrder = sameGroupMembers[targetIndex]?.display_order || prevOrder + 1
          newDisplayOrder = Math.floor((prevOrder + nextOrder) / 2)
        }
      } else {
        // Append to end
        const maxOrder = sameGroupMembers.length > 0 
          ? Math.max(...sameGroupMembers.map(m => m.display_order))
          : 0
        newDisplayOrder = maxOrder + 1
      }

      // Update member
      const updateData: any = {
        display_order: newDisplayOrder
      }

      // If position changed
      if (targetPositionId !== undefined) {
        if (targetPositionId && targetPositionId !== draggedMember.position_type_id) {
          updateData.position_type_id = targetPositionId
        } else if (!targetPositionId && draggedMember.position_type_id) {
          updateData.position_type_id = null
        }
      }

      await supabase
        .from('committee_members')
        .update(updateData)
        .eq('id', draggedMember.id)

      await loadData()
    } catch (error: any) {
      console.error('Error moving member:', error)
      alert(`Error moving member: ${error.message}`)
    } finally {
      setDraggedMember(null)
      setDragOverPosition(null)
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
    } catch (error: any) {
      console.error('Error adding member:', error)
      alert(`Error adding member: ${error.message}`)
    }
  }

  const filteredMembers = members.filter(m => {
    const matchesType = m.committee_type === selectedType
    const matchesSearch = !searchTerm || 
      m.profile?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.position_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
  const existingMemberProfileIds = new Set(members.filter(m => m.is_current && m.committee_type === selectedType).map(m => m.profile_id))
  const availableProfiles = profiles.filter(p => !existingMemberProfileIds.has(p.id))
  const filteredAvailableProfiles = availableProfiles.filter(p => 
    !profileSearchTerm || 
    p.full_name.toLowerCase().includes(profileSearchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(profileSearchTerm.toLowerCase())
  )

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
            onClick={() => setShowAddMemberModal(true)}
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
                    <div 
                      className="space-y-2"
                      onDragOver={(e) => handleDragOver(e, position.id)}
                      onDrop={(e) => handleDrop(e, position.id)}
                    >
                      {group.members.map((member, index) => (
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
                          isDragOver={dragOverPosition === position.id}
                        />
                      ))}
                      {/* Drop zone for adding to this position */}
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm hover:border-primary-400 transition-colors"
                        onDragOver={(e) => handleDragOver(e, position.id)}
                        onDrop={(e) => handleDrop(e, position.id)}
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
                  <div 
                    className="space-y-2"
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e)}
                  >
                    {membersWithoutPosition.map((member, index) => (
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
                        isDragOver={dragOverPosition === null}
                      />
                    ))}
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
                        alt={member.profile.full_name}
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
                      <h3 className="font-semibold text-gray-900">{member.profile?.full_name}</h3>
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
                      onChange={(e) => setProfileSearchTerm(e.target.value)}
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
                            alt={profile.full_name}
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
                          <p className="font-medium text-gray-900 truncate">{profile.full_name}</p>
                          {profile.email && (
                            <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                          )}
                          {profile.profession && (
                            <p className="text-xs text-gray-400 truncate">{profile.profession}</p>
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
                        {profile.full_name} {profile.email ? `(${profile.email})` : ''}
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
  onDragEnd: () => void
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
          alt={member.profile.full_name}
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
        <h3 className="font-semibold text-gray-900 truncate">{member.profile?.full_name}</h3>
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

