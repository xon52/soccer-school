import { namedDrawing } from '@/field'
import { LessonParseError } from '@/lesson/error'
import { isTag, parseTag } from '@/lesson/tag'
import {
  expectWord,
  parseNumber,
  parsePointTokens,
  parseRef,
} from '@/lesson/commands/shared'
import type { CommandHandler, LessonBuilder, SourceLine } from '@/lesson/commands/types'

function currentStep(builder: LessonBuilder, line: SourceLine) {
  const step = builder.steps[builder.steps.length - 1]
  if (!step) throw new LessonParseError('command must be inside a step', line.no)
  return step
}

const NAMED_DRAWS = new Set([
  'sideline',
  'goal-line',
  'goal-mouth',
  'penalty-area',
  'goal-area',
  'halfway-line',
  'center-circle',
  'penalty-spot',
])

export const stepHandlers: Record<string, CommandHandler> = {
  caption(line, _args, rest, builder) {
    currentStep(builder, line).caption = rest
  },
  ball(line, args, _rest, builder) {
    const step = currentStep(builder, line)
    const mode = args[0]?.toLowerCase()
    if (mode === 'with') {
      step.ball = { with: parseTag(args[1] ?? '', line.no).tag }
      return
    }
    if (mode === 'at' || mode === 'to') {
      step.ball = { at: parsePointTokens(args, 1, line).point }
      return
    }
    throw new LessonParseError('use "ball with TAG" or "ball to x, y"', line.no)
  },
  arrow(line, args, _rest, builder) {
    const step = currentStep(builder, line)
    expectWord(args, 0, 'from', line)
    const from = parseRef(args, 1, line)
    expectWord(args, from.next, 'to', line)
    const to = parseRef(args, from.next + 1, line)
    step.arrows.push({ from: from.ref, to: to.ref })
  },
  draw(line, args, _rest, builder) {
    const step = currentStep(builder, line)
    const kind = args[0]?.toLowerCase()
    if (!kind) throw new LessonParseError('draw needs a shape or field name', line.no)
    if (kind === 'line') {
      const start = parsePointTokens(args, 1, line)
      expectWord(args, start.next, 'to', line)
      const end = parsePointTokens(args, start.next + 1, line)
      step.drawings.push({
        kind: 'line',
        x1: start.point.x,
        y1: start.point.y,
        x2: end.point.x,
        y2: end.point.y,
      })
      return
    }
    if (kind === 'rect') {
      const x = parseNumber(args[1], line, 'x')
      const y = parseNumber(args[2], line, 'y')
      const w = parseNumber(args[3], line, 'w')
      const h = parseNumber(args[4], line, 'h')
      step.drawings.push({ kind: 'rect', x, y, w, h })
      return
    }
    if (kind === 'circle') {
      const x = parseNumber(args[1], line, 'x')
      const y = parseNumber(args[2], line, 'y')
      const rIndex = args[3]?.toLowerCase() === 'r' ? 4 : 3
      const r = parseNumber(args[rIndex], line, 'radius')
      step.drawings.push({ kind: 'circle', x, y, r })
      return
    }
    if (!NAMED_DRAWS.has(kind)) {
      throw new LessonParseError(`unknown draw "${kind}"`, line.no)
    }
    try {
      step.drawings.push(namedDrawing(kind, args[1]?.toLowerCase()))
    } catch (error) {
      throw new LessonParseError(error instanceof Error ? error.message : 'bad draw', line.no)
    }
  },
  label(line, args, rest, builder) {
    const step = currentStep(builder, line)
    const parsed = parseTag(args[0] ?? '', line.no)
    const text = rest.slice((args[0] ?? '').length).trim()
    if (!text) throw new LessonParseError('label needs text', line.no)
    step.labels.set(parsed.tag, text)
  },
  banner(line, _args, rest, builder) {
    if (!rest) throw new LessonParseError('banner needs text', line.no)
    currentStep(builder, line).banner = rest
  },
  duration(line, args, _rest, builder) {
    currentStep(builder, line).durationMs = parseNumber(args[0], line, 'duration')
  },
  hands(line, args, _rest, builder) {
    currentStep(builder, line).hands = parseTag(args[0] ?? '', line.no).tag
  },
  'no-hands'(line, args, _rest, builder) {
    currentStep(builder, line).noHands = parseTag(args[0] ?? '', line.no).tag
  },
}

export function handleMove(line: SourceLine, args: string[], builder: LessonBuilder) {
  const { cmd } = { cmd: tokenizeCmd(line.text) }
  if (!isTag(cmd) || args[0]?.toLowerCase() !== 'to') {
    throw new LessonParseError(`unknown command "${cmd}"`, line.no)
  }
  const parsed = parseTag(cmd, line.no)
  const { point } = parsePointTokens(args, 1, line)
  currentStep(builder, line).moves.set(parsed.tag, point)
}

function tokenizeCmd(text: string) {
  return text.split(/\s+/)[0] ?? ''
}
