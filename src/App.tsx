import { Maze } from "@/components/Maze";
import { AppLayout, Footer, Header } from "@corbinmurray/ui-components";

export function App() {
  const appName = "asterius";

  // AppLayout handles all the min-heights, flexbox math, and
  // compensating for the Header's exact fixed height so things don't hide!
  return (
    <AppLayout
      header={<Header appName={appName} />}
      footer={<Footer appName={appName} />}
    >
      <div className="py-4 sm:py-6 lg:py-8">
        <section
          aria-label="About Asterius"
          className="pb-8 mb-8 border-b border-border"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
            Pathfinding, <span className="text-primary">visualized.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-5 max-w-3xl leading-relaxed">
            Asterius generates a random maze and lets you watch classic
            algorithms find a path through it — step by step. Pick a solver, hit
            Solve, and see how each strategy explores differently.
          </p>
          <div className="flex flex-wrap gap-3 mt-6" aria-label="How to use">
            <span className="inline-flex items-center gap-2 text-sm font-medium bg-muted text-foreground px-4 py-2 rounded-lg border border-border">
              <span aria-hidden="true">🧩</span> Pick a solver
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium bg-muted text-foreground px-4 py-2 rounded-lg border border-border">
              <span aria-hidden="true">▶</span> Solve
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium bg-muted text-foreground px-4 py-2 rounded-lg border border-border">
              <span aria-hidden="true">⚡</span> Speed
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium bg-muted text-foreground px-4 py-2 rounded-lg border border-border">
              <span aria-hidden="true">🔄</span> Re-generate
            </span>
          </div>
        </section>
        <Maze />
      </div>
    </AppLayout>
  );
}

export default App;
