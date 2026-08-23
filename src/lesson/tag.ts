import { LessonParseError } from '@/lesson/error'
import type { Team } from '@/types'

const TAG = /^([BR])-([A-Z]{1,3})$/i

export interface ParsedTag {
  tag: string
  team: Team
  role: string
  keeper: boolean
}

export function isTag(value: string) {
  return TAG.test(value)
}

export function parseTag(value: string, line = 0): ParsedTag {
  const match = TAG.exec(value)
  if (!match) {
    throw new LessonParseError(`expected a tag like B-LF or R-G, got "${value}"`, line)
  }
  const color = match[1]
  const role = match[2]
  if (!color || !role) {
    throw new LessonParseError(`expected a tag like B-LF or R-G, got "${value}"`, line)
  }
  return {
    tag: `${color.toUpperCase()}-${role.toUpperCase()}`,
    team: color.toUpperCase() === 'B' ? 'blue' : 'red',
    role: role.toUpperCase(),
    keeper: role.toUpperCase() === 'G',
  }
}
