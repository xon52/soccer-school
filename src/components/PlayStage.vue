<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import QuizChoice from '@/components/QuizChoice.vue'
import SoccerField from '@/components/SoccerField.vue'
import { usePlayReplay } from '@/composables/usePlayReplay'
import { useSpeech } from '@/composables/useSpeech'
import { hitSpeech } from '@/quiz/praise'
import type { Play, Question } from '@/types'

const props = defineProps<{
  play: Play
  question: Question
}>()

const emit = defineEmits<{
  answered: [correct: boolean]
  continue: []
  flag: []
}>()

type Phase = 'asking' | 'done'

const phase = ref<Phase>('asking')
const chosen = ref<number | null>(null)
let introGen = 0
let feedbackGen = 0

const { unlock, speak } = useSpeech()

const frames = computed(() => props.play.frames)

const {
  ball,
  highlight,
  players,
  restartLabel,
  kickFrom,
  kickTo,
  kickTeam,
  kickerId,
  moveDurationMs,
  reducedMotion,
  drawings,
  arrows,
  isPlaying,
  replay,
  skipToEnd,
  skipStep,
} = usePlayReplay(frames)

watch(
  () => props.question,
  (question) => {
    introGen += 1
    feedbackGen += 1
    chosen.value = null
    phase.value = 'asking'
    skipToEnd()
    speak(question.prompt)
  },
)

/** Run the clip, then ask. Choices stay live the whole time. */
async function runIntro() {
  const gen = ++introGen
  await replay()
  if (gen !== introGen || phase.value !== 'asking') return
  await speak(props.question.prompt)
}

function watchPlay() {
  unlock()
  feedbackGen += 1
  void runIntro()
}

function skip() {
  unlock()
  skipStep()
}

onMounted(() => {
  void runIntro()
})

async function choose(choiceIndex: number) {
  if (chosen.value !== null || phase.value !== 'asking') return
  unlock()
  introGen += 1
  skipToEnd()
  chosen.value = choiceIndex
  const correct = choiceIndex === props.question.correctIndex
  emit('answered', correct)
  phase.value = 'done'
  const myFeedback = ++feedbackGen
  if (correct) {
    await speak(hitSpeech(props.question))
    if (myFeedback !== feedbackGen) return
    emit('continue')
  } else {
    await speak(props.question.why)
  }
}

const answeredRight = computed(() => chosen.value === props.question.correctIndex)

const prompt = computed(() => {
  if (phase.value === 'asking') return props.question.prompt
  return answeredRight.value ? props.question.correct : 'Not quite.'
})

const fallbackText = computed(() => {
  if (phase.value === 'asking') return props.play.intro || props.question.prompt
  if (answeredRight.value) return props.question.correct
  const answer = props.question.choices[props.question.correctIndex] ?? ''
  return `The right answer is ${answer}. ${props.question.why}`
})

const fallbackLabel = computed(() => {
  if (phase.value === 'done') return 'Why?'
  return 'Read this'
})
</script>

<template>
  <div class="stage">
    <SoccerField
      :ball="ball"
      :highlight="highlight"
      :players="players"
      :restart-label="restartLabel"
      :reduced-motion="reducedMotion"
      :show-labels="!play.hideNames"
      :show-ball="!play.hideBall"
      :show-legend="players.length > 0"
      :kick-from="kickFrom"
      :kick-to="kickTo"
      :kick-team="kickTeam"
      :kicker-id="kickerId"
      :move-duration-ms="moveDurationMs"
      :drawings="drawings"
      :arrows="arrows"
    />

    <section class="dock">
      <div class="prompt-row">
        <p class="prompt">{{ prompt }}</p>
        <div class="play-controls">
          <button v-if="isPlaying" class="replay-btn" type="button" @click="skip">Skip</button>
          <button class="replay-btn" type="button" @click="watchPlay">Replay</button>
          <button
            class="replay-btn flag-btn"
            type="button"
            title="Report a problem"
            aria-label="Report a problem with this question"
            @click="emit('flag')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6 2.6c.7 0 1.2.6 1.2 1.2v17.1a1.2 1.2 0 0 1-2.4 0V3.8c0-.6.5-1.2 1.2-1.2z"
              />
              <path
                fill="currentColor"
                d="M8.5 4.3h9.3a1 1 0 0 1 .87 1.5L17 8.7l1.67 2.9a1 1 0 0 1-.87 1.5H8.5z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="choices">
        <QuizChoice
          v-for="(choice, index) in question.choices"
          :key="choice"
          :label="choice"
          :revealed="chosen !== null"
          :selected="chosen === index"
          :correct="index === question.correctIndex"
          @choose="choose(index)"
        />
      </div>

      <div class="actions">
        <slot />
      </div>

      <details class="fallback">
        <summary>{{ fallbackLabel }}</summary>
        <p>{{ fallbackText }}</p>
      </details>
    </section>
  </div>
</template>

<style scoped>
.stage {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 0.6rem;
  height: 100%;
  min-height: 0;
}

.stage :deep(.pitch-wrap) {
  min-height: 0;
  grid-template-rows: minmax(0, 1fr) auto;
}

/*
 * The field gives up whatever height the dock needs. `align-self: center` keeps
 * its height auto so the max-height clamp shrinks the width with it instead of
 * stretching the box and letterboxing the drawing.
 */
.stage :deep(.pitch) {
  max-height: 100%;
  align-self: center;
  justify-self: center;
}

.dock {
  background: #fff8e7;
  color: #14221b;
  border: 3px solid #14221b;
  border-radius: 18px;
  padding: 0.85rem 1rem 1rem;
  box-shadow: 0 6px 0 #14221b;
  display: grid;
  gap: 0.7rem;
}

.prompt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.prompt {
  margin: 0;
  font-size: clamp(1.05rem, 2.4vw, 1.35rem);
  font-weight: 800;
  line-height: 1.25;
}

.play-controls {
  display: flex;
  flex-shrink: 0;
  gap: 0.4rem;
}

.replay-btn {
  flex-shrink: 0;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 3px solid #14221b;
  background: #e8f6ec;
  color: #14221b;
  cursor: pointer;
}

.flag-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.5rem;
}

.flag-btn svg {
  width: 0.95rem;
  height: 0.95rem;
}

.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  width: 100%;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.actions:not(:has(*)) {
  display: none;
}

.fallback {
  margin: 0;
  font-size: 0.95rem;
}

.fallback summary {
  cursor: pointer;
  font-weight: 800;
  color: #1d6a3a;
}

.fallback p {
  margin: 0.45rem 0 0;
  line-height: 1.4;
}

@media (min-width: 800px) {
  .choices {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-height: 620px) {
  .dock {
    padding: 0.6rem 0.75rem 0.7rem;
    gap: 0.5rem;
  }

  .fallback {
    font-size: 0.85rem;
  }
}
</style>
