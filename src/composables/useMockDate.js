/**
 * useMockDate Composable
 * Provides development utilities to mock the current date/time
 *
 * USAGE:
 * 1. Set via query parameter: ?mockDate=2025-02-15&mockTime=14:30
 * 2. Set via localStorage:
 *    localStorage.setItem('mockDate', '2025-02-15')
 *    localStorage.setItem('mockTime', '14:30')
 * 3. Reset mocking:
 *    localStorage.removeItem('mockDate')
 *    localStorage.removeItem('mockTime')
 */

import { ref } from 'vue'

// Global state for mock date
const mockDate = ref(null)
const mockTime = ref(null)
export const isMocking = ref(false)

/**
 * Initialize mock date from query params or localStorage
 * Should be called in main.js or App.vue setup
 */
export function initMockDate() {
  // Check query parameters first
  const params = new URLSearchParams(window.location.search)
  const paramDate = params.get('mockDate')
  const paramTime = params.get('mockTime')

  // Check localStorage as fallback
  const storedDate = localStorage.getItem('mockDate')
  const storedTime = localStorage.getItem('mockTime')

  // Set mock values (query params take precedence)
  if (paramDate) {
    mockDate.value = paramDate
    mockTime.value = paramTime || '00:00'
    isMocking.value = true

    // Store in localStorage for persistence
    localStorage.setItem('mockDate', paramDate)
    if (paramTime) {
      localStorage.setItem('mockTime', paramTime)
    }
  } else if (storedDate) {
    mockDate.value = storedDate
    mockTime.value = storedTime || '00:00'
    isMocking.value = true
  }

  // Log mock mode status in development
  if (import.meta.env.DEV) {
    if (isMocking.value) {
      console.log(
        `%c📅 MOCK DATE ENABLED: ${mockDate.value} ${mockTime.value}`,
        'background: #ff9800; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;'
      )
    }
  }
}

/**
 * Set a new mock date and time
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timeStr - Time in HH:MM format (optional)
 */
export function setMockDate(dateStr, timeStr = '00:00') {
  mockDate.value = dateStr
  mockTime.value = timeStr
  isMocking.value = true

  // Persist to localStorage
  localStorage.setItem('mockDate', dateStr)
  localStorage.setItem('mockTime', timeStr)

  console.log(
    `%c📅 Mock date set to: ${dateStr} ${timeStr}`,
    'background: #4caf50; color: white; padding: 4px 8px; border-radius: 3px;'
  )
}

/**
 * Clear mock date and return to real time
 */
export function clearMockDate() {
  mockDate.value = null
  mockTime.value = null
  isMocking.value = false

  localStorage.removeItem('mockDate')
  localStorage.removeItem('mockTime')

  console.log(
    `%c🕐 Mock date cleared - using real time`,
    'background: #2196f3; color: white; padding: 4px 8px; border-radius: 3px;'
  )
}

/**
 * Get the currently mocked date as a Date object
 * Returns null if not mocking
 * @returns {Date|null}
 */
export function getMockedDate() {
  if (!isMocking.value || !mockDate.value) return null

  const [year, month, day] = mockDate.value.split('-').map(Number)
  const [hours, minutes] = (mockTime.value || '00:00').split(':').map(Number)

  // Create date in local timezone, then convert to GMT+7
  const localDate = new Date(year, month - 1, day, hours, minutes, 0)

  // Create a date string in Asia/Jakarta timezone
  const jakartaTime = new Date(localDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))

  return jakartaTime
}

/**
 * Composable to use in components
 * Returns reactive mock state and control functions
 */
export function useMockDate() {
  return {
    mockDate,
    mockTime,
    isMocking,
    setMockDate,
    clearMockDate,
    getMockedDate
  }
}
