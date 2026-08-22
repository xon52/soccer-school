import { computed, onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { Highlight, Keyframe, Player, Point, Team } from '@/types'

const KICK_MS = 1450
const MOVE_MS = 800
const END_HOLD_MS = 400

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function frameDuration(frame: Keyframe | undefined) {
  if (prefersReducedMotion()) return 50
  if (!frame) return MOVE_MS
  if (frame.durationMs !== undefined) return frame.durationMs
  return frame.kick ? KICK_MS : MOVE_MS
}

function holderOf(frame: Keyframe | undefined) {
  return frame?.players?.find((player) => player.hasBall)
}

export function usePlayReplay(frames: MaybeRefOrGetter<Keyframe[]>) {
  const index = ref(0)
  const isPlaying = ref(false)
  const isComplete = ref(false)
  const previousBall = ref<Point | null>(null)
  const kickTeam = ref<Team | null>(null)
  const kickerId = ref<string | null>(null)
  const instantMove = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let raf = 0

  const list = computed(() => toValue(frames))

  const current = computed((): Keyframe | undefined => {
    return list.value[index.value] ?? list.value[0]
  })

  const ball = computed((): Point => current.value?.ball ?? { x: 50, y: 50 })

  const highlight = computed((): Highlight => current.value?.highlight ?? 'none')

  const caption = computed(() => current.value?.caption ?? '')

  const restartLabel = computed(() => current.value?.restartLabel)

  const forbidHands = computed(() => current.value?.forbidHands === true)

  const moveDurationMs = computed(() => {
    if (instantMove.value || prefersReducedMotion()) return 20
    return frameDuration(current.value)
  })

  const kickFrom = computed(() => previousBall.value)

  const kickTo = computed(() => {
    if (!current.value?.kick || !previousBall.value) return null
    return current.value.ball
  })

  const players = computed((): Player[] => {
    let latest: Player[] = []
    const end = Math.min(index.value, list.value.length - 1)
    for (let i = 0; i <= end; i += 1) {
      const frame = list.value[i]
      if (frame?.players) latest = frame.players
    }
    return latest
  })

  function clearTimer() {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  function lastIndex() {
    return Math.max(0, list.value.length - 1)
  }

  function finish() {
    isPlaying.value = false
    isComplete.value = true
  }

  function afterPaint(callback: () => void) {
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        raf = 0
        callback()
      })
    })
  }

  function advance() {
    if (index.value >= lastIndex()) {
      finish()
      return
    }
    const from = list.value[index.value]
    const holder = holderOf(from)
    const nextIndex = index.value + 1
    const next = list.value[nextIndex]
    previousBall.value = holder ? { x: holder.x, y: holder.y } : (from?.ball ?? null)
    kickTeam.value = holder?.team ?? null
    kickerId.value = holder?.id ?? null
    instantMove.value = false
    index.value = nextIndex
    const wait = frameDuration(next) + (nextIndex >= lastIndex() ? END_HOLD_MS : 120)
    timer = setTimeout(() => {
      if (index.value >= lastIndex()) finish()
      else advance()
    }, wait)
  }

  function play() {
    clearTimer()
    if (list.value.length === 0) {
      finish()
      return
    }
    if (isComplete.value || index.value >= lastIndex()) {
      replay()
      return
    }
    isPlaying.value = true
    if (list.value.length <= 1) {
      finish()
      return
    }
    afterPaint(advance)
  }

  function pause() {
    clearTimer()
    isPlaying.value = false
  }

  function skipToEnd() {
    clearTimer()
    const first = list.value[0]
    const last = list.value[lastIndex()]
    const holder = holderOf(first)
    previousBall.value = last?.kick ? (holder ? { x: holder.x, y: holder.y } : (first?.ball ?? null)) : null
    kickTeam.value = last?.kick ? (holder?.team ?? null) : null
    kickerId.value = last?.kick ? (holder?.id ?? null) : null
    instantMove.value = true
    isPlaying.value = false
    index.value = lastIndex()
    isComplete.value = true
  }

  function replay() {
    clearTimer()
    instantMove.value = true
    index.value = 0
    previousBall.value = null
    kickTeam.value = null
    kickerId.value = null
    isComplete.value = false
    isPlaying.value = true
    afterPaint(() => {
      instantMove.value = false
      if (list.value.length <= 1) {
        finish()
        return
      }
      advance()
    })
  }

  function reset() {
    clearTimer()
    index.value = 0
    previousBall.value = null
    kickTeam.value = null
    kickerId.value = null
    instantMove.value = false
    isPlaying.value = false
    isComplete.value = false
  }

  watch(
    list,
    () => {
      reset()
    },
    { deep: false },
  )

  onUnmounted(clearTimer)

  return {
    index,
    isPlaying,
    isComplete,
    current,
    ball,
    highlight,
    caption,
    players,
    restartLabel,
    forbidHands,
    kickFrom,
    kickTo,
    kickTeam,
    kickerId,
    moveDurationMs,
    reducedMotion: prefersReducedMotion(),
    play,
    pause,
    replay,
    reset,
    skipToEnd,
  }
}
