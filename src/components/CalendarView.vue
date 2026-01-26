<template>
  <div class="calendar-view">
    <!-- Desktop/Tablet Table View -->
    <div class="calendar-table-wrapper">
      <table class="calendar-table">
        <!-- Header Row: Time Slots -->
        <thead>
          <tr>
            <th class="calendar-table__date-header">Tanggal</th>
            <th 
              v-for="slot in timeSlots" 
              :key="slot.id"
              class="calendar-table__slot-header"
              :class="{ 'calendar-table__slot-header--break': slot.isBreak }"
            >
              <template v-if="slot.isBreak">
                <div class="slot-time">{{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}</div>
              </template>
              <template v-else>
                <div class="slot-time">{{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}</div>
              </template>
            </th>
          </tr>
        </thead>

        <!-- Body Rows: Schedule Days -->
        <tbody>
          <tr 
            v-for="dayRow in calendarGrid" 
            :key="dayRow.date"
            :class="{ 'calendar-table__row--today': isToday(dayRow.date) }"
          >
            <!-- Date Column (Sticky) -->
            <td 
              class="calendar-table__date-cell"
              :class="{ 'calendar-table__date-cell--today': isToday(dayRow.date) }"
            >
              <span class="date-day">{{ getDayName(dayRow.day) }}, {{ formatShortDate(dayRow.date) }}</span>
            </td>

            <!-- Session Cells - render each slot -->
            <template v-for="(cell, cellIndex) in dayRow.cells" :key="`${dayRow.date}-${cellIndex}`">
              <td
                v-if="cell.visible"
                :colspan="cell.colspan"
                class="calendar-table__cell"
                :class="getCellClasses(cell, dayRow)"
              >
                <div v-if="cell.type === 'session'" class="session-content">
                  <span class="session-title">{{ cell.session.title }}</span>
                </div>
                <div v-else-if="cell.type === 'break'" class="break-content">
                  {{ cell.label }}
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile View: Monthly Calendar Grid -->
    <div class="calendar-mobile">
      <!-- Month Navigation -->
      <div class="mobile-month-header">
        <button class="mobile-month-nav" @click="prevMonth">‹</button>
        <span class="mobile-month-title">{{ currentMonthName }} {{ currentYear }}</span>
        <button class="mobile-month-nav" @click="nextMonth">›</button>
      </div>

      <!-- Weekday Headers -->
      <div class="mobile-weekdays">
        <div class="mobile-weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
      </div>

      <!-- Calendar Grid -->
      <div class="mobile-calendar-grid">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="mobile-calendar-day"
          :class="{
            'mobile-calendar-day--empty': !day.date,
            'mobile-calendar-day--today': day.isToday,
            'mobile-calendar-day--selected': selectedDate === day.date,
            'mobile-calendar-day--has-class': day.sessions?.length > 0,
            'mobile-calendar-day--other-month': day.isOtherMonth
          }"
          @click="day.date && selectDay(day.date)"
        >
          <span v-if="day.date" class="mobile-calendar-day__number">{{ day.dayNumber }}</span>
          <!-- Department badges -->
          <div v-if="day.sessions?.length > 0" class="mobile-calendar-day__depts">
            <span 
              v-for="dept in getUniqueDepts(day.sessions).slice(0, 2)" 
              :key="dept"
              class="mobile-calendar-day__dept"
            >{{ dept }}</span>
            <span v-if="getUniqueDepts(day.sessions).length > 2" class="mobile-calendar-day__more">
              +{{ getUniqueDepts(day.sessions).length - 2 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Selected Day Detail -->
      <div v-if="selectedDayData" class="mobile-day-detail">
        <div class="mobile-day-detail__header">
          <div class="mobile-day-detail__title">
            <span class="mobile-day-detail__day">{{ getDayName(selectedDayData.day) }}</span>
            <span class="mobile-day-detail__date">{{ formatFullDate(selectedDayData.date) }}</span>
          </div>
          <span v-if="isToday(selectedDayData.date)" class="mobile-day-detail__today">HARI INI</span>
        </div>
        
        <div v-if="selectedDayData.sessions?.length > 0" class="mobile-day-detail__sessions">
          <div 
            v-for="(session, idx) in selectedDayData.sessions" 
            :key="idx"
            class="mobile-session-card"
            :class="{ 'mobile-session-card--active': isActive(session, selectedDayData.date) }"
          >
            <div class="mobile-session-card__time">
              <span class="mobile-session-card__time-range">{{ session.timeRange }}</span>
              <span class="mobile-session-card__session-num">{{ session.sessionRange }}</span>
            </div>
            <div class="mobile-session-card__info">
              <div class="mobile-session-card__title">{{ session.title }}</div>
              <div class="mobile-session-card__dept">{{ session.department }}</div>
            </div>
          </div>
        </div>
        <div v-else class="mobile-day-detail__empty">
          Tidak ada kelas pada hari ini
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { 
  TIME_SLOTS, 
  parseTimeToMinutes
} from '../composables/useSchedule.js'

/**
 * CalendarView Component
 * Renders a table-based calendar layout from JSON schedule data
 * Desktop: Full table calendar | Mobile: Monthly grid calendar
 */

const props = defineProps({
  schedule: {
    type: Array,
    required: true
  },
  todayDate: {
    type: String,
    required: true
  },
  isActive: {
    type: Function,
    required: true
  }
})

// ===== MOBILE MONTHLY CALENDAR =====
const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

// Current viewed month/year
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const selectedDate = ref(null)

// Initialize with today's date selected
onMounted(() => {
  if (props.todayDate) {
    selectedDate.value = props.todayDate
    const today = new Date(props.todayDate)
    currentMonth.value = today.getMonth()
    currentYear.value = today.getFullYear()
  }
})

// Watch for todayDate changes
watch(() => props.todayDate, (newDate) => {
  if (newDate && !selectedDate.value) {
    selectedDate.value = newDate
    const today = new Date(newDate)
    currentMonth.value = today.getMonth()
    currentYear.value = today.getFullYear()
  }
}, { immediate: true })

// Current month name
const currentMonthName = computed(() => monthNames[currentMonth.value])

// Navigate months
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Build calendar days grid for the current month
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDayOfWeek = firstDay.getDay() // 0 = Sunday
  
  // Create schedule lookup map
  const scheduleMap = {}
  props.schedule.forEach(day => {
    scheduleMap[day.date] = day
  })
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevDate = new Date(currentYear.value, currentMonth.value, -startDayOfWeek + i + 1)
    const dateStr = formatDateStr(prevDate)
    days.push({
      date: dateStr,
      dayNumber: prevDate.getDate(),
      isOtherMonth: true,
      isToday: dateStr === props.todayDate,
      sessions: scheduleMap[dateStr]?.sessions || []
    })
  }
  
  // Add days of the current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(currentYear.value, currentMonth.value, d)
    const dateStr = formatDateStr(date)
    days.push({
      date: dateStr,
      dayNumber: d,
      isOtherMonth: false,
      isToday: dateStr === props.todayDate,
      sessions: scheduleMap[dateStr]?.sessions || [],
      day: scheduleMap[dateStr]?.day
    })
  }
  
  // Add empty cells to complete the last week
  const remainingCells = 7 - (days.length % 7)
  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(currentYear.value, currentMonth.value + 1, i)
      const dateStr = formatDateStr(nextDate)
      days.push({
        date: dateStr,
        dayNumber: i,
        isOtherMonth: true,
        isToday: dateStr === props.todayDate,
        sessions: scheduleMap[dateStr]?.sessions || []
      })
    }
  }
  
  return days
})

// Format date to YYYY-MM-DD
const formatDateStr = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get unique departments from sessions
const getUniqueDepts = (sessions) => {
  if (!sessions) return []
  const depts = sessions.map(s => s.department)
  return [...new Set(depts)]
}

// Select a day
const selectDay = (date) => {
  selectedDate.value = selectedDate.value === date ? null : date
}

// Get selected day data
const selectedDayData = computed(() => {
  if (!selectedDate.value) return null
  const scheduleDay = props.schedule.find(d => d.date === selectedDate.value)
  if (scheduleDay) return scheduleDay
  
  // Create a basic day object for dates not in schedule
  const date = new Date(selectedDate.value)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return {
    date: selectedDate.value,
    day: dayNames[date.getDay()],
    sessions: []
  }
})

// Format full date
const formatFullDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

// Time slots for header columns
const timeSlots = TIME_SLOTS

// Format time for display (07:30 -> 07.30)
const formatTime = (time) => {
  return time.replace(':', '.')
}

// Check if a date is today
const isToday = (date) => {
  return date === props.todayDate
}

// Get Indonesian day name
const getDayName = (englishDay) => {
  const dayMap = {
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
    'Sunday': 'Minggu'
  }
  return dayMap[englishDay] || englishDay
}

// Format date as DD/MM/YY
const formatShortDate = (dateStr) => {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

/**
 * Check if a session covers a specific slot
 */
function sessionCoversSlot(session, slot) {
  if (!session || !session.timeRange) return false
  const [sessStart, sessEnd] = session.timeRange.split(' - ').map(t => parseTimeToMinutes(t.trim()))
  const slotStart = parseTimeToMinutes(slot.start)
  const slotEnd = parseTimeToMinutes(slot.end)
  return sessStart < slotEnd && sessEnd > slotStart
}

/**
 * Find session that covers a specific slot
 */
function findSessionForSlot(sessions, slot) {
  if (!sessions) return null
  return sessions.find(session => sessionCoversSlot(session, slot))
}

/**
 * Build calendar grid from schedule data
 * Sessions span columns but STOP at break columns
 * Break columns always show their label
 * Sessions that continue after a break appear as new cell spans
 */
const calendarGrid = computed(() => {
  return props.schedule.map(day => {
    const cells = []
    let slotIndex = 0
    const isFriday = day.day === 'Friday'
    // Track which sessions have already been started (to handle continuation after breaks)
    const sessionStartedSlots = new Map() // session -> last slot index where it was rendered

    while (slotIndex < timeSlots.length) {
      const slot = timeSlots[slotIndex]

      // BREAK SLOTS - Always render with their label
      if (slot.isBreak) {
        let label = slot.label
        // On Friday, show "Soljum" instead of "Istirahat"
        if (slot.label === 'Istirahat' && isFriday) {
          label = 'Soljum'
        }
        cells.push({
          type: 'break',
          label: label,
          colspan: 1,
          visible: true
        })
        slotIndex++
        continue
      }

      // FRIDAY SPECIAL: Slot 7 (12:35-13:30) becomes "Istirahat" after Soljum
      if (slot.isFridayBreak && isFriday) {
        cells.push({
          type: 'break',
          label: 'Istirahat',
          colspan: 1,
          visible: true
        })
        slotIndex++
        continue
      }

      // SESSION SLOTS - Find if a session covers this slot
      const session = findSessionForSlot(day.sessions, slot)

      if (session) {
        // Calculate colspan - count consecutive NON-BREAK slots this session covers
        let colspan = 0
        let checkIndex = slotIndex
        
        while (checkIndex < timeSlots.length) {
          const checkSlot = timeSlots[checkIndex]
          
          // Stop at break slots - session will continue after break as new cell
          if (checkSlot.isBreak) break
          
          // Stop at Friday breaks (slot 7 becomes Istirahat on Fridays)
          if (checkSlot.isFridayBreak && isFriday) break
          
          // Stop if session doesn't cover this slot
          if (!sessionCoversSlot(session, checkSlot)) break
          
          colspan++
          checkIndex++
        }

        cells.push({
          type: 'session',
          session: session,
          colspan: Math.max(1, colspan),
          visible: true
        })
        
        // Skip the slots we just covered
        slotIndex = checkIndex
      } else {
        // Empty cell
        cells.push({
          type: 'empty',
          colspan: 1,
          visible: true
        })
        slotIndex++
      }
    }

    return {
      date: day.date,
      day: day.day,
      cells
    }
  })
})

// Get CSS classes for a cell
const getCellClasses = (cell, dayRow) => {
  const classes = []
  
  if (cell.type === 'empty') {
    classes.push('calendar-table__cell--empty')
  } else if (cell.type === 'break') {
    classes.push('calendar-table__cell--break')
  } else if (cell.type === 'session') {
    classes.push('calendar-table__cell--session')
    if (props.isActive(cell.session, dayRow.date)) {
      classes.push('calendar-table__cell--active')
    }
  }
  
  return classes
}
</script>

<style scoped>
.calendar-view {
  width: 100%;
}

/* ===== TABLE WRAPPER ===== */
.calendar-table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #fff;
  border: 2px solid #1e3a5f;
}

/* ===== TABLE STYLES ===== */
.calendar-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  min-width: 1400px;
}

/* Header Row */
.calendar-table thead tr {
  background: #1e3a5f;
}

.calendar-table__date-header {
  padding: 0.875rem 0.75rem;
  text-align: center;
  font-weight: 700;
  color: #fff;
  min-width: 110px;
  position: sticky;
  left: 0;
  background: #1e3a5f;
  z-index: 11;
  border-right: 2px solid #fff;
}

.calendar-table__slot-header {
  padding: 0.625rem 0.25rem;
  text-align: center;
  font-weight: 600;
  color: #fff;
  min-width: 85px;
  border-left: 1px solid rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  background: #1e3a5f;
}

.calendar-table__slot-header--break {
  background: #2d4a6f;
  min-width: 75px;
  border-left: 2px solid #fff;
  border-right: 2px solid #fff;
}

.slot-time {
  font-size: 0.6875rem;
  line-height: 1.4;
  white-space: nowrap;
}

/* Body Rows */
.calendar-table tbody tr {
  border-bottom: 1px solid #94a3b8;
}

.calendar-table tbody tr:nth-child(odd) {
  background: #ffffff;
}

.calendar-table tbody tr:nth-child(even) {
  background: #e2e8f0;
}

.calendar-table__row--today {
  background: #fef3c7 !important;
  outline: 3px solid #f59e0b;
  outline-offset: -3px;
}

/* Date Cell (First Column - Sticky) */
.calendar-table__date-cell {
  padding: 0.75rem 0.5rem;
  background: #1e3a5f;
  color: #fff;
  position: sticky;
  left: 0;
  z-index: 5;
  border-right: 2px solid #fff;
  min-width: 110px;
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
}

.calendar-table tbody tr:nth-child(even) .calendar-table__date-cell {
  background: #2d4a6f;
}

.calendar-table__date-cell--today {
  background: #ea580c !important;
}

.date-day {
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Session Cells */
.calendar-table__cell {
  padding: 0.5rem 0.375rem;
  text-align: center;
  vertical-align: middle;
  border-left: 1px solid #cbd5e1;
  border-right: 1px solid #cbd5e1;
  height: 60px;
  transition: background-color 200ms ease;
}

.calendar-table__cell--empty {
  background: transparent;
}

.calendar-table__cell--break {
  background: #94a3b8;
  font-weight: 700;
  color: #1e293b;
  font-size: 0.6875rem;
  border-left: 2px solid #64748b;
  border-right: 2px solid #64748b;
}

.calendar-table tbody tr:nth-child(even) .calendar-table__cell--break {
  background: #7c8ca3;
}

/* Break content */
.break-content {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
}

.calendar-table__cell--session {
  background: #ffffff;
}

.calendar-table tbody tr:nth-child(even) .calendar-table__cell--session {
  background: #e2e8f0;
}

.calendar-table__cell--session:hover {
  background: #dbeafe;
}

/* Active Session Highlight */
.calendar-table__cell--active {
  background: #bfdbfe !important;
  border-top: 4px solid #ea580c;
  border-bottom: 4px solid #ea580c;
}

/* Session Content */
.session-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0.125rem;
}

.session-title {
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
  font-size: 0.6875rem;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== MOBILE VIEW ===== */
.calendar-mobile {
  display: none;
}

/* Show mobile view on smaller screens */
@media (max-width: 768px) {
  .calendar-table-wrapper {
    display: none;
  }
  
  .calendar-mobile {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

/* Desktop: keep table */
@media (min-width: 769px) {
  .calendar-table-wrapper {
    display: block;
  }
}

/* ===== MOBILE MONTH HEADER ===== */
.mobile-month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #1e3a5f;
  border-radius: 12px;
  color: #fff;
}

.mobile-month-title {
  font-weight: 700;
  font-size: 1.125rem;
}

.mobile-month-nav {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.mobile-month-nav:active {
  background: rgba(255, 255, 255, 0.25);
}

/* ===== MOBILE WEEKDAYS ===== */
.mobile-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: #f1f5f9;
  padding: 0.5rem 0;
  border-radius: 8px;
}

.mobile-weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  padding: 0.25rem;
}

/* ===== MOBILE CALENDAR GRID ===== */
.mobile-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  background: #e2e8f0;
  padding: 3px;
  border-radius: 12px;
}

.mobile-calendar-day {
  aspect-ratio: 1;
  background: #fff;
  border-radius: 8px;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 50px;
}

.mobile-calendar-day:active {
  transform: scale(0.95);
}

.mobile-calendar-day--empty {
  background: transparent;
  cursor: default;
}

.mobile-calendar-day--other-month {
  opacity: 0.4;
}

.mobile-calendar-day--today {
  background: #dbeafe;
  border: 2px solid #ea580c;
}

.mobile-calendar-day--selected {
  background: #1e3a5f;
}

.mobile-calendar-day--selected .mobile-calendar-day__number {
  color: #fff;
}

.mobile-calendar-day--selected .mobile-calendar-day__dept {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.mobile-calendar-day--has-class {
  background: #f0fdf4;
}

.mobile-calendar-day--has-class.mobile-calendar-day--today {
  background: #dbeafe;
}

.mobile-calendar-day--has-class.mobile-calendar-day--selected {
  background: #1e3a5f;
}

.mobile-calendar-day__number {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.mobile-calendar-day--today .mobile-calendar-day__number {
  color: #ea580c;
  font-weight: 800;
}

.mobile-calendar-day__depts {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: center;
  max-width: 100%;
  overflow: hidden;
}

.mobile-calendar-day__dept {
  font-size: 0.5rem;
  background: #1e3a5f;
  color: #fff;
  padding: 1px 3px;
  border-radius: 2px;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-calendar-day__more {
  font-size: 0.5rem;
  background: #64748b;
  color: #fff;
  padding: 1px 3px;
  border-radius: 2px;
  font-weight: 600;
}

/* ===== MOBILE DAY DETAIL ===== */
.mobile-day-detail {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.mobile-day-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #1e3a5f;
  color: #fff;
}

.mobile-day-detail__title {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.mobile-day-detail__day {
  font-weight: 700;
  font-size: 1.125rem;
}

.mobile-day-detail__date {
  font-size: 0.8125rem;
  opacity: 0.85;
}

.mobile-day-detail__today {
  background: #ea580c;
  color: #fff;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.mobile-day-detail__sessions {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  background: #f8fafc;
}

.mobile-day-detail__empty {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

/* ===== MOBILE SESSION CARD ===== */
.mobile-session-card {
  background: #fff;
  border-radius: 10px;
  padding: 0.875rem;
  border-left: 4px solid #1e3a5f;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mobile-session-card--active {
  background: #dbeafe;
  border-left-color: #ea580c;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.15);
}

.mobile-session-card__time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.mobile-session-card__time-range {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: #1e3a5f;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.mobile-session-card--active .mobile-session-card__time-range {
  background: #ea580c;
}

.mobile-session-card__session-num {
  font-size: 0.6875rem;
  color: #64748b;
  background: #e2e8f0;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.mobile-session-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.mobile-session-card__title {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
  line-height: 1.4;
}

.mobile-session-card__dept {
  font-size: 0.75rem;
  color: #1e3a5f;
  font-weight: 600;
  background: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

/* Scrollbar Styling */
.calendar-table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.calendar-table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.calendar-table-wrapper::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 4px;
}

.calendar-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
