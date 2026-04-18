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

function makePlayer(kind: 'attacker' | 'defender', number: number): Token {
  return {
    id: `${kind[0]}${number}`,
    kind,
    number,
    color: kind === 'attacker' ? ATTACKER_COLOR : DEFENDER_COLOR,
    radius: 20,
  }
}

export const TOKENS = reactive<Token[]>([
  ...Array.from({ length: 6 }, (_, i) => makePlayer('attacker', i + 1)),
  ...Array.from({ length: 6 }, (_, i) => makePlayer('defender', i + 1)),
  { id: 'ball', kind: 'ball', color: BALL_COLOR, radius: 11 },
])

// Court geometry: 30px = 1m. Goal line y=600. Posts at x=405 and x=495.
// 6m line = quarter arcs r=180 from each post joined by straight at y=420.
// 9m line = same shape at r=270 / straight at y=330.
export const DEFAULT_FORMATION: Step = {
  // Attack 3-3: wings, three backs, pivot
  a1: { x: 210, y: 505 }, // left wing
  a2: { x: 310, y: 280 }, // left back
  a3: { x: 450, y: 255 }, // centre back (playmaker)
  a4: { x: 590, y: 280 }, // right back
  a5: { x: 690, y: 505 }, // right wing
  a6: { x: 450, y: 405 }, // pivot, just above 6m straight
  // Defence 6-0 sitting just outside the 6m line
  d1: { x: 235, y: 520 },
  d2: { x: 300, y: 448 },
  d3: { x: 425, y: 412 },
  d4: { x: 475, y: 412 },
  d5: { x: 600, y: 448 },
  d6: { x: 665, y: 520 },
  ball: { x: 450, y: 255 },
}

const ATTACKER_SPAWN: Position = { x: 450, y: 220 }
const DEFENDER_SPAWN: Position = { x: 450, y: 500 }

const DURATION = 1500

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
const selectedTokenId = ref<string | null>(null)

function selectToken(id: string | null) {
  selectedTokenId.value = id
}

function toggleTokenSelection(id: string) {
  selectedTokenId.value = selectedTokenId.value === id ? null : id
}
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
let tweenTargetIndex = -1

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
    currentIndex.value = tweenTargetIndex
    writeDisplayed(steps[currentIndex.value])
    if (isPlaying.value && currentIndex.value < steps.length - 1) {
      startTween(currentIndex.value + 1)
    } else {
      isPlaying.value = false
    }
  }
}

function startTween(targetIndex: number = currentIndex.value + 1) {
  if (targetIndex < 0 || targetIndex >= steps.length || targetIndex === currentIndex.value) {
    isPlaying.value = false
    return
  }
  const target = steps[targetIndex]
  const src: Step = {}
  for (const id in target) {
    const node = nodeMap.get(id)
    src[id] = node
      ? { x: node.x(), y: node.y() }
      : { ...steps[currentIndex.value][id] }
  }
  tweenFrom = src
  tweenTo = cloneStep(target)
  tweenTargetIndex = targetIndex
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
  if (steps.length <= 1) return
  cancelTween()
  // Snap instantly to frame 0 (no interpolation) so the play always starts from the opening formation.
  currentIndex.value = 0
  writeDisplayed(steps[0])
  for (const id in steps[0]) {
    const node = nodeMap.get(id)
    if (node) {
      node.x(steps[0][id].x)
      node.y(steps[0][id].y)
    }
  }
  anyLayer()?.batchDraw()
  isPlaying.value = true
  startTween(1)
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

function nextStep() {
  if (isTweening.value || isPlaying.value) return
  const target = currentIndex.value + 1
  if (target >= steps.length) return
  startTween(target)
}
function prevStep() {
  if (isTweening.value || isPlaying.value) return
  const target = currentIndex.value - 1
  if (target < 0) return
  startTween(target)
}

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
    clearAll()
    return
  }
  steps.splice(currentIndex.value, 1)
  if (currentIndex.value >= steps.length) currentIndex.value = steps.length - 1
  writeDisplayed(steps[currentIndex.value])
}

function clearAll() {
  cancelTween()
  isPlaying.value = false
  // Restore the default roster so any previously-deleted tokens come back.
  const defaults: Token[] = [
    ...Array.from({ length: 6 }, (_, i) => makePlayer('attacker', i + 1)),
    ...Array.from({ length: 6 }, (_, i) => makePlayer('defender', i + 1)),
    { id: 'ball', kind: 'ball', color: BALL_COLOR, radius: 11 },
  ]
  for (const t of TOKENS) {
    if (!defaults.some(d => d.id === t.id)) registerNode(t.id, null)
  }
  TOKENS.splice(0, TOKENS.length, ...defaults)
  const base = cloneStep(DEFAULT_FORMATION)
  steps.splice(0, steps.length, base)
  currentIndex.value = 0
  // Drop stale displayed entries for tokens no longer present.
  for (const id in displayed) {
    if (!base[id]) delete displayed[id]
  }
  writeDisplayed(steps[0])
  selectedTokenId.value = null
}

function addPlayer(kind: 'attacker' | 'defender') {
  cancelTween()
  isPlaying.value = false
  const sameKind = TOKENS.filter(t => t.kind === kind)
  const maxNum = sameKind.reduce((m, t) => Math.max(m, t.number ?? 0), 0)
  const number = maxNum + 1
  const token = makePlayer(kind, number)
  // Avoid id collision if a player with this number previously existed and was replaced.
  if (TOKENS.some(t => t.id === token.id)) {
    let n = number
    while (TOKENS.some(t => t.id === `${kind[0]}${n}`)) n++
    token.id = `${kind[0]}${n}`
    token.number = n
  }
  const ballIndex = TOKENS.findIndex(t => t.kind === 'ball')
  const insertAt = ballIndex === -1 ? TOKENS.length : ballIndex
  TOKENS.splice(insertAt, 0, token)
  const spawn = kind === 'attacker' ? ATTACKER_SPAWN : DEFENDER_SPAWN
  for (const step of steps) {
    step[token.id] = { x: spawn.x, y: spawn.y }
  }
  displayed[token.id] = { x: spawn.x, y: spawn.y }
}

function removePlayer(id: string) {
  if (id === 'ball') return
  cancelTween()
  isPlaying.value = false
  const idx = TOKENS.findIndex(t => t.id === id)
  if (idx === -1) return
  TOKENS.splice(idx, 1)
  for (const step of steps) delete step[id]
  delete displayed[id]
  registerNode(id, null)
  if (selectedTokenId.value === id) selectedTokenId.value = null
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
    addPlayer, removePlayer,
    selectedTokenId, selectToken, toggleTokenSelection,
    updateTokenPosition, registerNode,
  }
}
