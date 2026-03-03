# corbinmurray.dev

A high-performance personal portfolio and engineering showcase built with **React 19**, **Tailwind CSS v4**, and **Motion**.

This project serves as a living document of my technical expertise and architectural philosophy. It prioritizes clean code, responsive design, and a "soft-surface" aesthetic designed for high readability.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (utilizing high-performance `@theme` blocks)
- **Animations**: [Motion](https://www.framer.com/motion/) (orchestrated stagger reveals and layout transitions)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Architecture**: custom component library consumed from a private GitHub Packages registry.
- **Build Tool**: [Vite](https://vitejs.dev/)

## 🛠️ Performance & Architecture

- **Lazy-Loaded Sections**: Below-the-fold content is streamed via `Suspense` and `React.lazy` to maintain a sub-second "Lighthouse Perfect" initial load.
- **Hash-Routing Resilience**: Custom React hooks handle the transition between lazy-loaded boundaries to ensure that deep links (e.g., `/#contact`) remain accurate even during network streaming.
- **Data-Driven UI**: Sections like Projects and Experience are driven by local data arrays, making the portfolio trivially extensible without the overhead of an external CMS.

## 📦 Getting Started

### Prerequisites

This project consumes a private UI library (`@corbinmurray/ui-components`). You will need a GitHub Personal Access Token (PAT) with `read:packages` permissions.

1. Create a local `.npmrc` file:

   ```bash
   @corbinmurray:registry=https://npm.pkg.github.com/
   ```

2. Authenticate with GitHub:

   ```bash
   npm login --registry=https://npm.pkg.github.com/
   ```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📄 License

MIT © [Corbin Murray](https://github.com/corbinmurray)
