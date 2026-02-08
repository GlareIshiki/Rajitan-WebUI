"use client";

import { useState } from "react";
import type { Leaf, Nuts } from "@/lib/levemagi/types";
import { getLeafStatus } from "@/lib/levemagi/types";

interface LeafTabProps {
  leaves: Leaf[];
  nuts: Nuts[];
  onAdd: (data: Omit<Leaf, "id" | "createdAt">) => void;
  onStart: (id: string) => void;
  onComplete: (id: string, createSeed: boolean) => number | null;
  onDelete: (id: string) => void;
  onXPGain: (xp: number) => void;
}

export function LeafTab({
  leaves,
  nuts,
  onAdd,
  onStart,
  onComplete,
  onDelete,
  onXPGain,
}: LeafTabProps) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [nutsId, setNutsId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      difficulty,
      nutsId: nutsId || undefined,
    });

    setTitle("");
    setDifficulty(1);
  };

  const handleComplete = (id: string) => {
    const xp = onComplete(id, false);
    if (xp) {
      onXPGain(xp);
    }
  };

  // 未完了タスクを上に、完了タスクを下に
  const sortedLeaves = [...leaves].sort((a, b) => {
    const statusA = getLeafStatus(a);
    const statusB = getLeafStatus(b);
    const order = { pending: 0, in_progress: 1, completed: 2 };
    return order[statusA] - order[statusB];
  });

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="card p-4 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タスクを追加（動詞で始める）"
            className="flex-1"
          />
          <button type="submit" className="btn-primary">
            追加
          </button>
        </div>

        <div className="flex gap-4 flex-wrap">
          {/* 難易度 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">難易度:</span>
            <div className="flex gap-1">
              {([1, 2, 3, 4, 5] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    difficulty >= d
                      ? "bg-accent text-white"
                      : "bg-card border border-panel"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
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
      </form>

      {/* タスク一覧 */}
      <div className="space-y-2">
        {sortedLeaves.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            タスクがありません。上のフォームから追加してください。
          </div>
        ) : (
          sortedLeaves.map((leaf) => (
            <LeafItem
              key={leaf.id}
              leaf={leaf}
              nuts={nuts.find((n) => n.id === leaf.nutsId)}
              onStart={() => onStart(leaf.id)}
              onComplete={() => handleComplete(leaf.id)}
              onDelete={() => onDelete(leaf.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function LeafItem({
  leaf,
  nuts,
  onStart,
  onComplete,
  onDelete,
}: {
  leaf: Leaf;
  nuts?: Nuts;
  onStart: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const status = getLeafStatus(leaf);

  return (
    <div
      className={`card p-4 flex items-center gap-4 transition-all ${
        status === "completed" ? "opacity-60" : ""
      }`}
    >
      {/* ステータスボタン */}
      <div className="flex-shrink-0">
        {status === "pending" && (
          <button
            onClick={onStart}
            className="w-10 h-10 rounded-full border-2 border-panel hover:border-accent transition-colors flex items-center justify-center"
            title="開始"
          >
            <span className="text-muted">▶</span>
          </button>
        )}
        {status === "in_progress" && (
          <button
            onClick={onComplete}
            className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center animate-pulse"
            title="完了"
          >
            ✓
          </button>
        )}
        {status === "completed" && (
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
            ✓
          </div>
        )}
      </div>

      {/* タイトル */}
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium ${status === "completed" ? "line-through text-muted" : "text-primary"}`}
        >
          {leaf.title}
        </div>
        {nuts && (
          <div className="text-xs text-muted mt-1">
            🌰 {nuts.name}
          </div>
        )}
      </div>

      {/* 難易度 */}
      <div className="flex-shrink-0 text-accent text-sm">
        {"★".repeat(leaf.difficulty)}
      </div>

      {/* 削除 */}
      {status !== "completed" && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 text-muted hover:text-danger transition-colors"
          title="削除"
        >
          ✕
        </button>
      )}
    </div>
  );
}
