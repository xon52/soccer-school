import type { Drawing, Point, Question, Team } from '@/types'

export interface SourceLine {
  no: number
  text: string
}

export type PointRef =
  | { type: 'tag'; tag: string }
  | { type: 'ball' }
  | { type: 'point'; x: number; y: number }

export interface ArrowCmd {
  from: PointRef
  to: PointRef
}

export interface StepBuilder {
  caption: string
  moves: Map<string, Point>
  ball?: { at?: Point; with?: string }
  arrows: ArrowCmd[]
  drawings: Drawing[]
  labels: Map<string, string>
  banner?: string
  durationMs?: number
  hands?: string
  noHands?: string
}

export interface LessonBuilder {
  course?: string
  id?: string
  title?: string
  intro?: string
  flipVertical: boolean
  hideNames: boolean
  hideBall: boolean
  lineup?: '7v7'
  setupSeen: boolean
  setupPlayers: Map<string, Point>
  ball?: { at?: Point; with?: string }
  steps: StepBuilder[]
  questions: { question: Question; at: number }[]
}

export function emptyStep(): StepBuilder {
  return {
    caption: '',
    moves: new Map(),
    arrows: [],
    drawings: [],
    labels: new Map(),
  }
}

export function emptyBuilder(): LessonBuilder {
  return {
    flipVertical: false,
    hideNames: false,
    hideBall: false,
    setupSeen: false,
    setupPlayers: new Map(),
    steps: [],
    questions: [],
  }
}

export type CommandHandler = (line: SourceLine, args: string[], rest: string, builder: LessonBuilder) => void

export function teamFromTag(tag: string): Team | undefined {
  if (tag.startsWith('B-')) return 'blue'
  if (tag.startsWith('R-')) return 'red'
  return undefined
}
