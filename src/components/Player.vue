<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { Token, Position } from '../composables/usePlay'
import { usePlay } from '../composables/usePlay'

const props = defineProps<{
  token: Token
  position: Position
  draggable: boolean
}>()

const emit = defineEmits<{
  (e: 'dragend', id: string, x: number, y: number): void
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

function onDragEnd(e: any) {
  emit('dragend', props.token.id, e.target.x(), e.target.y())
}
</script>

<template>
  <v-group
    ref="groupRef"
    :config="{
      x: position.x,
      y: position.y,
      draggable,
    }"
    @dragend="onDragEnd"
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
  </v-group>
</template>
