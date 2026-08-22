import type { Question } from '@/types'

export function shuffleItems<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = copy[i]
    const b = copy[j]
    if (a !== undefined && b !== undefined) {
      copy[i] = b
      copy[j] = a
    }
  }
  return copy
}

export function shuffleQuestion(question: Question): Question {
  const marked = question.choices.map((label, index) => ({
    label,
    correct: index === question.correctIndex,
  }))
  const shuffled = shuffleItems(marked)
  const correctIndex = shuffled.findIndex((item) => item.correct)
  const first = shuffled[0]?.label ?? question.choices[0]
  const second = shuffled[1]?.label ?? question.choices[1]
  const third = shuffled[2]?.label ?? question.choices[2]
  const fourth = shuffled[3]?.label ?? question.choices[3]
  return {
    ...question,
    choices: [first, second, third, fourth],
    correctIndex: correctIndex < 0 ? 0 : correctIndex,
  }
}
