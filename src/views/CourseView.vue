<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PlayStage from '@/components/PlayStage.vue'
import { getCourse, isCourseId } from '@/data/courses'
import { useCourseSession } from '@/composables/useCourseSession'
import { useSpeech } from '@/composables/useSpeech'

const props = defineProps<{
  courseId: string
}>()

const router = useRouter()
const { current, total, questionNumber, revealed, isLast, start, recordAnswer, next, finished } =
  useCourseSession()
const { unlock, cancel } = useSpeech()

const course = computed(() => getCourse(props.courseId))

const lastCorrect = ref(false)

onMounted(async () => {
  if (!isCourseId(props.courseId) || course.value?.comingSoon) {
    await router.replace({ name: 'home' })
    return
  }
  start(props.courseId)
})

function onAnswered(correct: boolean) {
  lastCorrect.value = correct
  recordAnswer(correct)
}

async function onNext() {
  cancel()
  lastCorrect.value = false
  unlock()
  next()
  if (finished.value) {
    await router.push({ name: 'results', params: { courseId: props.courseId } })
  }
}
</script>

<template>
  <section v-if="current && course" class="play">
    <p class="progress">{{ course.title }} · Question {{ questionNumber }} of {{ total }}</p>

    <PlayStage
      :key="current.lessonId"
      :play="current.play"
      :question="current.question"
      @answered="onAnswered"
      @continue="onNext"
    >
      <button v-if="revealed && !lastCorrect" class="btn primary" type="button" @click="onNext">
        {{ isLast ? 'See your score' : 'Next' }}
      </button>
    </PlayStage>
  </section>
</template>

<style scoped>
.play {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.5rem;
  min-height: 0;
  height: 100%;
}

.progress {
  margin: 0;
  font-weight: 800;
  color: #facc15;
}
</style>
