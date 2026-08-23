<script setup lang="ts">
import { computed } from 'vue'
import PitchBackground from '@/components/PitchBackground.vue'
import {
  GOAL_AREA_H,
  GOAL_AREA_W,
  GOAL_AREA_Y,
  HIGHLIGHT_BAR,
  LENGTH_M,
  PENALTY_H,
  PENALTY_SPOT_GLOW_R,
  PENALTY_SPOT_X,
  PENALTY_W,
  PENALTY_Y,
  PITCH_LENGTH,
  PITCH_WIDTH,
  CENTER_R,
  SVG_PER_M,
  VIEWBOX,
  WIDTH_M,
  toSvg,
} from '@/field'
import type { Arrow, Drawing, Highlight, Player, Point, Team } from '@/types'

const props = withDefaults(
  defineProps<{
    ball: Point
    highlight?: Highlight
    players?: Player[]
    restartLabel?: string
    forbidHands?: boolean
    reducedMotion?: boolean
    showLabels?: boolean
    showBall?: boolean
    showLegend?: boolean
    kickFrom?: Point | null
    kickTo?: Point | null
    kickTeam?: Team | null
    kickerId?: string | null
    moveDurationMs?: number
    drawings?: Drawing[]
    arrows?: Arrow[]
  }>(),
  {
    highlight: 'none',
    players: () => [],
    restartLabel: undefined,
    forbidHands: false,
    reducedMotion: false,
    showLabels: true,
    showBall: true,
    showLegend: true,
    kickFrom: null,
    kickTo: null,
    kickTeam: null,
    kickerId: null,
    moveDurationMs: 900,
    drawings: () => [],
    arrows: () => [],
  },
)

const ballSvg = computed(() => toSvg(props.ball))

const ballStyle = computed(() => ({
  transform: `translate(${ballSvg.value.x}px, ${ballSvg.value.y}px)`,
  transitionDuration: props.reducedMotion ? '0.01s' : `${props.moveDurationMs}ms`,
}))

function playerStyle(player: Player) {
  const point = toSvg(player)
  return {
    transform: `translate(${point.x}px, ${point.y}px)`,
    transitionDuration: props.reducedMotion ? '0.01s' : `${props.moveDurationMs}ms`,
  }
}

function arrowGeom(from: Point, to: Point) {
  const start = toSvg(from)
  const end = toSvg(to)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy)
  if (length < 16) return null
  const ux = dx / length
  const uy = dy / length
  return {
    x1: start.x,
    y1: start.y,
    x2: end.x - ux * 18,
    y2: end.y - uy * 18,
  }
}

const kickArrow = computed(() => {
  if (!props.kickFrom || !props.kickTo) return null
  const geom = arrowGeom(props.kickFrom, props.kickTo)
  if (!geom) return null
  return {
    ...geom,
    team: props.kickTeam === 'red' ? 'red' : 'blue',
  }
})

const overlayArrows = computed(() => {
  return props.arrows.flatMap((arrow, index) => {
    const geom = arrowGeom(arrow.from, arrow.to)
    if (!geom) return []
    return [{
      key: `arr-${index}`,
      ...geom,
      team: arrow.team ?? 'teach',
    }]
  })
})

const overlayIds = computed(() => {
  const ids = new Set<string>()
  if (props.kickerId) ids.add(props.kickerId)
  for (const player of props.players) {
    if (player.hasBall) ids.add(player.id)
  }
  return ids
})

const fieldPlayers = computed(() => props.players.filter((player) => !overlayIds.value.has(player.id)))
const overlayPlayers = computed(() => props.players.filter((player) => overlayIds.value.has(player.id)))

const nearLeftGoal = computed(() => props.ball.x < LENGTH_M / 2)
const nearTopSideline = computed(() => props.ball.y < WIDTH_M / 2)
const penaltyX = computed(() => (nearLeftGoal.value ? 0 : PITCH_LENGTH - PENALTY_W))
const goalLineX = computed(() => (nearLeftGoal.value ? 0 : PITCH_LENGTH))
const sidelineY = computed(() => (nearTopSideline.value ? 0 : PITCH_WIDTH))
const goalAreaX = computed(() => (nearLeftGoal.value ? 0 : PITCH_LENGTH - GOAL_AREA_W))
const penaltySpotX = computed(() => (nearLeftGoal.value ? PENALTY_SPOT_X : PITCH_LENGTH - PENALTY_SPOT_X))

function drawingSvg(drawing: Drawing) {
  if (drawing.kind === 'line') {
    const from = toSvg({ x: drawing.x1, y: drawing.y1 })
    const to = toSvg({ x: drawing.x2, y: drawing.y2 })
    return { kind: 'line' as const, x1: from.x, y1: from.y, x2: to.x, y2: to.y }
  }
  if (drawing.kind === 'circle') {
    const center = toSvg({ x: drawing.x, y: drawing.y })
    return { kind: 'circle' as const, cx: center.x, cy: center.y, r: drawing.r * SVG_PER_M }
  }
  const origin = toSvg({ x: drawing.x, y: drawing.y })
  return {
    kind: drawing.kind,
    x: origin.x,
    y: origin.y,
    w: drawing.w * SVG_PER_M,
    h: drawing.h * SVG_PER_M,
  }
}

const drawn = computed(() => props.drawings.map((drawing, index) => ({
  key: `draw-${index}`,
  ...drawingSvg(drawing),
})))
</script>

<template>
  <div class="pitch-wrap">
    <svg
      class="pitch"
      :viewBox="VIEWBOX"
      role="img"
      aria-label="Soccer field showing the play"
    >
      <defs>
        <pattern id="grass-stripes" width="105" height="680" patternUnits="userSpaceOnUse">
          <rect width="105" height="680" fill="#2f8f4c" />
          <rect x="52.5" width="52.5" height="680" fill="#2a8345" />
        </pattern>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker
          id="kick-head-blue"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(37, 99, 235, 0.5)" />
        </marker>
        <marker
          id="kick-head-red"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(220, 38, 38, 0.5)" />
        </marker>
        <marker
          id="kick-head-teach"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#facc15" />
        </marker>
      </defs>

      <PitchBackground v-once />

      <rect
        v-if="highlight === 'penaltyArea'"
        class="highlight-fill"
        :x="penaltyX"
        :y="PENALTY_Y"
        :width="PENALTY_W"
        :height="PENALTY_H"
      />
      <rect
        v-if="highlight === 'goalArea'"
        class="highlight-fill"
        :x="goalAreaX"
        :y="GOAL_AREA_Y"
        :width="GOAL_AREA_W"
        :height="GOAL_AREA_H"
      />
      <circle
        v-if="highlight === 'centerCircle'"
        class="highlight-fill"
        :cx="PITCH_LENGTH / 2"
        :cy="PITCH_WIDTH / 2"
        :r="CENTER_R"
      />
      <circle
        v-if="highlight === 'penaltySpot'"
        class="highlight-fill"
        :cx="penaltySpotX"
        :cy="PITCH_WIDTH / 2"
        :r="PENALTY_SPOT_GLOW_R"
      />
      <rect
        v-if="highlight === 'sideline'"
        class="highlight-bar"
        x="-6"
        :y="sidelineY - HIGHLIGHT_BAR / 2"
        :width="PITCH_LENGTH + 12"
        :height="HIGHLIGHT_BAR"
        rx="8"
      />
      <rect
        v-if="highlight === 'goalLine'"
        class="highlight-bar"
        :x="goalLineX - HIGHLIGHT_BAR / 2"
        y="-6"
        :width="HIGHLIGHT_BAR"
        :height="PITCH_WIDTH + 12"
        rx="8"
      />
      <rect
        v-if="highlight === 'halfwayLine'"
        class="highlight-bar"
        :x="PITCH_LENGTH / 2 - HIGHLIGHT_BAR / 2"
        y="-6"
        :width="HIGHLIGHT_BAR"
        :height="PITCH_WIDTH + 12"
        rx="8"
      />

      <template v-for="item in drawn" :key="item.key">
        <line
          v-if="item.kind === 'line'"
          class="teach-line"
          :x1="item.x1"
          :y1="item.y1"
          :x2="item.x2"
          :y2="item.y2"
        />
        <rect
          v-else-if="item.kind === 'rect'"
          class="highlight-fill"
          :x="item.x"
          :y="item.y"
          :width="item.w"
          :height="item.h"
        />
        <rect
          v-else-if="item.kind === 'bar'"
          class="highlight-bar"
          :x="item.x"
          :y="item.y"
          :width="item.w"
          :height="item.h"
          rx="8"
        />
        <circle
          v-else-if="item.kind === 'circle'"
          class="highlight-fill"
          :cx="item.cx"
          :cy="item.cy"
          :r="item.r"
        />
      </template>

      <template v-if="showLabels">
        <text class="end-label" x="80" y="-18">Your goal</text>
        <text class="end-label" :x="PITCH_LENGTH - 80" y="-18">Their goal</text>
        <text class="side-label" :x="PITCH_LENGTH / 2" y="-18">Sideline</text>
        <text class="side-label" :x="PITCH_LENGTH / 2" :y="PITCH_WIDTH + 32">Sideline</text>
      </template>

      <line
        v-if="kickArrow"
        class="kick-arrow"
        :class="kickArrow.team"
        :x1="kickArrow.x1"
        :y1="kickArrow.y1"
        :x2="kickArrow.x2"
        :y2="kickArrow.y2"
        :marker-end="kickArrow.team === 'red' ? 'url(#kick-head-red)' : 'url(#kick-head-blue)'"
      />
      <line
        v-for="arrow in overlayArrows"
        :key="arrow.key"
        class="kick-arrow"
        :class="arrow.team"
        :x1="arrow.x1"
        :y1="arrow.y1"
        :x2="arrow.x2"
        :y2="arrow.y2"
        :marker-end="`url(#kick-head-${arrow.team})`"
      />

      <g
        v-for="player in fieldPlayers"
        :key="player.id"
        class="player"
        :class="[player.team, { keeper: player.role === 'goalkeeper', 'has-ball': player.hasBall }]"
        :style="playerStyle(player)"
      >
        <circle
          v-if="player.hasBall && player.role !== 'goalkeeper'"
          class="possession-ring"
          r="19"
        />
        <rect
          v-if="player.hasBall && player.role === 'goalkeeper'"
          class="possession-ring"
          x="-19"
          y="-19"
          width="38"
          height="38"
          rx="8"
        />
        <rect
          v-if="player.role === 'goalkeeper'"
          x="-16"
          y="-16"
          width="32"
          height="32"
          rx="6"
        />
        <circle v-else r="15" />
        <text
          v-if="player.label"
          class="player-label"
          :class="{ mark: player.label.length === 1 }"
          dominant-baseline="central"
        >{{ player.label }}</text>
        <g v-if="player.usingHands" class="gloves">
          <circle cx="-18" cy="-8" r="6" />
          <circle cx="18" cy="-8" r="6" />
        </g>
        <g v-if="forbidHands && player.role === 'goalkeeper'" class="no-hands">
          <circle r="22" />
          <line x1="-14" y1="-14" x2="14" y2="14" />
        </g>
      </g>

      <g v-if="showBall" class="ball" :style="ballStyle">
        <circle r="11" fill="#f8f5ee" stroke="#222" stroke-width="2" />
        <path
          d="M -3 -8 L 3 -8 L 6 0 L 3 8 L -3 8 L -6 0 Z"
          fill="none"
          stroke="#222"
          stroke-width="1.4"
        />
      </g>

      <g
        v-for="player in overlayPlayers"
        :key="`over-${player.id}`"
        class="player"
        :class="[player.team, { keeper: player.role === 'goalkeeper', 'has-ball': player.hasBall }]"
        :style="playerStyle(player)"
      >
        <circle
          v-if="player.hasBall && player.role !== 'goalkeeper'"
          class="possession-ring"
          r="19"
        />
        <rect
          v-if="player.hasBall && player.role === 'goalkeeper'"
          class="possession-ring"
          x="-19"
          y="-19"
          width="38"
          height="38"
          rx="8"
        />
        <rect
          v-if="player.role === 'goalkeeper'"
          x="-16"
          y="-16"
          width="32"
          height="32"
          rx="6"
        />
        <circle v-else r="15" />
        <text
          v-if="player.label"
          class="player-label"
          :class="{ mark: player.label.length === 1 }"
          dominant-baseline="central"
        >{{ player.label }}</text>
        <g v-if="player.usingHands" class="gloves">
          <circle cx="-18" cy="-8" r="6" />
          <circle cx="18" cy="-8" r="6" />
        </g>
        <g v-if="forbidHands && player.role === 'goalkeeper'" class="no-hands">
          <circle r="22" />
          <line x1="-14" y1="-14" x2="14" y2="14" />
        </g>
      </g>

      <g v-if="restartLabel" class="restart-banner">
        <rect
          :x="PITCH_LENGTH / 2 - 140"
          y="18"
          width="280"
          height="52"
          rx="12"
        />
        <text :x="PITCH_LENGTH / 2" y="52">{{ restartLabel }}</text>
      </g>
    </svg>

    <div v-if="showLegend" class="legend" aria-hidden="true">
      <span class="legend-item"><i class="swatch blue" /> You (blue)</span>
      <span class="legend-item"><i class="swatch red" /> Other team (red)</span>
      <span class="legend-item"><i class="swatch ball" /> Yellow ring = has the ball</span>
    </div>
  </div>
</template>

<style scoped>
.pitch-wrap {
  display: grid;
  gap: 0.6rem;
}

.pitch {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 16px;
  overflow: visible;
  background: #1b5c32;
}

.highlight-fill {
  fill: rgba(250, 204, 21, 0.4);
  stroke: #facc15;
  stroke-width: 8;
  pointer-events: none;
  animation: pulse-glow 1.2s ease-in-out infinite alternate;
}

.highlight-bar {
  fill: rgba(250, 204, 21, 0.85);
  stroke: #fff6b0;
  stroke-width: 3;
  pointer-events: none;
  animation: pulse-glow 1.2s ease-in-out infinite alternate;
}

.teach-line {
  fill: none;
  stroke: #facc15;
  stroke-width: 8;
  stroke-linecap: round;
  pointer-events: none;
  animation: pulse-glow 1.2s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  from { opacity: 0.75; }
  to { opacity: 1; }
}

.end-label,
.side-label {
  fill: #d7f5df;
  font-size: 18px;
  font-weight: 800;
  text-anchor: middle;
  letter-spacing: 0.04em;
}

.player {
  transform-box: view-box;
  transform-origin: 0 0;
  transition-property: transform;
  transition-timing-function: ease-in-out;
}

.possession-ring {
  fill: none;
  stroke: #facc15;
  stroke-width: 2;
}

.kick-arrow {
  fill: none;
  stroke-width: 7;
  stroke-linecap: round;
  pointer-events: none;
}

.kick-arrow.blue {
  stroke: rgba(37, 99, 235, 0.5);
}

.kick-arrow.red {
  stroke: rgba(220, 38, 38, 0.5);
}

.kick-arrow.teach {
  stroke: #facc15;
}

.ball {
  transform-box: view-box;
  transform-origin: 0 0;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.2, 0.85, 0.25, 1);
}

.player.blue > circle:not(.possession-ring),
.player.blue > rect:not(.possession-ring) {
  fill: #2563eb;
  stroke: #0f172a;
  stroke-width: 2.5;
}

.player.red > circle:not(.possession-ring),
.player.red > rect:not(.possession-ring) {
  fill: #dc2626;
  stroke: #0f172a;
  stroke-width: 2.5;
}

.player-label {
  fill: #fff;
  font-size: 10px;
  font-weight: 800;
  text-anchor: middle;
  pointer-events: none;
}

.player-label.mark {
  font-size: 22px;
  font-weight: 900;
}

.gloves circle {
  fill: #f8f5ee;
  stroke: #0f172a;
  stroke-width: 2;
}

.no-hands {
  fill: none;
  stroke: #facc15;
  stroke-width: 4;
}

.restart-banner rect {
  fill: rgba(15, 23, 42, 0.82);
  stroke: #facc15;
  stroke-width: 3;
}

.restart-banner text {
  fill: #facc15;
  font-size: 28px;
  font-weight: 900;
  text-anchor: middle;
}

.legend {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  color: #e8f6ec;
  font-weight: 700;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.swatch {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  border: 2px solid #0f172a;
  display: inline-block;
}

.swatch.blue {
  background: #2563eb;
}

.swatch.red {
  background: #dc2626;
}

.swatch.ball {
  background: transparent;
  border-color: #facc15;
}

@media (prefers-reduced-motion: reduce) {
  .ball,
  .player {
    transition: none;
  }

  .highlight-fill,
  .highlight-bar,
  .teach-line {
    animation: none;
  }
}
</style>
