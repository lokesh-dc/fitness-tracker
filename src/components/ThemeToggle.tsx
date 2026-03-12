"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-12 glass rounded-2xl" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="glass-button w-12 h-12 rounded-2xl border-foreground/10 hover:border-orange-500 transition-all duration-300 group"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
      ) : (
        <Moon className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
