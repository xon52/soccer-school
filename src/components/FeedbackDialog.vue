<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useFeedback } from '@/composables/useFeedback'
import { TURNSTILE_ACTION, TURNSTILE_SITEKEY, loadTurnstile } from '@/feedback/client'
import type { Turnstile } from '@/feedback/client'

const { isOpen, category, message, context, status, isQuestionReport, canSend, close, submit } =
  useFeedback()

const titleId = useId()
const card = ref<HTMLElement | null>(null)
const holder = ref<HTMLElement | null>(null)
const token = ref('')
const verifyFailed = ref(false)
let turnstile: Turnstile | null = null
let widgetId: string | null = null
let closeTimer = 0
let lastFocused: HTMLElement | null = null
let pressedMask = false

const title = computed(() => (isQuestionReport.value ? "Tell us what's wrong" : 'Send feedback'))
const about = computed(() => context.value.prompt)

const ready = computed(() => canSend.value && token.value !== '')

const statusText = computed(() => {
  if (status.value === 'sending') return 'Sending…'
  if (status.value === 'sent') return 'Thanks — sent.'
  if (status.value === 'error') return 'Could not send. Check your connection and try again.'
  if (verifyFailed.value) return 'Cannot verify right now. Check your connection.'
  if (token.value === '') return 'Checking you are a person…'
  return ''
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

function onMaskPointerDown(event: PointerEvent) {
  pressedMask = event.target === event.currentTarget
}

function onMaskClick(event: MouseEvent) {
  const onMask = event.target === event.currentTarget && pressedMask
  pressedMask = false
  if (onMask) close()
}

function trap() {
  lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
}

function release() {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
  lastFocused?.focus()
  lastFocused = null
}

async function mountTurnstile() {
  verifyFailed.value = false
  token.value = ''
  let api: Turnstile
  try {
    api = await loadTurnstile()
  } catch {
    verifyFailed.value = true
    return
  }
  turnstile = api
  if (!isOpen.value || !holder.value || widgetId !== null) return
  const id = api.render(holder.value, {
    sitekey: TURNSTILE_SITEKEY,
    action: TURNSTILE_ACTION,
    theme: 'light',
    appearance: 'interaction-only',
    callback: (next) => {
      token.value = next
      verifyFailed.value = false
    },
    'expired-callback': () => {
      token.value = ''
    },
    'error-callback': () => {
      token.value = ''
      verifyFailed.value = true
    },
  })
  widgetId = id ?? null
  if (widgetId === null) verifyFailed.value = true
}

function unmountTurnstile() {
  if (turnstile && widgetId !== null) turnstile.remove(widgetId)
  widgetId = null
  token.value = ''
  verifyFailed.value = false
}

async function retryTurnstile() {
  unmountTurnstile()
  await nextTick()
  void mountTurnstile()
}

watch(isOpen, async (open) => {
  window.clearTimeout(closeTimer)
  if (!open) {
    release()
    unmountTurnstile()
    return
  }
  trap()
  await nextTick()
  const first = card.value?.querySelector<HTMLElement>('[data-autofocus]')
  ;(first ?? card.value)?.focus()
  void mountTurnstile()
})

onBeforeUnmount(() => {
  window.clearTimeout(closeTimer)
  if (isOpen.value) release()
  unmountTurnstile()
})

async function onSubmit() {
  if (!ready.value) return
  const sent = await submit(token.value)
  if (sent) {
    closeTimer = window.setTimeout(close, 900)
    return
  }
  if (turnstile && widgetId !== null) {
    turnstile.reset(widgetId)
    token.value = ''
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="mask"
      @pointerdown="onMaskPointerDown"
      @click="onMaskClick"
    >
      <div
        ref="card"
        class="card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <h2 :id="titleId" class="card-title">{{ title }}</h2>

        <p v-if="about" class="about">{{ about }}</p>

        <form @submit.prevent="onSubmit">
          <label class="field-label" for="feedback-category">What is this?</label>
          <select id="feedback-category" v-model="category" class="field">
            <option value="bug">Something is wrong</option>
            <option value="idea">An idea or suggestion</option>
            <option value="other">Something else</option>
          </select>

          <label class="field-label" for="feedback-message">Tell us more</label>
          <textarea
            id="feedback-message"
            v-model="message"
            class="field message"
            maxlength="4000"
            required
            data-autofocus
          ></textarea>

          <div ref="holder" class="verify"></div>

          <p class="status" aria-live="polite">{{ statusText }}</p>
          <button
            v-if="verifyFailed"
            class="btn retry"
            type="button"
            @click="retryTurnstile"
          >
            Try again
          </button>

          <div class="actions">
            <button class="btn" type="button" @click="close">Cancel</button>
            <button class="btn primary" type="submit" :disabled="!ready">Send</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(0.75rem, env(safe-area-inset-top)) 1rem max(0.75rem, env(safe-area-inset-bottom));
  background: rgba(9, 24, 16, 0.65);
}

.card {
  width: min(30rem, 100%);
  max-height: 85dvh;
  overflow-y: auto;
  padding: 1rem 1.15rem 1.15rem;
  background: #fff8e7;
  color: #14221b;
  border: 3px solid #14221b;
  border-radius: 18px;
  box-shadow: 0 8px 0 #14221b;
}

.card:focus {
  outline: none;
}

.card-title {
  margin: 0 0 0.7rem;
  font-size: 1.2rem;
  font-weight: 900;
}

.about {
  margin: 0 0 0.7rem;
  padding: 0.5rem 0.7rem;
  background: #e8f6ec;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
}

.field-label {
  display: block;
  margin: 0.6rem 0 0.3rem;
  font-size: 0.95rem;
  font-weight: 800;
}

.field {
  width: 100%;
  padding: 0.5rem 0.6rem;
  font: inherit;
  font-weight: 700;
  color: #14221b;
  background: #fff;
  border: 3px solid #14221b;
  border-radius: 12px;
}

.message {
  min-height: 5.5rem;
  resize: vertical;
}

.verify:not(:empty) {
  margin-top: 0.7rem;
}

.status {
  margin: 0.5rem 0 0;
  min-height: 1.3em;
  font-size: 0.9rem;
  color: #1d6a3a;
}

.retry {
  margin-top: 0.4rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.7rem;
}

@media (max-height: 620px) {
  .card {
    padding: 0.7rem 0.9rem 0.9rem;
  }

  .card-title {
    margin-bottom: 0.5rem;
    font-size: 1.05rem;
  }

  .message {
    min-height: 4rem;
  }
}
</style>
