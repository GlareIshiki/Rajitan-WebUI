"use client";

import { useState, useMemo } from "react";
import type { Portal, Nuts, Leaf, Root, Trunk, Resource, PortalCategory } from "@/lib/levemagi/types";
import { PORTAL_CATEGORIES } from "@/lib/levemagi/constants";
import { EmptyState } from "./ui/EmptyState";

interface PortalTabProps {
  portals: Portal[];
  nuts: Nuts[];
  leaves: Leaf[];
  roots: Root[];
  trunks: Trunk[];
  resources: Resource[];
  onAdd: (data: Omit<Portal, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Portal, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_COLOR: Record<PortalCategory, { border: string; bg: string }> = {
  "🎨 創作・開発": { border: "border-t-purple-500", bg: "bg-purple-500/5" },
  "📝 思考・学習": { border: "border-t-blue-500", bg: "bg-blue-500/5" },
  "📋 仕事・キャリア": { border: "border-t-green-500", bg: "bg-green-500/5" },
  "🏠 生活・健康": { border: "border-t-amber-500", bg: "bg-amber-500/5" },
  "🎮 エンタメ・趣味": { border: "border-t-pink-500", bg: "bg-pink-500/5" },
};

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <span key={i} className={`text-xs ${i <= rating ? "text-yellow-400" : "text-gray-600"}`}>★</span>
      ))}
    </div>
  );
}

export function PortalTab({ portals, nuts, leaves, roots, trunks, resources, onAdd, onUpdate, onDelete }: PortalTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Portal["category"]>("🎨 創作・開発");
  const [desc, setDesc] = useState("");
  const [tagStr, setTagStr] = useState("");
  const [rating, setRating] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string>("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const tags = tagStr.split(",").map((t) => t.trim()).filter(Boolean);
    onAdd({ name: name.trim(), category, description: desc.trim(), tags, rating: rating || undefined });
    setName("");
    setDesc("");
    setTagStr("");
    setRating(0);
    setShowForm(false);
  };

  const filtered = catFilter === "all" ? portals : portals.filter((p) => p.category === catFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">ポータル ({portals.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? "閉じる" : "+ 追加"}
        </button>
      </div>

      {/* カテゴリフィルタ */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCatFilter("all")}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${catFilter === "all" ? "bg-accent text-white" : "bg-card border border-panel hover:border-accent"}`}>
          すべて ({portals.length})
        </button>
        {PORTAL_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${catFilter === cat ? "bg-accent text-white" : "bg-card border border-panel hover:border-accent"}`}>
            {cat} ({portals.filter((p) => p.category === cat).length})
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3 animate-slide-in">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ポータル名" className="w-full" autoFocus />
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-muted">カテゴリ:
              <select value={category} onChange={(e) => setCategory(e.target.value as Portal["category"])} className="text-sm">
                {PORTAL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">評価:
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <button key={i} type="button" onClick={() => setRating(i === rating ? 0 : i)}
                    className={`text-base transition-colors ${i <= rating ? "text-yellow-400" : "text-gray-600 hover:text-yellow-300"}`}>★</button>
                ))}
              </div>
            </label>
          </div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="説明" className="w-full" rows={2} />
          <input type="text" value={tagStr} onChange={(e) => setTagStr(e.target.value)} placeholder="タグ（カンマ区切り）" className="w-full text-sm" />
          <button type="submit" className="btn-primary">作成</button>
        </form>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState icon="🌀" title="ポータルがありません" description="タグで情報をつなぐハブを作りましょう" action={{ label: "+ 追加", onClick: () => setShowForm(true) }} />
        ) : filtered.map((portal) => (
          <PortalCard key={portal.id} portal={portal}
            nuts={nuts} leaves={leaves} roots={roots} trunks={trunks} resources={resources}
            isExpanded={expanded === portal.id}
            onToggle={() => setExpanded(expanded === portal.id ? null : portal.id)}
            onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function PortalCard({ portal, nuts, leaves, roots, trunks, resources, isExpanded, onToggle, onUpdate, onDelete }: {
  portal: Portal;
  nuts: Nuts[];
  leaves: Leaf[];
  roots: Root[];
  trunks: Trunk[];
  resources: Resource[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, data: Partial<Omit<Portal, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}) {
  const portalTags = portal.tags;
  const catStyle = CATEGORY_COLOR[portal.category];

  const related = useMemo(() => {
    if (portalTags.length === 0) return { nuts: [], leaves: [], roots: [], trunks: [], resources: [] };
    const hasTag = (tags: string[]) => tags.some((t) => portalTags.includes(t));
    return {
      nuts: nuts.filter((n) => hasTag(n.tags)),
      leaves: leaves.filter((l) => { const n = nuts.find((nu) => nu.id === l.nutsId); return n && hasTag(n.tags); }),
      roots: roots.filter((r) => hasTag(r.tags)),
      trunks: trunks.filter((t) => { const n = nuts.find((nu) => nu.id === t.nutsId); return n && hasTag(n.tags); }),
      resources: resources.filter((r) => hasTag(r.tags)),
    };
  }, [portalTags, nuts, leaves, roots, trunks, resources]);

  const counts = [
    { emoji: "🌰", count: related.nuts.length },
    { emoji: "🍃", count: related.leaves.length },
    { emoji: "🪵", count: related.trunks.length },
    { emoji: "🌱", count: related.roots.length },
    { emoji: "📁", count: related.resources.length },
  ].filter((c) => c.count > 0);

  return (
    <div className={`card overflow-hidden border-t-4 ${catStyle.border}`}>
      <div className={`p-4 ${catStyle.bg}`}>
        {/* カードフェイス */}
        <div className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* タイトル行 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-primary text-lg">{portal.name}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-panel text-muted">{portal.category}</span>
                <StarRating rating={portal.rating} />
              </div>

              {/* 説明（2行まで） */}
              {portal.description && (
                <p className="text-sm text-muted mt-1 line-clamp-2">{portal.description}</p>
              )}

              {/* 関連アイテムミニバッジ */}
              {counts.length > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  {counts.map((c, i) => (
                    <span key={i} className="flex items-center gap-0.5 text-xs text-muted">
                      <span>{c.emoji}</span>
                      <span className="font-medium text-primary">{c.count}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* タグ */}
              {portal.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {portal.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">#{t}</span>)}
                </div>
              )}
            </div>
            <span className="text-muted text-sm">{isExpanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>

      {/* 展開セクション */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-panel animate-slide-in">
          {portalTags.length === 0 ? (
            <p className="text-sm text-muted">タグを追加すると、関連するアイテムが自動的に表示されます。</p>
          ) : (
            <>
              {related.nuts.length > 0 && (
                <RelatedSection title="成果物" emoji="🌰" color="border-l-purple-500"
                  items={related.nuts.map((n) => ({ name: n.name, status: n.status, statusColor: "text-accent" }))} />
              )}
              {related.trunks.length > 0 && (
                <RelatedSection title="イシュー" emoji="🪵" color="border-l-amber-500"
                  items={related.trunks.map((t) => ({ name: t.title, status: t.status === "done" ? "完了" : t.status === "in_progress" ? "進行中" : "未着手", statusColor: t.status === "done" ? "text-green-400" : t.status === "in_progress" ? "text-accent" : "text-muted" }))} />
              )}
              {related.leaves.length > 0 && (
                <RelatedSection title="タスク" emoji="🍃" color="border-l-green-500"
                  items={related.leaves.map((l) => ({ name: l.title, status: l.completedAt ? "完了" : l.startedAt ? "進行中" : "未着手", statusColor: l.completedAt ? "text-green-400" : l.startedAt ? "text-accent" : "text-muted" }))} />
              )}
              {related.roots.length > 0 && (
                <RelatedSection title="ナレッジ" emoji="🌱" color="border-l-blue-500"
                  items={related.roots.map((r) => ({ name: r.title, status: r.type, statusColor: "text-muted" }))} />
              )}
              {related.resources.length > 0 && (
                <RelatedSection title="リソース" emoji="📁" color="border-l-pink-500"
                  items={related.resources.map((r) => ({ name: r.name, status: r.type, statusColor: "text-muted" }))} />
              )}
              {counts.length === 0 && <p className="text-sm text-muted">タグに一致するアイテムはありません。</p>}
            </>
          )}
          <button onClick={() => onDelete(portal.id)} className="text-sm text-red-400 hover:underline">削除</button>
        </div>
      )}
    </div>
  );
}

function RelatedSection({ title, emoji, color, items }: {
  title: string; emoji: string; color: string;
  items: { name: string; status: string; statusColor: string }[];
}) {
  return (
    <div>
      <div className="text-xs text-muted mb-1.5">{emoji} {title} ({items.length})</div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center justify-between bg-panel rounded-lg px-3 py-2 text-sm border-l-2 ${color}`}>
            <span className="text-primary">{item.name}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${item.statusColor === "text-green-400" ? "bg-green-400" : item.statusColor === "text-accent" ? "bg-accent" : "bg-gray-500"}`} />
              <span className={`text-xs ${item.statusColor}`}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
