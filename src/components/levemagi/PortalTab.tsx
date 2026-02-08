"use client";

import { useState, useMemo } from "react";
import type { Portal, Nuts, Leaf, Root, Trunk, Resource } from "@/lib/levemagi/types";
import { PORTAL_CATEGORIES } from "@/lib/levemagi/constants";

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

export function PortalTab({ portals, nuts, leaves, roots, trunks, resources, onAdd, onUpdate, onDelete }: PortalTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Portal["category"]>("🎨 創作・開発");
  const [desc, setDesc] = useState("");
  const [tagStr, setTagStr] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string>("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const tags = tagStr.split(",").map((t) => t.trim()).filter(Boolean);
    onAdd({ name: name.trim(), category, description: desc.trim(), tags });
    setName("");
    setDesc("");
    setTagStr("");
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
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ポータル名" className="w-full" autoFocus />
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-muted">カテゴリ:
              <select value={category} onChange={(e) => setCategory(e.target.value as Portal["category"])} className="text-sm">
                {PORTAL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
          </div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="説明" className="w-full" rows={2} />
          <input type="text" value={tagStr} onChange={(e) => setTagStr(e.target.value)} placeholder="タグ（カンマ区切り）" className="w-full text-sm" />
          <button type="submit" className="btn-primary">作成</button>
        </form>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-muted">ポータルがありません</div>
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

  // タグベースのフィルタリング
  const related = useMemo(() => {
    if (portalTags.length === 0) return { nuts: [], leaves: [], roots: [], trunks: [], resources: [] };
    const hasTag = (tags: string[]) => tags.some((t) => portalTags.includes(t));
    return {
      nuts: nuts.filter((n) => hasTag(n.tags)),
      leaves: leaves.filter((l) => {
        const n = nuts.find((nu) => nu.id === l.nutsId);
        return n && hasTag(n.tags);
      }),
      roots: roots.filter((r) => hasTag(r.tags)),
      trunks: trunks.filter((t) => hasTag(t.tags)),
      resources: resources.filter((r) => hasTag(r.tags)),
    };
  }, [portalTags, nuts, leaves, roots, trunks, resources]);

  const totalRelated = related.nuts.length + related.leaves.length + related.roots.length + related.trunks.length + related.resources.length;

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3 cursor-pointer" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-primary">{portal.name}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-panel text-muted">{portal.category}</span>
            {totalRelated > 0 && <span className="text-xs text-accent">{totalRelated}件関連</span>}
          </div>
          {portal.description && <p className="text-sm text-muted mt-1">{portal.description}</p>}
          {portal.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {portal.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">#{t}</span>)}
            </div>
          )}
        </div>
        <span className="text-muted text-sm">{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-panel pt-4">
          {portalTags.length === 0 ? (
            <p className="text-sm text-muted">タグを追加すると、関連するアイテムが自動的に表示されます。</p>
          ) : (
            <>
              {related.nuts.length > 0 && (
                <RelatedSection title="成果物" emoji="🌰" items={related.nuts.map((n) => ({ name: n.name, sub: n.status }))} />
              )}
              {related.trunks.length > 0 && (
                <RelatedSection title="イシュー" emoji="🪵" items={related.trunks.map((t) => ({ name: t.title, sub: t.status === "done" ? "完了" : t.status === "in_progress" ? "進行中" : "未着手" }))} />
              )}
              {related.leaves.length > 0 && (
                <RelatedSection title="タスク" emoji="🍃" items={related.leaves.map((l) => ({ name: l.title, sub: l.completedAt ? "完了" : l.startedAt ? "進行中" : "未着手" }))} />
              )}
              {related.roots.length > 0 && (
                <RelatedSection title="ナレッジ" emoji="🌱" items={related.roots.map((r) => ({ name: r.title, sub: r.type }))} />
              )}
              {related.resources.length > 0 && (
                <RelatedSection title="リソース" emoji="📁" items={related.resources.map((r) => ({ name: r.name, sub: r.type }))} />
              )}
              {totalRelated === 0 && <p className="text-sm text-muted">タグに一致するアイテムはありません。</p>}
            </>
          )}
          <button onClick={() => onDelete(portal.id)} className="text-sm text-red-400 hover:underline">削除</button>
        </div>
      )}
    </div>
  );
}

function RelatedSection({ title, emoji, items }: { title: string; emoji: string; items: { name: string; sub: string }[] }) {
  return (
    <div>
      <div className="text-xs text-muted mb-1">{emoji} {title} ({items.length})</div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-panel rounded px-3 py-1.5 text-sm">
            <span className="text-primary">{item.name}</span>
            <span className="text-xs text-muted">{item.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
