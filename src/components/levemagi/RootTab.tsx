"use client";

import { useState } from "react";
import type { Root, Nuts } from "@/lib/levemagi/types";
import { ROOT_TYPE_LABELS } from "@/lib/levemagi/constants";

interface RootTabProps {
  roots: Root[];
  nuts: Nuts[];
  onAdd: (data: Omit<Root, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Root, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}

export function RootTab({ roots, nuts, onAdd, onUpdate, onDelete }: RootTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Root["type"]>("knowledge");
  const [what, setWhat] = useState("");
  const [content, setContent] = useState("");
  const [nutsId, setNutsId] = useState("");
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
      tags: [],
    });

    setTitle("");
    setType("knowledge");
    setWhat("");
    setContent("");
    setNutsId("");
    setIsAdding(false);
  };

  // フィルタ適用
  const filteredRoots = roots.filter((r) => filter === "all" || r.type === filter);

  // タイプでソート（シード優先）
  const sortedRoots = [...filteredRoots].sort((a, b) => {
    const typeOrder = { seed: 0, knowledge: 1, guide: 2, column: 3, archive: 4 };
    return typeOrder[a.type] - typeOrder[b.type];
  });

  const typeColors = {
    seed: "bg-green-500/20 text-green-400 border-green-500/50",
    knowledge: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    guide: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    column: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    archive: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  };

  return (
    <div className="space-y-6">
      {/* フィルタ */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm transition-all ${
            filter === "all"
              ? "bg-accent text-white"
              : "bg-card border border-panel hover:border-accent"
          }`}
        >
          すべて ({roots.length})
        </button>
        {(Object.keys(ROOT_TYPE_LABELS) as Array<keyof typeof ROOT_TYPE_LABELS>).map((t) => {
          const count = roots.filter((r) => r.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-sm border transition-all ${
                filter === t ? typeColors[t] : "bg-card border-panel hover:border-accent"
              }`}
            >
              {ROOT_TYPE_LABELS[t]} ({count})
            </button>
          );
        })}
      </div>

      {/* 追加ボタン */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full card p-4 text-center text-muted hover:text-primary hover:border-accent transition-all"
        >
          + 新しいナレッジを追加
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            className="w-full"
            autoFocus
          />

          <div className="flex gap-4 flex-wrap">
            {/* タイプ */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">タイプ:</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Root["type"])}
                className="text-sm"
              >
                {(Object.keys(ROOT_TYPE_LABELS) as Array<keyof typeof ROOT_TYPE_LABELS>).map(
                  (t) => (
                    <option key={t} value={t}>
                      {ROOT_TYPE_LABELS[t]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* 成果物紐づけ */}
            {nuts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">成果物:</span>
                <select
                  value={nutsId}
                  onChange={(e) => setNutsId(e.target.value)}
                  className="text-sm"
                >
                  <option value="">なし</option>
                  {nuts.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <input
            type="text"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="何についての知見か（任意）"
            className="w-full"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="詳細な内容"
            className="w-full h-32 resize-none"
          />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn-secondary"
            >
              キャンセル
            </button>
            <button type="submit" className="btn-primary">
              追加
            </button>
          </div>
        </form>
      )}

      {/* 一覧 */}
      <div className="space-y-3">
        {sortedRoots.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            {filter === "all"
              ? "ナレッジがありません。上のボタンから追加してください。"
              : `「${ROOT_TYPE_LABELS[filter]}」タイプのナレッジはありません。`}
          </div>
        ) : (
          sortedRoots.map((r) => (
            <RootItem
              key={r.id}
              root={r}
              nuts={nuts.find((n) => n.id === r.nutsId)}
              typeColors={typeColors}
              onUpdate={(data) => onUpdate(r.id, data)}
              onDelete={() => onDelete(r.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RootItem({
  root,
  nuts,
  typeColors,
  onUpdate,
  onDelete,
}: {
  root: Root;
  nuts?: Nuts;
  typeColors: Record<Root["type"], string>;
  onUpdate: (data: Partial<Omit<Root, "id" | "createdAt">>) => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeIcons = {
    seed: "🌱",
    knowledge: "📚",
    guide: "📝",
    column: "💭",
    archive: "📦",
  };

  return (
    <div className="card overflow-hidden">
      {/* ヘッダー */}
      <div
        className="p-4 cursor-pointer hover:bg-panel transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeIcons[root.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-primary">{root.title}</div>
            <div className="text-sm text-muted flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs border ${typeColors[root.type]}`}
              >
                {ROOT_TYPE_LABELS[root.type]}
              </span>
              {nuts && (
                <>
                  <span>•</span>
                  <span>🌰 {nuts.name}</span>
                </>
              )}
            </div>
          </div>
          <span className="text-muted">{isExpanded ? "▼" : "▶"}</span>
        </div>

        {root.what && (
          <p className="mt-2 text-sm text-muted">{root.what}</p>
        )}
      </div>

      {/* 詳細 */}
      {isExpanded && (
        <div className="border-t border-panel p-4 bg-panel/50">
          {root.content ? (
            <div className="whitespace-pre-wrap text-primary mb-4">{root.content}</div>
          ) : (
            <p className="text-muted italic mb-4">内容がありません</p>
          )}

          {/* タイプ変更 */}
          {root.type === "seed" && (
            <div className="mb-4">
              <p className="text-sm text-muted mb-2">シードを昇格:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate({ type: "knowledge" })}
                  className="px-3 py-1 rounded-full text-sm border border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                >
                  → ナレッジ
                </button>
                <button
                  onClick={() => onUpdate({ type: "guide" })}
                  className="px-3 py-1 rounded-full text-sm border border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                >
                  → ガイド
                </button>
                <button
                  onClick={() => onUpdate({ type: "archive" })}
                  className="px-3 py-1 rounded-full text-sm border border-gray-500/50 text-gray-400 hover:bg-gray-500/20"
                >
                  → アーカイブ
                </button>
              </div>
            </div>
          )}

          {/* 削除 */}
          <button
            onClick={onDelete}
            className="text-sm text-danger hover:underline"
          >
            このナレッジを削除
          </button>
        </div>
      )}
    </div>
  );
}
