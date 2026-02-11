"use client";

import { useState, useCallback, useRef } from "react";
import type {
  Persona,
  PersonaCreate,
  PersonaUpdate,
  PersonalityTraits,
} from "@/types/persona";
import { DEFAULT_TRAITS, TRAIT_LABELS } from "@/types/persona";

interface PersonaEditorProps {
  persona?: Persona;
  onSave: (data: PersonaCreate | PersonaUpdate) => Promise<boolean>;
  onCancel: () => void;
  onAvatarUpload?: (file: File) => void;
}

export default function PersonaEditor({
  persona,
  onSave,
  onCancel,
  onAvatarUpload,
}: PersonaEditorProps) {
  const isEditing = !!persona;

  const [name, setName] = useState(persona?.name ?? "");
  const [displayName, setDisplayName] = useState(persona?.displayName ?? "");
  const [description, setDescription] = useState(persona?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(persona?.systemPrompt ?? "");
  const [traits, setTraits] = useState<PersonalityTraits>(
    persona?.personalityTraits ?? { ...DEFAULT_TRAITS }
  );
  const [isPublic, setIsPublic] = useState(persona?.isPublic ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTraitChange = useCallback(
    (key: keyof PersonalityTraits, value: number) => {
      setTraits((prev) => ({ ...prev, [key]: Math.round(value * 10) / 10 }));
    },
    []
  );

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload immediately if handler provided and persona exists
    if (onAvatarUpload && isEditing) {
      onAvatarUpload(file);
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const currentAvatar = avatarPreview || persona?.avatarUrl || null;
  const initial = (displayName || name || "?").charAt(0).toUpperCase();

  const handleSubmit = async () => {
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("名前は必須です");
      return;
    }
    if (trimmedName.length > 32) {
      setError("名前は32文字以内です");
      return;
    }
    if (systemPrompt.length > 4000) {
      setError("システムプロンプトは4000文字以内です");
      return;
    }

    setSaving(true);
    try {
      const data: PersonaCreate | PersonaUpdate = {
        name: trimmedName,
        displayName: displayName.trim(),
        description: description.trim(),
        systemPrompt: systemPrompt,
        personalityTraits: traits,
        isPublic,
      };
      const success = await onSave(data);
      if (!success) {
        setError("保存に失敗しました。名前が重複していないか確認してください。");
      }
    } catch {
      setError("保存中にエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-app border border-panel rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-accent mb-6">
            {isEditing ? "ペルソナを編集" : "新しいペルソナを作成"}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-panel bg-panel hover:border-accent transition-colors cursor-pointer group flex items-center justify-center relative"
              title="アバター画像を選択"
            >
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-muted group-hover:text-accent transition-colors">
                  {initial}
                </span>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            <div>
              <p className="text-sm font-medium text-primary">アバター画像</p>
              <p className="text-xs text-muted">
                PNG/JPEG/WebP/GIF, 2MB以下。256x256にリサイズされます
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-primary">
              名前 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-custom-persona"
              maxLength={32}
              className="w-full px-3 py-2 rounded-lg bg-card border border-panel text-primary focus:border-accent focus:outline-none"
            />
            <span className="text-xs text-muted">{name.length}/32</span>
          </div>

          {/* Display Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-primary">
              表示名
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="カスタムペルソナ"
              maxLength={64}
              className="w-full px-3 py-2 rounded-lg bg-card border border-panel text-primary focus:border-accent focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-primary">
              説明
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このペルソナの短い説明"
              maxLength={200}
              className="w-full px-3 py-2 rounded-lg bg-card border border-panel text-primary focus:border-accent focus:outline-none"
            />
          </div>

          {/* Trait Sliders */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-primary">
              パーソナリティトレイト
            </label>
            <div className="space-y-4 bg-panel rounded-xl p-4">
              {(Object.keys(TRAIT_LABELS) as (keyof PersonalityTraits)[]).map(
                (key) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-primary">
                        {TRAIT_LABELS[key]}
                      </span>
                      <span className="text-sm text-accent font-mono">
                        {traits[key].toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={traits[key]}
                      onChange={(e) =>
                        handleTraitChange(key, parseFloat(e.target.value))
                      }
                      className="w-full accent-[var(--theme-primary)]"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* System Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-primary">
              システムプロンプト（任意）
            </label>
            <p className="text-xs text-muted mb-2">
              空欄の場合、トレイト値からデフォルトプロンプトが自動生成されます
            </p>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="このペルソナのキャラクター設定を自由に記述..."
              rows={6}
              maxLength={4000}
              className="w-full px-3 py-2 rounded-lg bg-card border border-panel text-primary focus:border-accent focus:outline-none resize-y font-mono text-sm"
            />
            <span className="text-xs text-muted">
              {systemPrompt.length}/4000
            </span>
          </div>

          {/* Public Toggle */}
          <div className="mb-6 flex items-center justify-between bg-panel rounded-xl p-4">
            <div>
              <p className="text-sm font-medium text-primary">公開する</p>
              <p className="text-xs text-muted">
                他のサーバーからも利用可能になります
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                isPublic ? "bg-accent" : "bg-card border border-panel"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  isPublic ? "translate-x-5" : "translate-x-0.5"
                } mt-0.5`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="btn-secondary"
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "保存中..." : isEditing ? "更新" : "作成"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
