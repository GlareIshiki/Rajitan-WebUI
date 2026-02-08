"use client";

import { useState } from "react";
import type { Trunk, Nuts } from "@/lib/levemagi/types";
import { TRUNK_TYPE_LABELS, PRIORITY_LABELS } from "@/lib/levemagi/constants";

interface TrunkTabProps {
  trunks: Trunk[];
  nuts: Nuts[];
  onAdd: (data: Omit<Trunk, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Trunk, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
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

const VALUE_BADGE: Record<number, string> = {
  1: "bg-blue-500/20 text-blue-400",
  2: "bg-yellow-500/20 text-yellow-400",
  3: "bg-red-500/20 text-red-400",
};

export function TrunkTab({ trunks, nuts, onAdd, onUpdate, onDelete }: TrunkTabProps) {
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
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
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
          <div className="card p-8 text-center text-muted">イシューがありません</div>
        ) : sorted.map((trunk) => (
          <TrunkItem key={trunk.id} trunk={trunk} linkedNuts={nuts.find((n) => n.id === trunk.nutsId)} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function TrunkItem({ trunk, linkedNuts, onUpdate, onDelete }: {
  trunk: Trunk;
  linkedNuts?: Nuts;
  onUpdate: (id: string, data: Partial<Omit<Trunk, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [what, setWhat] = useState(trunk.what);
  const [idea, setIdea] = useState(trunk.idea);
  const [conclusion, setConclusion] = useState(trunk.conclusion);

  const handleSave = () => {
    onUpdate(trunk.id, { what, idea, conclusion });
  };

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-primary">{trunk.title}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[trunk.status]}`}>{STATUS_LABEL[trunk.status]}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${VALUE_BADGE[trunk.value]}`}>重要度 {trunk.value}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-panel text-muted">{TRUNK_TYPE_LABELS[trunk.type]}</span>
          </div>
          {linkedNuts && <div className="text-xs text-muted mt-1">🌰 {linkedNuts.name}</div>}
        </div>
        <span className="text-muted text-sm">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-panel pt-4">
          {/* ステータス変更 */}
          <div className="flex gap-2 flex-wrap">
            {(["pending", "in_progress", "done"] as const).map((s) => (
              <button key={s} onClick={() => onUpdate(trunk.id, { status: s })}
                className={`px-3 py-1 rounded text-xs transition-colors ${trunk.status === s ? "bg-accent text-white" : "bg-panel text-muted hover:text-primary"}`}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          {/* What / Idea / Conclusion */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted block mb-1">What（何が問題か）</label>
              <textarea value={what} onChange={(e) => setWhat(e.target.value)} className="w-full text-sm" rows={2} placeholder="問題の説明..." />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Idea（アイデア）</label>
              <textarea value={idea} onChange={(e) => setIdea(e.target.value)} className="w-full text-sm" rows={2} placeholder="解決のアイデア..." />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Conclusion（結論）</label>
              <textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} className="w-full text-sm" rows={2} placeholder="結論・実行内容..." />
            </div>
            <button onClick={handleSave} className="btn-primary text-sm">保存</button>
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
  );
}
