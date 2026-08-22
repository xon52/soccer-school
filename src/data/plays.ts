import { flipVertical } from '@/field'
import type { Keyframe, Play, Player } from '@/types'

function lineup(patches: Record<string, Partial<Player> | undefined> = {}): Player[] {
  const base: Player[] = [
    { id: 'bgk', team: 'blue', role: 'goalkeeper', x: 7, y: 50, label: 'GK' },
    { id: 'b1', team: 'blue', x: 22, y: 28 },
    { id: 'b2', team: 'blue', x: 22, y: 72 },
    { id: 'b3', team: 'blue', x: 38, y: 50 },
    { id: 'b4', team: 'blue', x: 55, y: 40 },
    { id: 'rgk', team: 'red', role: 'goalkeeper', x: 93, y: 50, label: 'GK' },
    { id: 'r1', team: 'red', x: 78, y: 28 },
    { id: 'r2', team: 'red', x: 78, y: 72 },
    { id: 'r3', team: 'red', x: 62, y: 58 },
    { id: 'r4', team: 'red', x: 48, y: 46 },
  ]

  return base.map((player) => {
    const patch = patches[player.id]
    return patch ? { ...player, ...patch } : player
  })
}

function holder(id: string, patch: Partial<Player> = {}) {
  const players = lineup({ [id]: { hasBall: true, ...patch } })
  const person = players.find((player) => player.id === id)
  return {
    players,
    ball: { x: person?.x ?? 50, y: person?.y ?? 50 },
  }
}

function flipFrames(frames: Keyframe[]): Keyframe[] {
  return frames.map((frame) => ({
    ...frame,
    ball: flipVertical(frame.ball),
    players: frame.players?.map((player) => ({ ...player, ...flipVertical(player) })),
  }))
}

export function defaultPlayers() {
  return lineup()
}

export function flipPlayVertical(play: Play): Play {
  return {
    ...play,
    frames: flipFrames(play.frames),
    outcome: play.outcome ? flipFrames(play.outcome) : undefined,
  }
}

export function throwInPlay(): Play {
  return {
    label: 'Over the sideline',
    intro: 'Blue has the ball near the side. Press Watch to see the kick.',
    frames: [
      {
        caption: 'Blue has the ball near the sideline.',
        ...holder('b4', { x: 54, y: 76 }),
      },
      {
        caption: 'Blue kicks it — all the way over the sideline!',
        ball: { x: 68, y: 108 },
        highlight: 'sideline',
        kick: true,
        durationMs: 1450,
        players: lineup({ b4: { x: 54, y: 76, hasBall: true } }),
      },
    ],
    outcome: [
      {
        caption: 'Red is ready to throw it back in.',
        highlight: 'sideline',
        ...holder('r2', { x: 68, y: 98, label: 'Throw' }),
      },
      {
        caption: 'Red throws it back onto the field.',
        ball: { x: 62, y: 82 },
        highlight: 'sideline',
        restartLabel: 'Throw-in',
        kick: true,
        durationMs: 1100,
        players: lineup({ r2: { x: 68, y: 98, hasBall: true, label: 'Throw' } }),
      },
    ],
  }
}

export function redThrowInPlay(): Play {
  return {
    label: 'They kick it over the sideline',
    intro: 'Red has the ball near the side. Press Watch to see the kick.',
    frames: [
      {
        caption: 'Red has the ball near the sideline.',
        ...holder('r4', { x: 48, y: 78 }),
      },
      {
        caption: 'Red kicks it — all the way over the sideline!',
        ball: { x: 42, y: 108 },
        highlight: 'sideline',
        kick: true,
        durationMs: 1450,
        players: lineup({ r4: { x: 48, y: 78, hasBall: true } }),
      },
    ],
    outcome: [
      {
        caption: 'Blue is ready to throw it back in.',
        highlight: 'sideline',
        ...holder('b2', { x: 42, y: 98, label: 'Throw' }),
      },
      {
        caption: 'Blue throws it back onto the field.',
        ball: { x: 48, y: 82 },
        highlight: 'sideline',
        restartLabel: 'Throw-in',
        kick: true,
        durationMs: 1100,
        players: lineup({ b2: { x: 42, y: 98, hasBall: true, label: 'Throw' } }),
      },
    ],
  }
}

export function goalKickPlay(): Play {
  return {
    label: 'They kicked it over your goal line',
    intro: 'Red has the ball in front of your goal. Press Watch to see the shot.',
    frames: [
      {
        caption: 'Red has the ball and is attacking your goal.',
        ...holder('r4', { x: 34, y: 44 }),
      },
      {
        caption: 'Red shoots — it misses the net and goes over your goal line.',
        ball: { x: -5, y: 16 },
        highlight: 'goalLine',
        kick: true,
        durationMs: 1450,
        players: lineup({ r4: { x: 34, y: 44, hasBall: true } }),
      },
    ],
    outcome: [
      {
        caption: 'You get a goal kick from the box by your goal.',
        highlight: 'goalArea',
        restartLabel: 'Goal kick',
        ...holder('bgk', { x: 8, y: 50 }),
      },
    ],
  }
}

export function cornerPlay(): Play {
  return {
    label: 'You kicked it over your own goal line',
    intro: 'Blue has the ball near your goal. Press Watch to see the clearance.',
    frames: [
      {
        caption: 'Blue has the ball near your goal.',
        ...holder('b2', { x: 16, y: 70 }),
      },
      {
        caption: 'Blue kicks it away — but it goes over their own goal line.',
        ball: { x: -5, y: 94 },
        highlight: 'goalLine',
        kick: true,
        durationMs: 1450,
        players: lineup({ b2: { x: 16, y: 70, hasBall: true } }),
      },
    ],
    outcome: [
      {
        caption: 'Red takes a corner kick from the corner of the field.',
        highlight: 'goalLine',
        restartLabel: 'Corner kick',
        ...holder('r2', { x: 2, y: 98, label: 'Corner' }),
      },
    ],
  }
}

export function blueCornerPlay(): Play {
  return {
    label: 'They kicked it over their own goal line',
    intro: 'Red has the ball near their goal. Press Watch to see the clearance.',
    frames: [
      {
        caption: 'Red has the ball near their own goal.',
        ...holder('r1', { x: 84, y: 28 }),
      },
      {
        caption: 'Red kicks it away — but it goes over their own goal line.',
        ball: { x: 105, y: 6 },
        highlight: 'goalLine',
        kick: true,
        durationMs: 1450,
        players: lineup({ r1: { x: 84, y: 28, hasBall: true } }),
      },
    ],
    outcome: [
      {
        caption: 'You get a corner kick from the corner of their end.',
        highlight: 'goalLine',
        restartLabel: 'Corner kick',
        ...holder('b1', { x: 98, y: 2, label: 'Corner' }),
      },
    ],
  }
}

export function kickOffAfterGoalPlay(): Play {
  return {
    label: 'After a goal',
    intro: 'Red has the ball in front of your goal. Press Watch to see the shot.',
    frames: [
      {
        caption: 'Red has the ball and shoots…',
        ...holder('r4', { x: 26, y: 50 }),
      },
      {
        caption: 'It’s in! Red scored a goal.',
        ball: { x: -3, y: 50 },
        highlight: 'goalLine',
        kick: true,
        durationMs: 1450,
        players: lineup({ r4: { x: 26, y: 50, hasBall: true } }),
      },
    ],
    outcome: [
      {
        caption: 'You got scored on, so YOU kick off from the center.',
        highlight: 'centerCircle',
        restartLabel: 'Kick-off',
        ...holder('b4', { x: 50, y: 50, label: 'Kick-off' }),
        players: lineup({
          b4: { x: 50, y: 50, hasBall: true, label: 'Kick-off' },
          r4: { x: 58, y: 50 },
        }),
      },
    ],
  }
}

export function handsOkPlay(): Play {
  return {
    label: 'Hands inside the box',
    intro: 'Red has the ball inside the box. Press Watch to see the shot.',
    frames: [
      {
        caption: 'Red has the ball inside the penalty area.',
        highlight: 'penaltyArea',
        ...holder('r4', { x: 26, y: 48 }),
      },
      {
        caption: 'Red shoots — and the goalie catches it with their hands!',
        ball: { x: 9, y: 50 },
        highlight: 'penaltyArea',
        restartLabel: 'Catch',
        kick: true,
        durationMs: 1300,
        players: lineup({
          r4: { x: 26, y: 48 },
          bgk: { x: 9, y: 50, hasBall: true, usingHands: true, label: 'Catch' },
        }),
      },
    ],
    outcome: [
      {
        caption: 'The goalie has the ball in their hands.',
        highlight: 'penaltyArea',
        ...holder('bgk', { x: 9, y: 50, usingHands: true, label: 'Throw' }),
      },
      {
        caption: 'They throw it out to a teammate. Play goes on!',
        ball: { x: 28, y: 34 },
        highlight: 'penaltyArea',
        restartLabel: 'Throw out',
        kick: true,
        durationMs: 1200,
        players: lineup({
          bgk: { x: 9, y: 50, usingHands: true, label: 'Throw' },
          b1: { x: 28, y: 34, hasBall: true },
        }),
      },
    ],
  }
}

export function handsOutsidePlay(): Play {
  return {
    label: 'Hands outside the box',
    intro: 'The ball is loose outside the box. Press Watch.',
    frames: [
      {
        caption: 'The ball is outside the penalty area.',
        ball: { x: 32, y: 32 },
        highlight: 'penaltyArea',
        players: lineup(),
      },
      {
        caption: 'Your goalie runs out of the box to get it.',
        ball: { x: 32, y: 32 },
        highlight: 'penaltyArea',
        durationMs: 1200,
        players: lineup({ bgk: { x: 32, y: 32, label: 'GK' } }),
      },
    ],
    outcome: [
      {
        caption: 'The goalie has to use their feet.',
        highlight: 'penaltyArea',
        forbidHands: true,
        ...holder('bgk', { x: 32, y: 32, label: 'Kick' }),
      },
      {
        caption: 'They kick it away — no hands.',
        ball: { x: 42, y: 40 },
        highlight: 'penaltyArea',
        restartLabel: 'No hands',
        forbidHands: true,
        kick: true,
        durationMs: 1200,
        players: lineup({ bgk: { x: 32, y: 32, hasBall: true, label: 'Kick' } }),
      },
    ],
  }
}

export function backPassPlay(): Play {
  return {
    label: 'A pass back to the goalie',
    intro: 'A teammate has the ball. Press Watch to see the pass back.',
    frames: [
      {
        caption: 'A Blue teammate has the ball.',
        highlight: 'penaltyArea',
        ...holder('b3', { x: 32, y: 50 }),
      },
      {
        caption: 'They kick it back to the goalie.',
        ball: { x: 9, y: 50 },
        highlight: 'penaltyArea',
        kick: true,
        durationMs: 1300,
        players: lineup({ b3: { x: 32, y: 50, hasBall: true } }),
      },
    ],
    outcome: [
      {
        caption: 'The goalie cannot pick this one up.',
        highlight: 'penaltyArea',
        forbidHands: true,
        ...holder('bgk', { x: 9, y: 50, label: 'Kick' }),
        players: lineup({
          bgk: { x: 9, y: 50, hasBall: true, label: 'Kick' },
          b3: { x: 26, y: 50 },
        }),
      },
      {
        caption: 'They kick it away with their feet.',
        ball: { x: 24, y: 40 },
        highlight: 'penaltyArea',
        restartLabel: 'No pickup',
        forbidHands: true,
        kick: true,
        durationMs: 1200,
        players: lineup({
          bgk: { x: 9, y: 50, hasBall: true, label: 'Kick' },
          b3: { x: 26, y: 50 },
        }),
      },
    ],
  }
}

export function throwInToGoaliePlay(): Play {
  return {
    label: 'A throw-in back to the goalie',
    intro: 'A teammate is on the sideline. Press Watch to see the throw.',
    frames: [
      {
        caption: 'A Blue teammate is about to throw the ball in.',
        highlight: 'penaltyArea',
        ...holder('b2', { x: 22, y: 98, label: 'Throw' }),
      },
      {
        caption: 'They throw it to the goalie.',
        ball: { x: 9, y: 50 },
        highlight: 'penaltyArea',
        kick: true,
        durationMs: 1300,
        players: lineup({ b2: { x: 22, y: 98, hasBall: true, label: 'Throw' } }),
      },
    ],
    outcome: [
      {
        caption: 'The goalie can pick this one up — it was a throw, not a kick.',
        highlight: 'penaltyArea',
        restartLabel: 'Catch',
        ...holder('bgk', { x: 9, y: 50, usingHands: true, label: 'Catch' }),
      },
    ],
  }
}
