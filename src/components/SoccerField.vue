<script setup lang="ts">
import { computed } from 'vue'
import {
  PITCH_LENGTH,
  PITCH_WIDTH,
  VIEWBOX,
  toSvg,
} from '@/field'
import type { Highlight, Player, Point, Team } from '@/types'

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

const kickArrow = computed(() => {
  if (!props.kickFrom || !props.kickTo) return null
  const from = toSvg(props.kickFrom)
  const to = toSvg(props.kickTo)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy)
  if (length < 16) return null
  const ux = dx / length
  const uy = dy / length
  return {
    x1: from.x,
    y1: from.y,
    x2: to.x - ux * 18,
    y2: to.y - uy * 18,
    team: props.kickTeam === 'red' ? 'red' : 'blue',
  }
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

const nearLeftGoal = computed(() => props.ball.x < 50)
const nearTopSideline = computed(() => props.ball.y < 50)
const penaltyX = computed(() => (nearLeftGoal.value ? 0 : PITCH_LENGTH - 165))
const goalLineX = computed(() => (nearLeftGoal.value ? 0 : PITCH_LENGTH))
const sidelineY = computed(() => (nearTopSideline.value ? 0 : PITCH_WIDTH))
const goalAreaX = computed(() => (nearLeftGoal.value ? 0 : PITCH_LENGTH - 55))
const penaltySpotX = computed(() => (nearLeftGoal.value ? 110 : PITCH_LENGTH - 110))
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
      </defs>

      <rect
        x="-70"
        y="-50"
        width="1190"
        height="780"
        fill="#1b5c32"
      />
      <rect x="0" y="0" :width="PITCH_LENGTH" :height="PITCH_WIDTH" fill="url(#grass-stripes)" />

      <g class="markings" fill="none" stroke="#f4f7f2" stroke-width="3">
        <rect x="0" y="0" :width="PITCH_LENGTH" :height="PITCH_WIDTH" />
        <line :x1="PITCH_LENGTH / 2" y1="0" :x2="PITCH_LENGTH / 2" :y2="PITCH_WIDTH" />
        <circle :cx="PITCH_LENGTH / 2" :cy="PITCH_WIDTH / 2" r="91.5" />
        <circle :cx="PITCH_LENGTH / 2" :cy="PITCH_WIDTH / 2" r="5" fill="#f4f7f2" stroke="none" />

        <rect x="0" y="138.5" width="165" height="403" />
        <rect :x="PITCH_LENGTH - 165" y="138.5" width="165" height="403" />
        <rect x="0" y="248.4" width="55" height="183.2" />
        <rect :x="PITCH_LENGTH - 55" y="248.4" width="55" height="183.2" />

        <circle cx="110" :cy="PITCH_WIDTH / 2" r="5" fill="#f4f7f2" stroke="none" />
        <circle :cx="PITCH_LENGTH - 110" :cy="PITCH_WIDTH / 2" r="5" fill="#f4f7f2" stroke="none" />

        <path d="M 165 248.4 A 91.5 91.5 0 0 1 165 431.6" />
        <path :d="`M ${PITCH_LENGTH - 165} 248.4 A 91.5 91.5 0 0 0 ${PITCH_LENGTH - 165} 431.6`" />

        <path d="M 10 0 A 10 10 0 0 0 0 10" />
        <path :d="`M 10 ${PITCH_WIDTH} A 10 10 0 0 1 0 ${PITCH_WIDTH - 10}`" />
        <path :d="`M ${PITCH_LENGTH - 10} 0 A 10 10 0 0 1 ${PITCH_LENGTH} 10`" />
        <path :d="`M ${PITCH_LENGTH - 10} ${PITCH_WIDTH} A 10 10 0 0 0 ${PITCH_LENGTH} ${PITCH_WIDTH - 10}`" />
      </g>

      <g class="goals" fill="none" stroke="#e8ece7" stroke-width="5">
        <rect x="-22" y="304" width="22" height="72" />
        <rect :x="PITCH_LENGTH" y="304" width="22" height="72" />
      </g>

      <rect
        v-if="highlight === 'penaltyArea'"
        class="highlight-fill"
        :x="penaltyX"
        y="138.5"
        width="165"
        height="403"
      />
      <rect
        v-if="highlight === 'goalArea'"
        class="highlight-fill"
        :x="goalAreaX"
        y="248.4"
        width="55"
        height="183.2"
      />
      <circle
        v-if="highlight === 'centerCircle'"
        class="highlight-fill"
        :cx="PITCH_LENGTH / 2"
        :cy="PITCH_WIDTH / 2"
        r="91.5"
      />
      <circle
        v-if="highlight === 'penaltySpot'"
        class="highlight-fill"
        :cx="penaltySpotX"
        :cy="PITCH_WIDTH / 2"
        r="22"
      />
      <rect
        v-if="highlight === 'sideline'"
        class="highlight-bar"
        x="-6"
        :y="sidelineY - 14"
        :width="PITCH_LENGTH + 12"
        height="28"
        rx="8"
      />
      <rect
        v-if="highlight === 'goalLine'"
        class="highlight-bar"
        :x="goalLineX - 14"
        y="-6"
        width="28"
        :height="PITCH_WIDTH + 12"
        rx="8"
      />
      <rect
        v-if="highlight === 'halfwayLine'"
        class="highlight-bar"
        :x="PITCH_LENGTH / 2 - 14"
        y="-6"
        width="28"
        :height="PITCH_WIDTH + 12"
        rx="8"
      />

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
        <text v-if="player.label" class="player-label" y="5">{{ player.label }}</text>
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
        <text v-if="player.label" class="player-label" y="5">{{ player.label }}</text>
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
  .highlight-bar {
    animation: none;
  }
}
</style>
