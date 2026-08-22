import { computed, ref } from 'vue'
import type { GroupId, GroupScore } from '@/types'

const STORAGE_KEY = 'soccer-school.progress'

const scores = ref<Partial<Record<GroupId, GroupScore>>>(loadScores())

function loadScores(): Partial<Record<GroupId, GroupScore>> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Partial<Record<GroupId, GroupScore>>
  } catch {
    return {}
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.value))
}

export function useProgress() {
  const completed = computed(() => scores.value)

  function scoreFor(groupId: GroupId) {
    return scores.value[groupId]
  }

  function saveScore(groupId: GroupId, correct: number, total: number) {
    scores.value = {
      ...scores.value,
      [groupId]: { correct, total },
    }
    persist()
  }

  function clearScore(groupId: GroupId) {
    const next = { ...scores.value }
    delete next[groupId]
    scores.value = next
    persist()
  }

  return {
    completed,
    scoreFor,
    saveScore,
    clearScore,
  }
}
