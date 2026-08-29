import type { Arrow, Drawing, Point } from '@/types'

/** FIFA pitch size in metres. */
export const LENGTH_M = 105
export const WIDTH_M = 68
export const SVG_PER_M = 10

export const PENALTY_DEPTH_M = 16.5
export const PENALTY_WIDTH_M = 40.32
export const GOAL_AREA_DEPTH_M = 5.5
export const GOAL_AREA_WIDTH_M = 18.32
export const PENALTY_SPOT_M = 11
export const CENTER_CIRCLE_M = 9.15
export const GOAL_WIDTH_M = 7.32
export const GOAL_DEPTH_M = 2.44
export const CORNER_ARC_M = 1
export const SPOT_R_M = 0.5
export const HIGHLIGHT_BAR_M = 2.8

export function m(metres: number) {
  return metres * SVG_PER_M
}

export const PITCH_LENGTH = m(LENGTH_M)
export const PITCH_WIDTH = m(WIDTH_M)

export const VIEW_PAD_X_M = 7
export const VIEW_PAD_Y_M = 5
export const VIEW_PAD_X = m(VIEW_PAD_X_M)
export const VIEW_PAD_Y = m(VIEW_PAD_Y_M)
export const VIEW_WIDTH = PITCH_LENGTH + VIEW_PAD_X * 2
export const VIEW_HEIGHT = PITCH_WIDTH + VIEW_PAD_Y * 2
export const VIEWBOX = `${-VIEW_PAD_X} ${-VIEW_PAD_Y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`

export const PENALTY_Y = m((WIDTH_M - PENALTY_WIDTH_M) / 2)
export const PENALTY_H = m(PENALTY_WIDTH_M)
export const PENALTY_W = m(PENALTY_DEPTH_M)
export const GOAL_AREA_Y = m((WIDTH_M - GOAL_AREA_WIDTH_M) / 2)
export const GOAL_AREA_H = m(GOAL_AREA_WIDTH_M)
export const GOAL_AREA_W = m(GOAL_AREA_DEPTH_M)
export const PENALTY_SPOT_X = m(PENALTY_SPOT_M)
export const CENTER_R = m(CENTER_CIRCLE_M)
export const GOAL_Y = m((WIDTH_M - GOAL_WIDTH_M) / 2)
export const GOAL_H = m(GOAL_WIDTH_M)
export const GOAL_W = m(GOAL_DEPTH_M)
export const CORNER_R = m(CORNER_ARC_M)
export const SPOT_R = m(SPOT_R_M)
export const HIGHLIGHT_BAR = m(HIGHLIGHT_BAR_M)
export const PENALTY_SPOT_GLOW_R = m(2.2)

const penaltyArcHalfM = Math.sqrt(CENTER_CIRCLE_M ** 2 - (PENALTY_DEPTH_M - PENALTY_SPOT_M) ** 2)
export const PENALTY_ARC_Y1 = m(WIDTH_M / 2 - penaltyArcHalfM)
export const PENALTY_ARC_Y2 = m(WIDTH_M / 2 + penaltyArcHalfM)

export const CENTER_M: Point = { x: LENGTH_M / 2, y: WIDTH_M / 2 }

export function toSvg(point: Point): Point {
  return {
    x: m(point.x),
    y: m(point.y),
  }
}

export function flipVertical(point: Point): Point {
  return { x: point.x, y: WIDTH_M - point.y }
}

export function flipDrawing(drawing: Drawing): Drawing {
  if (drawing.kind === 'line') {
    return {
      ...drawing,
      y1: WIDTH_M - drawing.y1,
      y2: WIDTH_M - drawing.y2,
    }
  }
  if (drawing.kind === 'circle') {
    return { ...drawing, y: WIDTH_M - drawing.y }
  }
  return { ...drawing, y: WIDTH_M - drawing.y - drawing.h }
}

export function flipArrow(arrow: Arrow): Arrow {
  return {
    ...arrow,
    from: flipVertical(arrow.from),
    to: flipVertical(arrow.to),
  }
}

export function namedDrawing(name: string, side?: string): Drawing {
  const bar = HIGHLIGHT_BAR_M
  const pad = 0.6
  switch (name) {
    case 'sideline': {
      const top = side !== 'bottom'
      return {
        kind: 'bar',
        x: -pad,
        y: (top ? 0 : WIDTH_M) - bar / 2,
        w: LENGTH_M + pad * 2,
        h: bar,
      }
    }
    case 'goal-line': {
      const left = side !== 'right'
      return {
        kind: 'bar',
        x: (left ? 0 : LENGTH_M) - bar / 2,
        y: -pad,
        w: bar,
        h: WIDTH_M + pad * 2,
      }
    }
    case 'goal-mouth': {
      const left = side !== 'right'
      return {
        kind: 'bar',
        x: (left ? 0 : LENGTH_M) - bar / 2,
        y: (WIDTH_M - GOAL_WIDTH_M) / 2,
        w: bar,
        h: GOAL_WIDTH_M,
      }
    }
    case 'halfway-line':
      return {
        kind: 'bar',
        x: LENGTH_M / 2 - bar / 2,
        y: -pad,
        w: bar,
        h: WIDTH_M + pad * 2,
      }
    case 'penalty-area': {
      const left = side !== 'right'
      return {
        kind: 'rect',
        x: left ? 0 : LENGTH_M - PENALTY_DEPTH_M,
        y: (WIDTH_M - PENALTY_WIDTH_M) / 2,
        w: PENALTY_DEPTH_M,
        h: PENALTY_WIDTH_M,
      }
    }
    case 'goal-area': {
      const left = side !== 'right'
      return {
        kind: 'rect',
        x: left ? 0 : LENGTH_M - GOAL_AREA_DEPTH_M,
        y: (WIDTH_M - GOAL_AREA_WIDTH_M) / 2,
        w: GOAL_AREA_DEPTH_M,
        h: GOAL_AREA_WIDTH_M,
      }
    }
    case 'center-circle':
      return { kind: 'circle', x: LENGTH_M / 2, y: WIDTH_M / 2, r: CENTER_CIRCLE_M }
    case 'penalty-spot': {
      const left = side !== 'right'
      return {
        kind: 'circle',
        x: left ? PENALTY_SPOT_M : LENGTH_M - PENALTY_SPOT_M,
        y: WIDTH_M / 2,
        r: 2.2,
      }
    }
    default:
      throw new Error(`Unknown drawing name: ${name}`)
  }
}
