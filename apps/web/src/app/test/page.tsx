import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground p-10 font-sans">
      <ThemeToggle />

      {/* HEADER SECTION */}
      <header className="mb-12 mt-4">
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">
          The Modern Voyager
        </h1>
        <p className="text-muted-foreground text-lg">
          Theme Verification Dashboard
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 1. BUTTONS & ACCENTS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">
            Buttons & Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md shadow hover:bg-primary/90 transition">
              Primary Action
            </button>
            <button className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md shadow hover:bg-secondary/90 transition">
              Secondary Action
            </button>
            <button className="bg-destructive text-destructive-foreground px-6 py-2 rounded-md shadow hover:bg-destructive/90 transition">
              Destructive
            </button>
            <button className="bg-white border border-input px-6 py-2 rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground transition">
              Outline / Ghost
            </button>
          </div>
        </section>

        {/* 2. CARDS & SHADOWS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">
            Cards & Shadows
          </h2>
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-xl font-bold mb-2">Trip to Amalfi Coast</h3>
            <p className="text-muted-foreground mb-4">
              This card uses your custom &quot;Deep Slate&quot; shadow and
              &quot;Mist White&quot; background.
            </p>
            <div className="h-2 w-full bg-muted rounded overflow-hidden">
              <div className="h-full bg-primary w-2/3"></div>
            </div>
          </div>
        </section>

        {/* 3. CHART COLORS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">
            Chart Palette
          </h2>
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono text-white">
            <div className="bg-chart-1 p-4 rounded">Chart 1</div>
            <div className="bg-chart-2 p-4 rounded">Chart 2</div>
            <div className="bg-chart-3 p-4 rounded">Chart 3</div>
            <div className="bg-chart-4 p-4 rounded">Chart 4</div>
            <div className="bg-chart-5 p-4 rounded">Chart 5</div>
          </div>
        </section>

        {/* 4. TYPOGRAPHY CHECK */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">Typography</h2>
          <div className="space-y-2">
            <p className="font-sans text-lg">
              <span className="font-bold text-muted-foreground">
                Inter (UI):
              </span>{" "}
              The quick brown fox jumps over the lazy dog.
            </p>
            <p className="font-serif text-2xl italic text-primary">
              <span className="font-bold text-muted-foreground text-sm not-italic font-sans block mb-1">
                Playfair Display (Headers):
              </span>
              &quot;Paris is always a good idea.&quot;
            </p>
            <p className="font-mono text-sm bg-muted p-2 rounded">
              <span className="font-bold text-muted-foreground font-sans block mb-1">
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
