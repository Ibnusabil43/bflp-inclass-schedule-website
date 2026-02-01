import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { initMockDate } from './composables/useMockDate'

// Initialize mock date system (checks query params and localStorage)
initMockDate()

createApp(App).mount('#app')

