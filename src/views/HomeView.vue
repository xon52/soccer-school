<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { courses } from '@/data/courses'
import { useFeedback } from '@/composables/useFeedback'
import { useProgress } from '@/composables/useProgress'
import { useSpeech } from '@/composables/useSpeech'
import type { CourseId } from '@/types'

const { scoreFor } = useProgress()
const { unlock } = useSpeech()
const { open: openFeedback } = useFeedback()

function scoreLabel(courseId: CourseId) {
  const score = scoreFor(courseId)
  if (!score) return null
  return `${score.correct} / ${score.total}`
}
</script>

<template>
  <section class="hub">
    <h1 class="lead">Pick a course and learn the rules of soccer.</h1>

    <div class="cards">
      <template v-for="course in courses" :key="course.id">
        <p v-if="course.comingSoon" class="hub-card soon">
          <strong>{{ course.title }}</strong>
          <span>{{ course.blurb }}</span>
          <em>Coming soon</em>
        </p>
        <RouterLink
          v-else
          class="hub-card"
          :to="{ name: 'course', params: { courseId: course.id } }"
          @click="unlock"
        >
          <strong>{{ course.title }}</strong>
          <span>{{ course.blurb }}</span>
          <em v-if="scoreLabel(course.id)">{{ scoreLabel(course.id) }}</em>
        </RouterLink>
      </template>
    </div>

    <p class="feedback">
      <button class="btn" type="button" @click="openFeedback()">Send feedback</button>
    </p>
  </section>
</template>

<style scoped>
.hub {
  display: grid;
  gap: 0.85rem;
}

.lead {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
  font-weight: 700;
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

.feedback {
  margin: 0.4rem 0 0;
}

@media (min-width: 700px) {
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
