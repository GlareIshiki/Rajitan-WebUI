"use client";

import type { Persona, PersonalityTraits } from "@/types/persona";
import { TRAIT_LABELS } from "@/types/persona";

interface PersonaCardProps {
  persona: Persona;
  isActive: boolean;
  isOwned?: boolean;
  onActivate: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PersonaCard({
  persona,
  isActive,
  isOwned = true,
  onActivate,
  onEdit,
  onDelete,
}: PersonaCardProps) {
  const traits = persona.personalityTraits;

  return (
    <div
      className={`relative p-5 rounded-xl border-2 transition-all ${
        isActive
          ? "border-accent bg-accent/10 shadow-glow-sm"
          : "border-panel bg-card hover:border-accent/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-primary truncate">
              {persona.displayName || persona.name}
            </h3>
            {persona.isPreset && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-accent/20 text-accent">
                プリセット
              </span>
            )}
            {persona.isPublic && !persona.isPreset && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                公開
              </span>
            )}
            {isActive && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                アクティブ
              </span>
            )}
          </div>
          {persona.description && (
            <p className="text-sm text-muted mt-1 line-clamp-2">
              {persona.description}
            </p>
          )}
        </div>
      </div>

      {/* Trait Bars */}
      <div className="space-y-1.5 mb-4">
        {(Object.keys(TRAIT_LABELS) as (keyof PersonalityTraits)[]).map(
          (key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-muted w-24 shrink-0">
                {TRAIT_LABELS[key]}
              </span>
              <div className="flex-1 h-2 rounded-full bg-panel overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${(traits?.[key] ?? 0.5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted w-8 text-right">
                {((traits?.[key] ?? 0.5) * 10).toFixed(0)}
              </span>
            </div>
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isActive && (
          <button
            onClick={onActivate}
            className="btn-primary text-sm flex-1"
          >
            アクティブにする
          </button>
        )}
        {!persona.isPreset && isOwned && onEdit && (
          <button
            onClick={onEdit}
            className="btn-secondary text-sm"
          >
            編集
          </button>
        )}
        {!persona.isPreset && isOwned && onDelete && (
          <button
            onClick={onDelete}
            className="text-sm px-3 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}
