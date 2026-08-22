import { onUnmounted, ref } from 'vue'

const MUTE_KEY = 'soccer-school.mute'

const muted = ref(loadMuted())
let unlocked = false

function loadMuted() {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(MUTE_KEY) === '1'
}

function synth() {
  if (typeof window === 'undefined') return undefined
  return window.speechSynthesis
}

export function useSpeech() {
  function cancel() {
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

  function speak(text: string) {
    cancel()
    if (muted.value || !text.trim()) return
    const speech = synth()
    if (!speech) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    speech.speak(utterance)
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
