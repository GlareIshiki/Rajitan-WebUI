"use client";

import { ProgressRing } from "./ui/ProgressRing";
import { formatXP } from "@/lib/levemagi/xp";
import { getAchievementTitle } from "@/lib/levemagi/constants";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  level: number;
  totalXP: number;
  xpProgress: { current: number; required: number; progress: number };
  gachaTickets: number;
}

export function TabNavigation({ tabs, activeTab, onTabChange, level, totalXP, xpProgress, gachaTickets }: TabNavigationProps) {
  // プロフィールは下部に分離
  const mainTabs = tabs.filter((t) => t.id !== "profile");
  const profileTab = tabs.find((t) => t.id === "profile");

  return (
    <>
      {/* デスクトップ: 左サイドバー */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-56 flex-col bg-app border-r border-panel z-30">
        {/* レベル + XP */}
        <div className="p-4 border-b border-panel">
          <div className="flex items-center gap-3">
            <ProgressRing percentage={level >= 100 ? 100 : xpProgress.progress} size={48} strokeWidth={3}>
              <span className="text-sm font-bold text-accent">{level}</span>
            </ProgressRing>
            <div className="min-w-0">
              <div className="text-xs text-muted">Lv.{level}</div>
              <div className="text-sm font-bold text-accent truncate">{getAchievementTitle(level)}</div>
              <div className="text-xs text-muted">{formatXP(totalXP)} XP</div>
            </div>
          </div>
        </div>

        {/* ナビアイテム */}
        <nav className="flex-1 py-2 overflow-y-auto scrollbar-themed">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-accent/15 text-accent border-r-2 border-accent font-medium"
                  : "text-muted hover:text-primary hover:bg-panel"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* 下部: プロフィール + ガチャ */}
        <div className="border-t border-panel">
          {profileTab && (
            <button
              onClick={() => onTabChange(profileTab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                activeTab === profileTab.id
                  ? "bg-accent/15 text-accent border-r-2 border-accent font-medium"
                  : "text-muted hover:text-primary hover:bg-panel"
              }`}
            >
              <span className="text-lg">{profileTab.icon}</span>
              <span>{profileTab.label}</span>
            </button>
          )}
          <div className="px-4 py-3 flex items-center gap-2 text-sm text-muted">
            <span>🎫</span>
            <span className="font-bold text-accent">{gachaTickets}</span>
            <span className="text-xs">チケット</span>
          </div>
        </div>
      </aside>

      {/* モバイル: 下部タブバー */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-app/90 backdrop-blur-xl border-t border-panel">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-all ${
                activeTab === tab.id
                  ? "text-accent"
                  : "text-muted"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
