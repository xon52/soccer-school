import { loadLessons } from '@/lesson/load'
import type { Group, GroupId } from '@/types'

const fileLessons = loadLessons()

function scenariosFor(id: GroupId) {
  return fileLessons.filter((lesson) => lesson.group === id).map((lesson) => lesson.scenario)
}

export const groups: Group[] = [
  {
    id: 'names',
    title: 'Name the field',
    blurb: 'A line or box lights up. Pick what it is called.',
    scenarios: scenariosFor('names'),
  },
  {
    id: 'ball-out',
    title: 'Ball out',
    blurb: 'Watch where the ball goes. Who gets it, and how does play start again?',
    scenarios: scenariosFor('ball-out'),
  },
  {
    id: 'goalie-hands',
    title: 'Goalie hands',
    blurb: 'When can the goalie pick the ball up — and what should they do next?',
    scenarios: scenariosFor('goalie-hands'),
  },
  {
    id: 'fouls',
    title: 'Fouls',
    blurb: 'Pushes, trips, and handballs. Coming soon.',
    comingSoon: true,
    scenarios: [],
  },
]

export function getGroup(id: string) {
  return groups.find((group) => group.id === id)
}

export function isGroupId(id: string): id is GroupId {
  return groups.some((group) => group.id === id)
}
