import { computed, onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { CENTER_M } from '@/field'
import { useSpeech } from '@/composables/useSpeech'
import type { Arrow, Drawing, Highlight, Keyframe, Player, Point, Team } from '@/types'

const KICK_MS = 1450
const MOVE_MS = 800

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
  const { speak, cancel } = useSpeech()
  const index = ref(0)
  const isPlaying = ref(false)
  const isComplete = ref(false)
  const previousBall = ref<Point | null>(null)
  const kickTeam = ref<Team | null>(null)
  const kickerId = ref<string | null>(null)
  const instantMove = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let waitResolve: (() => void) | undefined
  let raf = 0
  let runId = 0

  const list = computed(() => toValue(frames))

  const current = computed((): Keyframe | undefined => {
    return list.value[index.value] ?? list.value[0]
  })

  const ball = computed((): Point => current.value?.ball ?? CENTER_M)

  const highlight = computed((): Highlight => current.value?.highlight ?? 'none')

  const caption = computed(() => current.value?.caption ?? '')

  const restartLabel = computed(() => current.value?.restartLabel)

  const drawings = computed((): Drawing[] => current.value?.drawings ?? [])

  const arrows = computed((): Arrow[] => current.value?.arrows ?? [])

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
    const resolve = waitResolve
    waitResolve = undefined
    resolve?.()
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

  function wait(ms: number, id: number) {
    return new Promise<void>((resolve) => {
      if (id !== runId) {
        resolve()
        return
      }
      waitResolve = () => {
        waitResolve = undefined
        resolve()
      }
      timer = setTimeout(() => {
        timer = undefined
        const done = waitResolve
        waitResolve = undefined
        done?.()
      }, ms)
    })
  }

  function prepareKick() {
    const from = list.value[index.value]
    const holder = holderOf(from)
    previousBall.value = holder ? { x: holder.x, y: holder.y } : (from?.ball ?? null)
    kickTeam.value = holder?.team ?? null
    kickerId.value = holder?.id ?? null
  }

  async function hold(frame: Keyframe | undefined, moveMs: number, id: number) {
    const caption = frame?.caption ?? ''
    await Promise.all([wait(moveMs, id), caption ? speak(caption) : Promise.resolve()])
  }

  async function runLoop(id: number) {
    let first = true
    while (id === runId) {
      const frame = list.value[index.value]
      const moveMs = first ? 0 : frameDuration(frame)
      first = false
      instantMove.value = false
      await hold(frame, moveMs, id)
      if (id !== runId) return
      if (index.value >= lastIndex()) {
        finish()
        return
      }
      prepareKick()
      index.value += 1
    }
  }

  function startLoop(): Promise<void> {
    isPlaying.value = true
    const id = ++runId
    return new Promise((resolve) => {
      afterPaint(async () => {
        instantMove.value = false
        await runLoop(id)
        resolve()
      })
    })
  }

  function play(): Promise<void> {
    clearTimer()
    if (list.value.length === 0) {
      finish()
      return Promise.resolve()
    }
    if (isComplete.value || index.value >= lastIndex()) {
      return replay()
    }
    return startLoop()
  }

  function pause() {
    runId += 1
    clearTimer()
    cancel()
    isPlaying.value = false
  }

  function skipToEnd() {
    runId += 1
    clearTimer()
    cancel()
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

  function replay(): Promise<void> {
    clearTimer()
    cancel()
    instantMove.value = true
    index.value = 0
    previousBall.value = null
    kickTeam.value = null
    kickerId.value = null
    isComplete.value = false
    return startLoop()
  }

  function skipStep() {
    if (!isPlaying.value) return
    cancel()
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    const resolve = waitResolve
    waitResolve = undefined
    resolve?.()
  }

  function reset() {
    runId += 1
    clearTimer()
    cancel()
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

  onUnmounted(() => {
    runId += 1
    clearTimer()
    cancel()
  })

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
    drawings,
    arrows,
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
    skipStep,
  }
}
