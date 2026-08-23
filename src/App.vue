<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useSpeech } from '@/composables/useSpeech'

const route = useRoute()
const playing = computed(() => route.name === 'play')
const { muted, toggleMute } = useSpeech()
</script>

<template>
  <div class="app-shell" :class="{ playing }">
    <header class="topbar">
      <RouterLink class="brand" to="/">Soccer School</RouterLink>
      <button
        class="mute-btn"
        type="button"
        :aria-pressed="muted"
        :aria-label="muted ? 'Unmute' : 'Mute'"
        @click="toggleMute"
      >
        <svg v-if="muted" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 9v6h4l5 5V4L8 9H4zm12.5 3A4.5 4.5 0 0 0 14 8.2v2.2a2.5 2.5 0 0 1 0 3.2v2.2A4.5 4.5 0 0 0 16.5 12zM14 4.2v2.1A6.5 6.5 0 0 1 19 12a6.5 6.5 0 0 1-5 5.7v2.1A8.5 8.5 0 0 0 21 12a8.5 8.5 0 0 0-7-7.8z"
          />
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2.4"
            d="M4 4l16 16"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 9v6h4l5 5V4L8 9H4zm12.5 3A4.5 4.5 0 0 0 14 8.2v2.2a2.5 2.5 0 0 1 0 3.2v2.2A4.5 4.5 0 0 0 16.5 12zM14 4.2v2.1A6.5 6.5 0 0 1 19 12a6.5 6.5 0 0 1-5 5.7v2.1A8.5 8.5 0 0 0 21 12a8.5 8.5 0 0 0-7-7.8z"
          />
        </svg>
      </button>
    </header>
    <main class="page">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
    </main>
  </div>
</template>
