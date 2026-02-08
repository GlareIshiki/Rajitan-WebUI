"use client";

import { useState } from "react";
import { useLeveMagi } from "@/hooks/levemagi/useLeveMagi";
import { TabNavigation } from "@/components/levemagi/TabNavigation";
import { PortalTab } from "@/components/levemagi/PortalTab";
import { NutsTab } from "@/components/levemagi/NutsTab";
import { LeafTab } from "@/components/levemagi/LeafTab";
import { TrunkTab } from "@/components/levemagi/TrunkTab";
import { RootTab } from "@/components/levemagi/RootTab";
import { ResourceTab } from "@/components/levemagi/ResourceTab";
import { ProfileTab } from "@/components/levemagi/ProfileTab";
import { EisenhowerMatrix } from "@/components/levemagi/EisenhowerMatrix";
import { XPGainAnimation } from "@/components/levemagi/XPGainAnimation";
import { GachaResult } from "@/components/levemagi/GachaResult";
import { ProgressRing } from "@/components/levemagi/ui/ProgressRing";
import { formatXP } from "@/lib/levemagi/xp";
import { getAchievementTitle } from "@/lib/levemagi/constants";
import type { GachaItem } from "@/lib/levemagi/types";

const TABS = [
  { id: "portal", label: "ポータル", icon: "🌀" },
  { id: "nuts", label: "成果物", icon: "🌰" },
  { id: "task", label: "タスク", icon: "🍃" },
  { id: "trunk", label: "イシュー", icon: "🪵" },
  { id: "root", label: "ナレッジ", icon: "🌱" },
  { id: "resource", label: "リソース", icon: "📁" },
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
    startWork,
    completeNuts,
    addTrunk,
    updateTrunk,
    deleteTrunk,
    addLeaf,
    startLeaf,
    completeLeaf,
    deleteLeaf,
    addRoot,
    updateRoot,
    deleteRoot,
    addPortal,
    updatePortal,
    deletePortal,
    addResource,
    updateResource,
    deleteResource,
    doGacha,
  } = useLeveMagi();

  const [activeTab, setActiveTab] = useState("portal");
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

  const handleCompleteLeaf = (id: string, createSeed: boolean) => {
    const xp = completeLeaf(id, createSeed);
    if (xp) setXPGain(xp);
  };

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* サイドバー（デスクトップ） + 下部バー（モバイル） */}
      <TabNavigation
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        level={level}
        totalXP={totalXP}
        xpProgress={xpProgress}
        gachaTickets={state.userData.gachaTickets}
      />

      {/* モバイルヘッダー（lg以上では非表示） */}
      <div className="lg:hidden sticky top-16 z-30 bg-app/80 backdrop-blur-xl border-b border-panel">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌰</span>
            <div>
              <h1 className="text-lg font-bold text-accent">LeveMagi</h1>
              <p className="text-[10px] text-muted">{getAchievementTitle(level)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-card rounded-xl px-3 py-1.5">
            <ProgressRing percentage={level >= 100 ? 100 : xpProgress.progress} size={32} strokeWidth={2}>
              <span className="text-[10px] font-bold text-accent">{level}</span>
            </ProgressRing>
            <div className="w-px h-6 bg-panel" />
            <div className="text-center">
              <div className="text-[10px] text-muted">XP</div>
              <div className="text-sm font-bold">{formatXP(totalXP)}</div>
            </div>
            <div className="w-px h-6 bg-panel" />
            <div className="text-center">
              <div className="text-[10px] text-muted">🎫</div>
              <div className="text-sm font-bold">{state.userData.gachaTickets}</div>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ — サイドバーオフセット + 下部バーパディング */}
      <div className="lg:ml-56 pb-16 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div key={activeTab} className="animate-slide-in">
          {activeTab === "portal" && (
            <div className="space-y-6">
              <EisenhowerMatrix nuts={state.nuts} />
              <PortalTab
                portals={state.portals}
                nuts={state.nuts}
                leaves={state.leaves}
                roots={state.roots}
                trunks={state.trunks}
                resources={state.resources}
                onAdd={addPortal}
                onUpdate={updatePortal}
                onDelete={deletePortal}
              />
            </div>
          )}

          {activeTab === "nuts" && (
            <NutsTab
              nuts={state.nuts}
              leaves={state.leaves}
              trunks={state.trunks}
              roots={state.roots}
              worklogs={state.worklogs}
              tags={state.tags}
              onAdd={addNuts}
              onUpdate={updateNuts}
              onDelete={deleteNuts}
              onStartWork={startWork}
              onCompleteNuts={completeNuts}
              onAddLeaf={addLeaf}
              onAddTrunk={addTrunk}
              onAddRoot={addRoot}
            />
          )}

          {activeTab === "task" && (
            <LeafTab
              leaves={state.leaves}
              nuts={state.nuts}
              trunks={state.trunks}
              onAdd={addLeaf}
              onStart={startLeaf}
              onComplete={handleCompleteLeaf}
              onDelete={deleteLeaf}
            />
          )}

          {activeTab === "trunk" && (
            <TrunkTab
              trunks={state.trunks}
              nuts={state.nuts}
              leaves={state.leaves}
              onAdd={addTrunk}
              onUpdate={updateTrunk}
              onDelete={deleteTrunk}
              onAddLeaf={addLeaf}
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

          {activeTab === "resource" && (
            <ResourceTab
              resources={state.resources}
              onAdd={addResource}
              onUpdate={updateResource}
              onDelete={deleteResource}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              level={level}
              totalXP={totalXP}
              xpProgress={xpProgress}
              userData={state.userData}
              leaves={state.leaves}
              nuts={state.nuts}
              worklogs={state.worklogs}
              onGacha={doGacha}
              onGachaResult={setGachaResult}
            />
          )}
          </div>
        </div>
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
