import type { Point } from '@/types'

/** Pitch in SVG units: 105m x 68m at 10 units per metre. */
export const PITCH_LENGTH = 1050
export const PITCH_WIDTH = 680

export const VIEW_PAD_X = 70
export const VIEW_PAD_Y = 50
export const VIEW_WIDTH = PITCH_LENGTH + VIEW_PAD_X * 2
export const VIEW_HEIGHT = PITCH_WIDTH + VIEW_PAD_Y * 2
export const VIEWBOX = `${-VIEW_PAD_X} ${-VIEW_PAD_Y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`

export function toSvg(point: Point): Point {
  return {
    x: (point.x / 100) * PITCH_LENGTH,
    y: (point.y / 100) * PITCH_WIDTH,
  }
}

export function flipVertical(point: Point): Point {
  return { x: point.x, y: 100 - point.y }
}
