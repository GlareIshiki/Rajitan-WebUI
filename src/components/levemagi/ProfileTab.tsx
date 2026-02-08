"use client";

import { useMemo } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { GACHA_ITEMS, getAchievementTitle } from "@/lib/levemagi/constants";
import { formatXP, formatHours } from "@/lib/levemagi/xp";
import type { UserData, GachaItem, Leaf, Nuts, Worklog } from "@/lib/levemagi/types";
import { getNutsStatusCategory } from "@/lib/levemagi/constants";
import { ProgressRing } from "./ui/ProgressRing";

interface ProfileTabProps {
  level: number;
  totalXP: number;
  xpProgress: { current: number; required: number; progress: number };
  userData: UserData;
  leaves: Leaf[];
  nuts: Nuts[];
  worklogs: Worklog[];
  onGacha: () => GachaItem | null;
  onGachaResult: (item: GachaItem) => void;
}

export function ProfileTab({
  level,
  totalXP,
  xpProgress,
  userData,
  leaves,
  nuts,
  worklogs,
  onGacha,
  onGachaResult,
}: ProfileTabProps) {
  const handleGacha = () => {
    const item = onGacha();
    if (item) {
      onGachaResult(item);
    }
  };

  const title = getAchievementTitle(level);

  const stats = useMemo(() => {
    const completedLeaves = leaves.filter((l) => l.completedAt);
    const totalActualHours = completedLeaves.reduce((sum, l) => sum + (l.actualHours ?? 0), 0);
    const totalBonusHours = completedLeaves.reduce((sum, l) => sum + (l.bonusHours ?? 0), 0);
    const activeNuts = nuts.filter((n) => getNutsStatusCategory(n.status) === "in_progress").length;
    const completedNuts = nuts.filter((n) => getNutsStatusCategory(n.status) === "complete").length;
    const taskCompletionRate = leaves.length > 0 ? Math.round((completedLeaves.length / leaves.length) * 100) : 0;
    const collectionRate = Math.round((userData.collectedItems.length / GACHA_ITEMS.length) * 100);
    return {
      completedTasks: completedLeaves.length,
      totalTasks: leaves.length,
      totalActualHours,
      totalBonusHours,
      activeNuts,
      completedNuts,
      totalNuts: nuts.length,
      totalWorklogs: worklogs.length,
      taskCompletionRate,
      collectionRate,
    };
  }, [leaves, nuts, worklogs, userData.collectedItems.length]);

  return (
    <div className="space-y-6">
      {/* レベル + 称号 */}
      <div className="card p-8 text-center">
        <div className="flex justify-center mb-4">
          <ProgressRing percentage={level >= 100 ? 100 : xpProgress.progress} size={160} strokeWidth={6}>
            <div className="text-center">
              <div className="text-xs text-muted">Lv</div>
              <div className="text-4xl font-black text-accent">{level}</div>
            </div>
          </ProgressRing>
        </div>

        {/* 称号 — 装飾フレーム */}
        <div className="inline-block px-6 py-2 rounded-lg border border-accent/50 bg-accent/5 shadow-glow-sm mb-3">
          <span className="text-lg font-bold bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] bg-clip-text text-transparent">
            {title}
          </span>
        </div>

        <div className="text-muted mb-4">総獲得XP: {formatXP(totalXP)}</div>

        {level < 100 ? (
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-sm text-muted mb-1">
              <span>次のレベルまで</span>
              <span>{formatXP(xpProgress.current)} / {formatXP(xpProgress.required)} XP</span>
            </div>
            <div className="h-2 bg-card rounded-full overflow-hidden border border-panel">
              <div className="h-full bg-accent transition-all duration-500 rounded-full" style={{ width: `${Math.min(xpProgress.progress, 100)}%` }} />
            </div>
          </div>
        ) : (
          <div className="text-accent font-bold text-xl animate-gold-shimmer">✦ MAX LEVEL ✦</div>
        )}
      </div>

      {/* 統計チャート + 数値 */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📊</span> 統計
        </h3>

        {/* recharts 円グラフ */}
        <div className="flex justify-center gap-8 mb-6 flex-wrap">
          <ChartRing label="タスク完了率" value={stats.taskCompletionRate} color="var(--theme-accent)" />
          <ChartRing label="コレクション" value={stats.collectionRate} color="var(--theme-primary)" />
        </div>

        {/* 数値グリッド */}
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="総獲得XP" value={formatXP(totalXP)} icon="✨" />
          <StatItem label="現在レベル" value={`Lv.${level}`} icon="🏆" />
          <StatItem label="総作業時間" value={formatHours(stats.totalActualHours)} icon="⏱️" />
          <StatItem label="早期完了ボーナス" value={formatHours(stats.totalBonusHours)} icon="🎁" />
          <StatItem label="完了タスク" value={`${stats.completedTasks} / ${stats.totalTasks}`} icon="✅" />
          <StatItem label="成果物" value={`${stats.completedNuts}完了 / ${stats.activeNuts}進行 / ${stats.totalNuts}件`} icon="🌰" />
          <StatItem label="作業記録" value={`${stats.totalWorklogs}件`} icon="📝" />
          <StatItem label="ガチャチケット" value={`${userData.gachaTickets}枚`} icon="🎫" />
        </div>
      </div>

      {/* ガチャ */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🎰</span> ガチャ
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-muted">チケット: </span>
            <span className="text-2xl font-bold text-accent">{userData.gachaTickets}枚</span>
          </div>
          <button onClick={handleGacha} disabled={userData.gachaTickets <= 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            🎲 ガチャを回す
          </button>
        </div>
        <p className="text-sm text-muted">レベルアップするとチケットがもらえます</p>
      </div>

      {/* コレクション */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📦</span> コレクション
          <span className="text-sm font-normal text-muted">({userData.collectedItems.length}/{GACHA_ITEMS.length})</span>
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {GACHA_ITEMS.map((item) => {
            const collected = userData.collectedItems.includes(item.id);
            return (
              <div key={item.id}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  collected
                    ? item.rarity === "rare"
                      ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 animate-gold-shimmer"
                      : "bg-card border border-panel hover:border-accent"
                    : "bg-card/30 border border-panel/30"
                }`}
                title={collected ? `${item.name}: ${item.description}` : "???"}>
                <span className={`text-3xl ${!collected ? "blur-sm opacity-30 grayscale" : ""}`}>
                  {item.emoji}
                </span>
                {collected && (
                  <span className={`text-[10px] leading-none ${item.rarity === "rare" ? "text-yellow-400" : "text-muted"}`}>
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** recharts ドーナツチャート */
function ChartRing({ label, value, color }: { label: string; value: number; color: string }) {
  const data = [{ value, fill: color }];
  return (
    <div className="text-center">
      <div className="relative inline-block">
        <RadialBarChart
          width={120} height={120}
          cx={60} cy={60}
          innerRadius={40} outerRadius={55}
          barSize={10}
          data={data}
          startAngle={90} endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" angleAxisId={0} cornerRadius={5} />
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{value}%</span>
        </div>
      </div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-panel rounded-xl p-3 flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-bold text-accent truncate">{value}</div>
      </div>
    </div>
  );
}
