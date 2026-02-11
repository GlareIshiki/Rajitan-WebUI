"use client";

import { useRef, useState } from "react";
import type { Persona, PersonalityTraits } from "@/types/persona";
import { TRAIT_LABELS } from "@/types/persona";
import AvatarCropModal from "@/components/AvatarCropModal";

interface PersonaCardProps {
  persona: Persona;
  isActive: boolean;
  isOwned?: boolean;
  onActivate: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAvatarUpload?: (file: File) => void;
}

export default function PersonaCard({
  persona,
  isActive,
  isOwned = true,
  onActivate,
  onEdit,
  onDelete,
  onAvatarUpload,
}: PersonaCardProps) {
  const traits = persona.personalityTraits;
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const handleAvatarClick = () => {
    if (onAvatarUpload) {
      fileRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show crop modal instead of uploading directly
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCropConfirm = (croppedFile: File) => {
    setCropSrc(null);
    onAvatarUpload?.(croppedFile);
  };

  const initial = (persona.displayName || persona.name).charAt(0).toUpperCase();

  return (
    <>
      <div
        className={`relative p-5 rounded-xl border-2 transition-all ${
          isActive
            ? "border-accent bg-accent/10 shadow-glow-sm"
            : "border-panel bg-card hover:border-accent/50"
        }`}
      >
        {/* Header with Avatar */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className={`shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-panel bg-panel flex items-center justify-center ${
              onAvatarUpload ? "cursor-pointer hover:border-accent group" : "cursor-default"
            }`}
            title={onAvatarUpload ? "アバターを変更" : undefined}
          >
            {persona.avatarUrl ? (
              <img
                src={persona.avatarUrl}
                alt={persona.displayName || persona.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-muted group-hover:text-accent transition-colors">
                {initial}
              </span>
            )}
            {onAvatarUpload && (
              <div className="absolute w-12 h-12 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Name + badges */}
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

      {/* Crop Modal */}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </>
  );
}
