"use client";

import type { NutsStatus } from "@/lib/levemagi/types";
import { calculateMilestones, detectPhase } from "@/lib/levemagi/milestones";

interface MilestoneBarProps {
  startDate?: string;
  deadline?: string;
  status: NutsStatus;
}

const PHASE_BG: Record<string, string> = {
  green: "bg-green-500/30",
  yellow: "bg-yellow-500/30",
  orange: "bg-orange-500/30",
  red: "bg-red-500/30",
};

export function MilestoneBar({ startDate, deadline, status }: MilestoneBarProps) {
  const phase = detectPhase(startDate, deadline, status);

  if (!startDate || !deadline) {
    return <div className="bg-panel rounded-lg p-3 text-center text-sm text-muted">📅 日程未設定</div>;
  }

  const milestones = calculateMilestones(startDate, deadline);
  if (milestones.length === 0) return null;

  const start = new Date(startDate).getTime();
  const end = new Date(deadline).getTime();
  const now = Date.now();
  const total = end - start;
  const markerPct = total > 0 ? Math.max(0, Math.min(((now - start) / total) * 100, 105)) : 0;

  const remaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const remainLabel = remaining < 0 ? `${Math.abs(remaining)}日超過` : remaining === 0 ? "今日が締切" : `残り${remaining}日`;

  return (
    <div className="bg-panel rounded-lg p-3 space-y-2">
      <div className="flex justify-between text-xs text-muted">
        <span>{new Date(startDate).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}</span>
        <span>{new Date(deadline).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}</span>
      </div>
      <div className="relative">
        <div className="flex h-5 rounded-full overflow-hidden">
          {milestones.map((m, i) => (
            <div key={i} className={`h-full ${PHASE_BG[m.color] || "bg-gray-500/30"} flex items-center justify-center`}
              style={{ width: `${m.percentage * 100}%` }} title={m.name}>
              {m.percentage >= 0.1 && <span className="text-[10px] opacity-70">{m.emoji}</span>}
            </div>
          ))}
        </div>
        {phase.id !== "complete" && (
          <div className="absolute top-0 h-5 pointer-events-none"
            style={{ left: `${Math.min(markerPct, 100)}%`, transform: "translateX(-50%)" }}>
            <div className={`w-0.5 h-5 ${now > end ? "bg-red-400" : "bg-white"} rounded-full shadow`} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-sm">
        <span>{phase.emoji}</span>
        <span className="font-medium">{phase.label}</span>
        {!["complete", "no_dates", "not_started"].includes(phase.id) && (
          <span className="text-xs text-muted ml-1">({remainLabel})</span>
        )}
      </div>
    </div>
  );
}
