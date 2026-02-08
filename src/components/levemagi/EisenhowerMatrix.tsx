"use client";

import type { Nuts } from "@/lib/levemagi/types";
import { detectPhase } from "@/lib/levemagi/milestones";
import {
  classifyEisenhower,
  type EisenhowerQuadrant,
} from "@/lib/levemagi/eisenhower";
import { getNutsStatusCategory, STATUS_PROGRESS_MAP } from "@/lib/levemagi/constants";

interface EisenhowerMatrixProps {
  nuts: Nuts[];
}

const QUADRANT_CONFIG: Record<
  EisenhowerQuadrant,
  { label: string; emoji: string; bgClass: string; description: string; emptyMsg: string }
> = {
  do_now: {
    label: "今すぐやる",
    emoji: "🔥",
    bgClass: "bg-red-500/10",
    description: "重要 × 緊急",
    emptyMsg: "緊急タスクなし — 良い状態です!",
  },
  schedule: {
    label: "余裕をもってやる",
    emoji: "🌿",
    bgClass: "bg-green-500/10",
    description: "重要 × 余裕あり",
    emptyMsg: "計画中のタスクを追加しましょう",
  },
  delegate: {
    label: "任せる",
    emoji: "⚡",
    bgClass: "bg-yellow-500/10",
    description: "低優先 × 緊急",
    emptyMsg: "委譲可能なタスクなし",
  },
  eliminate: {
    label: "やらなくてよい",
    emoji: "🗑",
    bgClass: "bg-gray-500/10",
    description: "低優先 × 余裕あり",
    emptyMsg: "見直し対象なし",
  },
};

export function EisenhowerMatrix({ nuts }: EisenhowerMatrixProps) {
  // 進行中のNutsだけを対象
  const activeNuts = nuts.filter(
    (n) => getNutsStatusCategory(n.status) === "in_progress"
  );

  const classified = activeNuts.map((n) => {
    const phase = detectPhase(n.startDate, n.deadline, n.status);
    const eisenhower = classifyEisenhower(n.priority, phase.id);
    const progress = STATUS_PROGRESS_MAP[n.status];
    return { nuts: n, phase, eisenhower, progress };
  });

  if (activeNuts.length === 0) {
    return (
      <div className="card p-6 text-center text-muted animate-slide-in">
        <div className="text-3xl mb-2">📋</div>
        <div className="font-medium">進行中の成果物がありません</div>
        <div className="text-sm mt-1">成果物を開始するとマトリクスに表示されます</div>
      </div>
    );
  }

  return (
    <div className="card p-4 overflow-hidden animate-slide-in">
      {/* 軸ラベル */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="text-xs text-muted">重要 ↑</span>
      </div>

      <div className="flex">
        {/* 左軸ラベル */}
        <div className="flex flex-col justify-center -mr-1">
          <span className="text-xs text-muted writing-vertical" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            ← 余裕　　緊急 →
          </span>
        </div>

        {/* マトリクス本体 */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {(["do_now", "schedule", "delegate", "eliminate"] as EisenhowerQuadrant[]).map((q) => {
            const config = QUADRANT_CONFIG[q];
            const items = classified.filter((c) => c.eisenhower.quadrant === q);
            return (
              <div key={q} className={`rounded-xl p-3 ${config.bgClass} border border-panel`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">{config.emoji}</span>
                  <div>
                    <div className="font-bold text-xs">{config.label}</div>
                    <div className="text-[10px] text-muted">{config.description}</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {items.length === 0 ? (
                    <div className="text-[11px] text-muted/60 py-1">{config.emptyMsg}</div>
                  ) : (
                    items.map((item) => (
                      <div key={item.nuts.id} className="bg-panel rounded-lg px-2.5 py-2 text-sm">
                        <div className="font-medium text-xs">{item.nuts.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted">{item.phase.emoji} {item.phase.label}</span>
                          {/* ミニ進捗バー */}
                          <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-muted">{item.progress}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
