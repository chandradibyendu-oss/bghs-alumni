'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Clock, Calendar, Trash2 } from 'lucide-react'

interface Activity {
  time: string
  description: string
}

interface DaySchedule {
  date: string
  dayLabel: string // "Day 1", "Day 2", or custom like "January 10, 2026"
  activities: Activity[]
}

interface ProgramScheduleEditorProps {
  startDate: string
  endDate: string
  value: DaySchedule[]
  onChange: (schedule: DaySchedule[]) => void
}

export default function ProgramScheduleEditor({
  startDate,
  endDate,
  value,
  onChange
}: ProgramScheduleEditorProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(value || [])

  // Generate day labels based on dates
  const generateDayLabel = (date: string, index: number) => {
    if (!date) return `Day ${index + 1}`
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Calculate expected day count
  const calculateDayCount = () => {
    if (!startDate) return 0
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : start
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return days
  }

  // Initialize schedule when dates change
  const initializeSchedule = () => {
    if (!startDate) return

    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : start
    const days: DaySchedule[] = []
    
    const currentDate = new Date(start)
    let dayIndex = 0
    
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayLabel = generateDayLabel(dateStr, dayIndex)
      
      // Check if this day already exists in schedule
      const existingDay = schedule.find(d => d.date === dateStr)
      
      days.push({
        date: dateStr,
        dayLabel: existingDay?.dayLabel || dayLabel,
        activities: existingDay?.activities || []
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
      dayIndex++
    }
    
    setSchedule(days)
    onChange(days)
  }

  // Auto-initialize when dates are provided
  useEffect(() => {
    if (startDate && (schedule.length === 0 || schedule.length !== calculateDayCount())) {
      initializeSchedule()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const addActivity = (dayIndex: number) => {
    const updated = [...schedule]
    updated[dayIndex].activities.push({
      time: '',
      description: ''
    })
    setSchedule(updated)
    onChange(updated)
  }

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updated = [...schedule]
    updated[dayIndex].activities.splice(activityIndex, 1)
    setSchedule(updated)
    onChange(updated)
  }

  // Smart time formatting - formats on blur
  // Examples: "2 30 A" → "2:30 AM", "230p" → "2:30 PM", "14:30" → "2:30 PM", "2:30 PM" → "2:30 PM"
  const formatTimeInput = (input: string): string => {
    if (!input || !input.trim()) return ''
    
    const trimmed = input.trim()
    
    // First, extract AM/PM indicator BEFORE cleaning (to catch "p" at the end)
    // Look for A, P, AM, PM at the end, case insensitive
    let ampm = ''
    // Try multiple patterns to catch different formats
    // Pattern 1: "p", "pm", "P", "PM" at the end
    // Pattern 2: "a", "am", "A", "AM" at the end
    const endsWithP = /p(?:m)?\s*$/i.test(trimmed)
    const endsWithA = /a(?:m)?\s*$/i.test(trimmed)
    
    if (endsWithP) {
      ampm = 'PM'
    } else if (endsWithA) {
      ampm = 'AM'
    }
    
    // Now clean the input (remove AM/PM indicators for parsing)
    // Remove p, pm, a, am at the end (case insensitive)
    let cleaned = trimmed.replace(/[ap]m?\s*$/gi, '').trim()
    cleaned = cleaned.replace(/[^\d:\s]/g, '') // Keep only digits, colon, spaces
    
    // Extract all digits
    const digits = cleaned.replace(/\D/g, '')
    const hasColon = cleaned.includes(':')
    
    // Parse hour and minute
    let hour = 0
    let minute = 0
    
    if (hasColon) {
      // Has colon: "2:30" or "14:30"
      const parts = cleaned.split(':')
      if (parts.length >= 2) {
        hour = parseInt(parts[0].replace(/\D/g, '')) || 0
        minute = parseInt(parts[1].replace(/\D/g, '').slice(0, 2)) || 0
      }
    } else if (digits.length > 0) {
      // No colon: parse digits intelligently
      if (digits.length === 1 || digits.length === 2) {
        // "2" or "12" → hour only, default minute to 0
        hour = parseInt(digits) || 0
        minute = 0
      } else if (digits.length === 3) {
        // "230" → "2:30" (first digit is hour, last 2 are minutes)
        hour = parseInt(digits[0]) || 0
        minute = parseInt(digits.slice(1)) || 0
      } else if (digits.length >= 4) {
        // "1230" → "12:30" or "2300" → "2:30"
        // Try to be smart: if first 2 digits <= 12, use as hour, else use first digit
        const firstTwo = parseInt(digits.slice(0, 2)) || 0
        if (firstTwo > 0 && firstTwo <= 12) {
          hour = firstTwo
          minute = parseInt(digits.slice(2, 4)) || 0
        } else {
          hour = parseInt(digits[0]) || 0
          minute = parseInt(digits.slice(1, 3)) || 0
        }
      }
    }
    
    // Validate ranges
    if (hour < 1 || hour > 23 || minute < 0 || minute > 59) {
      return trimmed // Return original if invalid
    }
    
    // Convert 24-hour to 12-hour if needed
    if (hour > 12) {
      hour = hour - 12
      if (!ampm) ampm = 'PM'
    } else if (hour === 0) {
      hour = 12
      if (!ampm) ampm = 'AM'
    } else if (hour === 12 && !ampm) {
      // Default 12 to PM if no AM/PM specified
      ampm = 'PM'
    } else if (!ampm) {
      // Default to AM if no indicator
      ampm = 'AM'
    }
    
    // Final validation and format
    if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`
    }
    
    // Return original if we can't format it
    return trimmed
  }
  
  // Parse time string into hour, minute, and AM/PM for display
  const parseTime = (timeStr: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } => {
    if (!timeStr || !timeStr.trim()) return { hour: 12, minute: 0, ampm: 'AM' }
    
    const trimmed = timeStr.trim()
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    
    if (match) {
      let hour = parseInt(match[1]) || 12
      const minute = parseInt(match[2]) || 0
      const ampm = (match[3]?.toUpperCase() as 'AM' | 'PM') || 'AM'
      
      if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
        return { hour, minute, ampm }
      }
    }
    
    return { hour: 12, minute: 0, ampm: 'AM' }
  }

  // Check if time format is valid (requires AM/PM for clarity)
  const isValidTimeFormat = (time: string): boolean => {
    if (!time || time.trim() === '') return false
    
    const trimmed = time.trim()
    
    // Accept formats with AM/PM (12-hour format preferred)
    const timePatterns = [
      /^\d{1,2}:\d{2}\s*(AM|PM|am|pm)$/i,  // 9:00 AM or 9:00 PM (preferred)
      /^\d{1,2}\s*(AM|PM|am|pm)$/i,       // 9 AM or 9 PM
      /^\d{1,2}:\d{2}:\d{2}\s*(AM|PM|am|pm)$/i  // 9:00:00 AM (with seconds)
    ]
    
    return timePatterns.some(pattern => pattern.test(trimmed))
  }
  
  // Get time validation error message
  const getTimeError = (time: string): string | null => {
    if (!time) return null
    if (isValidTimeFormat(time)) return null
    
    // Check if it's missing AM/PM
    if (/^\d{1,2}:\d{2}$/.test(time.trim())) {
      return 'Please add AM or PM (e.g., 2:30 PM)'
    }
    
    return 'Please use format: 9:00 AM or 2:30 PM'
  }

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    field: 'time' | 'description' | 'toggleAmpm',
    value?: string
  ) => {
    const updated = [...schedule]
    const activity = updated[dayIndex].activities[activityIndex]
    
    if (field === 'time' && value !== undefined) {
      // Store raw input while typing, only format on blur
      activity.time = value
    } else if (field === 'toggleAmpm') {
      // Toggle AM/PM
      const current = parseTime(activity.time)
      const newAmpm = current.ampm === 'AM' ? 'PM' : 'AM'
      activity.time = `${current.hour}:${current.minute.toString().padStart(2, '0')} ${newAmpm}`
    } else if (field === 'description' && value !== undefined) {
      activity.description = value
    }
    
    setSchedule(updated)
    onChange(updated)
  }
  
  // Format time on blur (when user leaves the field)
  const handleTimeBlur = (dayIndex: number, activityIndex: number, currentValue: string) => {
    if (!currentValue || !currentValue.trim()) return
    
    const formatted = formatTimeInput(currentValue)
    if (formatted && formatted !== currentValue && isValidTimeFormat(formatted)) {
      const updated = [...schedule]
      updated[dayIndex].activities[activityIndex].time = formatted
      setSchedule(updated)
      onChange(updated)
    }
  }

  const updateDayLabel = (dayIndex: number, label: string) => {
    const updated = [...schedule]
    updated[dayIndex].dayLabel = label
    setSchedule(updated)
    onChange(updated)
  }


  if (!startDate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          Please set the event start date first to add program schedule.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Program Schedule</h3>
        <button
          type="button"
          onClick={initializeSchedule}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Refresh Days
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">
            No schedule days found. Please check your event dates.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {schedule.map((day, dayIndex) => (
            <div
              key={day.date}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6"
            >
              {/* Day Header */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <input
                      type="text"
                      value={day.dayLabel}
                      onChange={(e) => updateDayLabel(dayIndex, e.target.value)}
                      className="text-lg font-semibold text-gray-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                      placeholder={`Day ${dayIndex + 1}`}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{day.date}</span>
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-3">
                {day.activities.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No activities scheduled for this day
                  </div>
                ) : (
                  <>
                    {day.activities.map((activity, activityIndex) => (
                    <div
                      key={activityIndex}
                      className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-32 sm:w-36">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <label className="text-xs text-gray-600">Time *</label>
                        </div>
                        <div className="relative">
                          {/* Smart Time Input */}
                          <input
                            type="text"
                            value={activity.time}
                            onChange={(e) => {
                              // Allow free typing - don't format while typing
                              updateActivity(dayIndex, activityIndex, 'time', e.target.value)
                            }}
                            onBlur={(e) => {
                              // Format only when user leaves the field
                              handleTimeBlur(dayIndex, activityIndex, e.target.value)
                            }}
                            placeholder="2:30 PM or 230p"
                            className={`w-full px-3 py-1.5 pr-12 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              activity.time && !isValidTimeFormat(activity.time) && activity.time.trim() !== ''
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                          />
                          {/* AM/PM Quick Toggle Button */}
                          {activity.time && isValidTimeFormat(activity.time) && (
                            <button
                              type="button"
                              onClick={() => updateActivity(dayIndex, activityIndex, 'toggleAmpm')}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                              title="Toggle AM/PM"
                            >
                              {parseTime(activity.time).ampm}
                            </button>
                          )}
                        </div>
                        {activity.time && !isValidTimeFormat(activity.time) && (
                          <p className="text-xs text-red-600 mt-1">
                            {getTimeError(activity.time) || 'Try: 2:30 PM or 230p'}
                          </p>
                        )}
                        {activity.time && isValidTimeFormat(activity.time) && (
                          <p className="text-xs text-gray-500 mt-1">
                            ✓ {activity.time}
                          </p>
                        )}
                        {!activity.time && (
                          <p className="text-xs text-gray-400 mt-1">
                            Type: 2 30 A or 2:30 PM
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 mb-1 block">Activity</label>
                        <input
                          type="text"
                          value={activity.description}
                          onChange={(e) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder="Registration & Welcome Tea"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActivity(dayIndex, activityIndex)}
                        className="flex-shrink-0 mt-6 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove activity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    ))}
                  </>
                )}

                {/* Add Activity Button */}
                <button
                  type="button"
                  onClick={() => addActivity(dayIndex)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Activity
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

