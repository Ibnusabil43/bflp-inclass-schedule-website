<template>
  <article 
    class="session-card" 
    :class="{ 
      'session-card--visible': isVisible,
      'session-card--pressed': isPressed,
      'session-card--live': isActive,
      'session-card--clickable': hasLearningMaterial
    }"
    :style="{ '--stagger-delay': `${index * 80}ms` }"
    :title="hasLearningMaterial ? 'Klik untuk membuka materi pembelajaran' : ''"
    @click="openMaterial"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @touchstart="handleMouseDown"
    @touchend="handleMouseUp"
  >
    <!-- Accent line with glow effect -->
    <div class="session-card__accent"></div>
    
    <!-- Live badge for active session -->
    <div v-if="isActive" class="session-card__live-badge">
      <span class="live-dot"></span>
      LIVE
    </div>
    
    <!-- Main card content -->
    <div class="session-card__content">
      <!-- Session title -->
      <h3 class="session-card__title">{{ session.title }}</h3>
      
      <!-- Session metadata -->
      <div class="session-card__meta">
        <!-- Time range with clock icon -->
        <div class="session-card__time">
          <svg class="session-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ session.timeRange }}</span>
        </div>
        
        <!-- Session range -->
        <div class="session-card__session-range">
          <svg class="session-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>{{ session.sessionRange }}</span>
        </div>
      </div>
      
      <!-- Department badge -->
      <div class="session-card__department">
        <span class="department-badge">{{ session.department }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { materialDriveMap } from '../config/materialDriveMap'

/**
 * SessionCard Component (Redesigned)
 * Displays individual session with rich micro-interactions
 * Features:
 * - Hover lift effect with shadow intensification
 * - Accent line glow on hover
 * - Staggered entry animation
 * - Click scale animation with spring back
 * - Real-time active session highlighting
 * - Clickable to open Google Drive learning materials
 * - Reduced motion support
 */

const props = defineProps({
  session: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.title && value.timeRange && value.sessionRange && value.department
    }
  },
  index: {
    type: Number,
    default: 0
  },
  isParentExpanded: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

// Animation states
const isVisible = ref(false)
const isPressed = ref(false)

// Check if learning material is available
const hasLearningMaterial = computed(() => {
  return !!materialDriveMap[props.session.department]
})

// Handle opening Google Drive material
const openMaterial = () => {
  const code = props.session.department
  const url = materialDriveMap[code]
  
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    // Optional: Show user-friendly message if material not available
    console.info(`Materi untuk ${code} belum tersedia`)
  }
}

// Handle click animation
const handleMouseDown = () => {
  isPressed.value = true
}

const handleMouseUp = () => {
  isPressed.value = false
}

const handleMouseLeave = () => {
  isPressed.value = false
}

// Trigger entrance animation when parent expands
watch(() => props.isParentExpanded, (expanded) => {
  if (expanded) {
    setTimeout(() => {
      isVisible.value = true
    }, props.index * 80)
  } else {
    isVisible.value = false
  }
}, { immediate: true })

onMounted(() => {
  if (props.isParentExpanded) {
    setTimeout(() => {
      isVisible.value = true
    }, props.index * 80 + 100)
  }
})
</script>

<style scoped>
.session-card {
  position: relative;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  padding-left: 1.5rem;
  box-shadow: var(--shadow-card);
  transition: 
    transform var(--transition-spring),
    box-shadow var(--transition-base);
  cursor: default;
  overflow: hidden;
  
  /* Initial state for entrance animation */
  opacity: 0;
  transform: translateY(16px);
}

/* Clickable card style */
.session-card--clickable {
  cursor: pointer;
}

.session-card--clickable:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.session-card--visible {
  opacity: 1;
  transform: translateY(0);
  transition-delay: var(--stagger-delay);
}

/* Hover state - lift and shadow */
.session-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

/* Pressed/click state - scale down with spring back */
.session-card--pressed {
  transform: scale(0.98) translateY(-2px);
  transition: transform 100ms ease-out;
}

/* Live/Active session state */
.session-card--live {
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  border: 2px solid var(--color-accent);
  box-shadow: var(--shadow-card), 0 0 0 4px rgba(255, 107, 53, 0.1);
}

.session-card--live .session-card__accent {
  background: linear-gradient(180deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
  width: 5px;
}

.session-card__live-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #fee2e2;
  color: #dc2626;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.625rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.live-dot {
  width: 6px;
  height: 6px;
  background: #dc2626;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Accent line */
.session-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  transition: all var(--transition-base);
}

/* Accent glow on hover */
.session-card:hover .session-card__accent {
  background: linear-gradient(180deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
  box-shadow: 0 0 12px var(--color-accent-glow);
  width: 5px;
}

.session-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.session-card__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: 1.4;
  margin: 0;
  transition: color var(--transition-fast);
}

.session-card:hover .session-card__title {
  color: var(--color-primary);
}

.session-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.session-card__time,
.session-card__session-range {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.session-card__icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.session-card:hover .session-card__icon {
  color: var(--color-accent);
}

.session-card__department {
  margin-top: 0.25rem;
}

/* Department badge styling */
.department-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all var(--transition-base);
}

.session-card:hover .department-badge {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
  box-shadow: 0 4px 12px var(--color-accent-glow);
  transform: translateX(2px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .session-card {
    padding: 1rem;
    padding-left: 1.25rem;
  }

  .session-card__title {
    font-size: 0.9375rem;
  }

  .session-card__meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .session-card:hover {
    transform: translateY(-2px);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .session-card {
    opacity: 1;
    transform: none;
    transition: box-shadow var(--transition-base);
  }
  
  .session-card:hover {
    transform: none;
  }
  
  .session-card--active {
    transform: none;
  }
  
  .session-card__accent {
    transition: none;
  }
  
  .session-card:hover .department-badge {
    transform: none;
  }
}
</style>
