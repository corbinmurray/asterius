# Asterius — Pathfinding, Visualized

**Asterius** is an interactive maze pathfinding visualizer built with **React 19**, **TypeScript**, and **Tailwind CSS v4**. It generates random mazes and animates classic graph-search algorithms solving them — step by step — so you can see exactly how each strategy explores.

🔗 **[Live Demo](https://corbinmurray.github.io/asterius/)**

---

## ✨ Features

- **Three pathfinding algorithms** — A*, BFS, and DFS — each with distinct exploration behaviors
- **Wilson's Algorithm** maze generation for provably uniform, perfect mazes
- **Step-by-step animation** with adjustable speed (1× to 10×)
- **Visual cell states** — unvisited, frontier, visited, and a gradient-colored solution path
- **Responsive layout** — sidebar controls on desktop, a bottom-sheet on mobile
- **Keyboard shortcut** — spacebar to toggle play/pause
- **Accessible** — ARIA labels, live regions for screen-reader announcements

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Animations | [Motion](https://motion.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |
| UI Components | `@corbinmurray/ui-components` (private GitHub Packages) |
| Build Tool | [Vite](https://vitejs.dev/) |

---

## 🧠 Algorithms

### Maze Generation — Wilson's Algorithm
Produces a **uniformly random spanning tree** via a loop-erased random walk. Every possible perfect maze is equally likely, and the result is always fully connected and solvable.

### Solvers

| Algorithm | Strategy | Optimal Path? |
|---|---|---|
| **A*** | Manhattan-distance heuristic guides search toward the goal | ✅ Yes |
| **BFS** | Level-by-level exploration guarantees fewest steps | ✅ Yes |
| **DFS** | Depth-first stack dives deep before backtracking — dramatic, not optimal | ❌ No |

---

## 🏗️ Architecture Highlights

- **RAF-based animation engine** — a custom `useAnimationEngine` hook drives step playback via `requestAnimationFrame`, with configurable intervals and frame-debt tracking to prevent burst animations after tab focus is restored.
- **Pre-computed solver steps** — solvers run synchronously up-front and emit an ordered array of steps. The animation engine replays those steps, cleanly separating algorithm logic from rendering.
- **Map-based cell state** — a `Map<string, CellState>` provides O(1) lookups across 441 cells without array scanning, keeping frame-to-frame updates fast.
- **Granular memoization** — `MazeCell` uses a custom memo comparator so only cells whose state actually changed re-render each animation frame.
- **CSS containment** — the grid sets `contain: layout style` to limit browser paint scope during high-frequency updates.

---

## 📦 Getting Started

### Prerequisites

This project consumes a private UI library (`@corbinmurray/ui-components`) published to GitHub Packages. You will need a [GitHub Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with `read:packages` scope.

1. Add the scoped registry to your local `.npmrc`:

   ```
   @corbinmurray:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:_authToken=YOUR_PAT_HERE
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Development

```bash
# Start the dev server (http://localhost:5173)
npm run dev

# Type-check & build for production
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

---

## 📄 License

MIT © [Corbin Murray](https://github.com/corbinmurray)
