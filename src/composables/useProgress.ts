import { computed, ref } from 'vue'
import { GROUP_IDS, type GroupId, type GroupScore } from '@/types'

const STORAGE_KEY = 'soccer-school.progress'

const scores = ref<Partial<Record<GroupId, GroupScore>>>(loadScores())

function loadScores(): Partial<Record<GroupId, GroupScore>> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const record = parsed as Record<string, GroupScore>
    if (record.goalie && !record['goalie-hands']) {
      record['goalie-hands'] = record.goalie
    }
    delete record.goalie
    const next: Partial<Record<GroupId, GroupScore>> = {}
    for (const id of GROUP_IDS) {
      if (record[id]) next[id] = record[id]
    }
    return next
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
