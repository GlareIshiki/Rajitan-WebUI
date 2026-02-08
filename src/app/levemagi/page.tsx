"use client";

import { useState } from "react";
import { useLeveMagi } from "@/hooks/levemagi/useLeveMagi";
import { TabNavigation } from "@/components/levemagi/TabNavigation";
import { LeafTab } from "@/components/levemagi/LeafTab";
import { NutsTab } from "@/components/levemagi/NutsTab";
import { RootTab } from "@/components/levemagi/RootTab";
import { ProfileTab } from "@/components/levemagi/ProfileTab";
import { XPGainAnimation } from "@/components/levemagi/XPGainAnimation";
import { GachaResult } from "@/components/levemagi/GachaResult";
import type { GachaItem } from "@/lib/levemagi/types";

const TABS = [
  { id: "task", label: "タスク", icon: "📋" },
  { id: "nuts", label: "成果物", icon: "🌰" },
  { id: "root", label: "ナレッジ", icon: "🌱" },
  { id: "profile", label: "プロフィール", icon: "🎮" },
];

export default function LeveMagiPage() {
  const {
    state,
    isLoaded,
    totalXP,
    level,
    xpProgress,
    addNuts,
    updateNuts,
    deleteNuts,
    addLeaf,
    startLeaf,
    completeLeaf,
    deleteLeaf,
    addRoot,
    updateRoot,
    deleteRoot,
    doGacha,
  } = useLeveMagi();

  const [activeTab, setActiveTab] = useState("task");
  const [xpGain, setXPGain] = useState<number | null>(null);
  const [gachaResult, setGachaResult] = useState<GachaItem | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌰</div>
          <div className="text-muted">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* ヘッダー */}
      <div className="sticky top-0 z-40 bg-app/80 backdrop-blur-xl border-b border-panel">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌰</span>
              <div>
                <h1 className="text-xl font-bold text-accent">LeveMagi</h1>
                <p className="text-xs text-muted">ナレッジ × ゲーミフィケーション</p>
              </div>
            </div>

            {/* レベル表示（ミニ） */}
            <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-muted">Lv</div>
                <div className="text-lg font-bold text-accent">{level}</div>
              </div>
              <div className="w-px h-8 bg-panel" />
              <div className="text-center">
                <div className="text-xs text-muted">XP</div>
                <div className="text-lg font-bold">{totalXP}</div>
              </div>
              <div className="w-px h-8 bg-panel" />
              <div className="text-center">
                <div className="text-xs text-muted">🎫</div>
                <div className="text-lg font-bold">{state.userData.gachaTickets}</div>
              </div>
            </div>
          </div>

          {/* タブ */}
          <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "task" && (
          <LeafTab
            leaves={state.leaves}
            nuts={state.nuts}
            onAdd={addLeaf}
            onStart={startLeaf}
            onComplete={completeLeaf}
            onDelete={deleteLeaf}
            onXPGain={setXPGain}
          />
        )}

        {activeTab === "nuts" && (
          <NutsTab
            nuts={state.nuts}
            leaves={state.leaves}
            onAdd={addNuts}
            onUpdate={updateNuts}
            onDelete={deleteNuts}
          />
        )}

        {activeTab === "root" && (
          <RootTab
            roots={state.roots}
            nuts={state.nuts}
            onAdd={addRoot}
            onUpdate={updateRoot}
            onDelete={deleteRoot}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            level={level}
            totalXP={totalXP}
            xpProgress={xpProgress}
            userData={state.userData}
            onGacha={doGacha}
            onGachaResult={setGachaResult}
          />
        )}
      </div>

      {/* XP獲得アニメーション */}
      {xpGain !== null && (
        <XPGainAnimation xp={xpGain} onComplete={() => setXPGain(null)} />
      )}

      {/* ガチャ結果 */}
      {gachaResult && (
        <GachaResult item={gachaResult} onClose={() => setGachaResult(null)} />
      )}
    </div>
  );
}
