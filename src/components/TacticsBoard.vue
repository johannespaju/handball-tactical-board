<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { usePlay, TOKENS } from '../composables/usePlay'
import Court from './Court.vue'
import Player from './Player.vue'
import ControlPanel from './ControlPanel.vue'
import StepList from './StepList.vue'

const {
  steps, currentIndex, displayed, isTweening, isPlaying,
  updateTokenPosition, removePlayer,
  selectedTokenId, toggleTokenSelection, selectToken,
  nextStep, prevStep,
} = usePlay()

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  const el = e.target as HTMLElement | null
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
  if (isTweening.value || isPlaying.value) return
  if (e.key === 'ArrowLeft' && currentIndex.value > 0) {
    e.preventDefault()
    prevStep()
  } else if (e.key === 'ArrowRight' && currentIndex.value < steps.length - 1) {
    e.preventDefault()
    nextStep()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const stageConfig = { width: 900, height: 600 }

const arrows = computed(() => {
  if (isTweening.value || isPlaying.value) return []
  const i = currentIndex.value
  if (i <= 0) return []
  const prev = steps[i - 1]
  const cur = steps[i]
  const out: { id: string; points: number[]; kind: string }[] = []
  for (const t of TOKENS) {
    const a = prev[t.id]
    const b = cur[t.id]
    if (!a || !b) continue
    const dx = b.x - a.x
    const dy = b.y - a.y
    if (dx * dx + dy * dy < 25) continue
    out.push({ id: t.id, points: [a.x, a.y, b.x, b.y], kind: t.kind })
  }
  return out
})

function arrowColor(kind: string) {
  if (kind === 'ball') return 'rgba(255, 107, 44, 0.75)'
  if (kind === 'attacker') return 'rgba(167, 44, 41, 0.55)'
  return 'rgba(29, 53, 87, 0.55)'
}

function onTokenDragEnd(id: string, x: number, y: number) {
  updateTokenPosition(id, x, y)
}

function onTokenRemove(id: string) {
  removePlayer(id)
}

function onTokenSelect(id: string) {
  toggleTokenSelection(id)
}

function onStageClick(e: any) {
  // Clicked empty area (the stage itself) — deselect.
  if (e?.target === e?.target?.getStage?.()) selectToken(null)
}

const attackerCount = computed(() => TOKENS.filter(t => t.kind === 'attacker').length)
const defenderCount = computed(() => TOKENS.filter(t => t.kind === 'defender').length)
</script>

<template>
  <div class="max-w-[1400px] mx-auto grid grid-cols-[60px_1fr_300px] gap-6 items-stretch">
    <!-- Vertical left rail -->
    <aside class="flex flex-col items-center justify-between py-2">
      <div class="u-mono text-[10px] tracking-[0.3em] text-[rgba(246,236,210,0.5)] rotate-vertical">
        FIELD NOTES · HANDBALL TACTICS
      </div>
      <div class="flex flex-col items-center gap-3 u-mono text-[9px] tracking-[0.2em] text-[rgba(246,236,210,0.4)]">
        <div class="w-px h-16 bg-[rgba(246,236,210,0.18)]"></div>
        <span>N</span>
        <span class="text-[var(--signal)] text-base leading-none">▲</span>
        <span>S</span>
        <div class="w-px h-16 bg-[rgba(246,236,210,0.18)]"></div>
      </div>
      <div class="u-mono text-[10px] tracking-[0.3em] text-[rgba(246,236,210,0.5)] rotate-vertical">
        SECTOR · A ⋅ 01
      </div>
    </aside>

    <!-- Canvas column -->
    <section class="flex flex-col gap-4 stagger">
      <!-- Heading strip -->
      <div class="flex items-end justify-between">
        <div>
          <div class="u-mono text-[10px] tracking-[0.3em] text-[var(--signal)] mb-1">§ 01 · SET PLAY</div>
          <h1 class="u-display text-[56px] leading-[0.9] text-[var(--cream)]">
            The 3-3<span class="text-[var(--signal)]">/</span>6-0
          </h1>
          <p class="font-[Newsreader] italic text-[rgba(246,236,210,0.7)] mt-2 max-w-md">
            Offensive build-up against a flat six. Mark a formation, capture
            a frame, watch the attack unfold in eight hundred millisecond beats.
          </p>
        </div>
        <div class="text-right u-mono text-[10px] tracking-[0.22em] text-[rgba(246,236,210,0.55)] space-y-1">
          <div>ATTACKERS <span class="text-[var(--cream)]">{{ attackerCount }}</span></div>
          <div>DEFENDERS <span class="text-[var(--cream)]">{{ defenderCount }}</span></div>
          <div>PIVOT POSITIONS <span class="text-[var(--cream)]">2</span></div>
          <div class="pt-1 border-t border-[rgba(246,236,210,0.15)]">20M × 20M</div>
        </div>
      </div>

      <!-- Court stage -->
      <div class="court-frame">
        <span class="corner-tr"></span>
        <span class="corner-bl"></span>
        <v-stage :config="stageConfig" @click="onStageClick" @tap="onStageClick">
          <v-layer :config="{ listening: false }">
            <Court />
            <v-arrow v-for="a in arrows" :key="a.id" :config="{
              points: a.points,
              stroke: arrowColor(a.kind),
              fill: arrowColor(a.kind),
              strokeWidth: 2,
              pointerLength: 9,
              pointerWidth: 9,
              dash: a.kind === 'ball' ? undefined : [8, 4],
            }" />
          </v-layer>
          <v-layer>
            <Player v-for="t in TOKENS" :key="t.id"
              :token="t"
              :position="displayed[t.id]"
              :draggable="!isTweening && !isPlaying"
              :selected="selectedTokenId === t.id"
              @dragend="onTokenDragEnd"
              @remove="onTokenRemove"
              @select="onTokenSelect"
            />
          </v-layer>
        </v-stage>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-6 u-mono text-[10px] tracking-[0.22em] text-[rgba(246,236,210,0.6)]">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-[#a72c29]"></span>
          <span>ATTACK</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-[#1d3557]"></span>
          <span>DEFENCE</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-[var(--signal)]"></span>
          <span>BALL</span>
        </div>
        <div class="flex-1 border-t border-dashed border-[rgba(246,236,210,0.15)]"></div>
        <div>EASE · CUBIC IN-OUT · 800MS</div>
      </div>

      <!-- Step list -->
      <StepList />
    </section>

    <!-- Right panel -->
    <aside class="panel p-5 flex flex-col gap-5 self-start stagger">
      <!-- Status -->
      <div>
        <div class="flex items-center justify-between">
          <span class="stamp text-[var(--signal)]">LIVE</span>
          <span class="u-mono text-[10px] tracking-[0.2em] text-[rgba(246,236,210,0.5)]">COACH · KP</span>
        </div>
        <h2 class="u-display text-[28px] leading-none mt-3 text-[var(--cream)]">Command<br/>Console</h2>
        <p class="font-[Newsreader] italic text-xs text-[rgba(246,236,210,0.55)] mt-2 leading-relaxed">
          Drag tokens on the court. Capture a frame. Repeat.
        </p>
      </div>

      <div class="border-t border-dashed border-[rgba(246,236,210,0.14)]"></div>

      <ControlPanel />

      <div class="border-t border-dashed border-[rgba(246,236,210,0.14)]"></div>

      <!-- Meta readout -->
      <div class="grid grid-cols-2 gap-3 u-mono text-[10px] tracking-[0.2em]">
        <div>
          <div class="text-[rgba(246,236,210,0.4)]">FRAMES</div>
          <div class="text-[var(--cream)] text-xl u-display mt-1">{{ String(steps.length).padStart(2, '0') }}</div>
        </div>
        <div>
          <div class="text-[rgba(246,236,210,0.4)]">DURATION</div>
          <div class="text-[var(--cream)] text-xl u-display mt-1">{{ (steps.length - 1) * 1.5 }}S</div>
        </div>
        <div>
          <div class="text-[rgba(246,236,210,0.4)]">CURRENT</div>
          <div class="text-[var(--signal)] text-xl u-display mt-1">#{{ String(currentIndex + 1).padStart(2, '0') }}</div>
        </div>
        <div>
          <div class="text-[rgba(246,236,210,0.4)]">STATE</div>
          <div class="text-[var(--cream)] text-xl u-display mt-1">
            {{ isPlaying ? 'RUN' : (isTweening ? 'MID' : 'SET') }}
          </div>
        </div>
      </div>

      <div class="mt-auto pt-3 border-t border-[rgba(246,236,210,0.1)] u-mono text-[9px] tracking-[0.25em] text-[rgba(246,236,210,0.35)]">
        DOSSIER RENDERED · KONVA + VUE
      </div>
    </aside>
  </div>
</template>
