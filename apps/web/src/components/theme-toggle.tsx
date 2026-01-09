"use client";

export function ThemeToggle() {
  return (
    <button
      className="px-4 py-2 rounded border border-border bg-card"
      onClick={() => {
        document.documentElement.classList.toggle("dark");
      }}
    >
      Toggle theme
    </button>
  );
}
