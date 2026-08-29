<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PlayStage from '@/components/PlayStage.vue'
import { getCourse, isCourseId } from '@/data/courses'
import { useCourseSession } from '@/composables/useCourseSession'
import { useFeedback } from '@/composables/useFeedback'
import { useSpeech } from '@/composables/useSpeech'

const props = defineProps<{
  courseId: string
}>()

const router = useRouter()
const { current, total, questionNumber, revealed, isLast, start, recordAnswer, next, finished } =
  useCourseSession()
const { unlock, cancel, speak } = useSpeech()
const { open: openFeedback, isOpen: feedbackOpen } = useFeedback()

const course = computed(() => getCourse(props.courseId))

const lastCorrect = ref(false)
let nextWhenDone = false

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

/**
 * Prompts repeat across lessons on purpose ("Who gets the ball?" is asked of
 * seven different situations), so identity comes from the lesson file plus the
 * position of the question block inside it.
 */
function onFlag() {
  const item = current.value
  if (!item) return
  cancel()
  openFeedback({
    questionId: `${props.courseId}/${item.lessonId}#${item.questionIndex + 1}`,
    lessonPath: `src/lessons/${props.courseId}/${item.lessonId}.lesson`,
    prompt: item.question.prompt,
    correctAnswer: item.question.choices[item.question.correctIndex] ?? '',
  })
}

async function onNext() {
  /*
   * A right answer advances on its own once the praise finishes, which would
   * move the quiz on — or route to the score screen — underneath an open
   * report. Hold it until the writer is done.
   */
  if (feedbackOpen.value) {
    nextWhenDone = true
    return
  }
  cancel()
  lastCorrect.value = false
  unlock()
  next()
  if (finished.value) {
    await router.push({ name: 'results', params: { courseId: props.courseId } })
  }
}

watch(feedbackOpen, (open) => {
  if (open) return
  if (nextWhenDone) {
    nextWhenDone = false
    void onNext()
    return
  }
  if (!revealed.value && current.value) {
    unlock()
    void speak(current.value.question.prompt)
  }
})
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
      @flag="onFlag"
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
