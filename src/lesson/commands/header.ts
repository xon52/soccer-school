import { LessonParseError } from '@/lesson/error'
import type { CommandHandler } from '@/lesson/commands/types'

function requireText(rest: string, line: { no: number }, what: string) {
  if (!rest) throw new LessonParseError(`${what} cannot be empty`, line.no)
  return rest
}

export const headerHandlers: Record<string, CommandHandler> = {
  group(line) {
    throw new LessonParseError('group comes from the folder name, not a command', line.no)
  },
  id(line) {
    throw new LessonParseError('id comes from the file name, not a command', line.no)
  },
  title(line, _args, rest, builder) {
    builder.title = requireText(rest, line, 'title')
  },
  intro(line, _args, rest, builder) {
    builder.intro = requireText(rest, line, 'intro')
  },
  flip(line, args, _rest, builder) {
    if (args[0]?.toLowerCase() !== 'vertical') {
      throw new LessonParseError('use "flip vertical"', line.no)
    }
    builder.flipVertical = true
  },
  hide(line, args, _rest, builder) {
    const what = args[0]?.toLowerCase()
    if (what === 'names') builder.hideNames = true
    else if (what === 'ball') builder.hideBall = true
    else throw new LessonParseError('use "hide names" or "hide ball"', line.no)
  },
}
