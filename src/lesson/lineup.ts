import { LENGTH_M } from '@/field'
import { parseTag } from '@/lesson/tag'
import type { Player } from '@/types'

const BLUE: Array<[string, number, number]> = [
  ['B-G', 6, 34],
  ['B-LB', 24, 12],
  ['B-CB', 22, 34],
  ['B-RB', 24, 56],
  ['B-CM', 42, 34],
  ['B-LF', 58, 22],
  ['B-RF', 58, 46],
]

const MIRROR_ROLE: Record<string, string> = {
  G: 'G',
  CB: 'CB',
  CM: 'CM',
  LB: 'RB',
  RB: 'LB',
  LF: 'RF',
  RF: 'LF',
}

function makePlayer(tag: string, x: number, y: number): Player {
  const parsed = parseTag(tag)
  return {
    id: parsed.tag,
    team: parsed.team,
    x,
    y,
    role: parsed.keeper ? 'goalkeeper' : 'outfield',
    label: parsed.keeper ? 'G' : undefined,
  }
}

export function lineup7v7(): Player[] {
  const blue = BLUE.map(([tag, x, y]) => makePlayer(tag, x, y))
  const red = BLUE.map(([tag, x, y]) => {
    const parsed = parseTag(tag)
    const redRole = MIRROR_ROLE[parsed.role] ?? parsed.role
    return makePlayer(`R-${redRole}`, LENGTH_M - x, y)
  })
  return [...blue, ...red]
}

export const MIN_PLAYER_GAP_M = 6
/** Opposite-team contact can be closer; warn only when tokens overlap. */
export const MIN_OVERLAP_M = 1.5
