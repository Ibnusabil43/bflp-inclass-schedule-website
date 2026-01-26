<template>
  <header class="header">
    <div class="header__container">
      <h1 class="header__title">{{ title }}</h1>
      <div class="header__meta">
        <span class="header__badge">{{ phase }}</span>
        <span class="header__badge header__badge--accent">{{ classInfo }}</span>
      </div>
      <p class="header__period">{{ period }}</p>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  phase: {
    type: String,
    default: ''
  },
  classInfo: {
    type: String,
    default: ''
  },
  period: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, var(--color-primary, #0a1628) 0%, var(--color-primary-light, #1e3a5f) 100%);
  color: #ffffff;
  padding: 3rem 1rem 2.5rem;
}

.header__container {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.header__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  letter-spacing: -0.01em;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header__meta {
  display: flex;
  justify-content: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.header__badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.375rem 1rem;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.header__badge--accent {
  background: #e85d24;
}

.header__period {
  font-size: 0.875rem;
  opacity: 0.85;
  margin: 0;
}

@media (min-width: 768px) {
  .header {
    padding: 3.5rem 1.5rem 3rem;
  }
  
  .header__title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
  
  .header__meta {
    margin-bottom: 1.25rem;
  }
  
  .header__badge {
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
  }
  
  .header__period {
    font-size: 1rem;
  }
}
</style>
