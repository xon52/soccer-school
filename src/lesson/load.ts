import { GROUP_IDS, type GroupId, type Scenario } from '@/types'
import { compileLesson } from '@/lesson/compile'
import { parseLesson } from '@/lesson/parse'

const files = import.meta.glob<string>('../lessons/**/*.lesson', {
  query: '?raw',
  eager: true,
  import: 'default',
})

function isGroupId(value: string): value is GroupId {
  return (GROUP_IDS as readonly string[]).includes(value)
}

function lessonPathParts(path: string) {
  const normalized = path.replaceAll('\\', '/')
  const match = /(?:^|\/)lessons\/([^/]+)\/([^/]+)\.lesson$/.exec(normalized)
  if (!match?.[1] || !match[2]) {
    throw new Error(
      `${path}: lessons must live in src/lessons/<group>/<name>.lesson (folder is the group, file name is the id)`,
    )
  }
  return { group: match[1], id: match[2] }
}

export interface LoadedLesson {
  group: GroupId
  scenario: Scenario
  source: string
}

export function loadLessons(): LoadedLesson[] {
  return Object.entries(files).map(([path, source]) => {
    const { group, id } = lessonPathParts(path)
    if (!isGroupId(group)) {
      throw new Error(`${path}: unknown group folder "${group}"`)
    }
    const builder = parseLesson(source)
    builder.group = group
    builder.id = id
    return {
      group,
      scenario: compileLesson(builder),
      source: path,
    }
  })
}
