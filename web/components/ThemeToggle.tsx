"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full border border-border-hairline bg-surface flex items-center justify-center opacity-50" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-8 h-8 rounded-full border border-border-hairline bg-surface/80 hover:bg-accent-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-150 active:scale-95"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 stroke-[1.75]" />
      ) : (
        <Moon className="w-4 h-4 text-text-secondary stroke-[1.75]" />
      )}
    </button>
  );
}
