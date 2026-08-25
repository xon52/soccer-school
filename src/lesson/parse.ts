import { headerHandlers } from '@/lesson/commands/header'
import { handleQuestionBlock } from '@/lesson/commands/question'
import { setupHandlers } from '@/lesson/commands/setup'
import { handleMove, stepHandlers } from '@/lesson/commands/step'
import { firstWord, tokenize } from '@/lesson/commands/shared'
import { emptyBuilder, emptyStep, type LessonBuilder, type SourceLine } from '@/lesson/commands/types'
import { LessonParseError } from '@/lesson/error'
import { isTag } from '@/lesson/tag'

const BLOCK = /^(setup|step|question)\b/i

function sourceLines(source: string): SourceLine[] {
  return source.split(/\r?\n/).map((raw, index) => {
    const withoutComment = raw.includes('#') ? raw.slice(0, raw.indexOf('#')) : raw
    return { no: index + 1, text: withoutComment.trim() }
  })
}

function dispatch(
  handlers: Record<string, (line: SourceLine, args: string[], rest: string, builder: LessonBuilder) => void>,
  line: SourceLine,
  builder: LessonBuilder,
  fallback?: (line: SourceLine, args: string[], builder: LessonBuilder) => void,
) {
  const { cmd, rest } = firstWord(line.text)
  const key = cmd.toLowerCase()
  const handler = handlers[key]
  if (handler) {
    handler(line, tokenize(rest), rest, builder)
    return
  }
  if (fallback) {
    fallback(line, tokenize(rest), builder)
    return
  }
  throw new LessonParseError(`unknown command "${cmd}"`, line.no)
}

export function parseLesson(source: string): LessonBuilder {
  const builder = emptyBuilder()
  const lines = sourceLines(source)
  let mode: 'header' | 'setup' | 'step' | 'question' = 'header'
  let questionLines: SourceLine[] = []

  function flushQuestion() {
    if (mode === 'question') {
      handleQuestionBlock(questionLines, builder)
      questionLines = []
    }
  }

  for (const line of lines) {
    if (!line.text) continue
    const block = BLOCK.exec(line.text)
    if (block) {
      flushQuestion()
      const type = block[1]?.toLowerCase()
      if (!type) continue
      if (type === 'setup') {
        if (builder.setupSeen) {
          throw new LessonParseError('only one setup block is allowed', line.no)
        }
        builder.setupSeen = true
        mode = 'setup'
      } else if (type === 'step') {
        if (builder.questions.length > 0) {
          throw new LessonParseError(
            'every step must come before the questions; the lesson ends on the last answer',
            line.no,
          )
        }
        mode = 'step'
        builder.steps.push(emptyStep())
      } else {
        mode = 'question'
        questionLines = []
      }
      continue
    }

    if (mode === 'header') {
      dispatch(headerHandlers, line, builder)
    } else if (mode === 'setup') {
      dispatch(setupHandlers, line, builder)
    } else if (mode === 'step') {
      dispatch(stepHandlers, line, builder, (stepLine, args, current) => {
        if (isTag(firstWord(stepLine.text).cmd)) handleMove(stepLine, args, current)
        else throw new LessonParseError(`unknown command "${firstWord(stepLine.text).cmd}"`, stepLine.no)
      })
    } else {
      questionLines.push(line)
    }
  }

  flushQuestion()

  if (!builder.title) throw new LessonParseError('missing title', 1)
  if (!builder.intro) throw new LessonParseError('missing intro', 1)
  if (builder.questions.length === 0) throw new LessonParseError('missing question', 1)
  if ((builder.questions[0]?.at ?? 0) < 1) {
    throw new LessonParseError('question needs at least one step before it', 1)
  }

  return builder
}
