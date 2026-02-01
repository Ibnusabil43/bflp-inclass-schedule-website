<template>
  <div class="today-card" :class="{ 'today-card--has-session': activeSession }">
    <!-- Card Header -->
    <div class="today-card__header">
      <div class="today-card__date">
        <svg class="today-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>{{ formattedToday }}</span>
      </div>
      <div class="today-card__time">
        <svg class="today-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>{{ formattedTime }}</span>
      </div>
    </div>

    <!-- Active Session Content -->
    <div v-if="activeSession" class="today-card__content">
      <!-- Live Badge -->
      <div class="today-card__badge">
        <span class="live-indicator"></span>
        <span>LIVE</span>
      </div>

      <!-- Session Title -->
      <h2 class="today-card__title">{{ activeSession.title }}</h2>

      <!-- Material Drive Link -->
      <div v-if="materialUrl" class="today-card__material-link">
        <a :href="materialUrl" target="_blank" class="material-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4z"></path>
            <polyline points="14,8,16,8,16,16"></polyline>
          </svg>
          <span>View Materials</span>
        </a>
      </div>

      <!-- Session Meta -->
      <div class="today-card__meta">
        <div class="today-card__meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ activeSession.timeRange }}</span>
        </div>
        <div class="today-card__meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span>{{ activeSession.sessionRange }}</span>
        </div>
        <div class="today-card__meta-item today-card__meta-item--department">
          <span class="department-tag">{{ activeSession.department }}</span>
        </div>
      </div>

      <!-- Break Status & Remaining Duration -->
      <div class="today-card__stats">
        <!-- Currently In Break -->
        <div v-if="isCurrentlyInBreak" class="today-card__stat-item today-card__stat-item--break">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span class="break-label">{{ breakStatus.label }}</span>
          <span class="break-time">{{ breakStatus.timeLeft }}</span>
        </div>

        <!-- Time Until Next Break (during class) -->
        <div v-else-if="timeUntilBreak" class="today-card__stat-item today-card__stat-item--break-upcoming">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span class="break-label">Break in {{ timeUntilBreak.timeUntil }}</span>
          <span class="break-time">{{ timeUntilBreak.label }}</span>
        </div>

        <!-- Remaining Duration -->
        <div class="today-card__stat-item today-card__stat-item--duration">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ remainingDuration }}</span>
        </div>
      </div>
    </div>

    <!-- No Active Session -->
    <div v-else class="today-card__empty">
      <div v-if="nextSession" class="today-card__next">
        <p class="today-card__empty-text">No class at the moment</p>
        <div class="today-card__next-session">
          <span class="next-label">Next:</span>
          <span class="next-title">{{ nextSession.title }}</span>
          <span class="next-time">{{ nextSession.timeRange }}</span>
        </div>
      </div>
      <div v-else-if="todaySchedule" class="today-card__done">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <p>All classes completed for today</p>
      </div>
      <div v-else class="today-card__no-class">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>No classes scheduled for today</p>
      </div>
    </div>

    <!-- Accent Line -->
    <div class="today-card__accent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TIME_SLOTS, parseTimeToMinutes } from '../composables/useSchedule'
import { materialDriveMap } from '../config/materialDriveMap'

/**
 * TodayCard Component
 * Displays the currently active class in a prominent card
 * Updates in real-time via props from parent
 */

const props = defineProps({
  activeSession: {
    type: Object,
    default: null
  },
  nextSession: {
    type: Object,
    default: null
  },
  todaySchedule: {
    type: Object,
    default: null
  },
  currentTime: {
    type: Date,
    required: true
  }
})

// Format today's date for display
const formattedToday = computed(() => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Jakarta'
  }
  return props.currentTime.toLocaleDateString('id-ID', options)
})

// Format current time
const formattedTime = computed(() => {
  return props.currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  }) + ' WIB'
})

// Get current time in minutes since midnight
const currentMinutes = computed(() => {
  return props.currentTime.getHours() * 60 + props.currentTime.getMinutes()
})

// Check if currently in a break and get break info
const isCurrentlyInBreak = computed(() => {
  return breakStatus.value !== null
})

const breakStatus = computed(() => {
  const currentMin = currentMinutes.value

  for (const slot of TIME_SLOTS) {
    if (slot.isBreak) {
      const slotStart = parseTimeToMinutes(slot.start)
      const slotEnd = parseTimeToMinutes(slot.end)

      if (currentMin >= slotStart && currentMin < slotEnd) {
        const timeLeft = slotEnd - currentMin
        const hours = Math.floor(timeLeft / 60)
        const minutes = timeLeft % 60

        return {
          label: slot.label,
          timeLeft: `${minutes}m left`,
          raw: timeLeft
        }
      }
    }
  }

  return null
})

// Get time until next break during class
const timeUntilBreak = computed(() => {
  if (!props.activeSession || isCurrentlyInBreak.value) return null

  const currentMin = currentMinutes.value

  // Find the next break after current time
  for (const slot of TIME_SLOTS) {
    if (slot.isBreak) {
      const slotStart = parseTimeToMinutes(slot.start)

      if (slotStart > currentMin) {
        const timeUntil = slotStart - currentMin
        const hours = Math.floor(timeUntil / 60)
        const minutes = timeUntil % 60

        return {
          label: slot.label,
          timeUntil: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
          raw: timeUntil
        }
      }
    }
  }

  return null
})

// Calculate remaining duration of current session
const remainingDuration = computed(() => {
  if (!props.activeSession) return ''

  // Parse session time range
  const [startStr, endStr] = props.activeSession.timeRange.split(' - ').map(s => s.trim())
  const sessionEnd = parseTimeToMinutes(endStr)
  const currentMin = currentMinutes.value

  const remainingMinutes = sessionEnd - currentMin

  if (remainingMinutes <= 0) {
    return 'Session ending'
  }

  const hours = Math.floor(remainingMinutes / 60)
  const minutes = remainingMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
})

const materialUrl = computed(() => {
  if (!props.activeSession) return null
  const code = props.activeSession.department
  return materialDriveMap[code] || null
})
</script>

<style scoped>
.today-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}

.today-card:hover {
  box-shadow: var(--shadow-xl);
}

.today-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.today-card__date,
.today-card__time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.today-card__icon {
  width: 1rem;
  height: 1rem;
}

.today-card__content {
  text-align: center;
}

.today-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

.live-indicator {
  width: 8px;
  height: 8px;
  background: #dc2626;
  border-radius: 50%;
  animation: pulse-live 2s ease-in-out infinite;
}

@keyframes pulse-live {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.today-card__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 1rem;
  line-height: 1.3;
}

.today-card__meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.today-card__meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.today-card__meta-item svg {
  width: 1rem;
  height: 1rem;
}

.today-card__meta-item--department {
  margin-left: 0.5rem;
}

.department-tag {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-white);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

/* Stats Section */
.today-card__stats {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
  justify-content: center;
}

.today-card__stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  background: var(--color-background);
}

.today-card__stat-item--break {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.today-card__stat-item--break-upcoming {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.today-card__stat-item--duration {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  font-weight: var(--font-weight-semibold);
}

.today-card__stat-item svg {
  width: 1rem;
  height: 1rem;
}

.break-label {
  font-weight: var(--font-weight-semibold);
}

.break-time {
  font-size: var(--font-size-xs);
  opacity: 0.85;
}

/* Empty States */
.today-card__empty {
  text-align: center;
  padding: 1rem 0;
}

.today-card__empty-text {
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  margin: 0 0 1rem;
}

.today-card__next-session {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.next-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.next-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.next-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.today-card__done,
.today-card__no-class {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-muted);
}

.today-card__done svg,
.today-card__no-class svg {
  width: 2.5rem;
  height: 2.5rem;
  opacity: 0.5;
}

.today-card__done p,
.today-card__no-class p {
  margin: 0;
  font-size: var(--font-size-base);
}

/* Accent Line */
.today-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
}

.today-card--has-session .today-card__accent {
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
}

/* Responsive */
@media (max-width: 640px) {
  .today-card {
    padding: 1.25rem;
  }

  .today-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .today-card__title {
    font-size: var(--font-size-lg);
  }

  .today-card__meta {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .today-card__stats {
    flex-direction: column;
    gap: 0.75rem;
  }

  .today-card__stat-item {
    width: 100%;
    justify-content: center;
  }
}

.material-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  margin-bottom: 1rem;
  transition: color var(--transition-fast);

  svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
