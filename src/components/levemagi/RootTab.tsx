"use client";

import { useState } from "react";
import type { Root, Nuts } from "@/lib/levemagi/types";
import { ROOT_TYPE_LABELS } from "@/lib/levemagi/constants";
import { EmptyState } from "./ui/EmptyState";

interface RootTabProps {
  roots: Root[];
  nuts: Nuts[];
  onAdd: (data: Omit<Root, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Root, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}

const TYPE_CARD_STYLE: Record<Root["type"], { bg: string; border: string }> = {
  seed: { bg: "bg-green-500/5", border: "border-dashed border-green-500/30" },
  knowledge: { bg: "bg-blue-500/5", border: "border-blue-500/20" },
  guide: { bg: "bg-purple-500/5", border: "border-purple-500/20" },
  column: { bg: "bg-orange-500/5", border: "border-orange-500/20" },
  archive: { bg: "bg-gray-500/5 opacity-75", border: "border-gray-500/20" },
};

const TYPE_BADGE: Record<Root["type"], string> = {
  seed: "bg-green-500/20 text-green-400 border-green-500/50",
  knowledge: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  guide: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  column: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  archive: "bg-gray-500/20 text-gray-400 border-gray-500/50",
};

const TYPE_ICON: Record<Root["type"], string> = {
  seed: "🌱",
  knowledge: "📚",
  guide: "📝",
  column: "💭",
  archive: "📦",
};

export function RootTab({ roots, nuts, onAdd, onUpdate, onDelete }: RootTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Root["type"]>("knowledge");
  const [what, setWhat] = useState("");
  const [content, setContent] = useState("");
  const [nutsId, setNutsId] = useState("");
  const [rootDifficulty, setRootDifficulty] = useState<1 | 2 | 3 | 0>(0);
  const [comment, setComment] = useState("");
  const [filter, setFilter] = useState<Root["type"] | "all">("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      type,
      what: what.trim(),
      content: content.trim(),
      nutsId: nutsId || undefined,
      difficulty: rootDifficulty ? (rootDifficulty as 1 | 2 | 3) : undefined,
      comment: comment.trim() || undefined,
      tags: [],
    });
    setTitle(""); setType("knowledge"); setWhat(""); setContent(""); setNutsId(""); setRootDifficulty(0); setComment(""); setIsAdding(false);
  };

  const filteredRoots = roots.filter((r) => filter === "all" || r.type === filter);
  const sortedRoots = [...filteredRoots].sort((a, b) => {
    const typeOrder = { seed: 0, knowledge: 1, guide: 2, column: 3, archive: 4 };
    return typeOrder[a.type] - typeOrder[b.type];
  });

  return (
    <div className="space-y-6">
      {/* フィルタ */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm transition-all ${filter === "all" ? "bg-accent text-white" : "bg-card border border-panel hover:border-accent"}`}>
          すべて ({roots.length})
        </button>
        {(Object.keys(ROOT_TYPE_LABELS) as Array<keyof typeof ROOT_TYPE_LABELS>).map((t) => {
          const count = roots.filter((r) => r.type === t).length;
          return (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-sm border transition-all ${filter === t ? TYPE_BADGE[t] : "bg-card border-panel hover:border-accent"}`}>
              {TYPE_ICON[t]} {ROOT_TYPE_LABELS[t]} ({count})
            </button>
          );
        })}
      </div>

      {!isAdding ? (
        <button onClick={() => setIsAdding(true)}
          className="w-full card p-4 text-center text-muted hover:text-primary hover:border-accent transition-all">
          + 新しいナレッジを追加
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4 animate-slide-in">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" className="w-full" autoFocus />
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">タイプ:</span>
              <select value={type} onChange={(e) => setType(e.target.value as Root["type"])} className="text-sm">
                {(Object.keys(ROOT_TYPE_LABELS) as Array<keyof typeof ROOT_TYPE_LABELS>).map((t) => (
                  <option key={t} value={t}>{ROOT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            {nuts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">成果物:</span>
                <select value={nutsId} onChange={(e) => setNutsId(e.target.value)} className="text-sm">
                  <option value="">なし</option>
                  {nuts.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">難易度:</span>
            <select value={rootDifficulty} onChange={(e) => setRootDifficulty(Number(e.target.value) as 0 | 1 | 2 | 3)} className="text-sm">
              <option value={0}>未設定</option>
              <option value={1}>★ 簡単</option>
              <option value={2}>★★ 普通</option>
              <option value={3}>★★★ 難しい</option>
            </select>
          </div>
          <input type="text" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="何についての知見か（任意）" className="w-full" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="詳細な内容" className="w-full h-32 resize-none" />
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="コメント（任意）" className="w-full h-16 resize-none" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">キャンセル</button>
            <button type="submit" className="btn-primary">追加</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sortedRoots.length === 0 ? (
          <EmptyState icon={filter === "all" ? "🌱" : TYPE_ICON[filter]}
            title={filter === "all" ? "ナレッジがありません" : `「${ROOT_TYPE_LABELS[filter]}」タイプのナレッジはありません`}
            description="学びや気づきを記録しましょう" />
        ) : sortedRoots.map((r) => (
          <RootItem key={r.id} root={r} nuts={nuts.find((n) => n.id === r.nutsId)}
            onUpdate={(data) => onUpdate(r.id, data)} onDelete={() => onDelete(r.id)} />
        ))}
      </div>
    </div>
  );
}

function RootItem({ root, nuts, onUpdate, onDelete }: {
  root: Root; nuts?: Nuts;
  onUpdate: (data: Partial<Omit<Root, "id" | "createdAt">>) => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardStyle = TYPE_CARD_STYLE[root.type];

  return (
    <div className={`card overflow-hidden border ${cardStyle.border}`}>
      {/* ヘッダー */}
      <div className={`p-4 cursor-pointer hover:bg-panel/50 transition-colors ${cardStyle.bg}`}
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{TYPE_ICON[root.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-primary">{root.title}</div>
            <div className="text-sm text-muted flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs border ${TYPE_BADGE[root.type]}`}>
                {ROOT_TYPE_LABELS[root.type]}
              </span>
              {root.difficulty && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-panel text-yellow-400">{"★".repeat(root.difficulty)}</span>
              )}
              {nuts && <><span>•</span><span>🌰 {nuts.name}</span></>}
            </div>
          </div>
          <span className="text-muted">{isExpanded ? "▼" : "▶"}</span>
        </div>

        {root.what && <p className="mt-2 text-sm text-muted">{root.what}</p>}

        {/* コンテンツプレビュー（非展開時） */}
        {!isExpanded && root.content && (
          <p className="mt-1 text-sm text-muted/70 line-clamp-2">{root.content}</p>
        )}

        {/* タグ（カードフェイスに表示） */}
        {root.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {root.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">#{t}</span>)}
          </div>
        )}
      </div>

      {/* 詳細 */}
      {isExpanded && (
        <div className="border-t border-panel p-4 animate-slide-in">
          {root.content ? (
            <div className="whitespace-pre-wrap text-primary mb-4">{root.content}</div>
          ) : (
            <p className="text-muted italic mb-4">内容がありません</p>
          )}

          {root.comment && (
            <div className="mb-4 p-3 bg-panel rounded-lg">
              <div className="text-xs text-muted mb-1">💬 コメント</div>
              <div className="text-sm text-primary whitespace-pre-wrap">{root.comment}</div>
            </div>
          )}

          {/* シード昇格 — 進化パス表示 */}
          {root.type === "seed" && (
            <div className="mb-4 p-3 bg-panel rounded-lg">
              <p className="text-sm text-muted mb-3">シードを昇格:</p>
              <div className="flex items-center gap-2 justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-xs text-green-400">Seed</div>
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { type: "knowledge" as const, icon: "📚", label: "ナレッジ", color: "border-blue-500/50 text-blue-400 hover:bg-blue-500/20" },
                    { type: "guide" as const, icon: "📝", label: "ガイド", color: "border-purple-500/50 text-purple-400 hover:bg-purple-500/20" },
                    { type: "archive" as const, icon: "📦", label: "アーカイブ", color: "border-gray-500/50 text-gray-400 hover:bg-gray-500/20" },
                  ].map((target) => (
                    <button key={target.type} onClick={() => onUpdate({ type: target.type })}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border transition-colors ${target.color}`}>
                      <span>→</span>
                      <span>{target.icon}</span>
                      <span>{target.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button onClick={onDelete} className="text-sm text-red-400 hover:underline">このナレッジを削除</button>
        </div>
      )}
    </div>
  );
}
