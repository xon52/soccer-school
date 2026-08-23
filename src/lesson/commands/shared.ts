import { LessonParseError } from '@/lesson/error'
import { isTag, parseTag } from '@/lesson/tag'
import type { PointRef, SourceLine } from '@/lesson/commands/types'

export function firstWord(text: string): { cmd: string; rest: string } {
  const match = /^(\S+)\s*(.*)$/.exec(text)
  return { cmd: match?.[1] ?? '', rest: match?.[2] ?? '' }
}

export function tokenize(text: string) {
  return text.split(/[\s,]+/).filter(Boolean)
}

export function parseNumber(token: string | undefined, line: SourceLine, label: string) {
  const value = Number(token)
  if (token === undefined || Number.isNaN(value)) {
    throw new LessonParseError(`expected ${label} to be a number`, line.no)
  }
  return value
}

export function parsePointTokens(tokens: string[], start: number, line: SourceLine) {
  const x = parseNumber(tokens[start], line, 'x')
  const y = parseNumber(tokens[start + 1], line, 'y')
  return { point: { x, y }, next: start + 2 }
}

export function parseRef(tokens: string[], start: number, line: SourceLine): { ref: PointRef; next: number } {
  const token = tokens[start]
  if (!token) throw new LessonParseError('expected a tag, ball, or x, y', line.no)
  if (token.toLowerCase() === 'ball') return { ref: { type: 'ball' }, next: start + 1 }
  if (isTag(token)) return { ref: { type: 'tag', tag: parseTag(token, line.no).tag }, next: start + 1 }
  const parsed = parsePointTokens(tokens, start, line)
  return { ref: { type: 'point', ...parsed.point }, next: parsed.next }
}

export function expectWord(tokens: string[], index: number, word: string, line: SourceLine) {
  if (tokens[index]?.toLowerCase() !== word) {
    throw new LessonParseError(`expected "${word}"`, line.no)
  }
}
