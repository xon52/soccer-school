import type { Highlight, Play, Point } from '@/types'

function namePlay(options: {
  label: string
  highlight: Highlight
  ball: Point
  caption: string
}): Play {
  return {
    label: options.label,
    intro: 'Press Watch. A part of the field will glow. Then pick its name.',
    hideNames: true,
    hideBall: true,
    frames: [
      {
        caption: 'Look at the field…',
        ball: options.ball,
        players: [],
      },
      {
        caption: options.caption,
        ball: options.ball,
        highlight: options.highlight,
        players: [],
        durationMs: 400,
      },
    ],
  }
}

export function sidelineNamePlay(): Play {
  return namePlay({
    label: 'The long side line',
    highlight: 'sideline',
    ball: { x: 50, y: 98 },
    caption: 'This long line along the side is glowing.',
  })
}

export function goalLineNamePlay(): Play {
  return namePlay({
    label: 'The line by the goal',
    highlight: 'goalLine',
    ball: { x: 2, y: 50 },
    caption: 'This line at the end of the field, by the goal, is glowing.',
  })
}

export function penaltyAreaNamePlay(): Play {
  return namePlay({
    label: 'The big box',
    highlight: 'penaltyArea',
    ball: { x: 10, y: 50 },
    caption: 'This big box in front of the goal is glowing.',
  })
}

export function goalAreaNamePlay(): Play {
  return namePlay({
    label: 'The small box',
    highlight: 'goalArea',
    ball: { x: 4, y: 50 },
    caption: 'This smaller box right in front of the goal is glowing.',
  })
}

export function centerCircleNamePlay(): Play {
  return namePlay({
    label: 'The circle in the middle',
    highlight: 'centerCircle',
    ball: { x: 50, y: 50 },
    caption: 'This circle in the middle of the field is glowing.',
  })
}

export function halfwayLineNamePlay(): Play {
  return namePlay({
    label: 'The line through the middle',
    highlight: 'halfwayLine',
    ball: { x: 50, y: 50 },
    caption: 'This line that cuts the field in half is glowing.',
  })
}

export function penaltySpotNamePlay(): Play {
  return namePlay({
    label: 'The spot in the box',
    highlight: 'penaltySpot',
    ball: { x: 12, y: 50 },
    caption: 'This little spot inside the big box is glowing.',
  })
}
