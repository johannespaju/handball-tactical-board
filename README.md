# Handball Tactical Board

Interactive tactical board for designing, animating, and exporting handball plays.

Live demo: https://jopaju-bolt.proxy.itcollege.ee/

## Features

- Drag-and-drop players and ball on a handball court
- Step-based play authoring with movable trajectories between steps
- Animated playback of multi-step plays
- Video export of the animated play
- Built-in court rendering with Konva canvas

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Konva / vue-konva for canvas rendering
- Tailwind CSS v4
- Nginx + Docker for deployment

## Development

```bash
npm install
npm run dev
```

Other scripts:

- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run typecheck` — run `vue-tsc` only

## Docker

```bash
docker compose up -d --build
```

The app is served by Nginx on port `8083` (mapped from container port `80`).

## Project Structure

```
src/
  components/
    TacticsBoard.vue   # Main board container
    Court.vue          # Court rendering
    Player.vue         # Player token
    ControlPanel.vue   # Playback / editing controls
    StepList.vue       # Step navigation
  composables/
    usePlay.ts         # Play state and step logic
    useVideoExport.ts  # Canvas-to-video export
```
