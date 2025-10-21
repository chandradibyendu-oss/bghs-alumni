# Undo Attendance Functionality Test Report

## Current Implementation Analysis

### Undo Logic (app/api/admin/events/registrations/undo-attendance/route.ts)
```typescript
// Time-based detection (2 hours)
const registrationDate = new Date(registration.registration_date)
const now = new Date()
const hoursSinceRegistration = (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60)
const isWalkIn = hoursSinceRegistration < 2

if (isWalkIn) {
  // DELETE entire registration
} else {
  // Keep registration, clear attendance only
}
```

### Walk-in Attendance API (app/api/admin/events/registrations/walk-in-attendance/route.ts)
- Creates/updates registration with `status: 'confirmed'`
- Sets `attendance_status: 'attended'`
- Sets `actual_attendance_count`
- **CRITICAL ISSUE**: Does NOT set any flag to indicate it's a walk-in

## Test Scenarios & Expected Results

### Scenario 1: Fresh Walk-in (Created < 2 hours ago)
**Steps:**
1. Mark new walk-in as attended
2. Press undo
**Expected:** Registration deleted, user disappears from search
**Current Logic:** ✅ Should work (time < 2 hours = DELETE)

### Scenario 2: Old Walk-in (Created > 2 hours ago)  
**Steps:**
1. Mark walk-in as attended (wait > 2 hours)
2. Press undo
**Expected:** Registration deleted (should still be walk-in)
**Current Logic:** ❌ Will NOT work (time > 2 hours = KEEP registration)

### Scenario 3: Regular Registration
**Steps:**
1. User registered normally for event
2. Mark as attended
3. Press undo
**Expected:** Registration kept, attendance cleared
**Current Logic:** ✅ Should work (time > 2 hours = KEEP registration)

## Root Cause Analysis

**The fundamental issue:** The system has NO way to permanently distinguish walk-ins from regular registrations.

**Problems:**
1. **Time-based detection is unreliable** - Walk-ins become "regular registrations" after 2 hours
2. **No permanent walk-in flag** - The `is_walkin` field was referenced but never actually implemented
3. **Inconsistent behavior** - Same action (undo) behaves differently based on timing

## Recommendations

### Option 1: Implement Proper Walk-in Flag
1. Add `is_walkin` boolean field to `event_registrations` table
2. Set `is_walkin = true` when creating walk-in registrations
3. Use this flag for undo logic instead of time-based detection

### Option 2: Always Delete Walk-in Registrations
1. Modify walk-in attendance API to create registrations with special status
2. Always delete registrations created via walk-in API on undo

### Option 3: User Confirmation Approach
1. When undoing attendance, ask user: "Delete registration or keep registration?"
2. Let user decide the behavior

## Current Status: BROKEN
The undo functionality for walk-ins is **unreliable** due to time-based detection. Walk-ins created more than 2 hours ago will not be properly handled on undo.

## Immediate Fix Required
The time-based logic needs to be replaced with a permanent walk-in identification system.
