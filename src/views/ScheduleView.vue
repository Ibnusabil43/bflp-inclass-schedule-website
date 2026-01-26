<template>
  <div class="schedule-view">
    <!-- Header Section -->
    <HeaderSection
      :title="scheduleData.program"
      :phase="scheduleData.phase"
      :classInfo="scheduleData.class"
      :period="scheduleData.period"
    />
    
    <!-- Main Content -->
    <main class="schedule-view__content">
      <!-- Today's Class Card -->
      <section class="schedule-view__today">
        <TodayCard
          :activeSession="activeSession"
          :nextSession="nextSession"
          :todaySchedule="todaySchedule"
          :currentTime="currentTime"
        />
      </section>

      <!-- View Toggle -->
      <div class="schedule-view__controls">
        <div class="view-toggle">
          <button 
            class="view-toggle__btn"
            :class="{ 'view-toggle__btn--active': currentView === 'calendar' }"
            @click="currentView = 'calendar'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            <span>Calendar</span>
          </button>
          <button 
            class="view-toggle__btn"
            :class="{ 'view-toggle__btn--active': currentView === 'list' }"
            @click="currentView = 'list'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>List</span>
          </button>
        </div>
      </div>

      <!-- Calendar View -->
      <section v-show="currentView === 'calendar'" class="schedule-view__calendar">
        <CalendarView
          :schedule="scheduleData.schedule"
          :todayDate="todayDate"
          :isActive="isActive"
        />
      </section>

      <!-- List View (Original Day Cards) -->
      <section v-show="currentView === 'list'" class="schedule-view__list">
        <ControlBar
          @expand-all="handleExpandAll"
          @collapse-all="handleCollapseAll"
        />
        <div class="schedule-view__days">
          <ScheduleDay
            v-for="(day, index) in scheduleData.schedule"
            :key="day.date"
            :day-data="day"
            :initial-expanded="expandedStates[index]"
            :animation-delay="index * 100"
            :isToday="day.date === todayDate"
            :isActive="isActive"
          />
        </div>
      </section>
    </main>
    
    <!-- Footer -->
    <footer class="schedule-view__footer">
      <p>&copy; {{ new Date().getFullYear() }} BFLP In-Class Schedule</p>
      <p class="schedule-view__footer-tz">All times are in WIB (GMT+7)</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderSection from '../components/HeaderSection.vue'
import ControlBar from '../components/ControlBar.vue'
import ScheduleDay from '../components/ScheduleDay.vue'
import TodayCard from '../components/TodayCard.vue'
import CalendarView from '../components/CalendarView.vue'
import { useCurrentSession } from '../composables/useSchedule.js'
import scheduleData from '../data/schedule.json'

/**
 * ScheduleView - Main view component
 * Renders the complete schedule dashboard with:
 * - Today's active class card
 * - Calendar table view
 * - List view with collapsible days
 * 
 * REAL-TIME UPDATES:
 * - Updates every 60 seconds via useCurrentSession composable
 * - All time calculations use GMT+7 (Asia/Jakarta)
 */

// Current view state
const currentView = ref('calendar')

// Real-time session tracking (updates every 60 seconds)
const {
  currentTime,
  todayDate,
  todaySchedule,
  activeSession,
  nextSession,
  isActive
} = useCurrentSession(scheduleData)

// Track expanded state for list view
const expandedStates = ref(scheduleData.schedule.map(() => true))

// Expand all days in list view
const handleExpandAll = () => {
  expandedStates.value = expandedStates.value.map(() => true)
}

// Collapse all days in list view
const handleCollapseAll = () => {
  expandedStates.value = expandedStates.value.map(() => false)
}
</script>

<style scoped>
.schedule-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}

.schedule-view__content {
  flex: 1;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Today Card Section */
.schedule-view__today {
  margin-bottom: 1.5rem;
}

/* View Toggle Controls */
.schedule-view__controls {
  margin-bottom: 1.5rem;
}

.view-toggle {
  display: inline-flex;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 0.25rem;
  box-shadow: var(--shadow-sm);
}

.view-toggle__btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-toggle__btn:hover {
  color: var(--color-text-primary);
  background: var(--color-background);
}

.view-toggle__btn--active {
  color: var(--color-white);
  background: var(--color-primary);
}

.view-toggle__btn--active:hover {
  color: var(--color-white);
  background: var(--color-primary-dark);
}

.view-toggle__btn svg {
  width: 1rem;
  height: 1rem;
}

/* Calendar Section */
.schedule-view__calendar {
  margin-bottom: 2rem;
}

/* List Section */
.schedule-view__list {
  margin-bottom: 2rem;
}

.schedule-view__days {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

/* Footer */
.schedule-view__footer {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
}

.schedule-view__footer p {
  margin: 0;
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.schedule-view__footer-tz {
  margin-top: 0.5rem !important;
  font-size: var(--font-size-xs) !important;
  opacity: 0.6 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-view__content {
    padding: 1rem;
  }

  .view-toggle__btn span {
    display: none;
  }

  .view-toggle__btn {
    padding: 0.75rem;
  }

  .view-toggle__btn svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

@media (min-width: 768px) {
  .schedule-view__content {
    padding: 2rem;
  }

  .schedule-view__days {
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .schedule-view__content {
    padding: 2.5rem;
  }
}
</style>
