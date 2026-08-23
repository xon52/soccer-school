export class LessonParseError extends Error {
  constructor(message: string, readonly line: number) {
    super(`Line ${line}: ${message}`)
    this.name = 'LessonParseError'
  }
}
