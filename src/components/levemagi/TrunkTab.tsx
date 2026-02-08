"use client";

import { useState } from "react";
import type { Trunk, Nuts, Leaf } from "@/lib/levemagi/types";
import { getLeafStatus } from "@/lib/levemagi/types";
import { TRUNK_TYPE_LABELS } from "@/lib/levemagi/constants";
import { EmptyState } from "./ui/EmptyState";

interface TrunkTabProps {
  trunks: Trunk[];
  nuts: Nuts[];
  leaves: Leaf[];
  onAdd: (data: Omit<Trunk, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Trunk, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
  onAddLeaf: (data: Omit<Leaf, "id" | "createdAt">) => void;
}

const STATUS_BADGE: Record<Trunk["status"], string> = {
  pending: "bg-gray-500/20 text-muted",
  in_progress: "bg-accent/20 text-accent",
  done: "bg-green-500/20 text-green-400",
};
const STATUS_LABEL: Record<Trunk["status"], string> = {
  pending: "未着手",
  in_progress: "進行中",
  done: "完了",
};

const VALUE_BORDER: Record<number, string> = {
  1: "border-l-blue-500",
  2: "border-l-yellow-500",
  3: "border-l-red-500",
};

const VALUE_BADGE: Record<number, string> = {
  1: "bg-blue-500/20 text-blue-400",
  2: "bg-yellow-500/20 text-yellow-400",
  3: "bg-red-500/20 text-red-400",
};

export function TrunkTab({ trunks, nuts, leaves, onAdd, onUpdate, onDelete, onAddLeaf }: TrunkTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [nutsId, setNutsId] = useState("");
  const [type, setType] = useState<Trunk["type"]>("non-issue");
  const [value, setValue] = useState<1 | 2 | 3>(2);
  const [filter, setFilter] = useState<"all" | Trunk["status"]>("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !nutsId) return;
    onAdd({
      nutsId,
      title: title.trim(),
      type,
      value,
      status: "pending",
      what: "",
      idea: "",
      conclusion: "",
      tags: [],
    });
    setTitle("");
    setShowForm(false);
  };

  const filtered = filter === "all" ? trunks : trunks.filter((t) => t.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    const statusOrder = { pending: 0, in_progress: 1, done: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">イシュー ({trunks.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? "閉じる" : "+ 追加"}
        </button>
      </div>

      {/* フィルタ */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "in_progress", "done"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === s ? "bg-accent text-white" : "bg-card border border-panel hover:border-accent"}`}>
            {s === "all" ? `すべて (${trunks.length})` : `${STATUS_LABEL[s]} (${trunks.filter((t) => t.status === s).length})`}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3 animate-slide-in">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="イシュータイトル" className="w-full" autoFocus />
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-muted">成果物:
              <select value={nutsId} onChange={(e) => setNutsId(e.target.value)} className="text-sm">
                <option value="">選択してください</option>
                {nuts.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">タイプ:
              <select value={type} onChange={(e) => setType(e.target.value as Trunk["type"])} className="text-sm">
                {(Object.keys(TRUNK_TYPE_LABELS) as Array<keyof typeof TRUNK_TYPE_LABELS>).map((t) => (
                  <option key={t} value={t}>{TRUNK_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">重要度:
              <select value={value} onChange={(e) => setValue(Number(e.target.value) as 1 | 2 | 3)} className="text-sm">
                <option value={1}>低 (1)</option>
                <option value={2}>中 (2)</option>
                <option value={3}>高 (3)</option>
              </select>
            </label>
          </div>
          <button type="submit" className="btn-primary">作成</button>
        </form>
      )}

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <EmptyState icon="🪵" title="イシューがありません" description="課題やアイデアを記録しましょう" action={{ label: "+ 追加", onClick: () => setShowForm(true) }} />
        ) : sorted.map((trunk) => (
          <TrunkItem key={trunk.id} trunk={trunk} linkedNuts={nuts.find((n) => n.id === trunk.nutsId)}
            childLeaves={leaves.filter((l) => l.trunkId === trunk.id)}
            onUpdate={onUpdate} onDelete={onDelete} onAddLeaf={onAddLeaf} />
        ))}
      </div>
    </div>
  );
}

function TrunkItem({ trunk, linkedNuts, childLeaves, onUpdate, onDelete, onAddLeaf }: {
  trunk: Trunk;
  linkedNuts?: Nuts;
  childLeaves: Leaf[];
  onUpdate: (id: string, data: Partial<Omit<Trunk, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
  onAddLeaf: (data: Omit<Leaf, "id" | "createdAt">) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [what, setWhat] = useState(trunk.what);
  const [idea, setIdea] = useState(trunk.idea);
  const [conclusion, setConclusion] = useState(trunk.conclusion);
  const [addingLeaf, setAddingLeaf] = useState(false);
  const [leafTitle, setLeafTitle] = useState("");

  const handleSave = () => {
    onUpdate(trunk.id, { what, idea, conclusion });
  };

  return (
    <div className={`card overflow-hidden border-l-4 ${VALUE_BORDER[trunk.value]}`}>
      <div className="p-4">
        <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-primary">{trunk.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[trunk.status]}`}>{STATUS_LABEL[trunk.status]}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${VALUE_BADGE[trunk.value]}`}>重要度 {trunk.value}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-panel text-muted">{TRUNK_TYPE_LABELS[trunk.type]}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {linkedNuts && <span className="text-xs text-muted">🌰 {linkedNuts.name}</span>}
              {childLeaves.length > 0 && (
                <span className="text-xs text-muted">🍃 {childLeaves.filter((l) => l.completedAt).length}/{childLeaves.length}</span>
              )}
            </div>
            {/* What概要（カードフェイス） */}
            {trunk.what && !expanded && (
              <p className="text-sm text-muted mt-1 truncate">{trunk.what}</p>
            )}
          </div>
          <span className="text-muted text-sm">{expanded ? "▲" : "▼"}</span>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-panel pt-4 animate-slide-in">
            {/* ステータス変更 */}
            <div className="flex gap-2 flex-wrap">
              {(["pending", "in_progress", "done"] as const).map((s) => (
                <button key={s} onClick={() => onUpdate(trunk.id, { status: s })}
                  className={`px-3 py-1 rounded text-xs transition-colors ${trunk.status === s ? "bg-accent text-white" : "bg-panel text-muted hover:text-primary"}`}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>

            {/* What→Idea→Conclusion フロー */}
            <div className="relative pl-8">
              {/* 縦線 */}
              <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-panel" />

              {[
                { icon: "❓", label: "What（何が問題か）", value: what, setter: setWhat, placeholder: "問題の説明..." },
                { icon: "💡", label: "Idea（アイデア）", value: idea, setter: setIdea, placeholder: "解決のアイデア..." },
                { icon: "✅", label: "Conclusion（結論）", value: conclusion, setter: setConclusion, placeholder: "結論・実行内容..." },
              ].map((step, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  {/* ステップドット */}
                  <div className="absolute -left-8 top-2 w-6 h-6 rounded-full bg-panel border-2 border-panel flex items-center justify-center text-xs z-10">
                    {step.icon}
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">{step.label}</label>
                    <textarea value={step.value} onChange={(e) => step.setter(e.target.value)} className="w-full text-sm" rows={2} placeholder={step.placeholder} />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleSave} className="btn-primary text-sm">保存</button>

            {/* 子タスク一覧 */}
            <div className="bg-panel rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">🍃 タスク ({childLeaves.length})</span>
              </div>
              {childLeaves.length > 0 && (
                <div className="space-y-1">
                  {childLeaves.map((l) => {
                    const st = getLeafStatus(l);
                    return (
                      <div key={l.id} className="flex items-center gap-2 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${st === "completed" ? "bg-green-400" : st === "in_progress" ? "bg-accent" : "bg-gray-500"}`} />
                        <span className={`truncate ${st === "completed" ? "line-through text-muted" : "text-primary"}`}>{l.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {!addingLeaf ? (
                <button onClick={() => setAddingLeaf(true)} className="px-2 py-1 rounded text-xs bg-card border border-panel hover:border-accent transition-colors">+ タスク追加</button>
              ) : (
                <div className="flex gap-2 animate-slide-in">
                  <input type="text" value={leafTitle} onChange={(e) => setLeafTitle(e.target.value)} placeholder="タスク名" className="flex-1 text-sm" autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (leafTitle.trim()) {
                          onAddLeaf({ title: leafTitle.trim(), nutsId: trunk.nutsId, trunkId: trunk.id, difficulty: "easy", priority: "medium" });
                          setLeafTitle(""); setAddingLeaf(false);
                        }
                      }
                      if (e.key === "Escape") { setAddingLeaf(false); setLeafTitle(""); }
                    }} />
                  <button onClick={() => {
                    if (leafTitle.trim()) {
                      onAddLeaf({ title: leafTitle.trim(), nutsId: trunk.nutsId, trunkId: trunk.id, difficulty: "easy", priority: "medium" });
                      setLeafTitle(""); setAddingLeaf(false);
                    }
                  }} className="btn-primary text-xs">追加</button>
                  <button onClick={() => { setAddingLeaf(false); setLeafTitle(""); }} className="text-xs text-muted hover:text-primary">✕</button>
                </div>
              )}
            </div>

            {trunk.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {trunk.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-panel rounded text-xs text-muted">#{t}</span>)}
              </div>
            )}

            <button onClick={() => onDelete(trunk.id)} className="text-sm text-red-400 hover:underline">削除</button>
          </div>
        )}
      </div>
    </div>
  );
}
