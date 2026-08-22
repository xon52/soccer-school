<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { groups } from '@/data/groups'
import { useProgress } from '@/composables/useProgress'
import type { GroupId } from '@/types'

const { scoreFor } = useProgress()

function scoreLabel(groupId: GroupId) {
  const score = scoreFor(groupId)
  if (!score) return null
  return `${score.correct} / ${score.total}`
}
</script>

<template>
  <section class="hub">
    <p class="eyebrow">For soccer kids</p>
    <h1>Soccer School</h1>
    <p class="lead">
      You are the <strong>blue</strong> team. Watch the play, then tap what happens next.
    </p>

    <div class="cards">
      <template v-for="group in groups" :key="group.id">
        <p v-if="group.comingSoon" class="hub-card soon">
          <strong>{{ group.title }}</strong>
          <span>{{ group.blurb }}</span>
          <em>Coming soon</em>
        </p>
        <RouterLink
          v-else
          class="hub-card"
          :to="{ name: 'play', params: { groupId: group.id } }"
        >
          <strong>{{ group.title }}</strong>
          <span>{{ group.blurb }}</span>
          <em v-if="scoreLabel(group.id)">{{ scoreLabel(group.id) }}</em>
        </RouterLink>
      </template>
    </div>
  </section>
</template>

<style scoped>
.hub {
  display: grid;
  gap: 0.85rem;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
  color: #facc15;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  line-height: 1.05;
}

.lead {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
  max-width: 36rem;
}

.cards {
  display: grid;
  gap: 0.9rem;
}

.hub-card {
  display: grid;
  gap: 0.35rem;
  padding: 1.1rem 1.2rem;
  background: #fff8e7;
  color: #14221b;
  border: 3px solid #14221b;
  border-radius: 16px;
  text-decoration: none;
  box-shadow: 0 5px 0 #14221b;
}

.hub-card:hover,
.hub-card:focus-visible {
  background: #e8f6ec;
}

.hub-card.soon {
  margin: 0;
  opacity: 0.78;
  box-shadow: none;
}

.hub-card strong {
  font-size: 1.25rem;
}

.hub-card em {
  font-style: normal;
  font-weight: 800;
  color: #1d6a3a;
}

.hub-card.soon em {
  color: #6b7280;
}

@media (min-width: 700px) {
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
