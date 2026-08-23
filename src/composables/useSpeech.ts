import { onUnmounted, ref } from 'vue'

const MUTE_KEY = 'soccer-school.mute'

const muted = ref(loadMuted())
let unlocked = false
let speakGen = 0

function loadMuted() {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(MUTE_KEY) === '1'
}

function synth() {
  if (typeof window === 'undefined') return undefined
  return window.speechSynthesis
}

function safetyMs(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.min(12_000, Math.max(2_000, words * 400))
}

export function useSpeech() {
  function cancel() {
    speakGen += 1
    synth()?.cancel()
  }

  function unlock() {
    if (unlocked) return
    const speech = synth()
    if (!speech) return
    unlocked = true
    speech.cancel()
    const warm = new SpeechSynthesisUtterance(' ')
    warm.volume = 0
    speech.speak(warm)
  }

  function speak(text: string): Promise<void> {
    if (muted.value || !text.trim()) return Promise.resolve()
    cancel()
    const speech = synth()
    if (!speech) return Promise.resolve()
    const gen = speakGen
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    return new Promise((resolve) => {
      const finish = () => resolve()
      const timer = window.setTimeout(finish, safetyMs(text))
      const done = () => {
        window.clearTimeout(timer)
        finish()
      }
      utterance.onend = done
      utterance.onerror = done
      speech.speak(utterance)
      if (gen !== speakGen) {
        window.clearTimeout(timer)
        resolve()
      }
    })
  }

  function toggleMute() {
    muted.value = !muted.value
    localStorage.setItem(MUTE_KEY, muted.value ? '1' : '0')
    if (muted.value) cancel()
  }

  onUnmounted(cancel)

  return {
    muted,
    unlock,
    speak,
    cancel,
    toggleMute,
  }
}
