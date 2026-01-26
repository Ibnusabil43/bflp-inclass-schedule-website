<template>
  <div class="control-bar">
    <div class="control-bar__container">
      <button 
        class="control-btn control-btn--primary"
        @click="handleExpandAll"
        :class="{ 'control-btn--active': isExpandActive }"
      >
        <svg class="control-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
        <span>Expand All</span>
      </button>
      
      <button 
        class="control-btn control-btn--secondary"
        @click="handleCollapseAll"
        :class="{ 'control-btn--active': isCollapseActive }"
      >
        <svg class="control-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 14 10 14 10 20"></polyline>
          <polyline points="20 10 14 10 14 4"></polyline>
          <line x1="14" y1="10" x2="21" y2="3"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
        <span>Collapse All</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/**
 * ControlBar Component
 * Provides expand/collapse all functionality with modern button styling
 * Features: Hover elevation, click scale animation
 */

const emit = defineEmits(['expand-all', 'collapse-all'])

// Button active states for click animation
const isExpandActive = ref(false)
const isCollapseActive = ref(false)

const handleExpandAll = () => {
  isExpandActive.value = true
  emit('expand-all')
  
  // Reset active state after animation
  setTimeout(() => {
    isExpandActive.value = false
  }, 200)
}

const handleCollapseAll = () => {
  isCollapseActive.value = true
  emit('collapse-all')
  
  setTimeout(() => {
    isCollapseActive.value = false
  }, 200)
}
</script>

<style scoped>
.control-bar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.control-bar__container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.control-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* Primary button style */
.control-btn--primary {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  box-shadow: 0 4px 14px rgba(0, 32, 96, 0.25);
}

.control-btn--primary:hover {
  background: var(--color-primary-dark);
  box-shadow: 0 6px 20px rgba(0, 32, 96, 0.35);
  transform: translateY(-2px);
}

.control-btn--primary:active,
.control-btn--primary.control-btn--active {
  transform: scale(0.97) translateY(0);
  box-shadow: 0 2px 8px rgba(0, 32, 96, 0.2);
}

/* Secondary button style */
.control-btn--secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.control-btn--secondary:hover {
  background: var(--color-primary);
  color: var(--color-white);
  box-shadow: 0 6px 20px rgba(0, 32, 96, 0.25);
  transform: translateY(-2px);
}

.control-btn--secondary:active,
.control-btn--secondary.control-btn--active {
  transform: scale(0.97) translateY(0);
}

.control-btn__icon {
  width: 1rem;
  height: 1rem;
  transition: transform var(--transition-base);
}

.control-btn:hover .control-btn__icon {
  transform: scale(1.1);
}

/* Ripple effect on click */
.control-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.control-btn:active::after {
  width: 200px;
  height: 200px;
}

/* Responsive */
@media (max-width: 640px) {
  .control-bar {
    padding: 0.875rem 1rem;
  }
  
  .control-bar__container {
    gap: 0.75rem;
  }
  
  .control-btn {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }
  
  .control-btn span {
    display: none;
  }
  
  .control-btn__icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

@media (min-width: 641px) {
  .control-btn span {
    display: inline;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .control-btn {
    transition: none;
  }
  
  .control-btn:hover {
    transform: none;
  }
  
  .control-btn:active {
    transform: none;
  }
}
</style>
