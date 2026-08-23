import { LessonParseError } from '@/lesson/error'
import { firstWord } from '@/lesson/commands/shared'
import type { LessonBuilder, SourceLine } from '@/lesson/commands/types'

export function handleQuestionBlock(lines: SourceLine[], builder: LessonBuilder) {
  let prompt = ''
  let answer = ''
  const wrongs: string[] = []
  let correct = ''
  let why = ''

  for (const line of lines) {
    const { cmd, rest } = firstWord(line.text)
    const key = cmd.toLowerCase()
    if (key === 'prompt') prompt = rest
    else if (key === 'answer') answer = rest
    else if (key === 'wrong') wrongs.push(rest)
    else if (key === 'correct') correct = rest
    else if (key === 'why') why = rest
    else throw new LessonParseError(`unknown question field "${cmd}"`, line.no)
  }

  const where = lines[0]?.no ?? 1
  if (!prompt) throw new LessonParseError('question needs a prompt', where)
  if (!answer) throw new LessonParseError('question needs an answer', where)
  if (wrongs.length !== 3) {
    throw new LessonParseError('question needs exactly three wrong answers', where)
  }
  if (!correct) throw new LessonParseError('question needs a correct line', where)
  if (!why) throw new LessonParseError('question needs a why', where)

  builder.questions.push({
    at: builder.steps.length,
    question: {
      prompt,
      choices: [answer, wrongs[0]!, wrongs[1]!, wrongs[2]!],
      correctIndex: 0,
      correct,
      why,
    },
  })
}
