import { flipArrow, flipDrawing, flipVertical } from '@/field'
import type { Keyframe, Play } from '@/types'

function flipFrames(frames: Keyframe[]): Keyframe[] {
  return frames.map((frame) => ({
    ...frame,
    ball: flipVertical(frame.ball),
    players: frame.players?.map((player) => ({ ...player, ...flipVertical(player) })),
    drawings: frame.drawings?.map(flipDrawing),
    arrows: frame.arrows?.map(flipArrow),
  }))
}

export function flipPlayVertical(play: Play): Play {
  return {
    ...play,
    frames: flipFrames(play.frames),
    outcome: play.outcome ? flipFrames(play.outcome) : undefined,
  }
}
