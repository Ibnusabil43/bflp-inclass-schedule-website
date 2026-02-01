/**
 * useSchedule Composable
 * Centralized time logic and session utilities for GMT+7 (Asia/Jakarta)
 *
 * TIMEZONE RULE: All calculations use GMT+7 explicitly
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { isMocking, getMockedDate } from './useMockDate'

// GMT+7 Timezone identifier
const TIMEZONE = 'Asia/Jakarta'

/**
 * Standard time slots for the calendar view - EXACTLY MATCHING THE REFERENCE IMAGE
 * These define the column headers - content comes from JSON
 *
 * Based on the reference image columns (header times):
 * 07.30-08.25, 08.25-09.20, 09.20-09.35 (Coffee), 09.35-10.30, 10.30-11.25,
 * 11.25-11.35 (Istirahat/Soljum), 12.35-13.30, 13.30-14.25, 14.25-15.20,
 * 15.20-15.35 (Coffee), 15.35-16.30, 16.30-17.25, 17.25-18.20
 *
 * FRIDAY SPECIAL CASE:
 * - Slot 6 (11:25-11:35): Shows "Soljum" instead of "Istirahat"
 * - Slot 7 (12:35-13:30): Shows "Istirahat" (normally a session slot)
 */
export const TIME_SLOTS = [
  { id: 1, start: '07:30', end: '08:25', isBreak: false },
  { id: 2, start: '08:25', end: '09:20', isBreak: false },
  { id: 3, start: '09:20', end: '09:35', label: 'Coffee break', isBreak: true },
  { id: 4, start: '09:35', end: '10:30', isBreak: false },
  { id: 5, start: '10:30', end: '11:25', isBreak: false },
  { id: 6, start: '11:25', end: '12:35', label: 'Istirahat', isBreak: true },
  { id: 7, start: '12:35', end: '13:30', isBreak: false, isFridayBreak: true },
  { id: 8, start: '13:30', end: '14:25', isBreak: false },
  { id: 9, start: '14:25', end: '15:20', isBreak: false },
  { id: 10, start: '15:20', end: '15:35', label: 'Coffee break', isBreak: true },
  { id: 11, start: '15:35', end: '16:30', isBreak: false },
  { id: 12, start: '16:30', end: '17:25', isBreak: false },
  { id: 13, start: '17:25', end: '18:20', isBreak: false },
]

/**
 * Parse time string "HH:mm" to minutes since midnight
 * @param {string} timeStr - Time in "HH:mm" format
 * @returns {number} Minutes since midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0
  const normalized = timeStr.replace('.', ':')
  const [hours, minutes] = normalized.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Parse time range string "HH:mm - HH:mm" to start/end minutes
 * @param {string} timeRange - Time range like "07:30 - 10:30"
 * @returns {{ start: number, end: number }}
 */
export function parseTimeRange(timeRange) {
  if (!timeRange) return { start: 0, end: 0 }
  const [startStr, endStr] = timeRange.split(' - ').map(s => s.trim())
  return {
    start: parseTimeToMinutes(startStr),
    end: parseTimeToMinutes(endStr),
    startStr,
    endStr
  }
}

/**
 * Check if a session overlaps with a time slot
 * @param {Object} session - Session with timeRange
 * @param {Object} slot - Time slot with start/end
 * @returns {boolean}
 */
export function sessionOverlapsSlot(session, slot) {
  const sessionTime = parseTimeRange(session.timeRange)
  const slotStart = parseTimeToMinutes(slot.start)
  const slotEnd = parseTimeToMinutes(slot.end)

  // Session overlaps if it starts before slot ends AND ends after slot starts
  return sessionTime.start < slotEnd && sessionTime.end > slotStart
}

/**
 * Check if a session is the primary session for a slot (starts in this slot)
 * Used to determine where to show the session title
 * @param {Object} session - Session with timeRange
 * @param {Object} slot - Time slot with start/end
 * @returns {boolean}
 */
export function sessionStartsInSlot(session, slot) {
  const sessionTime = parseTimeRange(session.timeRange)
  const slotStart = parseTimeToMinutes(slot.start)
  const slotEnd = parseTimeToMinutes(slot.end)

  return sessionTime.start >= slotStart && sessionTime.start < slotEnd
}

/**
 * Calculate how many consecutive slots a session spans from a given slot
 * @param {Object} session - Session with timeRange
 * @param {number} startSlotIndex - Index of the starting slot
 * @returns {number} Number of slots spanned
 */
export function calculateSessionSpan(session, startSlotIndex) {
  const sessionTime = parseTimeRange(session.timeRange)
  let span = 0

  for (let i = startSlotIndex; i < TIME_SLOTS.length; i++) {
    const slot = TIME_SLOTS[i]
    const slotStart = parseTimeToMinutes(slot.start)

    if (slotStart < sessionTime.end) {
      span++
    } else {
      break
    }
  }

  return Math.max(1, span)
}

/**
 * Get current time in GMT+7 (Asia/Jakarta)
 * Returns mocked time if mocking is enabled, otherwise real time
 * @returns {Date}
 */
export function getCurrentTimeGMT7() {
  // Check if mocking is enabled
  if (isMocking.value) {
    const mockedDate = getMockedDate()
    if (mockedDate) return mockedDate
  }

  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

/**
 * Get today's date string in YYYY-MM-DD format (GMT+7)
 * @returns {string}
 */
export function getTodayDateString() {
  const now = getCurrentTimeGMT7()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a session is currently active (GMT+7)
 * A session is ACTIVE when: currentTime >= startTime AND currentTime < endTime
 *
 * @param {Object} session - Session with timeRange
 * @param {Date} now - Current time (should be GMT+7)
 * @returns {boolean}
 */
export function isSessionActive(session, now) {
  if (!session || !session.timeRange) return false

  const sessionTime = parseTimeRange(session.timeRange)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Active: currentTime >= startTime AND currentTime < endTime
  return currentMinutes >= sessionTime.start && currentMinutes < sessionTime.end
}

/**
 * Check if a session has ended
 * @param {Object} session - Session with timeRange
 * @param {Date} now - Current time
 * @returns {boolean}
 */
export function isSessionPast(session, now) {
  if (!session || !session.timeRange) return false

  const sessionTime = parseTimeRange(session.timeRange)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return currentMinutes >= sessionTime.end
}

/**
 * Check if a session is upcoming (hasn't started yet)
 * @param {Object} session - Session with timeRange
 * @param {Date} now - Current time
 * @returns {boolean}
 */
export function isSessionUpcoming(session, now) {
  if (!session || !session.timeRange) return false

  const sessionTime = parseTimeRange(session.timeRange)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return currentMinutes < sessionTime.start
}

/**
 * Format date for display (e.g., "Senin, 26/01/26")
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} dayName - Day name
 * @returns {string}
 */
export function formatDateDisplay(dateStr, dayName) {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)

  // Map English day names to Indonesian
  const dayMap = {
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
    'Sunday': 'Minggu'
  }

  const indonesianDay = dayMap[dayName] || dayName
  return `${indonesianDay}, ${day}/${month}/${year}`
}

/**
 * Composable for real-time current session tracking
 * Updates every 60 seconds as per requirements
 */
export function useCurrentSession(scheduleData) {
  const currentTime = ref(getCurrentTimeGMT7())
  const todayDate = ref(getTodayDateString())
  let intervalId = null

  // Find today's schedule from JSON data
  const todaySchedule = computed(() => {
    if (!scheduleData?.schedule) return null
    return scheduleData.schedule.find(day => day.date === todayDate.value)
  })

  // Find the currently active session
  const activeSession = computed(() => {
    if (!todaySchedule.value?.sessions) return null

    return todaySchedule.value.sessions.find(session =>
      isSessionActive(session, currentTime.value)
    )
  })

  // Find the next upcoming session
  const nextSession = computed(() => {
    if (!todaySchedule.value?.sessions) return null

    const upcoming = todaySchedule.value.sessions
      .filter(session => isSessionUpcoming(session, currentTime.value))
      .sort((a, b) => {
        const timeA = parseTimeRange(a.timeRange).start
        const timeB = parseTimeRange(b.timeRange).start
        return timeA - timeB
      })

    return upcoming[0] || null
  })

  // Check if a specific session is currently active
  const isActive = (session, date) => {
    if (date !== todayDate.value) return false
    return isSessionActive(session, currentTime.value)
  }

  // Update time every 60 seconds
  const startTimer = () => {
    intervalId = setInterval(() => {
      currentTime.value = getCurrentTimeGMT7()
      todayDate.value = getTodayDateString()
    }, 60000) // 60 seconds
  }

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    currentTime,
    todayDate,
    todaySchedule,
    activeSession,
    nextSession,
    isActive
  }
}

/**
 * Build calendar grid data from schedule JSON
 * Maps sessions to time slots for each day
 *
 * @param {Array} schedule - Array of day schedules from JSON
 * @returns {Array} Calendar grid data
 */
export function buildCalendarGrid(schedule) {
  if (!schedule || !Array.isArray(schedule)) return []

  return schedule.map(day => {
    const cells = []
    let skipUntilSlot = -1

    TIME_SLOTS.forEach((slot, slotIndex) => {
      // Skip cells that are covered by a spanning session
      if (slotIndex < skipUntilSlot) {
        return
      }

      // Find session that starts in this slot
      const session = day.sessions?.find(s => sessionStartsInSlot(s, slot))

      if (session) {
        const span = calculateSessionSpan(session, slotIndex)
        cells.push({
          slotIndex,
          slot,
          session,
          span,
          isEmpty: false,
          isBreak: slot.isBreak || false
        })
        skipUntilSlot = slotIndex + span
      } else {
        // Check if this slot is covered by an ongoing session
        const ongoingSession = day.sessions?.find(s =>
          sessionOverlapsSlot(s, slot) && !sessionStartsInSlot(s, slot)
        )

        if (!ongoingSession) {
          cells.push({
            slotIndex,
            slot,
            session: null,
            span: 1,
            isEmpty: true,
            isBreak: slot.isBreak || false
          })
        }
      }
    })

    return {
      date: day.date,
      day: day.day,
      displayDate: formatDateDisplay(day.date, day.day),
      cells
    }
  })
}
