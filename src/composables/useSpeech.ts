import { ref } from 'vue'

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
  return Math.min(20_000, Math.max(8_000, words * 800 + 2_000))
}

/**
 * Chrome and Safari load voices asynchronously, and an utterance queued before
 * they arrive is dropped. Without this the very first caption of a session is
 * silent.
 */
function voicesReady(speech: SpeechSynthesis): Promise<void> {
  if (speech.getVoices().length > 0) return Promise.resolve()
  return new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      window.clearInterval(poll)
      speech.removeEventListener('voiceschanged', done)
      resolve()
    }
    const timer = window.setTimeout(done, 1500)
    const poll = window.setInterval(() => {
      if (speech.getVoices().length > 0) done()
    }, 100)
    speech.addEventListener('voiceschanged', done)
  })
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
      let settled = false
      let heard = false
      let timer = 0
      let poll = 0
      let resume = 0

      const finish = () => {
        if (settled) return
        settled = true
        window.clearTimeout(timer)
        window.clearInterval(poll)
        window.clearInterval(resume)
        resolve()
      }

      timer = window.setTimeout(finish, safetyMs(text))
      poll = window.setInterval(() => {
        if (gen !== speakGen) {
          finish()
          return
        }
        if (speech.speaking || speech.pending) heard = true
        else if (heard) finish()
      }, 80)
      resume = window.setInterval(() => {
        if (gen !== speakGen) return
        if (speech.paused) speech.resume()
      }, 250)

      utterance.onend = () => {
        if (gen === speakGen) finish()
      }
      utterance.onerror = () => finish()

      void voicesReady(speech).then(() => {
        window.setTimeout(() => {
          if (gen !== speakGen) {
            finish()
            return
          }
          speech.speak(utterance)
        }, 50)
      })
    })
  }

  function toggleMute() {
    muted.value = !muted.value
    localStorage.setItem(MUTE_KEY, muted.value ? '1' : '0')
    if (muted.value) cancel()
  }

  return {
    muted,
    unlock,
    speak,
    cancel,
    toggleMute,
  }
}
