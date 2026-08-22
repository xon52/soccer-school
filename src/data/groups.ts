import {
  centerCircleNamePlay,
  goalAreaNamePlay,
  goalLineNamePlay,
  halfwayLineNamePlay,
  penaltyAreaNamePlay,
  penaltySpotNamePlay,
  sidelineNamePlay,
} from '@/data/pitch'
import {
  backPassPlay,
  blueCornerPlay,
  cornerPlay,
  goalKickPlay,
  handsOkPlay,
  handsOutsidePlay,
  kickOffAfterGoalPlay,
  redThrowInPlay,
  throwInPlay,
  throwInToGoaliePlay,
} from '@/data/plays'
import type { Group, GroupId, Question, Scenario } from '@/types'

function whoGetsBall(who: 'Blue' | 'Red', why: string): Question {
  return {
    prompt: 'Who gets the ball?',
    choices: ['Blue', 'Red', 'Nobody', 'Play on'],
    correctIndex: who === 'Blue' ? 0 : 1,
    why,
  }
}

function whatRestart(
  restart: 'Throw-in' | 'Goal kick' | 'Corner' | 'Kick-off',
  why: string,
): Question {
  const choices: Question['choices'] = ['Throw-in', 'Goal kick', 'Corner', 'Kick-off']
  const correctIndex = { 'Throw-in': 0, 'Goal kick': 1, Corner: 2, 'Kick-off': 3 }[restart]
  return {
    prompt: 'What restart is it?',
    choices,
    correctIndex,
    why,
  }
}

function nameQuestion(correct: string, decoys: [string, string, string], why: string): Question {
  return {
    prompt: 'What is that called?',
    choices: [correct, decoys[0], decoys[1], decoys[2]],
    correctIndex: 0,
    why,
  }
}

function canThey(prompt: string, yes: boolean, why: string): Question {
  return {
    prompt,
    choices: ['Yes', 'No', 'Only outside the box', 'Only after a goal'],
    correctIndex: yes ? 0 : 1,
    why,
  }
}

const names: Scenario[] = [
  {
    id: 'name-sideline',
    canFlipVertical: true,
    play: sidelineNamePlay(),
    questions: [
      nameQuestion(
        'Sideline',
        ['Goal line', 'Halfway line', 'Penalty area'],
        'The long lines on the sides are the sidelines. If the ball goes over one, it is a throw-in.',
      ),
    ],
  },
  {
    id: 'name-goal-line',
    play: goalLineNamePlay(),
    questions: [
      nameQuestion(
        'Goal line',
        ['Sideline', 'Halfway line', 'Center circle'],
        'The lines at each end are the goal lines. A goal only counts if the ball goes over this line into the net.',
      ),
    ],
  },
  {
    id: 'name-penalty-area',
    play: penaltyAreaNamePlay(),
    questions: [
      nameQuestion(
        'Penalty area',
        ['Goal area', 'Center circle', 'Halfway line'],
        'The big box is the penalty area. This is where the goalie may use their hands.',
      ),
    ],
  },
  {
    id: 'name-goal-area',
    play: goalAreaNamePlay(),
    questions: [
      nameQuestion(
        'Goal area',
        ['Penalty area', 'Center circle', 'Sideline'],
        'The small box is the goal area. Goal kicks are taken from here.',
      ),
    ],
  },
  {
    id: 'name-center-circle',
    play: centerCircleNamePlay(),
    questions: [
      nameQuestion(
        'Center circle',
        ['Penalty area', 'Goal area', 'Halfway line'],
        'Kick-offs happen at the center spot, and the other team stays outside this circle until the ball is kicked.',
      ),
    ],
  },
  {
    id: 'name-halfway',
    play: halfwayLineNamePlay(),
    questions: [
      nameQuestion(
        'Halfway line',
        ['Goal line', 'Sideline', 'Penalty area'],
        'The halfway line splits the field into two halves. At kick-off, each team starts in their own half.',
      ),
    ],
  },
  {
    id: 'name-penalty-spot',
    play: penaltySpotNamePlay(),
    questions: [
      nameQuestion(
        'Penalty spot',
        ['Center circle', 'Goal area', 'Halfway line'],
        'If the defending team fouls in their own penalty area, the other team may get a penalty kick from this spot.',
      ),
    ],
  },
]

const ballOut: Scenario[] = [
  {
    id: 'throw-in-blue-out',
    canFlipVertical: true,
    play: throwInPlay(),
    questions: [
      whoGetsBall('Red', 'Blue touched it last over the sideline, so Red gets the ball.'),
      whatRestart('Throw-in', 'Over the sideline, the other team throws it back in.'),
    ],
  },
  {
    id: 'throw-in-red-out',
    canFlipVertical: true,
    play: redThrowInPlay(),
    questions: [
      whoGetsBall('Blue', 'Red touched it last over the sideline, so Blue gets the ball.'),
      whatRestart('Throw-in', 'Over the sideline, the other team throws it back in.'),
    ],
  },
  {
    id: 'goal-kick',
    canFlipVertical: true,
    play: goalKickPlay(),
    questions: [
      whoGetsBall('Blue', 'Red last touched it over your goal line, so you get the ball.'),
      whatRestart('Goal kick', 'They last touched it over your goal line, so you restart with a goal kick.'),
    ],
  },
  {
    id: 'corner-blue-out',
    canFlipVertical: true,
    play: cornerPlay(),
    questions: [
      whoGetsBall('Red', 'You last touched it over your own goal line, so Red gets the ball.'),
      whatRestart('Corner', 'If you last touch it over your own goal line, they get a corner kick.'),
    ],
  },
  {
    id: 'corner-red-out',
    canFlipVertical: true,
    play: blueCornerPlay(),
    questions: [
      whoGetsBall('Blue', 'Red last touched it over their own goal line, so you get the ball.'),
      whatRestart('Corner', 'If they last touch it over their own goal line, you get a corner kick.'),
    ],
  },
  {
    id: 'kick-off',
    play: kickOffAfterGoalPlay(),
    questions: [
      whoGetsBall('Blue', 'After a goal, the team that got scored on gets the ball.'),
      whatRestart('Kick-off', 'Play starts again with a kick-off from the center circle.'),
    ],
  },
]

const goalie: Scenario[] = [
  {
    id: 'hands-ok',
    play: handsOkPlay(),
    questions: [
      canThey(
        'Can the goalie use their hands here?',
        true,
        'Yes. The goalie is inside their own penalty area, so they may catch the ball.',
      ),
      {
        prompt: 'After the catch, what can they do?',
        choices: ['Throw or kick it out', 'Run holding the ball', 'Give it to Red', 'Take a corner'],
        correctIndex: 0,
        why: 'After a catch, the goalie can throw it or drop it and kick it. They cannot run the whole field holding it.',
      },
    ],
  },
  {
    id: 'hands-out',
    play: handsOutsidePlay(),
    questions: [
      canThey(
        'Can they pick it up here?',
        false,
        'No. Outside the penalty area, the goalie cannot use their hands.',
      ),
      {
        prompt: 'What should they do?',
        choices: ['Use their feet', 'Pick it up', 'Corner kick', 'Goal kick'],
        correctIndex: 0,
        why: 'Outside the box they must use their feet, like anyone else.',
      },
    ],
  },
  {
    id: 'back-pass',
    play: backPassPlay(),
    questions: [
      canThey(
        'Can they pick up a kick from a teammate?',
        false,
        'No. A goalie cannot pick up a kick from a teammate.',
      ),
      {
        prompt: 'What should they do?',
        choices: ['Use their feet', 'Pick it up', 'Throw-in', 'Corner kick'],
        correctIndex: 0,
        why: 'They have to play it with their feet.',
      },
    ],
  },
  {
    id: 'throw-in-to-gk',
    play: throwInToGoaliePlay(),
    questions: [
      canThey(
        'Can they pick up a throw from a teammate?',
        true,
        'Yes. A throw-in is not a kick, so the goalie may catch it.',
      ),
      {
        prompt: 'What can they do?',
        choices: ['Catch it, then throw or kick', 'Must use their feet', 'Corner kick', 'Play on, no touch'],
        correctIndex: 0,
        why: 'They can catch a throw-in, then throw or kick it out to a teammate.',
      },
    ],
  },
]

export const groups: Group[] = [
  {
    id: 'names',
    title: 'Name the field',
    blurb: 'A line or box lights up. Pick what it is called.',
    scenarios: names,
  },
  {
    id: 'ball-out',
    title: 'Ball out',
    blurb: 'Watch where the ball goes. Who gets it, and how does play start again?',
    scenarios: ballOut,
  },
  {
    id: 'goalie',
    title: 'Goalie hands',
    blurb: 'When can the goalie pick the ball up — and what should they do next?',
    scenarios: goalie,
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
