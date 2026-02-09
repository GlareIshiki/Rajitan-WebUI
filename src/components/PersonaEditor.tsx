"use client";

import { useState, useCallback } from "react";
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
}

export default function PersonaEditor({
  persona,
  onSave,
  onCancel,
}: PersonaEditorProps) {
  const isEditing = !!persona;

  const [name, setName] = useState(persona?.name ?? "");
  const [displayName, setDisplayName] = useState(persona?.displayName ?? "");
  const [description, setDescription] = useState(persona?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(persona?.systemPrompt ?? "");
  const [traits, setTraits] = useState<PersonalityTraits>(
    persona?.personalityTraits ?? { ...DEFAULT_TRAITS }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTraitChange = useCallback(
    (key: keyof PersonalityTraits, value: number) => {
      setTraits((prev) => ({ ...prev, [key]: Math.round(value * 10) / 10 }));
    },
    []
  );

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
