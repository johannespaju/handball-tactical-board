# Handball Tactics Board — Build Prompt

Build a handball tactics board web app using **Vue 3 (Vite) + vue-konva + Tailwind CSS**.

## Core concept
A coach or captain (user) arranges players and a ball on a handball half-court, records a sequence of positions step by step, then plays it back as an animation. Think whiteboard tool for drawing plays.

## Build order (verify each before moving on)
1. Static court rendering
2. Draggable players + ball in default formation
3. Step recording + step list UI
4. Playback animation + step navigation
5. Movement arrows (nice-to-have, last)

## Canvas & court
- Canvas: 900×600px, court rendered programmatically with Konva shapes (no image files)
- Use a square 600×600 region centered horizontally for the court itself; leave ~150px margin on each side for visual breathing room. Court represents a 20m × 20m half-court, so 1m ≈ 30px.
- Court elements, all drawn with Konva `Line`, `Arc`, `Rect`:
  - Outer court boundary
  - Goal (small rectangle at the goal line, centered)
  - 6m line (solid arc from goal)
  - 9m line (dashed arc from goal — use `dash: [10, 5]`)
  - Center line (top edge of half-court)
- Court background: light neutral (e.g., `#f5f5f0`), lines dark gray/black, ~2px stroke

## Players & ball
- **7 attackers**: red circles (`#dc2626`), numbered 1–7, radius 22px
- **7 defenders**: blue circles (`#2563eb`), numbered 1–7, radius 22px
- **1 ball**: orange circle (`#f97316`), radius 14px
- Numbers rendered as white text, centered, bold, ~16px
- All draggable via Konva's `draggable: true`
- Z-order (bottom → top): court lines, movement arrows, players, ball

## Default formation (on app load)
- **Attackers** in standard 3-3 outside the 9m line: left wing, left back, center back, right back, right wing, plus line player (pivot) near the 6m arc
- **Defenders** in 6-0 along the 6m arc: evenly spaced
- **Ball** starts at the center back's position
- Exact coordinates can be approximate — just make it look like a recognizable handball setup

## Step recording
- **"Add Step"** button: snapshots current x/y of all 12 players + ball as a new frame appended to the steps array
- Step 1 is auto-created from the default formation on app load
- Steps shown as a numbered list below or beside the canvas; clicking a step loads those positions onto the canvas
- Selecting a step and dragging players **updates that step in place** (live edit)
- **"Delete Step"**: removes the currently selected step. If it's the only step, reset to default formation and keep it as Step 1.
- **"Clear All"**: wipes all steps and resets to default formation as Step 1 (confirm dialog)

## Playback
- **"Play"**: animates smoothly between steps in sequence using Konva `Tween`, 800ms per transition, `Konva.Easings.EaseInOut`
- **"Pause"**: stops at current tween position; pressing Play again resumes from there
- **← / →** buttons: jump to previous/next step instantly (no animation)
- During playback, highlight the currently-animating step in the list

## Movement arrows
- When a step is displayed (not during initial load of Step 1), draw faint arrows from each player's previous-step position to current position
- Style: semi-transparent gray (`rgba(75, 85, 99, 0.4)`), 2px, simple line with small arrowhead
- Skip arrows for players that didn't move (distance < 5px)
- Arrows hidden during active tweening, shown once the step settles

## UI layout
- Canvas on the left/center
- Right-side controls panel (~250px wide): Play, Pause, ←, →, Add Step, Delete Step, Clear All
- Step list below the controls or below the canvas — numbered buttons, highlight selected
- Tailwind for all non-canvas UI; clean, minimal, good spacing, rounded buttons, hover states

## Technical requirements
- Vue 3 Composition API everywhere (`<script setup>`)
- `vue-konva` for all canvas work
- State in a single composable `usePlay.js` — no Pinia
- Suggested file layout:
  - `src/components/Court.vue` — static court rendering
  - `src/components/Player.vue` — reusable draggable token (players + ball)
  - `src/components/TacticsBoard.vue` — Konva stage, wires everything together
  - `src/components/ControlPanel.vue` — buttons
  - `src/components/StepList.vue` — step selector
  - `src/composables/usePlay.js` — steps array, current step index, playback state, add/delete/clear logic
- No backend, no database, no accounts, no mobile/touch, no team management

## Done when
- `npm run dev` starts cleanly with no console errors
- Court renders with all lines and arcs in correct proportions
- 14 players + ball appear in recognizable default formation
- Dragging any token updates its position smoothly
- Add Step → drag some players → Add Step → Play animates between them at 800ms/step
- Clicking a step loads that position; dragging while selected updates it
- ← / → navigation works; Delete Step and Clear All behave as specified
- Movement arrows appear between steps when not animating

Keep it simple — one screen, one court, one set of controls.