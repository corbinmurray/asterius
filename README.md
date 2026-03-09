# Asterius

Asterius is an interactive maze pathfinding visualizer. It generates a random maze and lets you watch classic algorithms find a path through it, one step at a time. Swap algorithms, adjust speed, and regenerate the maze to see how each strategy explores differently.

**[Live Demo](https://corbinmurray.github.io/asterius/)**

---

## Tech Stack

| | |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Animations | [Motion](https://motion.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |
| UI Components | `@corbinmurray/ui-components` (private GitHub Packages) |
| Build Tool | [Vite](https://vitejs.dev/) |

---

## Algorithms

Mazes are generated using [Wilson's Algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Wilson's_algorithm), which produces a uniformly random spanning tree via a loop-erased random walk. Every maze is guaranteed to be solvable with a unique path between any two cells.

The following pathfinding algorithms are currently supported:

| Algorithm | Strategy | Shortest Path |
|---|---|---|
| A* | Uses Manhattan distance as a heuristic to guide the search toward the goal | Yes |
| BFS | Explores neighbors level by level | Yes |
| DFS | Explores as deep as possible before backtracking | No |

---

## Under the Hood

A few things worth noting for anyone reading the source:

- Solvers run up-front and produce an ordered list of steps. The animation engine replays those steps independently, so algorithm logic and rendering stay separate.
- Cell state is tracked in a `Map<string, CellState>`, which keeps per-frame lookups fast as the grid scales.
- `MazeCell` uses a custom memo comparator so only cells whose state changed actually re-render during playback.
- The animation engine uses `requestAnimationFrame` with frame-debt tracking to handle cases like tab switching without causing burst updates.

---

## Getting Started

This project depends on a private UI library (`@corbinmurray/ui-components`) published to GitHub Packages. You'll need a [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with `read:packages` scope before installing.

1. Add the scoped registry to your local `.npmrc`:

   ```
   @corbinmurray:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:_authToken=YOUR_PAT_HERE
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Other scripts:

```bash
npm run build    # type-check and build for production
npm run preview  # preview the production build locally
npm run lint     # lint
```

---

## License

MIT © [Corbin Murray](https://github.com/corbinmurray)
