<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const playing = computed(() => route.name === 'play')
</script>

<template>
  <div class="app-shell" :class="{ playing }">
    <header class="topbar">
      <RouterLink class="brand" to="/">Soccer School</RouterLink>
      <nav>
        <RouterLink to="/">Home</RouterLink>
      </nav>
    </header>
    <main class="page">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
    </main>
  </div>
</template>
