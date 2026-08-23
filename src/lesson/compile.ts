import { CENTER_M } from '@/field'
import type { Arrow, Keyframe, Player, Point, Scenario } from '@/types'
import type { LessonBuilder, PointRef, StepBuilder } from '@/lesson/commands/types'
import { teamFromTag } from '@/lesson/commands/types'
import { LessonParseError } from '@/lesson/error'
import { lineup7v7, MIN_PLAYER_GAP_M } from '@/lesson/lineup'
import { parseTag } from '@/lesson/tag'

function clonePlayers(players: Player[]) {
  return players.map((player) => ({ ...player }))
}

function findPlayer(players: Player[], tag: string, line = 1) {
  const player = players.find((item) => item.id === tag)
  if (!player) throw new LessonParseError(`unknown player ${tag}`, line)
  return player
}

function resolveRef(ref: PointRef, players: Player[], ball: Point, line = 1): Point {
  if (ref.type === 'ball') return { ...ball }
  if (ref.type === 'point') return { x: ref.x, y: ref.y }
  const player = findPlayer(players, ref.tag, line)
  return { x: player.x, y: player.y }
}

function applyBall(
  players: Player[],
  ball: Point,
  spec: { at?: Point; with?: string } | undefined,
) {
  const next = clonePlayers(players)
  if (!spec) return { players: next, ball: { ...ball } }
  if (spec.with) {
    const holder = findPlayer(next, spec.with)
    for (const player of next) player.hasBall = player.id === holder.id
    return { players: next, ball: { x: holder.x, y: holder.y } }
  }
  if (spec.at) return { players: next, ball: { ...spec.at } }
  return { players: next, ball: { ...ball } }
}

function warnSpacing(players: Player[], where: string) {
  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      const a = players[i]
      const b = players[j]
      if (!a || !b) continue
      const gap = Math.hypot(a.x - b.x, a.y - b.y)
      if (gap < MIN_PLAYER_GAP_M) {
        console.warn(
          `[lesson] ${where}: ${a.id} and ${b.id} are ${gap.toFixed(1)}m apart (need ~${MIN_PLAYER_GAP_M}m)`,
        )
      }
    }
  }
}

function snapshot(step: StepBuilder, players: Player[], ball: Point): Keyframe {
  const arrows: Arrow[] = step.arrows.map((arrow) => {
    const from = resolveRef(arrow.from, players, ball)
    const to = resolveRef(arrow.to, players, ball)
    const team = arrow.from.type === 'tag' ? teamFromTag(arrow.from.tag) : undefined
    return { from, to, team }
  })

  return {
    ball: { ...ball },
    caption: step.caption,
    players: clonePlayers(players),
    restartLabel: step.banner,
    forbidHands: step.noHands || undefined,
    durationMs: step.durationMs,
    drawings: step.drawings.length ? [...step.drawings] : undefined,
    arrows: arrows.length ? arrows : undefined,
  }
}

function applyStep(players: Player[], ball: Point, step: StepBuilder) {
  let next = clonePlayers(players)
  for (const [tag, point] of step.moves) {
    const player = findPlayer(next, tag)
    player.x = point.x
    player.y = point.y
  }
  for (const [tag, text] of step.labels) {
    findPlayer(next, tag).label = text
  }
  if (step.hands) {
    for (const player of next) player.usingHands = player.id === step.hands
  }
  const placed = applyBall(next, ball, step.ball)
  next = placed.players
  return { players: next, ball: placed.ball }
}

export function compileLesson(builder: LessonBuilder): Scenario {
  let players = builder.lineup === '7v7' ? lineup7v7() : []
  for (const [tag, point] of builder.setupPlayers) {
    const existing = players.find((player) => player.id === tag)
    if (existing) {
      existing.x = point.x
      existing.y = point.y
    } else {
      const parsed = parseTag(tag)
      players.push({
        id: parsed.tag,
        team: parsed.team,
        x: point.x,
        y: point.y,
        role: parsed.keeper ? 'goalkeeper' : 'outfield',
        label: parsed.keeper ? 'G' : undefined,
      })
    }
  }

  const start = applyBall(players, CENTER_M, builder.ball)
  players = start.players
  let ball = start.ball
  warnSpacing(players, builder.id ?? 'lesson')

  const frames: Keyframe[] = []
  const outcome: Keyframe[] = []
  const questionAt = builder.questionAt ?? builder.steps.length

  builder.steps.forEach((step, index) => {
    const applied = applyStep(players, ball, step)
    players = applied.players
    ball = applied.ball
    const frame = snapshot(step, players, ball)
    if (index < questionAt) frames.push(frame)
    else outcome.push(frame)
  })

  return {
    id: builder.id!,
    canFlipVertical: builder.flipVertical,
    play: {
      label: builder.title!,
      intro: builder.intro!,
      frames,
      outcome: outcome.length ? outcome : undefined,
      hideNames: builder.hideNames || undefined,
      hideBall: builder.hideBall || undefined,
    },
    questions: [builder.question!],
  }
}
