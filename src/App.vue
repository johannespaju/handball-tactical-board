<script setup lang="ts">
import TacticsBoard from './components/TacticsBoard.vue'
</script>

<template>
  <div class="min-h-screen w-full flex flex-col">
    <!-- Global header bar -->
    <header class="border-b border-[rgba(246,236,210,0.1)] px-8 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 bg-[var(--signal)] flex items-center justify-center">
          <span class="u-display text-[var(--ink)] text-lg leading-none">H</span>
        </div>
        <div>
          <div class="u-mono text-[10px] tracking-[0.3em] text-[var(--signal)]">DOSSIER / 07</div>
          <div class="u-display text-[var(--cream)] text-lg leading-none">Tactical Briefing</div>
        </div>
      </div>
      <div class="flex items-center gap-6 u-mono text-[10px] tracking-[0.2em] text-[rgba(246,236,210,0.6)]">
        <span>HANDBALL · HALF COURT</span>
        <span class="hidden md:inline">1M ≈ 30PX</span>
        <span class="stamp text-[var(--cream)]">Classified — Coach Eyes Only</span>
      </div>
    </header>

    <main class="flex-1 px-8 py-8">
      <TacticsBoard />
    </main>

    <footer class="border-t border-[rgba(246,236,210,0.1)] px-8 py-3 flex items-center justify-between u-mono text-[10px] tracking-[0.2em] text-[rgba(246,236,210,0.45)]">
      <span>FILE 01 · HALF-COURT SET PLAYS</span>
      <span>EST. 2026 · REV. A</span>
      <span>v1.0.0</span>
    </footer>
  </div>
</template>
