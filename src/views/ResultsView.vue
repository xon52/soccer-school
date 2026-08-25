<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getCourse, isCourseId } from '@/data/courses'
import { useCourseSession } from '@/composables/useCourseSession'
import { useProgress } from '@/composables/useProgress'
import { useSpeech } from '@/composables/useSpeech'
import type { CourseId } from '@/types'

const props = defineProps<{
  courseId: string
}>()

const router = useRouter()
const { score, total, finished, start } = useCourseSession()
const { clearScore } = useProgress()
const { unlock } = useSpeech()
const course = computed(() => getCourse(props.courseId))

onMounted(async () => {
  if (!isCourseId(props.courseId) || !finished.value || total.value === 0) {
    await router.replace({ name: 'home' })
  }
})

const message = computed(() => {
  if (score.value === total.value) return 'Perfect! You know this stuff.'
  if (score.value >= Math.ceil(total.value * 0.7)) {
    return 'Great job. Try again if you want to beat your score.'
  }
  return 'Good try. Watch the lessons one more time and have another go.'
})

async function tryAgain() {
  if (!isCourseId(props.courseId)) return
  const id: CourseId = props.courseId
  unlock()
  clearScore(id)
  start(id)
  await router.push({ name: 'course', params: { courseId: id } })
}
</script>

<template>
  <section v-if="finished && course" class="results">
    <p class="kicker">{{ course.title }} complete</p>
    <h1>{{ score }} / {{ total }}</h1>
    <p class="lead">{{ message }}</p>
    <div class="cta">
      <button class="btn primary" type="button" @click="tryAgain">Try again</button>
      <RouterLink class="btn" to="/">Pick another course</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.results {
  max-width: 36rem;
  background: #fff8e7;
  color: #14221b;
  border: 3px solid #14221b;
  border-radius: 18px;
  padding: 1.6rem 1.4rem;
  box-shadow: 0 6px 0 #14221b;
}

.kicker {
  margin: 0;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #1d6a3a;
}

h1 {
  margin: 0.3rem 0 0.6rem;
  font-size: clamp(2.4rem, 8vw, 4rem);
}

.lead {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.2rem;
}
</style>
