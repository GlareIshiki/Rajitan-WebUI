"use client";

import { useState } from "react";
import type { Nuts, Leaf } from "@/lib/levemagi/types";
import { getLeafStatus, getLeafXP } from "@/lib/levemagi/types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/levemagi/constants";

interface NutsTabProps {
  nuts: Nuts[];
  leaves: Leaf[];
  onAdd: (data: Omit<Nuts, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Nuts, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}

export function NutsTab({ nuts, leaves, onAdd, onUpdate, onDelete }: NutsTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      description: description.trim(),
      status: "someday",
      priority,
      difficulty,
      tags: [],
    });

    setName("");
    setDescription("");
    setPriority("medium");
    setDifficulty(3);
    setIsAdding(false);
  };

  // 進行中を上に
  const sortedNuts = [...nuts].sort((a, b) => {
    const statusOrder = { active: 0, someday: 1, blocked: 2, done: 3, archived: 4 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-6">
      {/* 追加ボタン */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full card p-4 text-center text-muted hover:text-primary hover:border-accent transition-all"
        >
          + 新しい成果物を追加
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="成果物の名前"
            className="w-full"
            autoFocus
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明（任意）"
            className="w-full h-20 resize-none"
          />

          <div className="flex gap-4 flex-wrap">
            {/* 優先度 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">優先度:</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
                className="text-sm"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            {/* 難易度 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">難易度:</span>
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`w-6 h-6 rounded text-sm transition-all ${
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
          </div>

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
        {sortedNuts.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            成果物がありません。上のボタンから追加してください。
          </div>
        ) : (
          sortedNuts.map((n) => (
            <NutsItem
              key={n.id}
              nuts={n}
              leaves={leaves.filter((l) => l.nutsId === n.id)}
              onUpdate={(data) => onUpdate(n.id, data)}
              onDelete={() => onDelete(n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NutsItem({
  nuts,
  leaves,
  onUpdate,
  onDelete,
}: {
  nuts: Nuts;
  leaves: Leaf[];
  onUpdate: (data: Partial<Omit<Nuts, "id" | "createdAt">>) => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 進捗計算
  const completedLeaves = leaves.filter((l) => getLeafStatus(l) === "completed");
  const progress = leaves.length > 0 ? (completedLeaves.length / leaves.length) * 100 : 0;
  const totalXP = leaves.reduce((sum, l) => sum + getLeafXP(l), 0);

  const statusColors = {
    someday: "text-gray-400",
    active: "text-green-400",
    blocked: "text-red-400",
    done: "text-blue-400",
    archived: "text-gray-600",
  };

  return (
    <div className="card overflow-hidden">
      {/* ヘッダー */}
      <div
        className="p-4 cursor-pointer hover:bg-panel transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌰</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-primary">{nuts.name}</div>
            <div className="text-sm text-muted flex items-center gap-2">
              <span className={statusColors[nuts.status]}>
                {STATUS_LABELS[nuts.status]}
              </span>
              <span>•</span>
              <span>優先度: {PRIORITY_LABELS[nuts.priority]}</span>
              <span>•</span>
              <span>{"★".repeat(nuts.difficulty)}</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-accent font-bold">{totalXP} XP</div>
            <div className="text-muted">
              {completedLeaves.length}/{leaves.length} タスク
            </div>
          </div>
          <span className="text-muted">{isExpanded ? "▼" : "▶"}</span>
        </div>

        {/* 進捗バー */}
        {leaves.length > 0 && (
          <div className="mt-3 h-2 bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* 詳細 */}
      {isExpanded && (
        <div className="border-t border-panel p-4 bg-panel/50">
          {nuts.description && (
            <p className="text-muted mb-4">{nuts.description}</p>
          )}

          {/* ステータス変更 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>).map((s) => (
              <button
                key={s}
                onClick={() => onUpdate({ status: s })}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  nuts.status === s
                    ? "bg-accent text-white"
                    : "bg-card border border-panel hover:border-accent"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* 削除 */}
          <button
            onClick={onDelete}
            className="text-sm text-danger hover:underline"
          >
            この成果物を削除
          </button>
        </div>
      )}
    </div>
  );
}
