"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeColor = "purple" | "cyan" | "pink" | "green" | "amber" | "rose";

interface ThemeConfig {
  primary: string;
  primaryHover: string;
  accent: string;
  glow: string;
  gradient: string;
  particleColor: string;
}

export const themeConfigs: Record<ThemeColor, ThemeConfig> = {
  purple: {
    primary: "rgb(168, 85, 247)",
    primaryHover: "rgb(147, 51, 234)",
    accent: "rgb(192, 132, 252)",
    glow: "rgba(168, 85, 247, 0.5)",
    gradient: "from-purple-500 via-pink-500 to-cyan-500",
    particleColor: "168, 85, 247",
  },
  cyan: {
    primary: "rgb(6, 182, 212)",
    primaryHover: "rgb(8, 145, 178)",
    accent: "rgb(103, 232, 249)",
    glow: "rgba(6, 182, 212, 0.5)",
    gradient: "from-cyan-500 via-blue-500 to-purple-500",
    particleColor: "6, 182, 212",
  },
  pink: {
    primary: "rgb(236, 72, 153)",
    primaryHover: "rgb(219, 39, 119)",
    accent: "rgb(244, 114, 182)",
    glow: "rgba(236, 72, 153, 0.5)",
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    particleColor: "236, 72, 153",
  },
  green: {
    primary: "rgb(34, 197, 94)",
    primaryHover: "rgb(22, 163, 74)",
    accent: "rgb(74, 222, 128)",
    glow: "rgba(34, 197, 94, 0.5)",
    gradient: "from-green-500 via-emerald-500 to-cyan-500",
    particleColor: "34, 197, 94",
  },
  amber: {
    primary: "rgb(245, 158, 11)",
    primaryHover: "rgb(217, 119, 6)",
    accent: "rgb(251, 191, 36)",
    glow: "rgba(245, 158, 11, 0.5)",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    particleColor: "245, 158, 11",
  },
  rose: {
    primary: "rgb(244, 63, 94)",
    primaryHover: "rgb(225, 29, 72)",
    accent: "rgb(251, 113, 133)",
    glow: "rgba(244, 63, 94, 0.5)",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    particleColor: "244, 63, 94",
  },
};

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColor>("purple");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("rajitan-theme") as ThemeColor | null;
    if (saved && themeConfigs[saved]) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("rajitan-theme", theme);
      // CSS変数を更新
      const config = themeConfigs[theme];
      document.documentElement.style.setProperty("--theme-primary", config.primary);
      document.documentElement.style.setProperty("--theme-primary-hover", config.primaryHover);
      document.documentElement.style.setProperty("--theme-accent", config.accent);
      document.documentElement.style.setProperty("--theme-glow", config.glow);
      document.documentElement.style.setProperty("--theme-particle", config.particleColor);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeColor) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config: themeConfigs[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
