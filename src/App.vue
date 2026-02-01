<script setup>
/**
 * App.vue - Root component
 * Renders the main ScheduleView as the primary content
 * Modern, clean, and polished class schedule dashboard
 */
import ScheduleView from "./views/ScheduleView.vue";
import DevDebugPanel from "./components/DevDebugPanel.vue";
</script>

<template>
  <ScheduleView />
  <DevDebugPanel />
</template>

<style>
/* Global app styles handled in style.css */
</style>