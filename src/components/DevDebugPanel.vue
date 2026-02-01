<template>
  <!-- Debug panel only shown in development -->
  <div v-if="isDev && isVisible" class="dev-debug-panel">
    <button class="dev-debug-panel__toggle" @click="isVisible = false" title="Close debug panel">
      ✕
    </button>

    <div class="dev-debug-panel__content">
      <h3 class="dev-debug-panel__title">🛠️ Dev Tools - Mock Date</h3>

      <!-- Status -->
      <div class="dev-debug-panel__status">
        <p v-if="isMocking" class="dev-debug-panel__status-text dev-debug-panel__status-text--active">
          ✓ Mocking: {{ mockDate }} {{ mockTime }}
        </p>
        <p v-else class="dev-debug-panel__status-text dev-debug-panel__status-text--inactive">
          Using real time
        </p>
      </div>

      <!-- Inputs -->
      <div class="dev-debug-panel__inputs">
        <div class="dev-debug-panel__input-group">
          <label for="mock-date-input">Date (YYYY-MM-DD):</label>
          <input
            id="mock-date-input"
            v-model="dateInput"
            type="text"
            placeholder="2025-02-15"
            @keydown.enter="applyMock"
            class="dev-debug-panel__input"
          />
        </div>

        <div class="dev-debug-panel__input-group">
          <label for="mock-time-input">Time (HH:MM):</label>
          <input
            id="mock-time-input"
            v-model="timeInput"
            type="text"
            placeholder="14:30"
            @keydown.enter="applyMock"
            class="dev-debug-panel__input"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="dev-debug-panel__buttons">
        <button class="dev-debug-panel__btn dev-debug-panel__btn--apply" @click="applyMock">
          Apply Mock
        </button>
        <button class="dev-debug-panel__btn dev-debug-panel__btn--clear" @click="handleClear">
          Clear Mock
        </button>
      </div>

      <!-- Quick presets -->
      <div class="dev-debug-panel__presets">
        <p class="dev-debug-panel__presets-label">Quick Presets:</p>
        <div class="dev-debug-panel__preset-buttons">
          <button
            class="dev-debug-panel__preset-btn"
            @click="setPreset('today', getTodayDate())"
          >
            Today
          </button>
          <button
            class="dev-debug-panel__preset-btn"
            @click="setPreset('morning', getTodayDate(), '08:00')"
          >
            8:00 AM
          </button>
          <button
            class="dev-debug-panel__preset-btn"
            @click="setPreset('noon', getTodayDate(), '12:00')"
          >
            12:00 PM
          </button>
          <button
            class="dev-debug-panel__preset-btn"
            @click="setPreset('evening', getTodayDate(), '18:00')"
          >
            6:00 PM
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Floating toggle button (when panel is hidden) -->
  <button
    v-if="isDev && !isVisible"
    class="dev-debug-panel__fab"
    @click="isVisible = true"
    title="Open debug panel"
  >
    🛠️
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMockDate } from '../composables/useMockDate'

const isDev = import.meta.env.DEV
const isVisible = ref(false)

const { isMocking, mockDate, mockTime, setMockDate, clearMockDate } = useMockDate()

const dateInput = ref('')
const timeInput = ref('')

// Update inputs when mock values change
computed(() => {
  if (isMocking.value) {
    dateInput.value = mockDate.value || ''
    timeInput.value = mockTime.value || '00:00'
  }
})

const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const applyMock = () => {
  if (!dateInput.value) {
    alert('Please enter a date')
    return
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput.value)) {
    alert('Please use YYYY-MM-DD format')
    return
  }

  // Validate time format if provided
  if (timeInput.value && !/^\d{2}:\d{2}$/.test(timeInput.value)) {
    alert('Please use HH:MM format')
    return
  }

  setMockDate(dateInput.value, timeInput.value || '00:00')
}

const handleClear = () => {
  dateInput.value = ''
  timeInput.value = ''
  clearMockDate()
}

const setPreset = (name, date, time = '00:00') => {
  dateInput.value = date
  timeInput.value = time
  setMockDate(date, time)
}
</script>

<style scoped>
.dev-debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 2px solid #ff9800;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  max-width: 320px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.dev-debug-panel__toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  color: #666;
  transition: color 0.2s;
}

.dev-debug-panel__toggle:hover {
  color: #ff9800;
}

.dev-debug-panel__content {
  padding-right: 20px;
}

.dev-debug-panel__title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.dev-debug-panel__status {
  margin-bottom: 12px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.dev-debug-panel__status-text {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
}

.dev-debug-panel__status-text--active {
  color: #4caf50;
}

.dev-debug-panel__status-text--inactive {
  color: #666;
}

.dev-debug-panel__inputs {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dev-debug-panel__input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dev-debug-panel__input-group label {
  font-size: 10px;
  font-weight: bold;
  color: #555;
}

.dev-debug-panel__input {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  background: white;
}

.dev-debug-panel__input:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.1);
}

.dev-debug-panel__buttons {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.dev-debug-panel__btn {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.dev-debug-panel__btn--apply {
  background: #4caf50;
  color: white;
}

.dev-debug-panel__btn--apply:hover {
  background: #45a049;
}

.dev-debug-panel__btn--clear {
  background: #f44336;
  color: white;
}

.dev-debug-panel__btn--clear:hover {
  background: #da190b;
}

.dev-debug-panel__presets {
  border-top: 1px solid #eee;
  padding-top: 8px;
}

.dev-debug-panel__presets-label {
  margin: 0 0 6px;
  font-size: 10px;
  font-weight: bold;
  color: #555;
}

.dev-debug-panel__preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.dev-debug-panel__preset-btn {
  padding: 6px 4px;
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.dev-debug-panel__preset-btn:hover {
  background: #ff9800;
  color: white;
  border-color: #ff9800;
}

.dev-debug-panel__fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 2px solid #ff9800;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.2s;
  z-index: 10000;
}

.dev-debug-panel__fab:hover {
  background: #ff9800;
  transform: scale(1.1);
}
</style>
