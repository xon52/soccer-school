<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import QuizChoice from '@/components/QuizChoice.vue'
import SoccerField from '@/components/SoccerField.vue'
import { usePlayReplay } from '@/composables/usePlayReplay'
import { useSpeech } from '@/composables/useSpeech'
import { hitSpeech } from '@/quiz/praise'
import type { Play, Question } from '@/types'

const props = defineProps<{
  play: Play
  question: Question
  isLastLayer: boolean
}>()

const emit = defineEmits<{
  answered: [correct: boolean]
  continue: []
}>()

type Phase = 'asking' | 'done'

const phase = ref<Phase>('asking')
const chosen = ref<number | null>(null)
const showingOutcome = ref(false)
const introReady = ref(false)
let playGen = 0
let continueGen = 0

const { unlock, speak } = useSpeech()

const frames = computed(() => {
  if (showingOutcome.value && props.play.outcome?.length) {
    return props.play.outcome
  }
  return props.play.frames
})

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
  play: startPlay,
  replay,
  skipToEnd,
  skipStep,
} = usePlayReplay(frames)

watch(
  () => props.question,
  (question) => {
    playGen += 1
    continueGen += 1
    chosen.value = null
    showingOutcome.value = false
    phase.value = 'asking'
    introReady.value = true
    skipToEnd()
    speak(question.prompt)
  },
)

async function runContextThenAsk() {
  const gen = ++playGen
  introReady.value = false
  showingOutcome.value = false
  await replay()
  if (gen !== playGen) return
  introReady.value = true
  await speak(props.question.prompt)
  if (gen !== playGen) return
  if (phase.value === 'done' && answeredRight.value) {
    if (props.isLastLayer && props.play.outcome?.length) {
      showingOutcome.value = true
      await nextTick()
      await startPlay()
    }
    if (gen !== playGen) return
    emit('continue')
  }
}

function watchPlay() {
  unlock()
  continueGen += 1
  void runContextThenAsk()
}

function skip() {
  unlock()
  skipStep()
}

onMounted(() => {
  void runContextThenAsk()
})

async function choose(choiceIndex: number) {
  if (!introReady.value || chosen.value !== null || phase.value !== 'asking') return
  chosen.value = choiceIndex
  const correct = choiceIndex === props.question.correctIndex
  emit('answered', correct)
  phase.value = 'done'
  const myContinue = continueGen
  if (correct) {
    await speak(hitSpeech(props.question))
    if (myContinue !== continueGen) return
    if (props.isLastLayer && props.play.outcome?.length) {
      showingOutcome.value = true
      await nextTick()
      await startPlay()
    }
    if (myContinue !== continueGen) return
    emit('continue')
  } else {
    await speak(props.question.why)
    if (myContinue !== continueGen) return
    if (props.isLastLayer && props.play.outcome?.length) {
      showingOutcome.value = true
      await nextTick()
      await startPlay()
    }
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
          :locked="!introReady"
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
  gap: 0.8rem;
  min-height: calc(100dvh - 5.5rem);
}

.stage :deep(.pitch) {
  max-height: min(52dvh, 560px);
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

@media (min-height: 800px) {
  .stage :deep(.pitch) {
    max-height: min(58dvh, 640px);
  }
}
</style>
