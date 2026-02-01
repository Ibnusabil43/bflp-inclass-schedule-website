/**
 * useCurrentTime Composable
 * Handles real-time clock updates in GMT+7 (Asia/Jakarta) timezone
 * Updates every 60 seconds for session highlighting
 *
 * Supports mock dates during development via useMockDate
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { isMocking, getMockedDate } from './useMockDate'

/**
 * Get current time in GMT+7 timezone
 * Returns mocked time if mocking is enabled, otherwise real time
 * @returns {Date} Current date/time adjusted to GMT+7
 */
export function getCurrentTimeGMT7() {
  // Check if mocking is enabled
  if (isMocking.value) {
    const mockedDate = getMockedDate()
    if (mockedDate) return mockedDate
  }

  const now = new Date()
  // Create a date string in Asia/Jakarta timezone
  const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  return jakartaTime
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formatDateToISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get current time as minutes since midnight
 * @param {Date} date
 * @returns {number}
 */
export function getMinutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Check if a session is currently active
 * @param {Object} session - Session with timeRange
 * @param {string} sessionDate - Date string YYYY-MM-DD
 * @param {Date} currentTime - Current time in GMT+7
 * @returns {boolean}
 */
export function isSessionActive(session, sessionDate, currentTime) {
  if (!session.timeRange || !sessionDate) return false

  const currentDateStr = formatDateToISO(currentTime)

  // Not today, not active
  if (currentDateStr !== sessionDate) return false

  // Parse session times
  const [startStr, endStr] = session.timeRange.split(' - ').map(t => t.trim())
  const [startHour, startMin] = startStr.replace('.', ':').split(':').map(Number)
  const [endHour, endMin] = endStr.replace('.', ':').split(':').map(Number)

  const sessionStart = startHour * 60 + startMin
  const sessionEnd = endHour * 60 + endMin
  const currentMinutes = getMinutesSinceMidnight(currentTime)

  // Active if: currentTime >= start AND currentTime < end
  return currentMinutes >= sessionStart && currentMinutes < sessionEnd
}

/**
 * Main composable
 */
export function useCurrentTime() {
  const currentTime = ref(getCurrentTimeGMT7())
  const updateInterval = ref(null)

  // Computed values
  const currentDateISO = computed(() => formatDateToISO(currentTime.value))

  const currentTimeString = computed(() => {
    const hours = String(currentTime.value.getHours()).padStart(2, '0')
    const minutes = String(currentTime.value.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  })

  const currentMinutes = computed(() => getMinutesSinceMidnight(currentTime.value))

  // Update time every 60 seconds
  const startUpdating = () => {
    updateInterval.value = setInterval(() => {
      currentTime.value = getCurrentTimeGMT7()
    }, 60000) // 60 seconds
  }

  const stopUpdating = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }

  onMounted(() => {
    startUpdating()
  })

  onUnmounted(() => {
    stopUpdating()
  })

  return {
    currentTime,
    currentDateISO,
    currentTimeString,
    currentMinutes,
    isSessionActive,
    formatDateToISO,
    getCurrentTimeGMT7
  }
}
