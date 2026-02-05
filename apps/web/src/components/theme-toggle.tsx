'use client';

export function ThemeToggle() {
  return (
    <button
      className="border-border bg-card rounded border px-4 py-2"
      onClick={() => {
        document.documentElement.classList.toggle('dark');
      }}
    >
      Toggle theme
    </button>
  );
}
