"use client";

import { useState } from "react";
import type { Nuts, Leaf, Trunk, Root, Worklog, Tag, NutsStatus } from "@/lib/levemagi/types";
import { getLeafStatus } from "@/lib/levemagi/types";
import {
  STATUS_PROGRESS_MAP,
  getNutsStatusCategory,
  NUTS_STATUS_TODO,
  NUTS_STATUS_IN_PROGRESS,
  NUTS_STATUS_COMPLETE,
  ALL_NUTS_STATUSES,
  PRIORITY_LABELS,
} from "@/lib/levemagi/constants";
import { detectPhase } from "@/lib/levemagi/milestones";
import { classifyEisenhower } from "@/lib/levemagi/eisenhower";
import { calculateNutsXP, formatXP } from "@/lib/levemagi/xp";
import { ProgressRing } from "./ui/ProgressRing";
import { EmptyState } from "./ui/EmptyState";
import { MilestoneBar } from "./MilestoneBar";

interface NutsTabProps {
  nuts: Nuts[];
  leaves: Leaf[];
  trunks: Trunk[];
  roots: Root[];
  worklogs: Worklog[];
  tags: Tag[];
  onAdd: (data: Omit<Nuts, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Nuts, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
  onStartWork: (nutsId: string) => void;
  onCompleteNuts: (nutsId: string) => void;
  onAddLeaf: (data: Omit<Leaf, "id" | "createdAt">) => void;
  onAddTrunk: (data: Omit<Trunk, "id" | "createdAt">) => void;
  onAddRoot: (data: Omit<Root, "id" | "createdAt">) => void;
}

const PRIO_BORDER: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-blue-500",
};

const PRIO_BADGE: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
};

const VERSION_OPTIONS = ["未完", "v1.0", "v2.0"] as const;

export function NutsTab({ nuts, leaves, trunks, roots, worklogs, tags, onAdd, onUpdate, onDelete, onStartWork, onCompleteNuts, onAddLeaf, onAddTrunk, onAddRoot }: NutsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [difficulty, setDifficulty] = useState(5);
  const [tagStr, setTagStr] = useState("");
  const [icon, setIcon] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
      icon: icon.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });
    setName(""); setDesc(""); setTagStr(""); setIcon(""); setImageUrl(""); setShowForm(false);
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
        <form onSubmit={handleSubmit} className="card p-4 space-y-3 animate-slide-in">
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
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-muted">アイコン:
              <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🌰" className="w-16 text-sm text-center" />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted flex-1">画像URL:
              <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="flex-1 text-sm" />
            </label>
          </div>
          <input type="text" value={tagStr} onChange={(e) => setTagStr(e.target.value)} placeholder="タグ（カンマ区切り）" className="w-full text-sm" />
          <button type="submit" className="btn-primary">作成</button>
        </form>
      )}

      <div className="space-y-4">
        {sorted.length === 0 ? (
          <EmptyState icon="🌰" title="成果物がありません" description="プロジェクトや制作物を追加しましょう" action={{ label: "+ 追加", onClick: () => setShowForm(true) }} />
        ) : sorted.map((n) => {
          const nutsLeaves = leaves.filter((l) => l.nutsId === n.id);
          const nutsTrunks = trunks.filter((t) => t.nutsId === n.id);
          const nutsRoots = roots.filter((r) => r.nutsId === n.id);
          const completedCount = nutsLeaves.filter((l) => l.completedAt).length;
          const phase = detectPhase(n.startDate, n.deadline, n.status);
          const eisenhower = classifyEisenhower(n.priority, phase.id);
          const progress = STATUS_PROGRESS_MAP[n.status];
          const xp = calculateNutsXP(nutsLeaves);
          const isExpanded = expanded === n.id;
          const cat = getNutsStatusCategory(n.status);
          const displayIcon = n.icon || "🌰";

          return (
            <div key={n.id} className={`card overflow-hidden border-l-4 ${PRIO_BORDER[n.priority]} ${cat === "in_progress" ? "animate-border-glow" : ""}`}>
              {/* カバー画像 */}
              {n.imageUrl && (
                <div className="relative h-32 overflow-hidden">
                  <img src={n.imageUrl} alt={n.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              <div className="p-4">
                {/* カードフェイス */}
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : n.id)}>
                  <div className="flex-shrink-0">
                    <ProgressRing percentage={progress} size={56} strokeWidth={3}>
                      <span className="text-xl">{displayIcon}</span>
                    </ProgressRing>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-primary text-lg">{n.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${cat === "in_progress" ? "bg-accent/20 text-accent" : cat === "complete" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-muted"}`}>{n.status}</span>
                      {n.version && <span className="px-2 py-0.5 rounded-full text-xs bg-panel text-muted">{n.version}</span>}
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${PRIO_BADGE[n.priority]}`}>{PRIORITY_LABELS[n.priority]}</span>
                      {phase.id !== "no_dates" && <span className="text-xs">{phase.emoji} {phase.label}</span>}
                      {cat === "in_progress" && <span className="text-xs text-muted">{eisenhower.emoji}</span>}
                      <span className="text-xs text-muted ml-auto">
                        {formatXP(xp)} XP | 🍃{completedCount}/{nutsLeaves.length} 🪵{nutsTrunks.length} 🌱{nutsRoots.length}
                      </span>
                    </div>

                    {n.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {n.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">#{t}</span>)}
                      </div>
                    )}
                  </div>

                  <span className="text-muted text-sm flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {n.startDate && n.deadline && !isExpanded && (
                  <MiniMilestoneBar startDate={n.startDate} deadline={n.deadline} status={n.status} />
                )}

                {/* 展開セクション */}
                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t border-panel pt-4 animate-slide-in">
                    {n.description && <p className="text-sm text-muted">{n.description}</p>}

                    {/* 画像/アイコン/バージョン編集 */}
                    <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2 text-sm text-muted">アイコン:
                        <input type="text" value={n.icon || ""} onChange={(e) => onUpdate(n.id, { icon: e.target.value || undefined })} className="w-16 text-sm text-center" placeholder="🌰" />
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted">バージョン:
                        <select value={n.version || "未完"} onChange={(e) => onUpdate(n.id, { version: e.target.value })} className="text-sm">
                          {VERSION_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted flex-1">画像URL:
                        <input type="text" value={n.imageUrl || ""} onChange={(e) => onUpdate(n.id, { imageUrl: e.target.value || undefined })} className="flex-1 text-sm" placeholder="https://..." />
                      </label>
                    </div>

                    {/* 日程 */}
                    <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2 text-sm text-muted">開始日:
                        <input type="date" value={n.startDate?.split("T")[0] || ""} onChange={(e) => onUpdate(n.id, { startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} className="text-sm" />
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted">締切:
                        <input type="date" value={n.deadline?.split("T")[0] || ""} onChange={(e) => onUpdate(n.id, { deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })} className="text-sm" />
                      </label>
                    </div>

                    <MilestoneBar startDate={n.startDate} deadline={n.deadline} status={n.status} />
                    <StatusStepper currentStatus={n.status} onStatusChange={(s) => onUpdate(n.id, { status: s })} />

                    {/* 子アイテムサマリー */}
                    <ChildItemsSummary nutsId={n.id} leaves={nutsLeaves} trunks={nutsTrunks} roots={nutsRoots} onAddLeaf={onAddLeaf} onAddTrunk={onAddTrunk} onAddRoot={onAddRoot} />

                    {/* アクションボタン */}
                    <div className="flex gap-2 flex-wrap">
                      {cat !== "in_progress" && cat !== "complete" && (
                        <button onClick={() => onStartWork(n.id)} className="btn-primary text-sm">▶ 作業開始</button>
                      )}
                      {cat !== "complete" && (
                        <button onClick={() => onCompleteNuts(n.id)} className="px-3 py-1.5 rounded-lg text-sm bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-colors">✅ 完了！</button>
                      )}
                      <button onClick={() => onDelete(n.id)} className="btn-secondary text-sm text-red-400">削除</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 子アイテムサマリー + クイック追加 */
function ChildItemsSummary({ nutsId, leaves, trunks, roots, onAddLeaf, onAddTrunk, onAddRoot }: {
  nutsId: string;
  leaves: Leaf[];
  trunks: Trunk[];
  roots: Root[];
  onAddLeaf: (data: Omit<Leaf, "id" | "createdAt">) => void;
  onAddTrunk: (data: Omit<Trunk, "id" | "createdAt">) => void;
  onAddRoot: (data: Omit<Root, "id" | "createdAt">) => void;
}) {
  const [addMode, setAddMode] = useState<"leaf" | "trunk" | "root" | null>(null);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    if (addMode === "leaf") {
      onAddLeaf({ title: title.trim(), nutsId, difficulty: "easy", priority: "medium" });
    } else if (addMode === "trunk") {
      onAddTrunk({ nutsId, title: title.trim(), type: "non-issue", value: 2, status: "pending", what: "", idea: "", conclusion: "", tags: [] });
    } else if (addMode === "root") {
      onAddRoot({ nutsId, title: title.trim(), type: "seed", tags: [], what: "", content: "" });
    }
    setTitle("");
    setAddMode(null);
  };

  return (
    <div className="bg-panel rounded-lg p-3 space-y-3">
      <div className="text-xs text-muted mb-1">子アイテム</div>

      {/* サマリーバッジ */}
      <div className="flex gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-sm">
          <span>🍃</span>
          <span className="text-primary font-medium">{leaves.filter((l) => l.completedAt).length}/{leaves.length}</span>
          <span className="text-muted text-xs">タスク</span>
        </span>
        <span className="flex items-center gap-1 text-sm">
          <span>🪵</span>
          <span className="text-primary font-medium">{trunks.length}</span>
          <span className="text-muted text-xs">イシュー</span>
        </span>
        <span className="flex items-center gap-1 text-sm">
          <span>🌱</span>
          <span className="text-primary font-medium">{roots.length}</span>
          <span className="text-muted text-xs">ナレッジ</span>
        </span>
      </div>

      {/* ミニリスト（最新5件） */}
      {leaves.length > 0 && (
        <div className="space-y-1">
          {leaves.slice(0, 5).map((l) => {
            const st = getLeafStatus(l);
            return (
              <div key={l.id} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${st === "completed" ? "bg-green-400" : st === "in_progress" ? "bg-accent" : "bg-gray-500"}`} />
                <span className={`truncate ${st === "completed" ? "line-through text-muted" : "text-primary"}`}>{l.title}</span>
              </div>
            );
          })}
          {leaves.length > 5 && <div className="text-[10px] text-muted">他{leaves.length - 5}件</div>}
        </div>
      )}

      {/* クイック追加ボタン */}
      {addMode === null ? (
        <div className="flex gap-2">
          <button onClick={() => setAddMode("leaf")} className="px-2 py-1 rounded text-xs bg-card border border-panel hover:border-accent transition-colors">+ 🍃 タスク</button>
          <button onClick={() => setAddMode("trunk")} className="px-2 py-1 rounded text-xs bg-card border border-panel hover:border-accent transition-colors">+ 🪵 イシュー</button>
          <button onClick={() => setAddMode("root")} className="px-2 py-1 rounded text-xs bg-card border border-panel hover:border-accent transition-colors">+ 🌱 ナレッジ</button>
        </div>
      ) : (
        <div className="flex gap-2 animate-slide-in">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={addMode === "leaf" ? "タスク名" : addMode === "trunk" ? "イシュー名" : "ナレッジ名"} className="flex-1 text-sm" autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } if (e.key === "Escape") setAddMode(null); }} />
          <button onClick={handleAdd} className="btn-primary text-xs">追加</button>
          <button onClick={() => { setAddMode(null); setTitle(""); }} className="text-xs text-muted hover:text-primary">✕</button>
        </div>
      )}
    </div>
  );
}

/** ステータスワークフローステッパー */
function StatusStepper({ currentStatus, onStatusChange }: { currentStatus: NutsStatus; onStatusChange: (s: NutsStatus) => void }) {
  const currentIdx = ALL_NUTS_STATUSES.indexOf(currentStatus);
  const groups = [
    { label: "To Do", statuses: NUTS_STATUS_TODO, color: "gray" },
    { label: "In Progress", statuses: NUTS_STATUS_IN_PROGRESS, color: "accent" },
    { label: "Complete", statuses: NUTS_STATUS_COMPLETE, color: "green" },
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted">ステータス変更:</div>
      {groups.map((group) => (
        <div key={group.label}>
          <div className="text-xs text-muted mb-1.5">{group.label}</div>
          <div className="flex items-center gap-0.5 flex-wrap">
            {group.statuses.map((s, i) => {
              const idx = ALL_NUTS_STATUSES.indexOf(s);
              const isCurrent = currentStatus === s;
              const isPast = idx < currentIdx;
              return (
                <div key={s} className="flex items-center">
                  {i > 0 && <div className={`w-3 h-0.5 ${isPast ? "bg-accent" : "bg-panel"}`} />}
                  <button
                    onClick={() => onStatusChange(s as NutsStatus)}
                    className={`relative px-2 py-1 rounded-full text-xs transition-all ${
                      isCurrent
                        ? group.color === "green" ? "bg-green-500 text-white shadow-glow-sm" : "bg-accent text-white shadow-glow-sm"
                        : isPast
                          ? "bg-accent/30 text-accent"
                          : "bg-panel text-muted hover:text-primary hover:bg-panel"
                    }`}
                    title={s}
                  >
                    {s}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** カードフェイス下部のミニマイルストーンバー */
function MiniMilestoneBar({ startDate, deadline, status }: { startDate: string; deadline: string; status: NutsStatus }) {
  const phase = detectPhase(startDate, deadline, status);
  if (phase.id === "complete" || phase.id === "no_dates") return null;

  const start = new Date(startDate).getTime();
  const end = new Date(deadline).getTime();
  const now = Date.now();
  const total = end - start;
  const pct = total > 0 ? Math.max(0, Math.min(((now - start) / total) * 100, 100)) : 0;

  const barColor = phase.id === "fire" || phase.id === "red" ? "bg-red-500" : phase.id === "yellow" ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="mt-3 relative">
      <div className="h-1 bg-panel rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
