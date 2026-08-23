import { computed, ref } from 'vue'
import { getGroup } from '@/data/groups'
import { flipPlayVertical } from '@/data/plays'
import { shuffleItems, shuffleQuestion } from '@/data/shuffle'
import { useProgress } from '@/composables/useProgress'
import type { GroupId, Play, Question, Scenario } from '@/types'

export interface SessionItem {
  scenarioId: string
  play: Play
  question: Question
  layerIndex: number
  layerCount: number
}

const items = ref<SessionItem[]>([])
const index = ref(0)
const score = ref(0)
const revealed = ref(false)
const finished = ref(false)
const groupId = ref<GroupId | null>(null)

/**
 * Lessons in a group often open on the same line ("Look at the field…"). Say it
 * on the first one, then drop it so the group does not repeat itself.
 */
function dropRepeatedLead(play: Play, spokenLeads: Set<string>): Play {
  const lead = play.frames[0]
  const caption = lead?.caption ?? ''
  if (!lead || !caption) return play
  if (!spokenLeads.has(caption)) {
    spokenLeads.add(caption)
    return play
  }
  return { ...play, frames: [{ ...lead, caption: '' }, ...play.frames.slice(1)] }
}

function prepareScenario(scenario: Scenario, spokenLeads: Set<string>): SessionItem[] {
  const flipped =
    scenario.canFlipVertical && Math.random() >= 0.5
      ? flipPlayVertical(scenario.play)
      : scenario.play
  const play = dropRepeatedLead(flipped, spokenLeads)
  const questions = scenario.questions.map(shuffleQuestion)
  return questions.map((question, layerIndex) => ({
    scenarioId: scenario.id,
    play,
    question,
    layerIndex,
    layerCount: questions.length,
  }))
}

export function useGroupSession() {
  const { saveScore } = useProgress()
  const current = computed(() => items.value[index.value])
  const total = computed(() => items.value.length)
  const questionNumber = computed(() => index.value + 1)
  const isLast = computed(() => index.value >= total.value - 1)
  const isLastLayer = computed(() => {
    const item = current.value
    if (!item) return true
    return item.layerIndex >= item.layerCount - 1
  })

  function start(nextGroupId: GroupId) {
    const group = getGroup(nextGroupId)
    if (!group || group.comingSoon || group.scenarios.length === 0) {
      items.value = []
      groupId.value = null
      finished.value = false
      return
    }
    groupId.value = nextGroupId
    const spokenLeads = new Set<string>()
    items.value = shuffleItems(group.scenarios).flatMap((scenario) =>
      prepareScenario(scenario, spokenLeads),
    )
    index.value = 0
    score.value = 0
    revealed.value = false
    finished.value = false
  }

  function recordAnswer(correct: boolean) {
    if (revealed.value) return
    revealed.value = true
    if (correct) score.value += 1
  }

  function next() {
    if (!revealed.value) return
    if (isLast.value) {
      finished.value = true
      if (groupId.value) saveScore(groupId.value, score.value, total.value)
      return
    }
    index.value += 1
    revealed.value = false
  }

  function reset() {
    if (groupId.value) start(groupId.value)
  }

  return {
    items,
    index,
    score,
    revealed,
    finished,
    groupId,
    current,
    total,
    questionNumber,
    isLast,
    isLastLayer,
    start,
    recordAnswer,
    next,
    reset,
  }
}
