import type { Question } from '@/types'

/** Spoken on a hit. The answer is on screen, so the voice only confirms it. */
const OPENERS = [
  "That's right.",
  'You got it.',
  'Correct.',
  'Nice one.',
  'Exactly.',
  'Spot on.',
  "Yep, that's it.",
] as const

/** Openers that agree out loud, which jars when the right answer was "No". */
const AGREEING = new Set<string>(["Yep, that's it."])
const NO_LIKE = /^(no|false|n)$/i

let last = ''

export function hitSpeech(question: Question): string {
  const answer = question.choices[question.correctIndex] ?? ''
  const usable = NO_LIKE.test(answer.trim())
    ? OPENERS.filter((item) => !AGREEING.has(item))
    : [...OPENERS]
  const pool = usable.filter((item) => item !== last)
  const opener = pool[Math.floor(Math.random() * pool.length)] ?? "That's right."
  last = opener
  return opener
}
