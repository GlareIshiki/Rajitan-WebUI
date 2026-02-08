"use client";

import { useState } from "react";
import type { Resource, ResourceType } from "@/lib/levemagi/types";
import { RESOURCE_TYPES } from "@/lib/levemagi/constants";

interface ResourceTabProps {
  resources: Resource[];
  onAdd: (data: Omit<Resource, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Resource, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}

const TYPE_ICON: Record<ResourceType, string> = {
  "画像": "🖼️",
  "文書": "📄",
  "音楽": "🎵",
  "動画": "🎬",
  "歌詞": "🎤",
};

const TYPE_COLOR: Record<ResourceType, string> = {
  "画像": "bg-pink-500/20 text-pink-400",
  "文書": "bg-blue-500/20 text-blue-400",
  "音楽": "bg-purple-500/20 text-purple-400",
  "動画": "bg-red-500/20 text-red-400",
  "歌詞": "bg-green-500/20 text-green-400",
};

export function ResourceTab({ resources, onAdd, onUpdate, onDelete }: ResourceTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ResourceType>("文書");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [tagStr, setTagStr] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const tags = tagStr.split(",").map((t) => t.trim()).filter(Boolean);
    onAdd({
      name: name.trim(),
      type,
      tags,
      description: desc.trim() || undefined,
      url: url.trim() || undefined,
    });
    setName("");
    setDesc("");
    setUrl("");
    setTagStr("");
    setShowForm(false);
  };

  const filtered = filter === "all" ? resources : resources.filter((r) => r.type === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">リソース ({resources.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? "閉じる" : "+ 追加"}
        </button>
      </div>

      {/* タイプフィルタ */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === "all" ? "bg-accent text-white" : "bg-card border border-panel hover:border-accent"}`}>
          すべて ({resources.length})
        </button>
        {RESOURCE_TYPES.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === t ? "bg-accent text-white" : "bg-card border border-panel hover:border-accent"}`}>
            {TYPE_ICON[t]} {t} ({resources.filter((r) => r.type === t).length})
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="リソース名" className="w-full" autoFocus />
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-muted">種類:
              <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className="text-sm">
                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>)}
              </select>
            </label>
          </div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="説明（任意）" className="w-full" rows={2} />
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL（任意）" className="w-full text-sm" />
          <input type="text" value={tagStr} onChange={(e) => setTagStr(e.target.value)} placeholder="タグ（カンマ区切り）" className="w-full text-sm" />
          <button type="submit" className="btn-primary">作成</button>
        </form>
      )}

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="card p-8 text-center text-muted">リソースがありません</div>
        ) : sorted.map((res) => (
          <div key={res.id} className="card p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{TYPE_ICON[res.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-primary">{res.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_COLOR[res.type]}`}>{res.type}</span>
                </div>
                {res.description && <p className="text-sm text-muted mt-0.5">{res.description}</p>}
                {res.url && (
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-0.5 block truncate">{res.url}</a>
                )}
                {res.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {res.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-panel rounded text-xs text-muted">#{t}</span>)}
                  </div>
                )}
              </div>
              <button onClick={() => onDelete(res.id)} className="flex-shrink-0 text-muted hover:text-red-400 transition-colors text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
