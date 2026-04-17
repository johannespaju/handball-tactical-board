<script setup lang="ts">
import { usePlay } from '../composables/usePlay'

const { steps, currentIndex, isPlaying, selectStep } = usePlay()
</script>

<template>
  <div class="panel px-5 py-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="u-mono text-[10px] tracking-[0.28em] text-[rgba(246,236,210,0.5)]">SEQUENCE / FILMSTRIP</div>
        <div v-if="isPlaying" class="flex items-center gap-2 u-mono text-[10px] tracking-[0.28em] text-[var(--signal)]">
          <span class="rec-dot"></span>
          <span>PLAYING</span>
        </div>
      </div>
      <div class="u-mono text-[10px] tracking-[0.2em] text-[rgba(246,236,210,0.5)]">
        FRAME <span class="text-[var(--cream)]">{{ String(currentIndex + 1).padStart(2, '0') }}</span>
        / {{ String(steps.length).padStart(2, '0') }}
      </div>
    </div>

    <div class="relative overflow-x-auto">
      <!-- Track line -->
      <div class="absolute left-0 right-0 top-[22px] h-px bg-[rgba(246,236,210,0.12)]"></div>

      <div class="flex gap-3 pb-1 pt-1 relative">
        <button
          v-for="(_, i) in steps" :key="i"
          class="timeline-tick group flex flex-col items-center flex-shrink-0"
          @click="selectStep(i)"
        >
          <!-- Tick marker -->
          <div
            :class="[
              'w-[44px] h-[44px] border flex items-center justify-center relative transition-all',
              i === currentIndex
                ? 'border-[var(--signal)] bg-[rgba(255,107,44,0.12)] shadow-[0_0_0_3px_rgba(255,107,44,0.1)]'
                : 'border-[rgba(246,236,210,0.2)] bg-[rgba(20,18,14,0.6)] group-hover:border-[var(--cream)]'
            ]"
          >
            <span
              class="u-display text-lg"
              :class="i === currentIndex ? 'text-[var(--signal)]' : 'text-[var(--cream)]'"
            >{{ String(i + 1).padStart(2, '0') }}</span>
            <!-- Corner notches -->
            <span class="absolute -top-px -left-px w-1.5 h-1.5 border-t border-l"
              :class="i === currentIndex ? 'border-[var(--signal)]' : 'border-[rgba(246,236,210,0.3)]'"></span>
            <span class="absolute -bottom-px -right-px w-1.5 h-1.5 border-b border-r"
              :class="i === currentIndex ? 'border-[var(--signal)]' : 'border-[rgba(246,236,210,0.3)]'"></span>
          </div>
          <div class="u-mono text-[9px] tracking-[0.2em] mt-1"
            :class="i === currentIndex ? 'text-[var(--signal)]' : 'text-[rgba(246,236,210,0.4)]'">
            T+{{ i * 800 }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
