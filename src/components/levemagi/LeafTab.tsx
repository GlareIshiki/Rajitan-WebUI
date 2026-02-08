"use client";

import { useState, useEffect } from "react";
import type { Leaf, Nuts, DifficultyId } from "@/lib/levemagi/types";
import { getLeafStatus } from "@/lib/levemagi/types";
import {
  DIFFICULTY_MASTER,
  DIFFICULTY_OPTIONS,
  PRIORITY_LABELS,
} from "@/lib/levemagi/constants";
import { formatXP, formatHours } from "@/lib/levemagi/xp";
import { EmptyState } from "./ui/EmptyState";

interface LeafTabProps {
  leaves: Leaf[];
  nuts: Nuts[];
  onAdd: (data: Omit<Leaf, "id" | "createdAt">) => void;
  onStart: (id: string) => void;
  onComplete: (id: string, createSeed: boolean) => void;
  onDelete: (id: string) => void;
}

const DIFF_BADGE: Record<DifficultyId, string> = {
  easy: "bg-green-500/20 text-green-400",
  normal: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-red-500/20 text-red-400",
};

const PRIO_BADGE: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
};

export function LeafTab({ leaves, nuts, onAdd, onStart, onComplete, onDelete }: LeafTabProps) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyId>("normal");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [nutsId, setNutsId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), difficulty, priority, nutsId: nutsId || undefined });
    setTitle("");
  };

  // ステータスごとにグループ化
  const inProgress = leaves.filter((l) => getLeafStatus(l) === "in_progress");
  const pending = leaves.filter((l) => getLeafStatus(l) === "pending");
  const completed = leaves.filter((l) => getLeafStatus(l) === "completed");

  const sections = [
    { key: "in_progress", label: "進行中", emoji: "⚡", items: inProgress, color: "text-accent" },
    { key: "pending", label: "未着手", emoji: "📋", items: pending, color: "text-muted" },
    { key: "completed", label: "完了", emoji: "✅", items: completed, color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card p-4 space-y-3">
        <div className="flex gap-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="タスクを追加（動詞で始める）" className="flex-1" />
          <button type="submit" className="btn-primary">追加</button>
        </div>
        <div className="flex gap-4 flex-wrap items-center">
          <label className="flex items-center gap-2 text-sm text-muted">
            難易度:
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyId)} className="text-sm">
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>{DIFFICULTY_MASTER[d].label} (~{DIFFICULTY_MASTER[d].estimateHours}h)</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            優先度:
            <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")} className="text-sm">
              {(["high", "medium", "low"] as const).map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
            </select>
          </label>
          {nuts.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-muted">
              成果物:
              <select value={nutsId} onChange={(e) => setNutsId(e.target.value)} className="text-sm">
                <option value="">なし</option>
                {nuts.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </label>
          )}
        </div>
      </form>

      {leaves.length === 0 ? (
        <EmptyState icon="🍃" title="タスクがありません" description="上のフォームからタスクを追加しましょう" />
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
            if (section.items.length === 0) return null;
            return (
              <div key={section.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span>{section.emoji}</span>
                  <span className={`font-bold text-sm ${section.color}`}>{section.label}</span>
                  <span className="text-xs text-muted">({section.items.length})</span>
                </div>
                <div className="space-y-2">
                  {section.items.map((leaf) => (
                    <LeafItem key={leaf.id} leaf={leaf} linkedNuts={nuts.find((n) => n.id === leaf.nutsId)}
                      onStart={() => onStart(leaf.id)} onComplete={onComplete} onDelete={() => onDelete(leaf.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const ms = Date.now() - new Date(startedAt).getTime();
      const mins = Math.floor(ms / 60000);
      if (mins < 60) {
        setElapsed(`${mins}分`);
      } else {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        setElapsed(`${h}時間${m > 0 ? `${m}分` : ""}`);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return <span className="text-xs text-accent">{elapsed}経過</span>;
}

function LeafItem({ leaf, linkedNuts, onStart, onComplete, onDelete }: {
  leaf: Leaf; linkedNuts?: Nuts; onStart: () => void;
  onComplete: (id: string, seed: boolean) => void; onDelete: () => void;
}) {
  const [showSeed, setShowSeed] = useState(false);
  const status = getLeafStatus(leaf);
  const estimate = DIFFICULTY_MASTER[leaf.difficulty].estimateHours;

  return (
    <div className={`card p-4 transition-all ${status === "completed" ? "opacity-60" : ""} ${status === "in_progress" ? "animate-border-glow" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {status === "pending" && (
            <button onClick={onStart} className="w-10 h-10 rounded-full border-2 border-panel hover:border-accent transition-colors flex items-center justify-center group">
              <span className="text-muted group-hover:text-accent">▶</span>
            </button>
          )}
          {status === "in_progress" && (
            <button onClick={() => setShowSeed(true)} className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center animate-pulse">✓</button>
          )}
          {status === "completed" && (
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">✓</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${status === "completed" ? "line-through text-muted" : "text-primary"}`}>{leaf.title}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFF_BADGE[leaf.difficulty]}`}>{DIFFICULTY_MASTER[leaf.difficulty].label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIO_BADGE[leaf.priority]}`}>{PRIORITY_LABELS[leaf.priority]}</span>
            {linkedNuts && <span className="text-xs text-muted">🌰 {linkedNuts.name}</span>}
            {status === "in_progress" && leaf.startedAt && <ElapsedTimer startedAt={leaf.startedAt} />}
            {status === "pending" && (
              <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">~{estimate}h ≈ {formatXP(estimate)} XP</span>
            )}
          </div>
        </div>
        {status !== "completed" && (
          <button onClick={onDelete} className="flex-shrink-0 text-muted hover:text-red-400 transition-colors">✕</button>
        )}
      </div>
      {showSeed && (
        <div className="mt-3 p-3 bg-panel rounded-lg border border-panel animate-slide-in">
          <p className="text-sm mb-2">学びをシードとして記録しますか？</p>
          <div className="flex gap-2">
            <button onClick={() => { onComplete(leaf.id, true); setShowSeed(false); }} className="btn-primary text-sm">シードを作成して完了</button>
            <button onClick={() => { onComplete(leaf.id, false); setShowSeed(false); }} className="btn-secondary text-sm">そのまま完了</button>
          </div>
        </div>
      )}
      {status === "completed" && leaf.actualHours != null && leaf.xpSubtotal != null && (
        <div className="mt-3 p-3 bg-panel rounded-lg text-xs space-y-2">
          {/* 見積vs実績の比較バー */}
          <div className="space-y-1">
            <div className="flex justify-between text-muted">
              <span>見積: {formatHours(estimate)}</span>
              <span>実績: {formatHours(leaf.actualHours)}</span>
            </div>
            <div className="h-2 bg-card rounded-full overflow-hidden flex">
              <div className="h-full bg-accent rounded-l-full transition-all"
                style={{ width: `${Math.min((leaf.actualHours / Math.max(estimate, leaf.actualHours)) * 100, 100)}%` }} />
              {(leaf.bonusHours ?? 0) > 0 && (
                <div className="h-full bg-green-500 rounded-r-full transition-all"
                  style={{ width: `${((leaf.bonusHours!) / Math.max(estimate, leaf.actualHours)) * 100}%` }} />
              )}
            </div>
          </div>
          <div className="flex justify-between border-t border-panel pt-1">
            <span className="font-medium text-muted">XP小計</span>
            <span className="text-accent font-bold">{formatXP(leaf.xpSubtotal)} XP</span>
          </div>
        </div>
      )}
    </div>
  );
}
