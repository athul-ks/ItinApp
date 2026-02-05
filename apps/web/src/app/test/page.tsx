import { ThemeToggle } from '@/components/theme-toggle';

export default function Page() {
  return (
    <div className="bg-background text-foreground min-h-screen p-10 font-sans">
      <ThemeToggle />

      {/* HEADER SECTION */}
      <header className="mt-4 mb-12">
        <h1 className="text-primary mb-2 font-serif text-4xl font-bold">The Modern Voyager</h1>
        <p className="text-muted-foreground text-lg">Theme Verification Dashboard</p>
      </header>

      <main className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* 1. BUTTONS & ACCENTS */}
        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold">Buttons & Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 shadow transition">
              Primary Action
            </button>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-6 py-2 shadow transition">
              Secondary Action
            </button>
            <button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-6 py-2 shadow transition">
              Destructive
            </button>
            <button className="border-input hover:bg-accent hover:text-accent-foreground rounded-md border bg-white px-6 py-2 shadow-sm transition">
              Outline / Ghost
            </button>
          </div>
        </section>

        {/* 2. CARDS & SHADOWS */}
        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold">Cards & Shadows</h2>
          <div className="bg-card text-card-foreground border-border rounded-lg border p-6 shadow-md">
            <h3 className="mb-2 text-xl font-bold">Trip to Amalfi Coast</h3>
            <p className="text-muted-foreground mb-4">
              This card uses your custom &quot;Deep Slate&quot; shadow and &quot;Mist White&quot;
              background.
            </p>
            <div className="bg-muted h-2 w-full overflow-hidden rounded">
              <div className="bg-primary h-full w-2/3"></div>
            </div>
          </div>
        </section>

        {/* 3. CHART COLORS */}
        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold">Chart Palette</h2>
          <div className="grid grid-cols-5 gap-2 text-center font-mono text-xs text-white">
            <div className="bg-chart-1 rounded p-4">Chart 1</div>
            <div className="bg-chart-2 rounded p-4">Chart 2</div>
            <div className="bg-chart-3 rounded p-4">Chart 3</div>
            <div className="bg-chart-4 rounded p-4">Chart 4</div>
            <div className="bg-chart-5 rounded p-4">Chart 5</div>
          </div>
        </section>

        {/* 4. TYPOGRAPHY CHECK */}
        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold">Typography</h2>
          <div className="space-y-2">
            <p className="font-sans text-lg">
              <span className="text-muted-foreground font-bold">Inter (UI):</span> The quick brown
              fox jumps over the lazy dog.
            </p>
            <p className="text-primary font-serif text-2xl italic">
              <span className="text-muted-foreground mb-1 block font-sans text-sm font-bold not-italic">
                Playfair Display (Headers):
              </span>
              &quot;Paris is always a good idea.&quot;
            </p>
            <p className="bg-muted rounded p-2 font-mono text-sm">
              <span className="text-muted-foreground mb-1 block font-sans font-bold">
                JetBrains Mono (Code):
              </span>
              FLIGHT_NUM: &quot;BA-149&quot;
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
