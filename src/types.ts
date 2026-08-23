export type Team = 'blue' | 'red'
export type Highlight =
  | 'none'
  | 'sideline'
  | 'goalLine'
  | 'penaltyArea'
  | 'goalArea'
  | 'centerCircle'
  | 'halfwayLine'
  | 'penaltySpot'
export const GROUP_IDS = ['names', 'ball-out', 'goalie-hands', 'fouls'] as const
export type GroupId = (typeof GROUP_IDS)[number]

export interface Point {
  x: number
  y: number
}

export interface Player {
  id: string
  team: Team
  x: number
  y: number
  role?: 'goalkeeper' | 'outfield'
  hasBall?: boolean
  usingHands?: boolean
  label?: string
}

export type Drawing =
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'bar'; x: number; y: number; w: number; h: number }
  | { kind: 'circle'; x: number; y: number; r: number }

export interface Arrow {
  from: Point
  to: Point
  team?: Team
}

export interface Keyframe {
  ball: Point
  caption: string
  highlight?: Highlight
  players?: Player[]
  restartLabel?: string
  forbidHands?: boolean
  /** Time to animate the ball onto this frame. */
  durationMs?: number
  /** Draw a kick arrow from the previous ball position to this one. */
  kick?: boolean
  drawings?: Drawing[]
  arrows?: Arrow[]
}

export interface Play {
  label: string
  intro: string
  frames: Keyframe[]
  outcome?: Keyframe[]
  hideNames?: boolean
  hideBall?: boolean
}

export interface Question {
  prompt: string
  choices: [string, string, string, string]
  correctIndex: number
  why: string
}

export interface Scenario {
  id: string
  play: Play
  questions: Question[]
  canFlipVertical?: boolean
}

export interface Group {
  id: GroupId
  title: string
  blurb: string
  comingSoon?: boolean
  scenarios: Scenario[]
}

export interface GroupScore {
  correct: number
  total: number
}
