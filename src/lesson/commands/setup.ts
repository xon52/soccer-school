import { LessonParseError } from '@/lesson/error'
import { parseTag } from '@/lesson/tag'
import { expectWord, parsePointTokens } from '@/lesson/commands/shared'
import type { CommandHandler } from '@/lesson/commands/types'

export const setupHandlers: Record<string, CommandHandler> = {
  lineup(line, args, _rest, builder) {
    if (args.join(' ').toLowerCase() !== '7v7') {
      throw new LessonParseError('only "lineup 7v7" is supported', line.no)
    }
    builder.lineup = '7v7'
  },
  player(line, args, _rest, builder) {
    const parsed = parseTag(args[0] ?? '', line.no)
    expectWord(args, 1, 'at', line)
    const { point } = parsePointTokens(args, 2, line)
    builder.setupPlayers.set(parsed.tag, point)
  },
  ball(line, args, _rest, builder) {
    const mode = args[0]?.toLowerCase()
    if (mode === 'with') {
      const parsed = parseTag(args[1] ?? '', line.no)
      builder.ball = { with: parsed.tag }
      return
    }
    if (mode === 'at' || mode === 'to') {
      const { point } = parsePointTokens(args, 1, line)
      builder.ball = { at: point }
      return
    }
    throw new LessonParseError('use "ball with TAG" or "ball at x, y"', line.no)
  },
}
