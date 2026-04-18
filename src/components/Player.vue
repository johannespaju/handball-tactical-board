<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { Token, Position } from '../composables/usePlay'
import { usePlay } from '../composables/usePlay'

const props = defineProps<{
  token: Token
  position: Position
  draggable: boolean
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'dragend', id: string, x: number, y: number): void
  (e: 'remove', id: string): void
  (e: 'select', id: string): void
}>()

const { registerNode } = usePlay()
const groupRef = ref<any>(null)

function node(): any | null {
  return groupRef.value?.getNode?.() ?? null
}

onMounted(() => {
  const n = node()
  if (n) registerNode(props.token.id, n)
})
onBeforeUnmount(() => registerNode(props.token.id, null))
watch(groupRef, () => {
  const n = node()
  if (n) registerNode(props.token.id, n)
})

const COURT = { x: 150, y: 0, width: 600, height: 600 }

function clampToCourt(pos: { x: number; y: number }) {
  const r = props.token.radius
  return {
    x: Math.max(COURT.x + r, Math.min(COURT.x + COURT.width - r, pos.x)),
    y: Math.max(COURT.y + r, Math.min(COURT.y + COURT.height - r, pos.y)),
  }
}

function onDragEnd(e: any) {
  const clamped = clampToCourt({ x: e.target.x(), y: e.target.y() })
  e.target.x(clamped.x)
  e.target.y(clamped.y)
  emit('dragend', props.token.id, clamped.x, clamped.y)
}

function onClick(e: any) {
  if (props.token.kind === 'ball') return
  e?.cancelBubble && (e.cancelBubble = true)
  emit('select', props.token.id)
}

function onRemoveClick(e: any) {
  if (e?.evt) e.evt.stopPropagation?.()
  if (e) e.cancelBubble = true
  emit('remove', props.token.id)
}
</script>

<template>
  <v-group
    ref="groupRef"
    :config="{
      x: position.x,
      y: position.y,
      draggable,
      dragBoundFunc: clampToCourt,
    }"
    @dragend="onDragEnd"
    @click="onClick"
    @tap="onClick"
  >
    <!-- Soft base shadow (hard edge, no blur = cheap) -->
    <v-circle :config="{
      x: 0, y: 2,
      radius: token.radius,
      fill: 'rgba(0, 0, 0, 0.25)',
      listening: false,
    }" />

    <!-- Outer ring (slightly larger, subtle halo) -->
    <v-circle v-if="token.kind !== 'ball'" :config="{
      radius: token.radius + 2,
      stroke: 'rgba(14, 13, 10, 0.35)',
      strokeWidth: 1,
      listening: false,
    }" />

    <!-- Main body -->
    <v-circle :config="{
      radius: token.radius,
      fill: token.color,
      stroke: '#0e0d0a',
      strokeWidth: 1.5,
    }" />

    <!-- Top highlight arc -->
    <v-arc v-if="token.kind !== 'ball'" :config="{
      innerRadius: token.radius - 4,
      outerRadius: token.radius - 1,
      angle: 140,
      rotation: -160,
      fill: 'rgba(255, 255, 255, 0.18)',
      listening: false,
    }" />

    <!-- Ball: stitched look via inner ring -->
    <v-circle v-if="token.kind === 'ball'" :config="{
      radius: token.radius - 4,
      stroke: 'rgba(14, 13, 10, 0.65)',
      strokeWidth: 1,
      dash: [2, 2],
      listening: false,
    }" />

    <!-- Number label -->
    <v-text v-if="token.number !== undefined" :config="{
      text: String(token.number),
      fontSize: 15,
      fontStyle: 'bold',
      fontFamily: 'Antonio, Impact, sans-serif',
      fill: '#f3ead6',
      align: 'center',
      verticalAlign: 'middle',
      width: token.radius * 2,
      height: token.radius * 2,
      offsetX: token.radius,
      offsetY: token.radius,
      listening: false,
    }" />

    <!-- Selection ring -->
    <v-circle v-if="selected && token.kind !== 'ball'" :config="{
      radius: token.radius + 5,
      stroke: '#f3ead6',
      strokeWidth: 1.5,
      dash: [3, 3],
      listening: false,
    }" />

    <!-- Remove badge (X) on top-right -->
    <v-group
      v-if="selected && token.kind !== 'ball'"
      :config="{ x: token.radius * 0.78, y: -token.radius * 0.78 }"
      @click="onRemoveClick"
      @tap="onRemoveClick"
      @mouseenter="(e: any) => { const s = e?.target?.getStage?.(); if (s) s.container().style.cursor = 'pointer' }"
      @mouseleave="(e: any) => { const s = e?.target?.getStage?.(); if (s) s.container().style.cursor = 'default' }"
    >
      <v-circle :config="{
        radius: 9,
        fill: '#0e0d0a',
        stroke: '#f3ead6',
        strokeWidth: 1.2,
      }" />
      <v-line :config="{
        points: [-3.5, -3.5, 3.5, 3.5],
        stroke: '#f3ead6',
        strokeWidth: 1.6,
        lineCap: 'round',
        listening: false,
      }" />
      <v-line :config="{
        points: [-3.5, 3.5, 3.5, -3.5],
        stroke: '#f3ead6',
        strokeWidth: 1.6,
        lineCap: 'round',
        listening: false,
      }" />
    </v-group>
  </v-group>
</template>
