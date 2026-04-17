<script setup lang="ts">
import { usePlay } from '../composables/usePlay'

const {
  isPlaying, currentIndex, steps,
  play, pause, nextStep, prevStep,
  addStep, deleteStep, clearAll,
} = usePlay()

function handleClear() {
  if (confirm('Clear all steps and reset to the default formation?')) clearAll()
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Playback block -->
    <div>
      <div class="u-mono text-[10px] tracking-[0.28em] text-[rgba(246,236,210,0.5)] mb-2">PLAYBACK</div>
      <div class="grid grid-cols-2 gap-2">
        <button class="btn-tac btn-primary" :disabled="isPlaying || currentIndex >= steps.length - 1" @click="play">
          <span>▶</span><span>Play</span>
        </button>
        <button class="btn-tac" :disabled="!isPlaying" @click="pause">
          <span>❙❙</span><span>Pause</span>
        </button>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-2">
        <button class="btn-tac" :disabled="currentIndex <= 0" @click="prevStep">← Prev</button>
        <button class="btn-tac" :disabled="currentIndex >= steps.length - 1" @click="nextStep">Next →</button>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-dashed border-[rgba(246,236,210,0.14)]"></div>

    <!-- Recording block -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="u-mono text-[10px] tracking-[0.28em] text-[rgba(246,236,210,0.5)]">FRAME CONTROL</div>
        <div class="u-mono text-[10px] tracking-[0.2em] text-[var(--signal)]">ACTIVE</div>
      </div>
      <button class="btn-tac btn-primary w-full mb-2" @click="addStep">+ Capture Frame</button>
      <div class="grid grid-cols-2 gap-2">
        <button class="btn-tac" @click="deleteStep">Delete</button>
        <button class="btn-tac btn-danger" @click="handleClear">Reset</button>
      </div>
    </div>
  </div>
</template>
