<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import QuizChoice from '@/components/QuizChoice.vue'
import SoccerField from '@/components/SoccerField.vue'
import { usePlayReplay } from '@/composables/usePlayReplay'
import { useSpeech } from '@/composables/useSpeech'
import type { Play, Question } from '@/types'

const props = defineProps<{
  play: Play
  question: Question
  isLastLayer: boolean
}>()

const emit = defineEmits<{
  answered: [correct: boolean]
}>()

type Phase = 'ready' | 'watching' | 'asking' | 'done'

const phase = ref<Phase>('ready')
const chosen = ref<number | null>(null)
const showingOutcome = ref(false)

const { muted, unlock, speak, toggleMute } = useSpeech()

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
  forbidHands,
  isComplete,
  isPlaying,
  kickFrom,
  kickTo,
  kickTeam,
  kickerId,
  moveDurationMs,
  reducedMotion,
  play: startPlay,
  replay,
  skipToEnd,
} = usePlayReplay(frames)

watch(
  () => props.question,
  (question) => {
    chosen.value = null
    showingOutcome.value = false
    phase.value = 'asking'
    speak(question.prompt)
  },
)

watch(isComplete, (done) => {
  if (!done || phase.value !== 'watching') return
  phase.value = chosen.value !== null ? 'done' : 'asking'
  if (phase.value === 'asking') speak(props.question.prompt)
})

function watchPlay() {
  unlock()
  showingOutcome.value = false
  phase.value = 'watching'
  replay()
}

function skipPlay() {
  skipToEnd()
}

async function choose(choiceIndex: number) {
  if (chosen.value !== null || phase.value !== 'asking') return
  chosen.value = choiceIndex
  const correct = choiceIndex === props.question.correctIndex
  emit('answered', correct)
  phase.value = 'done'
  if (props.isLastLayer && props.play.outcome?.length) {
    showingOutcome.value = true
    await nextTick()
    startPlay()
  }
  const answer = props.question.choices[props.question.correctIndex] ?? ''
  const feedback = correct ? 'Yes! That’s the one.' : `Not quite. The right answer is ${answer}.`
  speak(`${feedback} ${props.question.why}`)
}

const answeredRight = computed(() => chosen.value === props.question.correctIndex)

const prompt = computed(() => {
  if (phase.value === 'ready') return props.play.label
  if (phase.value === 'watching') return props.play.label
  if (phase.value === 'asking') return props.question.prompt
  return answeredRight.value ? 'Yes!' : 'Not quite.'
})

const fallbackText = computed(() => {
  if (phase.value === 'ready' || phase.value === 'watching') return props.play.intro
  if (phase.value === 'asking') return props.question.prompt
  const answer = props.question.choices[props.question.correctIndex] ?? ''
  const feedback = answeredRight.value ? 'That’s the one.' : `The right answer is ${answer}.`
  return `${feedback} ${props.question.why}`
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
      :forbid-hands="forbidHands"
      :reduced-motion="reducedMotion"
      :show-labels="!play.hideNames"
      :show-ball="!play.hideBall"
      :show-legend="players.length > 0"
      :kick-from="kickFrom"
      :kick-to="kickTo"
      :kick-team="kickTeam"
      :kicker-id="kickerId"
      :move-duration-ms="moveDurationMs"
    />

    <section class="dock">
      <div class="prompt-row">
        <p class="prompt">{{ prompt }}</p>
        <div class="speech">
          <button
            class="icon-btn"
            type="button"
            :aria-pressed="muted"
            :aria-label="muted ? 'Unmute voice' : 'Mute voice'"
            @click="toggleMute"
          >
            {{ muted ? 'Muted' : 'Voice' }}
          </button>
        </div>
      </div>

      <div v-if="phase === 'asking' || phase === 'done'" class="choices">
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
        <template v-if="phase === 'ready'">
          <button class="btn primary" type="button" @click="watchPlay">Watch the play</button>
        </template>
        <template v-else-if="phase === 'watching'">
          <button class="btn" type="button" :disabled="isPlaying" @click="watchPlay">Restart</button>
          <button class="btn" type="button" @click="skipPlay">Skip to end</button>
        </template>
        <template v-else>
          <button class="btn ghost" type="button" @click="watchPlay">Watch again</button>
          <slot />
        </template>
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

.speech {
  flex-shrink: 0;
}

.icon-btn {
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  border: 3px solid #14221b;
  background: #e8f6ec;
  color: #14221b;
  cursor: pointer;
}

.icon-btn[aria-pressed='true'] {
  background: #fecaca;
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

.ghost {
  background: #e8f6ec;
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
