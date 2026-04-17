import { ref, reactive, computed, watch } from 'vue'

export type TokenKind = 'attacker' | 'defender' | 'ball'

export interface Token {
  id: string
  kind: TokenKind
  number?: number
  color: string
  radius: number
}

export interface Position { x: number; y: number }
export type Step = Record<string, Position>

// Deeper, more editorial palette. Punches against parchment court.
const ATTACKER_COLOR = '#a72c29'
const DEFENDER_COLOR = '#1d3557'
const BALL_COLOR = '#ff6b2c'

export const TOKENS: Token[] = [
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `a${i + 1}`,
    kind: 'attacker' as TokenKind,
    number: i + 1,
    color: ATTACKER_COLOR,
    radius: 20,
  })),
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `d${i + 1}`,
    kind: 'defender' as TokenKind,
    number: i + 1,
    color: DEFENDER_COLOR,
    radius: 20,
  })),
  { id: 'ball', kind: 'ball', color: BALL_COLOR, radius: 11 },
]

export const DEFAULT_FORMATION: Step = {
  a1: { x: 200, y: 540 },
  a2: { x: 305, y: 315 },
  a3: { x: 450, y: 285 },
  a4: { x: 595, y: 315 },
  a5: { x: 700, y: 540 },
  a6: { x: 395, y: 440 },
  a7: { x: 505, y: 440 },
  d1: { x: 285, y: 530 },
  d2: { x: 345, y: 450 },
  d3: { x: 410, y: 420 },
  d4: { x: 490, y: 420 },
  d5: { x: 555, y: 450 },
  d6: { x: 615, y: 530 },
  d7: { x: 450, y: 585 },
  ball: { x: 450, y: 285 },
}

const DURATION = 800

function cloneStep(s: Step): Step {
  const out: Step = {}
  for (const k in s) out[k] = { x: s[k].x, y: s[k].y }
  return out
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

const steps = reactive<Step[]>([cloneStep(DEFAULT_FORMATION)])
const currentIndex = ref(0)
const isPlaying = ref(false)
const isTweening = ref(false)

const displayed = reactive<Step>(cloneStep(DEFAULT_FORMATION))
const currentStep = computed(() => steps[currentIndex.value])

const nodeMap = new Map<string, any>()

export function registerNode(id: string, node: any | null) {
  if (node) nodeMap.set(id, node)
  else nodeMap.delete(id)
}

function anyLayer(): any | null {
  for (const n of nodeMap.values()) {
    const l = n.getLayer?.()
    if (l) return l
  }
  return null
}

let rafId: number | null = null
let tweenFrom: Step | null = null
let tweenTo: Step | null = null
let tweenStart = 0

function writeDisplayed(s: Step) {
  for (const id in s) {
    if (!displayed[id]) displayed[id] = { x: s[id].x, y: s[id].y }
    else {
      displayed[id].x = s[id].x
      displayed[id].y = s[id].y
    }
  }
}

watch(currentStep, (s) => {
  if (!isTweening.value) writeDisplayed(s)
})

function tick(now: number) {
  if (!tweenFrom || !tweenTo) return
  const elapsed = now - tweenStart
  const t = Math.min(1, elapsed / DURATION)
  const e = easeInOut(t)
  for (const id in tweenFrom) {
    const node = nodeMap.get(id)
    if (!node) continue
    const from = tweenFrom[id]
    const to = tweenTo[id]
    node.x(from.x + (to.x - from.x) * e)
    node.y(from.y + (to.y - from.y) * e)
  }
  anyLayer()?.batchDraw()
  if (t < 1) {
    rafId = requestAnimationFrame(tick)
  } else {
    rafId = null
    isTweening.value = false
    currentIndex.value = currentIndex.value + 1
    writeDisplayed(steps[currentIndex.value])
    if (isPlaying.value && currentIndex.value < steps.length - 1) {
      startTween()
    } else {
      isPlaying.value = false
    }
  }
}

function startTween() {
  if (currentIndex.value >= steps.length - 1) {
    isPlaying.value = false
    return
  }
  const target = steps[currentIndex.value + 1]
  const src: Step = {}
  for (const id in target) {
    const node = nodeMap.get(id)
    src[id] = node
      ? { x: node.x(), y: node.y() }
      : { ...steps[currentIndex.value][id] }
  }
  tweenFrom = src
  tweenTo = cloneStep(target)
  tweenStart = performance.now()
  isTweening.value = true
  rafId = requestAnimationFrame(tick)
}

function cancelTween() {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  tweenFrom = null
  tweenTo = null
  isTweening.value = false
}

function play() {
  if (currentIndex.value >= steps.length - 1) return
  isPlaying.value = true
  if (!isTweening.value) startTween()
}

function pause() {
  isPlaying.value = false
  cancelTween()
  for (const t of TOKENS) {
    const node = nodeMap.get(t.id)
    if (node && displayed[t.id]) {
      displayed[t.id].x = node.x()
      displayed[t.id].y = node.y()
    }
  }
}

function selectStep(i: number) {
  if (i < 0 || i >= steps.length) return
  cancelTween()
  isPlaying.value = false
  currentIndex.value = i
  writeDisplayed(steps[i])
}

function nextStep() { selectStep(currentIndex.value + 1) }
function prevStep() { selectStep(currentIndex.value - 1) }

function addStep() {
  cancelTween()
  isPlaying.value = false
  const snap = cloneStep(steps[currentIndex.value])
  steps.splice(currentIndex.value + 1, 0, snap)
  currentIndex.value += 1
  writeDisplayed(steps[currentIndex.value])
}

function deleteStep() {
  cancelTween()
  isPlaying.value = false
  if (steps.length <= 1) {
    steps.splice(0, steps.length, cloneStep(DEFAULT_FORMATION))
    currentIndex.value = 0
    writeDisplayed(steps[0])
    return
  }
  steps.splice(currentIndex.value, 1)
  if (currentIndex.value >= steps.length) currentIndex.value = steps.length - 1
  writeDisplayed(steps[currentIndex.value])
}

function clearAll() {
  cancelTween()
  isPlaying.value = false
  steps.splice(0, steps.length, cloneStep(DEFAULT_FORMATION))
  currentIndex.value = 0
  writeDisplayed(steps[0])
}

function updateTokenPosition(id: string, x: number, y: number) {
  if (isTweening.value) return
  steps[currentIndex.value][id] = { x, y }
  if (displayed[id]) {
    displayed[id].x = x
    displayed[id].y = y
  } else {
    displayed[id] = { x, y }
  }
}

export function usePlay() {
  return {
    steps, currentIndex, currentStep, displayed,
    isPlaying, isTweening,
    play, pause, selectStep, nextStep, prevStep,
    addStep, deleteStep, clearAll,
    updateTokenPosition, registerNode,
  }
}
