"use client";

import { GACHA_ITEMS } from "@/lib/levemagi/constants";
import type { UserData, GachaItem } from "@/lib/levemagi/types";

interface ProfileTabProps {
  level: number;
  totalXP: number;
  xpProgress: { current: number; required: number; progress: number };
  userData: UserData;
  onGacha: () => GachaItem | null;
  onGachaResult: (item: GachaItem) => void;
}

export function ProfileTab({
  level,
  totalXP,
  xpProgress,
  userData,
  onGacha,
  onGachaResult,
}: ProfileTabProps) {
  const handleGacha = () => {
    const item = onGacha();
    if (item) {
      onGachaResult(item);
    }
  };

  return (
    <div className="space-y-6">
      {/* レベル表示 */}
      <div className="card p-6 text-center">
        <div className="text-6xl mb-2">🏆</div>
        <div className="text-4xl font-black text-accent mb-2">Lv.{level}</div>
        <div className="text-muted mb-4">総獲得XP: {totalXP}</div>

        {/* 進捗バー */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-muted mb-1">
            <span>次のレベルまで</span>
            <span>
              {xpProgress.current} / {xpProgress.required} XP
            </span>
          </div>
          <div className="h-4 bg-card rounded-full overflow-hidden border border-panel">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${Math.min(xpProgress.progress, 100)}%` }}
            />
          </div>
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
            <span className="text-2xl font-bold text-accent">
              {userData.gachaTickets}枚
            </span>
          </div>
          <button
            onClick={handleGacha}
            disabled={userData.gachaTickets <= 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎲 ガチャを回す
          </button>
        </div>

        <p className="text-sm text-muted">
          レベルアップするとチケットがもらえます
        </p>
      </div>

      {/* コレクション */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📦</span> コレクション
          <span className="text-sm font-normal text-muted">
            ({userData.collectedItems.length}/{GACHA_ITEMS.length})
          </span>
        </h3>

        <div className="grid grid-cols-5 gap-3">
          {GACHA_ITEMS.map((item) => {
            const collected = userData.collectedItems.includes(item.id);
            return (
              <div
                key={item.id}
                className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all ${
                  collected
                    ? item.rarity === "rare"
                      ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/50"
                      : "bg-card border border-panel"
                    : "bg-card/50 border border-panel/50 opacity-30"
                }`}
                title={collected ? `${item.name}: ${item.description}` : "???"}
              >
                {collected ? item.emoji : "?"}
              </div>
            );
          })}
        </div>
      </div>

      {/* 統計 */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📊</span> 統計
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="総獲得XP" value={totalXP.toString()} />
          <StatItem label="現在レベル" value={`Lv.${level}`} />
          <StatItem
            label="コレクション達成率"
            value={`${Math.round((userData.collectedItems.length / GACHA_ITEMS.length) * 100)}%`}
          />
          <StatItem
            label="レアアイテム数"
            value={`${userData.collectedItems.filter((id) => id.startsWith("r")).length}/3`}
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel rounded-xl p-4">
      <div className="text-sm text-muted mb-1">{label}</div>
      <div className="text-xl font-bold text-accent">{value}</div>
    </div>
  );
}
