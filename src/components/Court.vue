<script setup lang="ts">
const cy = 600
// Goal posts (inside edges) at x = 405 and x = 495 (goal width 90px = 3m, so 30px = 1m)
const postL = 405
const postR = 495
const r6 = 180 // 6m
const r9 = 270 // 9m (free-throw, dashed)

const INK = '#2a2012'
const SEPIA = '#3a2e1e'
const SEPIA_SOFT = 'rgba(58, 46, 30, 0.6)'

// Handball area line: quarter-arc from left post, straight across, quarter-arc from right post.
function areaLineScene(radius: number) {
  return (ctx: any, shape: any) => {
    ctx.beginPath()
    // Left quarter-arc: centered on left post, from 180° (due left of post) sweeping up to 270° (straight above post).
    ctx.arc(postL, cy, radius, Math.PI, 1.5 * Math.PI, false)
    // Straight segment across the top (parallel to goal line), from above left post to above right post.
    ctx.lineTo(postR, cy - radius)
    // Right quarter-arc: centered on right post, from 270° (straight above) sweeping to 360°/0° (due right of post).
    ctx.arc(postR, cy, radius, 1.5 * Math.PI, 2 * Math.PI, false)
    ctx.strokeShape(shape)
  }
}

const arc6 = areaLineScene(r6)
const arc9 = areaLineScene(r9)

// 4m goalkeeper line: short segment parallel to goal line, 4m out, between the goalposts.
function gkLineScene(ctx: any, shape: any) {
  const y = cy - 120 // 4m
  ctx.beginPath()
  ctx.moveTo(postL + 15, y)
  ctx.lineTo(postR - 15, y)
  ctx.strokeShape(shape)
}

// 7m penalty line: 1m long, centered on goal, 7m out.
function penaltyLineScene(ctx: any, shape: any) {
  const y = cy - 210 // 7m
  ctx.beginPath()
  ctx.moveTo(450 - 15, y)
  ctx.lineTo(450 + 15, y)
  ctx.strokeShape(shape)
}

// Diagonal hatch pattern for goal net
function goalNetScene(ctx: any, shape: any) {
  ctx.beginPath()
  ctx.rect(405, 598, 90, 12)
  ctx.fillStrokeShape(shape)
  // net lines
  for (let x = 405; x <= 495; x += 6) {
    ctx.beginPath()
    ctx.moveTo(x, 598)
    ctx.lineTo(x, 610)
    ctx.strokeShape(shape)
  }
}

// Faint grid inside court
function gridScene(ctx: any, shape: any) {
  ctx.beginPath()
  for (let x = 180; x < 750; x += 30) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 600)
  }
  for (let y = 30; y < 600; y += 30) {
    ctx.moveTo(150, y)
    ctx.lineTo(750, y)
  }
  ctx.strokeShape(shape)
}

// Crosshair at goal center
function crosshairScene(ctx: any, shape: any) {
  ctx.beginPath()
  ctx.moveTo(450 - 12, 600)
  ctx.lineTo(450 + 12, 600)
  ctx.moveTo(450, 600 - 12)
  ctx.lineTo(450, 600 + 12)
  ctx.strokeShape(shape)
}
</script>

<template>
  <v-group>
    <!-- Court background: warm parchment with radial warmth -->
    <v-rect :config="{
      x: 150, y: 0, width: 600, height: 600,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: 600 },
      fillLinearGradientColorStops: [
        0, '#ead9b5',
        1, '#d9c59c',
      ],
    }" />

    <!-- Clipped group so court lines can't escape the sidelines -->
    <v-group :config="{ clip: { x: 150, y: 0, width: 600, height: 600 } }">

    <!-- Subtle grid -->
    <v-shape :config="{
      stroke: 'rgba(58, 46, 30, 0.08)',
      strokeWidth: 1,
      sceneFunc: gridScene,
      listening: false,
    }" />

    <!-- Outer boundary -->
    <v-rect :config="{
      x: 150, y: 0, width: 600, height: 600,
      stroke: SEPIA, strokeWidth: 2, listening: false,
    }" />

    <!-- Double border (inside) -->
    <v-rect :config="{
      x: 156, y: 6, width: 588, height: 588,
      stroke: SEPIA_SOFT, strokeWidth: 1, listening: false,
    }" />

    <!-- Center line (top) emphasized -->
    <v-line :config="{
      points: [150, 0, 750, 0],
      stroke: SEPIA, strokeWidth: 3,
    }" />

    <!-- 9m dashed arc -->
    <v-shape :config="{
      stroke: SEPIA, strokeWidth: 2, dash: [12, 6],
      sceneFunc: arc9, listening: false,
    }" />

    <!-- 6m solid area line -->
    <v-shape :config="{
      stroke: SEPIA, strokeWidth: 2,
      sceneFunc: arc6, listening: false,
    }" />

    <!-- 4m goalkeeper line -->
    <v-shape :config="{
      stroke: SEPIA, strokeWidth: 2,
      sceneFunc: gkLineScene, listening: false,
    }" />

    <!-- 7m penalty line -->
    <v-shape :config="{
      stroke: SEPIA, strokeWidth: 2.5,
      sceneFunc: penaltyLineScene, listening: false,
    }" />

    <!-- Goal line -->
    <v-line :config="{
      points: [150, 600, 750, 600],
      stroke: SEPIA, strokeWidth: 3, listening: false,
    }" />

    <!-- Crosshair at goal center -->
    <v-shape :config="{
      stroke: 'rgba(58, 46, 30, 0.55)',
      strokeWidth: 1,
      sceneFunc: crosshairScene,
      listening: false,
    }" />

    <!-- Goal (with net hatch) -->
    <v-shape :config="{
      fill: '#3a2e1e',
      stroke: '#1c140a',
      strokeWidth: 1.5,
      sceneFunc: goalNetScene,
      listening: false,
    }" />

    <!-- Distance labels -->
    <v-text :config="{
      x: 438, y: 320, text: '9M', fontFamily: 'JetBrains Mono', fontSize: 11,
      fontStyle: 'bold', fill: 'rgba(58, 46, 30, 0.65)', listening: false,
    }" />
    <v-text :config="{
      x: 438, y: 408, text: '6M', fontFamily: 'JetBrains Mono', fontSize: 11,
      fontStyle: 'bold', fill: 'rgba(58, 46, 30, 0.65)', listening: false,
    }" />

    <!-- Corner tick stamps -->
    <v-line :config="{ points: [155, 5, 170, 5], stroke: SEPIA, strokeWidth: 2, listening: false }" />
    <v-line :config="{ points: [155, 5, 155, 20], stroke: SEPIA, strokeWidth: 2, listening: false }" />
    <v-line :config="{ points: [745, 5, 730, 5], stroke: SEPIA, strokeWidth: 2, listening: false }" />
    <v-line :config="{ points: [745, 5, 745, 20], stroke: SEPIA, strokeWidth: 2, listening: false }" />
    </v-group>
  </v-group>
</template>
