import { computed, ref } from 'vue'
import { COURSE_IDS, type CourseId, type CourseScore } from '@/types'

const STORAGE_KEY = 'soccer-school.progress'

const scores = ref<Partial<Record<CourseId, CourseScore>>>(loadScores())

function loadScores(): Partial<Record<CourseId, CourseScore>> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const record = parsed as Record<string, CourseScore>
    if (record.goalie && !record['goalie-hands']) {
      record['goalie-hands'] = record.goalie
    }
    delete record.goalie
    const next: Partial<Record<CourseId, CourseScore>> = {}
    for (const id of COURSE_IDS) {
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

  function scoreFor(courseId: CourseId) {
    return scores.value[courseId]
  }

  function saveScore(courseId: CourseId, correct: number, total: number) {
    scores.value = {
      ...scores.value,
      [courseId]: { correct, total },
    }
    persist()
  }

  function clearScore(courseId: CourseId) {
    const next = { ...scores.value }
    delete next[courseId]
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
