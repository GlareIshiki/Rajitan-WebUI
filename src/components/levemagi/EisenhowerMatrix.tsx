"use client";

import type { Nuts } from "@/lib/levemagi/types";
import { detectPhase } from "@/lib/levemagi/milestones";
import {
  classifyEisenhower,
  type EisenhowerQuadrant,
} from "@/lib/levemagi/eisenhower";
import { getNutsStatusCategory } from "@/lib/levemagi/constants";

interface EisenhowerMatrixProps {
  nuts: Nuts[];
}

const QUADRANT_CONFIG: Record<
  EisenhowerQuadrant,
  { label: string; emoji: string; bgClass: string; description: string }
> = {
  do_now: {
    label: "今すぐやる",
    emoji: "🔥",
    bgClass: "bg-red-500/10",
    description: "重要 × 緊急",
  },
  schedule: {
    label: "余裕をもってやる",
    emoji: "🌿",
    bgClass: "bg-green-500/10",
    description: "重要 × 余裕あり",
  },
  delegate: {
    label: "任せる",
    emoji: "⚡",
    bgClass: "bg-yellow-500/10",
    description: "低優先 × 緊急",
  },
  eliminate: {
    label: "やらなくてよい",
    emoji: "🗑",
    bgClass: "bg-gray-500/10",
    description: "低優先 × 余裕あり",
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
    return { nuts: n, phase, eisenhower };
  });

  const quadrants: EisenhowerQuadrant[] = [
    "do_now",
    "schedule",
    "delegate",
    "eliminate",
  ];

  if (activeNuts.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        進行中の成果物がありません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {quadrants.map((q) => {
        const config = QUADRANT_CONFIG[q];
        const items = classified.filter((c) => c.eisenhower.quadrant === q);
        return (
          <div key={q} className={`rounded-xl p-4 ${config.bgClass} border border-panel`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{config.emoji}</span>
              <div>
                <div className="font-bold text-sm">{config.label}</div>
                <div className="text-xs text-muted">{config.description}</div>
              </div>
            </div>
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-xs text-muted py-2">なし</div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.nuts.id}
                    className="bg-panel rounded-lg px-3 py-2 text-sm"
                  >
                    <div className="font-medium">{item.nuts.name}</div>
                    <div className="text-xs text-muted mt-1">
                      {item.phase.emoji} {item.phase.label}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
