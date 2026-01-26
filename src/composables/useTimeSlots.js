/**
 * useTimeSlots Composable
 * Defines the session time slots based on the JADWAL PENDIDIKAN reference
 * Handles time parsing and session-to-slot mapping
 */

import { computed } from 'vue'

/**
 * Session time slots configuration
 * Based on the reference schedule:
 * - SENIN-KAMIS (Monday-Thursday) schedule
 * - JUMAT (Friday) has slight differences (Sholat Jum'at)
 */
export const TIME_SLOTS = [
  { id: 1, label: 'Sesi 1', start: '07:30', end: '08:25' },
  { id: 2, label: 'Sesi 2', start: '08:25', end: '09:20' },
  { id: 'break1', label: 'Coffee Break', start: '09:20', end: '09:35', isBreak: true },
  { id: 3, label: 'Sesi 3', start: '09:35', end: '10:30' },
  { id: 4, label: 'Sesi 4', start: '10:30', end: '11:25' },
  { id: 'break2', label: 'Istirahat', start: '11:25', end: '12:35', isBreak: true },
  { id: 5, label: 'Sesi 5', start: '12:35', end: '13:30' },
  { id: 6, label: 'Sesi 6', start: '13:30', end: '14:25' },
  { id: 7, label: 'Sesi 7', start: '14:25', end: '15:20' },
  { id: 'break3', label: 'Coffee Break', start: '15:20', end: '15:35', isBreak: true },
  { id: 8, label: 'Sesi 8', start: '15:35', end: '16:30' },
  { id: 9, label: 'Sesi 9', start: '16:30', end: '17:25' },
  { id: 10, label: 'Sesi 10', start: '17:25', end: '18:20' }
]

/**
 * Parse time string (HH:mm or HH.mm) to minutes since midnight
 * @param {string} timeStr - Time string like "07:30" or "07.30"
 * @returns {number} Minutes since midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0
  const normalized = timeStr.replace('.', ':')
  const [hours, minutes] = normalized.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Format minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Formatted time like "07.30"
 */
export function formatMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}.${mins.toString().padStart(2, '0')}`
}

/**
 * Check if a session overlaps with a time slot
 * @param {Object} session - Session with timeRange
 * @param {Object} slot - Time slot with start/end
 * @returns {boolean} True if session covers this slot
 */
export function sessionOverlapsSlot(session, slot) {
  if (!session.timeRange) return false
  
  // Parse session time range (e.g., "07:30 - 10:30")
  const [sessionStart, sessionEnd] = session.timeRange.split(' - ').map(t => parseTimeToMinutes(t.trim()))
  const slotStart = parseTimeToMinutes(slot.start)
  const slotEnd = parseTimeToMinutes(slot.end)
  
  // Session overlaps if it starts before slot ends AND ends after slot starts
  return sessionStart < slotEnd && sessionEnd > slotStart
}

/**
 * Get the span (number of consecutive slots) for a session
 * @param {Object} session - Session with timeRange
 * @param {Array} slots - Array of time slots
 * @returns {number} Number of slots this session spans
 */
export function getSessionSpan(session, slots) {
  if (!session.timeRange) return 1
  
  const nonBreakSlots = slots.filter(s => !s.isBreak)
  let span = 0
  
  for (const slot of nonBreakSlots) {
    if (sessionOverlapsSlot(session, slot)) {
      span++
    }
  }
  
  return Math.max(1, span)
}

/**
 * Get the starting slot index for a session
 * @param {Object} session - Session with timeRange
 * @param {Array} slots - Array of time slots
 * @returns {number} Index of the first slot this session occupies
 */
export function getSessionStartSlotIndex(session, slots) {
  if (!session.timeRange) return 0
  
  const [sessionStart] = session.timeRange.split(' - ').map(t => parseTimeToMinutes(t.trim()))
  
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (slot.isBreak) continue
    
    const slotStart = parseTimeToMinutes(slot.start)
    const slotEnd = parseTimeToMinutes(slot.end)
    
    if (sessionStart >= slotStart && sessionStart < slotEnd) {
      return i
    }
  }
  
  return 0
}

/**
 * Main composable function
 */
export function useTimeSlots() {
  const slots = computed(() => TIME_SLOTS)
  
  const sessionSlots = computed(() => TIME_SLOTS.filter(s => !s.isBreak))
  
  const breakSlots = computed(() => TIME_SLOTS.filter(s => s.isBreak))
  
  return {
    slots,
    sessionSlots,
    breakSlots,
    parseTimeToMinutes,
    formatMinutesToTime,
    sessionOverlapsSlot,
    getSessionSpan,
    getSessionStartSlotIndex
  }
}
