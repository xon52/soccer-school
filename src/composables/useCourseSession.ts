import { computed, ref } from 'vue'
import { getCourse } from '@/data/courses'
import { flipPlayVertical } from '@/data/plays'
import { shuffleItems, shuffleQuestion } from '@/data/shuffle'
import { useProgress } from '@/composables/useProgress'
import type { CourseId, Lesson, Play, Question } from '@/types'

export interface SessionItem {
  lessonId: string
  play: Play
  question: Question
}

const items = ref<SessionItem[]>([])
const index = ref(0)
const score = ref(0)
const revealed = ref(false)
const finished = ref(false)
const courseId = ref<CourseId | null>(null)

/**
 * Lessons in a course often open on the same line ("Look at the field…"). Say it
 * on the first one, then drop it so the course does not repeat itself.
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

function prepareLesson(lesson: Lesson, spokenLeads: Set<string>): SessionItem[] {
  const flipped =
    lesson.canFlipVertical && Math.random() >= 0.5 ? flipPlayVertical(lesson.play) : lesson.play
  const play = dropRepeatedLead(flipped, spokenLeads)
  return lesson.questions.map(shuffleQuestion).map((question) => ({
    lessonId: lesson.id,
    play,
    question,
  }))
}

export function useCourseSession() {
  const { saveScore } = useProgress()
  const current = computed(() => items.value[index.value])
  const total = computed(() => items.value.length)
  const questionNumber = computed(() => index.value + 1)
  const isLast = computed(() => index.value >= total.value - 1)

  function start(nextCourseId: CourseId) {
    const course = getCourse(nextCourseId)
    if (!course || course.comingSoon || course.lessons.length === 0) {
      items.value = []
      courseId.value = null
      finished.value = false
      return
    }
    courseId.value = nextCourseId
    const spokenLeads = new Set<string>()
    items.value = shuffleItems(course.lessons).flatMap((lesson) =>
      prepareLesson(lesson, spokenLeads),
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
      if (courseId.value) saveScore(courseId.value, score.value, total.value)
      return
    }
    index.value += 1
    revealed.value = false
  }

  function reset() {
    if (courseId.value) start(courseId.value)
  }

  return {
    items,
    index,
    score,
    revealed,
    finished,
    courseId,
    current,
    total,
    questionNumber,
    isLast,
    start,
    recordAnswer,
    next,
    reset,
  }
}
