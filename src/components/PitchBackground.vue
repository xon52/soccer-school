<script setup lang="ts">
import {
  CENTER_R,
  CORNER_R,
  GOAL_AREA_H,
  GOAL_AREA_W,
  GOAL_AREA_Y,
  GOAL_H,
  GOAL_W,
  GOAL_Y,
  PITCH_LENGTH,
  PITCH_WIDTH,
  PENALTY_ARC_Y1,
  PENALTY_ARC_Y2,
  PENALTY_H,
  PENALTY_SPOT_X,
  PENALTY_W,
  PENALTY_Y,
  SPOT_R,
  VIEW_PAD_X,
  VIEW_PAD_Y,
} from '@/field'
</script>

<template>
  <g class="pitch-static">
    <rect
      :x="-VIEW_PAD_X"
      :y="-VIEW_PAD_Y"
      :width="PITCH_LENGTH + VIEW_PAD_X * 2"
      :height="PITCH_WIDTH + VIEW_PAD_Y * 2"
      fill="#1b5c32"
    />
    <rect x="0" y="0" :width="PITCH_LENGTH" :height="PITCH_WIDTH" fill="url(#grass-stripes)" />

    <g class="markings" fill="none" stroke="#f4f7f2" stroke-width="3">
      <rect x="0" y="0" :width="PITCH_LENGTH" :height="PITCH_WIDTH" />
      <line :x1="PITCH_LENGTH / 2" y1="0" :x2="PITCH_LENGTH / 2" :y2="PITCH_WIDTH" />
      <circle :cx="PITCH_LENGTH / 2" :cy="PITCH_WIDTH / 2" :r="CENTER_R" />
      <circle
        :cx="PITCH_LENGTH / 2"
        :cy="PITCH_WIDTH / 2"
        :r="SPOT_R"
        fill="#f4f7f2"
        stroke="none"
      />

      <rect x="0" :y="PENALTY_Y" :width="PENALTY_W" :height="PENALTY_H" />
      <rect :x="PITCH_LENGTH - PENALTY_W" :y="PENALTY_Y" :width="PENALTY_W" :height="PENALTY_H" />
      <rect x="0" :y="GOAL_AREA_Y" :width="GOAL_AREA_W" :height="GOAL_AREA_H" />
      <rect
        :x="PITCH_LENGTH - GOAL_AREA_W"
        :y="GOAL_AREA_Y"
        :width="GOAL_AREA_W"
        :height="GOAL_AREA_H"
      />

      <circle
        :cx="PENALTY_SPOT_X"
        :cy="PITCH_WIDTH / 2"
        :r="SPOT_R"
        fill="#f4f7f2"
        stroke="none"
      />
      <circle
        :cx="PITCH_LENGTH - PENALTY_SPOT_X"
        :cy="PITCH_WIDTH / 2"
        :r="SPOT_R"
        fill="#f4f7f2"
        stroke="none"
      />

      <path :d="`M ${PENALTY_W} ${PENALTY_ARC_Y1} A ${CENTER_R} ${CENTER_R} 0 0 1 ${PENALTY_W} ${PENALTY_ARC_Y2}`" />
      <path
        :d="`M ${PITCH_LENGTH - PENALTY_W} ${PENALTY_ARC_Y1} A ${CENTER_R} ${CENTER_R} 0 0 0 ${PITCH_LENGTH - PENALTY_W} ${PENALTY_ARC_Y2}`"
      />

      <path :d="`M ${CORNER_R} 0 A ${CORNER_R} ${CORNER_R} 0 0 0 0 ${CORNER_R}`" />
      <path
        :d="`M ${CORNER_R} ${PITCH_WIDTH} A ${CORNER_R} ${CORNER_R} 0 0 1 0 ${PITCH_WIDTH - CORNER_R}`"
      />
      <path
        :d="`M ${PITCH_LENGTH - CORNER_R} 0 A ${CORNER_R} ${CORNER_R} 0 0 1 ${PITCH_LENGTH} ${CORNER_R}`"
      />
      <path
        :d="`M ${PITCH_LENGTH - CORNER_R} ${PITCH_WIDTH} A ${CORNER_R} ${CORNER_R} 0 0 0 ${PITCH_LENGTH} ${PITCH_WIDTH - CORNER_R}`"
      />
    </g>

    <g class="goals" fill="none" stroke="#e8ece7" stroke-width="5">
      <rect :x="-GOAL_W" :y="GOAL_Y" :width="GOAL_W" :height="GOAL_H" />
      <rect :x="PITCH_LENGTH" :y="GOAL_Y" :width="GOAL_W" :height="GOAL_H" />
    </g>
  </g>
</template>
