import { loadLessons } from '@/lesson/load'
import type { Course, CourseId } from '@/types'

const fileLessons = loadLessons()

function lessonsFor(id: CourseId) {
  return fileLessons.filter((item) => item.course === id).map((item) => item.lesson)
}

export const courses: Course[] = [
  {
    id: 'names',
    title: 'Name the field',
    blurb: 'A line or box lights up. Pick what it is called.',
    lessons: lessonsFor('names'),
  },
  {
    id: 'ball-out',
    title: 'Ball out',
    blurb: 'Watch where the ball goes. Who gets it, and how does play start again?',
    lessons: lessonsFor('ball-out'),
  },
  {
    id: 'goalie-hands',
    title: 'Goalie hands',
    blurb: 'When can the goalie pick the ball up — and what should they do next?',
    lessons: lessonsFor('goalie-hands'),
  },
  {
    id: 'fouls',
    title: 'Fouls and penalties',
    blurb: 'Pushes, trips, and handballs. Is it a foul, and what happens next?',
    lessons: lessonsFor('fouls'),
  },
  {
    id: 'offside',
    title: 'Offside',
    blurb: 'Where can you stand when your team passes the ball forward?',
    lessons: lessonsFor('offside'),
  },
  {
    id: 'defender-tips',
    title: 'Defender tips',
    blurb: 'You are at the back. Watch the play and pick the best move.',
    lessons: lessonsFor('defender-tips'),
  },
]

export function getCourse(id: string) {
  return courses.find((course) => course.id === id)
}

export function isCourseId(id: string): id is CourseId {
  return courses.some((course) => course.id === id)
}
