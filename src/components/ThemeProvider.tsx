"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeColor = "purple" | "cyan" | "pink" | "green" | "amber" | "rose";
export type ThemeMode = "dark" | "light";

interface ThemeConfig {
  primary: string;
  primaryHover: string;
  accent: string;
  glow: string;
  gradient: string;
  particleColor: string;
}

interface ModeConfig {
  bg: string;
  bgSecondary: string;
  bgCard: string;
  text: string;
  textSecondary: string;
  border: string;
}

// ダークモード用（ビビッド）
export const darkThemeConfigs: Record<ThemeColor, ThemeConfig> = {
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

// ライトモード用（落ち着いた彩度）
export const lightThemeConfigs: Record<ThemeColor, ThemeConfig> = {
  purple: {
    primary: "rgb(109, 40, 217)",      // より深い紫
    primaryHover: "rgb(91, 33, 182)",
    accent: "rgb(139, 92, 246)",
    glow: "rgba(109, 40, 217, 0.25)",
    gradient: "from-purple-600 via-pink-600 to-cyan-600",
    particleColor: "109, 40, 217",
  },
  cyan: {
    primary: "rgb(14, 116, 144)",      // ティール寄り
    primaryHover: "rgb(17, 94, 122)",
    accent: "rgb(6, 148, 162)",
    glow: "rgba(14, 116, 144, 0.25)",
    gradient: "from-cyan-600 via-blue-600 to-purple-600",
    particleColor: "14, 116, 144",
  },
  pink: {
    primary: "rgb(190, 24, 93)",       // 深めのピンク
    primaryHover: "rgb(157, 23, 77)",
    accent: "rgb(219, 39, 119)",
    glow: "rgba(190, 24, 93, 0.25)",
    gradient: "from-pink-600 via-rose-600 to-orange-600",
    particleColor: "190, 24, 93",
  },
  green: {
    primary: "rgb(21, 128, 61)",       // 森の緑
    primaryHover: "rgb(22, 101, 52)",
    accent: "rgb(34, 160, 74)",
    glow: "rgba(21, 128, 61, 0.25)",
    gradient: "from-green-600 via-emerald-600 to-cyan-600",
    particleColor: "21, 128, 61",
  },
  amber: {
    primary: "rgb(180, 83, 9)",        // 琥珀色
    primaryHover: "rgb(146, 64, 14)",
    accent: "rgb(217, 119, 6)",
    glow: "rgba(180, 83, 9, 0.25)",
    gradient: "from-amber-600 via-orange-600 to-red-600",
    particleColor: "180, 83, 9",
  },
  rose: {
    primary: "rgb(190, 18, 60)",       // 深紅
    primaryHover: "rgb(159, 18, 57)",
    accent: "rgb(225, 29, 72)",
    glow: "rgba(190, 18, 60, 0.25)",
    gradient: "from-rose-600 via-red-600 to-orange-600",
    particleColor: "190, 18, 60",
  },
};

// 互換性のためのエイリアス
export const themeConfigs = darkThemeConfigs;

export const modeConfigs: Record<ThemeMode, ModeConfig> = {
  dark: {
    bg: "#050508",
    bgSecondary: "#0a0a0f",
    bgCard: "rgba(255, 255, 255, 0.03)",
    text: "#ffffff",
    textSecondary: "#9ca3af",
    border: "rgba(255, 255, 255, 0.1)",
  },
  light: {
    bg: "#f3f1ed",           // 暖かみのあるベージュ系
    bgSecondary: "#fbfaf8",  // パネル背景（オフホワイト）
    bgCard: "#ece8e2",       // カード背景（薄いベージュ）
    text: "#0f1b2d",         // 濃い紺色のテキスト
    textSecondary: "#4b5a6b", // グレー寄りのサブテキスト
    border: "#e0dbd3",       // 暖かみのあるボーダー
  },
};

interface ThemeContextType {
  theme: ThemeColor;
  mode: ThemeMode;
  setTheme: (theme: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  config: ThemeConfig;
  modeConfig: ModeConfig;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColor>("purple");
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("rajitan-theme") as ThemeColor | null;
    const savedMode = localStorage.getItem("rajitan-mode") as ThemeMode | null;
    if (savedTheme && themeConfigs[savedTheme]) {
      setThemeState(savedTheme);
    }
    if (savedMode && modeConfigs[savedMode]) {
      setModeState(savedMode);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("rajitan-theme", theme);
      localStorage.setItem("rajitan-mode", mode);

      // CSS変数を更新（モードに応じて色を切り替え）
      const colorConfig = mode === "dark" ? darkThemeConfigs[theme] : lightThemeConfigs[theme];
      const modeConfig = modeConfigs[mode];

      document.documentElement.style.setProperty("--theme-primary", colorConfig.primary);
      document.documentElement.style.setProperty("--theme-primary-hover", colorConfig.primaryHover);
      document.documentElement.style.setProperty("--theme-accent", colorConfig.accent);
      document.documentElement.style.setProperty("--theme-glow", colorConfig.glow);
      document.documentElement.style.setProperty("--theme-particle", colorConfig.particleColor);

      document.documentElement.style.setProperty("--mode-bg", modeConfig.bg);
      document.documentElement.style.setProperty("--mode-bg-secondary", modeConfig.bgSecondary);
      document.documentElement.style.setProperty("--mode-bg-card", modeConfig.bgCard);
      document.documentElement.style.setProperty("--mode-text", modeConfig.text);
      document.documentElement.style.setProperty("--mode-text-secondary", modeConfig.textSecondary);
      document.documentElement.style.setProperty("--mode-border", modeConfig.border);

      // body にクラスを追加
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(mode);
    }
  }, [theme, mode, mounted]);

  const setTheme = (newTheme: ThemeColor) => setThemeState(newTheme);
  const setMode = (newMode: ThemeMode) => setModeState(newMode);
  const toggleMode = () => setModeState(mode === "dark" ? "light" : "dark");

  const currentColorConfig = mode === "dark" ? darkThemeConfigs[theme] : lightThemeConfigs[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        setTheme,
        setMode,
        toggleMode,
        config: currentColorConfig,
        modeConfig: modeConfigs[mode],
        isDark: mode === "dark",
      }}
    >
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
