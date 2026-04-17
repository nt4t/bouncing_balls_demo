# Bouncing Balls

A 3D physics simulation built with Three.js and Rapier 2D.

## Features

- Realistic gravity and collision physics
- Click anywhere to spawn colored balls
- Ground changes color when a ball hits it
- Toggle between perspective and isometric camera views
- Responsive full-screen canvas

## Tech Stack

- **Three.js** — 3D rendering
- **Rapier 2D** — Physics engine
- **Vite** — Build tool

## Getting Started

```bash
npm install
npm run dev
```

Open the local dev server URL in your browser.

## Build

```bash
npm run build
npm run preview
```

## How It Works

1. Three balls (red, green, blue) are spawned above a ground platform
2. Gravity pulls them down and they bounce off the ground
3. Click on the canvas to drop a new ball at that position
4. When a ball hits the ground, the ground adopts the ball's color
5. Press the camera toggle button to switch between perspective and isometric views
