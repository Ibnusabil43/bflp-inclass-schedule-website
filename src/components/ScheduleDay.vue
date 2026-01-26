<template>
  <section 
    class="schedule-day" 
    :class="{ 
      'schedule-day--collapsed': !isExpanded,
      'schedule-day--visible': isVisible,
      'schedule-day--today': isToday
    }"
    :style="{ '--animation-delay': `${animationDelay}ms` }"
  >
    <!-- Day header with expand/collapse toggle -->
    <header 
      class="schedule-day__header" 
      @click="toggleExpand"
      role="button"
      :aria-expanded="isExpanded"
      tabindex="0"
      @keydown.enter="toggleExpand"
      @keydown.space.prevent="toggleExpand"
    >
      <div class="schedule-day__date-info">
        <!-- Day name -->
        <h2 class="schedule-day__name">{{ dayData.day }}</h2>
        <!-- Formatted date -->
        <time class="schedule-day__date" :datetime="dayData.date">
          {{ formattedDate }}
        </time>
      </div>
      
      <!-- Session count badge and toggle indicator -->
      <div class="schedule-day__actions">
        <!-- Today badge -->
        <span v-if="isToday" class="schedule-day__today-badge">Hari Ini</span>
        <span class="schedule-day__session-count">
          <span class="schedule-day__session-count-number">{{ dayData.sessions.length }}</span>
          <span class="schedule-day__session-count-label">{{ dayData.sessions.length === 1 ? 'Session' : 'Sessions' }}</span>
        </span>
        <div class="schedule-day__toggle" :class="{ 'schedule-day__toggle--expanded': isExpanded }">
          <svg class="schedule-day__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
    
    <!-- Sessions container with smooth height transition -->
    <div 
      class="schedule-day__sessions-wrapper"
      :class="{ 'schedule-day__sessions-wrapper--expanded': isExpanded }"
    >
      <div class="schedule-day__sessions" ref="sessionsRef">
        <SessionCard
          v-for="(session, index) in dayData.sessions"
          :key="`${dayData.date}-session-${index}`"
          :session="session"
          :index="index"
          :is-parent-expanded="isExpanded"
          :is-active="isActive(session, dayData.date)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import SessionCard from './SessionCard.vue'

/**
 * ScheduleDay Component (Redesigned)
 * Displays a single day's schedule with smooth collapsible animations
 * Features:
 * - Smooth height transition (no abrupt jumps)
 * - Rotating chevron icon
 * - Staggered entrance animation
 * - Keyboard accessible
 * - Real-time active session highlighting
 */

const props = defineProps({
  dayData: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.day && value.date && Array.isArray(value.sessions)
    }
  },
  initialExpanded: {
    type: Boolean,
    default: true
  },
  animationDelay: {
    type: Number,
    default: 0
  },
  isToday: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Function,
    default: () => false
  }
})

// Refs
const sessionsRef = ref(null)
const sessionsHeight = ref(0)
const isVisible = ref(false)

// Reactive state for expand/collapse
const isExpanded = ref(props.initialExpanded)

// Watch for external expanded state changes
watch(() => props.initialExpanded, (newVal) => {
  isExpanded.value = newVal
  updateHeight()
})

// Calculate sessions container height for smooth transition
const updateHeight = async () => {
  await nextTick()
  if (sessionsRef.value) {
    // Get actual scroll height plus padding, fallback to large value if 0
    const height = sessionsRef.value.scrollHeight
    sessionsHeight.value = height > 0 ? height + 40 : 2000
  } else {
    // Fallback if ref not ready
    sessionsHeight.value = 2000
  }
}

// Toggle expand/collapse state
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  updateHeight()
}

// Computed property to format the date for display
const formattedDate = computed(() => {
  const date = new Date(props.dayData.date)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Lifecycle
onMounted(() => {
  // Initial height calculation
  updateHeight()
  
  // Recalculate height after DOM is fully painted
  setTimeout(() => {
    updateHeight()
  }, 100)
  
  // Trigger entrance animation
  setTimeout(() => {
    isVisible.value = true
  }, props.animationDelay)
})

// Expose isExpanded for parent control
defineExpose({ isExpanded })
</script>

<style scoped>
.schedule-day {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  opacity: 0;
  transform: translateY(20px);
  transition: 
    opacity var(--duration-slow) cubic-bezier(0.16, 1, 0.3, 1),
    transform var(--duration-slow) cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow var(--transition-base);
  transition-delay: var(--animation-delay);
}

.schedule-day--visible {
  opacity: 1;
  transform: translateY(0);
}

.schedule-day:hover {
  box-shadow: var(--shadow-lg);
}

/* Today Highlight */
.schedule-day--today {
  border: 2px solid var(--color-accent);
  box-shadow: var(--shadow-lg), 0 0 0 4px rgba(255, 107, 53, 0.1);
}

.schedule-day__today-badge {
  background: var(--color-accent);
  color: var(--color-white);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 0.5rem;
}

/* Header */
.schedule-day__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-white);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* Subtle shine effect on header */
.schedule-day__header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.schedule-day__header:hover::before {
  left: 100%;
}

.schedule-day__header:hover {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
}

.schedule-day__header:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.schedule-day__date-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.schedule-day__name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  letter-spacing: -0.01em;
  color: var(--color-white);
}

.schedule-day__date {
  font-size: var(--font-size-sm);
  opacity: 0.85;
  font-weight: var(--font-weight-medium);
}

.schedule-day__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.schedule-day__session-count {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.schedule-day__session-count-number {
  font-weight: var(--font-weight-bold);
}

.schedule-day__session-count-label {
  opacity: 0.9;
}

.schedule-day__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.1);
  transition: all var(--transition-base);
}

.schedule-day__header:hover .schedule-day__toggle {
  background: rgba(255, 255, 255, 0.2);
}

.schedule-day__toggle-icon {
  width: 18px;
  height: 18px;
  transition: transform var(--transition-slow) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.schedule-day__toggle--expanded .schedule-day__toggle-icon {
  transform: rotate(180deg);
}

/* Sessions wrapper - handles height animation */
.schedule-day__sessions-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows var(--duration-slow) cubic-bezier(0.4, 0, 0.2, 1);
}

.schedule-day__sessions-wrapper--expanded {
  grid-template-rows: 1fr;
}

.schedule-day__sessions {
  min-height: 0;
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-background);
}

/* Responsive */
@media (min-width: 641px) and (max-width: 1024px) {
  .schedule-day__sessions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .schedule-day__sessions {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .schedule-day__header {
    padding: 1rem 1.25rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .schedule-day__name {
    font-size: var(--font-size-lg);
  }

  .schedule-day__sessions {
    padding: 1rem;
    grid-template-columns: 1fr;
  }

  .schedule-day__session-count {
    padding: 0.375rem 0.75rem;
  }

  .schedule-day__session-count-label {
    display: none;
  }

  .schedule-day__toggle {
    width: 28px;
    height: 28px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .schedule-day {
    opacity: 1;
    transform: none;
    transition: box-shadow var(--transition-base);
  }

  .schedule-day__sessions-wrapper {
    transition: none;
  }

  .schedule-day__toggle-icon {
    transition: none;
  }
}
</style>
