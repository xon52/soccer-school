import { COURSE_IDS, type CourseId, type Lesson } from '@/types'
import { compileLesson } from '@/lesson/compile'
import { parseLesson } from '@/lesson/parse'

const files = import.meta.glob<string>('../lessons/**/*.lesson', {
  query: '?raw',
  eager: true,
  import: 'default',
})

function isCourseId(value: string): value is CourseId {
  return (COURSE_IDS as readonly string[]).includes(value)
}

function lessonPathParts(path: string) {
  const normalized = path.replaceAll('\\', '/')
  const match = /(?:^|\/)lessons\/([^/]+)\/([^/]+)\.lesson$/.exec(normalized)
  if (!match?.[1] || !match[2]) {
    throw new Error(
      `${path}: lessons must live in src/lessons/<course>/<name>.lesson (folder is the course, file name is the id)`,
    )
  }
  return { course: match[1], id: match[2] }
}

export interface LoadedLesson {
  course: CourseId
  lesson: Lesson
  source: string
}

export function loadLessons(): LoadedLesson[] {
  return Object.entries(files).map(([path, source]) => {
    const { course, id } = lessonPathParts(path)
    if (!isCourseId(course)) {
      throw new Error(`${path}: unknown course folder "${course}"`)
    }
    const builder = parseLesson(source)
    builder.course = course
    builder.id = id
    return {
      course,
      lesson: compileLesson(builder),
      source: path,
    }
  })
}
