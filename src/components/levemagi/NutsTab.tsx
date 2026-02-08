"use client";

import { useState } from "react";
import type { Nuts, Leaf, Trunk, Worklog, Tag, NutsStatus } from "@/lib/levemagi/types";
import {
  STATUS_PROGRESS_MAP,
  getNutsStatusCategory,
  NUTS_STATUS_TODO,
  NUTS_STATUS_IN_PROGRESS,
  NUTS_STATUS_COMPLETE,
  PRIORITY_LABELS,
} from "@/lib/levemagi/constants";
import { detectPhase } from "@/lib/levemagi/milestones";
import { classifyEisenhower } from "@/lib/levemagi/eisenhower";
import { calculateNutsXP, formatXP } from "@/lib/levemagi/xp";
import { MilestoneBar } from "./MilestoneBar";

interface NutsTabProps {
  nuts: Nuts[];
  leaves: Leaf[];
  trunks: Trunk[];
  worklogs: Worklog[];
  tags: Tag[];
  onAdd: (data: Omit<Nuts, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Nuts, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
  onStartWork: (nutsId: string) => void;
}

const PRIO_BADGE: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
};

export function NutsTab({ nuts, leaves, trunks, worklogs, tags, onAdd, onUpdate, onDelete, onStartWork }: NutsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [difficulty, setDifficulty] = useState(5);
  const [tagStr, setTagStr] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const tagList = tagStr.split(",").map((t) => t.trim()).filter(Boolean);
    onAdd({
      name: name.trim(),
      description: desc.trim(),
      status: "いつかやる",
      priority,
      difficulty: Math.min(10, Math.max(1, difficulty)) as Nuts["difficulty"],
      tags: tagList,
    });
    setName(""); setDesc(""); setTagStr(""); setShowForm(false);
  };

  const sorted = [...nuts].sort((a, b) => {
    const catOrder = { in_progress: 0, todo: 1, complete: 2 };
    return catOrder[getNutsStatusCategory(a.status)] - catOrder[getNutsStatusCategory(b.status)];
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">成果物 ({nuts.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? "閉じる" : "+ 追加"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="成果物名" className="w-full" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="説明" className="w-full" rows={2} />
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-muted">優先度:
              <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")} className="text-sm">
                {(["high", "medium", "low"] as const).map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">難易度:
              <input type="number" min={1} max={10} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className="w-16 text-sm" />
              <span className="text-xs">/ 10</span>
            </label>
          </div>
          <input type="text" value={tagStr} onChange={(e) => setTagStr(e.target.value)} placeholder="タグ（カンマ区切り）" className="w-full text-sm" />
          <button type="submit" className="btn-primary">作成</button>
        </form>
      )}

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="card p-8 text-center text-muted">成果物がありません</div>
        ) : sorted.map((n) => {
          const nutsLeaves = leaves.filter((l) => l.nutsId === n.id);
          const completedCount = nutsLeaves.filter((l) => l.completedAt).length;
          const phase = detectPhase(n.startDate, n.deadline, n.status);
          const eisenhower = classifyEisenhower(n.priority, phase.id);
          const progress = STATUS_PROGRESS_MAP[n.status];
          const xp = calculateNutsXP(nutsLeaves);
          const isExpanded = expanded === n.id;
          const cat = getNutsStatusCategory(n.status);

          return (
            <div key={n.id} className="card p-4">
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : n.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-primary">{n.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${cat === "in_progress" ? "bg-accent/20 text-accent" : cat === "complete" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-muted"}`}>{n.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${PRIO_BADGE[n.priority]}`}>{PRIORITY_LABELS[n.priority]}</span>
                    {phase.id !== "no_dates" && <span className="text-xs">{phase.emoji} {phase.label}</span>}
                    {cat === "in_progress" && <span className="text-xs text-muted">{eisenhower.emoji}</span>}
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>進捗 {progress}%</span>
                      <span>XP: {formatXP(xp)} | タスク: {completedCount}/{nutsLeaves.length}</span>
                    </div>
                    <div className="h-2 bg-panel rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-muted text-sm">{isExpanded ? "▲" : "▼"}</span>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-panel pt-4">
                  {n.description && <p className="text-sm text-muted">{n.description}</p>}

                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2 text-sm text-muted">開始日:
                      <input type="date" value={n.startDate?.split("T")[0] || ""} onChange={(e) => onUpdate(n.id, { startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} className="text-sm" />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted">締切:
                      <input type="date" value={n.deadline?.split("T")[0] || ""} onChange={(e) => onUpdate(n.id, { deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })} className="text-sm" />
                    </label>
                  </div>

                  <MilestoneBar startDate={n.startDate} deadline={n.deadline} status={n.status} />

                  <div>
                    <div className="text-sm text-muted mb-2">ステータス変更:</div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted mb-1">To Do</div>
                        <div className="flex gap-1 flex-wrap">
                          {NUTS_STATUS_TODO.map((s) => (
                            <button key={s} onClick={() => onUpdate(n.id, { status: s as NutsStatus })}
                              className={`px-2 py-1 rounded text-xs transition-colors ${n.status === s ? "bg-accent text-white" : "bg-panel text-muted hover:text-primary"}`}>{s}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-1">In Progress</div>
                        <div className="flex gap-1 flex-wrap">
                          {NUTS_STATUS_IN_PROGRESS.map((s) => (
                            <button key={s} onClick={() => onUpdate(n.id, { status: s as NutsStatus })}
                              className={`px-2 py-1 rounded text-xs transition-colors ${n.status === s ? "bg-accent text-white" : "bg-panel text-muted hover:text-primary"}`}>{s}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-1">Complete</div>
                        <div className="flex gap-1 flex-wrap">
                          {NUTS_STATUS_COMPLETE.map((s) => (
                            <button key={s} onClick={() => onUpdate(n.id, { status: s as NutsStatus })}
                              className={`px-2 py-1 rounded text-xs transition-colors ${n.status === s ? "bg-green-500 text-white" : "bg-panel text-muted hover:text-primary"}`}>{s}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {n.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {n.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-panel rounded text-xs text-muted">#{t}</span>)}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {cat !== "in_progress" && (
                      <button onClick={() => onStartWork(n.id)} className="btn-primary text-sm">作業開始</button>
                    )}
                    <button onClick={() => onDelete(n.id)} className="btn-secondary text-sm text-red-400">削除</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
