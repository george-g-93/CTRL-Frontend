import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeCtx = createContext({ theme: "system", setTheme: () => {}, toggleTheme: () => {} });

const THEME_KEY = "theme"; // "light" | "dark" | "system"

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "system";
    return localStorage.getItem(THEME_KEY) || "system";
  });

  // Apply theme to <html> and keep in storage
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const effective = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

    root.classList.toggle("dark", effective === "dark");
    root.style.colorScheme = effective; // helps native UI (forms, scrollbars)
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Update on system change if using "system"
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!m) return;
    const handler = () => {
      setTheme((t) => (t === "system" ? "system" : t)); // triggers effect to re-apply scheme
    };
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
