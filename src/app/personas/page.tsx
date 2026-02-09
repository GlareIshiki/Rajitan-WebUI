"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { usePersonas } from "@/hooks/usePersonas";
import PersonaCard from "@/components/PersonaCard";
import PersonaEditor from "@/components/PersonaEditor";
import type { Persona, PersonaCreate, PersonaUpdate } from "@/types/persona";
import { TRAIT_LABELS } from "@/types/persona";
import type { PersonalityTraits } from "@/types/persona";

type SortKey = "createdAt" | "name" | keyof PersonalityTraits;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "createdAt", label: "作成日時" },
  { value: "name", label: "名前" },
  ...Object.entries(TRAIT_LABELS).map(([key, label]) => ({
    value: key as keyof PersonalityTraits,
    label,
  })),
];

interface Guild {
  id: string;
  name: string;
  memberCount: number;
  iconUrl: string | null;
}

export default function PersonasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [guildsLoading, setGuildsLoading] = useState(true);

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");

  const token = (session as { accessToken?: string } | null)?.accessToken;

  const {
    personas,
    activePersonaId,
    loading: personasLoading,
    createPersona,
    updatePersona,
    deletePersona,
    setActivePersona,
  } = usePersonas(selectedGuildId, token);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch guilds
  const fetchGuilds = useCallback(async () => {
    if (!token) return;
    setGuildsLoading(true);
    try {
      const data = await api.get<Guild[]>("/api/bot/guilds", token);
      setGuilds(data);
      if (data.length > 0 && !selectedGuildId) {
        setSelectedGuildId(data[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch guilds:", e);
    } finally {
      setGuildsLoading(false);
    }
  }, [token, selectedGuildId]);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  // Handlers
  const handleCreate = useCallback(() => {
    setEditingPersona(undefined);
    setShowEditor(true);
  }, []);

  const handleEdit = useCallback((persona: Persona) => {
    setEditingPersona(persona);
    setShowEditor(true);
  }, []);

  const handleSave = useCallback(
    async (data: PersonaCreate | PersonaUpdate): Promise<boolean> => {
      if (editingPersona) {
        return await updatePersona(editingPersona.id, data as PersonaUpdate);
      } else {
        const result = await createPersona(data as PersonaCreate);
        return result !== null;
      }
    },
    [editingPersona, createPersona, updatePersona]
  );

  const handleSaveAndClose = useCallback(
    async (data: PersonaCreate | PersonaUpdate): Promise<boolean> => {
      const success = await handleSave(data);
      if (success) {
        setShowEditor(false);
        setEditingPersona(undefined);
      }
      return success;
    },
    [handleSave]
  );

  const handleDelete = useCallback(
    async (personaId: string) => {
      const success = await deletePersona(personaId);
      if (success) {
        setConfirmDelete(null);
      }
    },
    [deletePersona]
  );

  // Sort helper
  const sortPersonas = useCallback(
    (list: Persona[]) => {
      return [...list].sort((a, b) => {
        if (sortKey === "createdAt") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortKey === "name") {
          return (a.displayName || a.name).localeCompare(b.displayName || b.name, "ja");
        }
        // Trait sort: descending (higher value first)
        const traitA = a.personalityTraits?.[sortKey] ?? 0;
        const traitB = b.personalityTraits?.[sortKey] ?? 0;
        return traitB - traitA;
      });
    },
    [sortKey]
  );

  // Separate presets, own custom, and shared public
  const presetPersonas = useMemo(
    () => sortPersonas(personas.filter((p) => p.isPreset)),
    [personas, sortPersonas]
  );
  const ownPersonas = useMemo(
    () => sortPersonas(personas.filter((p) => !p.isPreset && p.guildId === selectedGuildId)),
    [personas, sortPersonas, selectedGuildId]
  );
  const sharedPersonas = useMemo(
    () => sortPersonas(personas.filter((p) => !p.isPreset && p.guildId !== selectedGuildId)),
    [personas, sortPersonas, selectedGuildId]
  );
  const customPersonas = useMemo(
    () => [...ownPersonas, ...sharedPersonas],
    [ownPersonas, sharedPersonas]
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-muted">読み込み中...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-app text-primary p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-accent">ペルソナ管理</h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Guild Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h2 className="font-bold mb-4">サーバー一覧</h2>
              {guildsLoading ? (
                <div className="text-center py-4 text-muted">読み込み中...</div>
              ) : guilds.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  サーバーが見つかりません
                </div>
              ) : (
                <div className="space-y-2">
                  {guilds.map((guild) => (
                    <button
                      key={guild.id}
                      onClick={() => setSelectedGuildId(guild.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedGuildId === guild.id
                          ? "bg-accent text-white"
                          : "bg-card text-primary hover:border-accent"
                      }`}
                    >
                      {guild.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Persona Panel */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedGuildId ? (
              <div className="card p-8 text-center text-muted">
                サーバーを選択してください
              </div>
            ) : personasLoading ? (
              <div className="card p-8 text-center text-muted">
                読み込み中...
              </div>
            ) : (
              <>
                {/* Sort */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">並び替え:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortKey(opt.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          sortKey === opt.value
                            ? "bg-accent text-white"
                            : "bg-card text-muted hover:text-primary hover:bg-panel"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Presets */}
                <div className="card p-6">
                  <h2 className="text-xl font-bold mb-4">プリセット</h2>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {presetPersonas.map((persona) => (
                      <PersonaCard
                        key={persona.id}
                        persona={persona}
                        isActive={activePersonaId === persona.id}
                        onActivate={() => setActivePersona(persona.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                      カスタム ({ownPersonas.length}/50)
                    </h2>
                    {ownPersonas.length < 50 && (
                      <button onClick={handleCreate} className="btn-primary text-sm">
                        + 新規作成
                      </button>
                    )}
                  </div>

                  {customPersonas.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <p className="mb-4">カスタムペルソナはまだありません</p>
                      <button
                        onClick={handleCreate}
                        className="btn-primary"
                      >
                        最初のペルソナを作成
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {customPersonas.map((persona) => {
                        const owned = persona.guildId === selectedGuildId;
                        return (
                        <div key={persona.id} className="relative">
                          <PersonaCard
                            persona={persona}
                            isActive={activePersonaId === persona.id}
                            isOwned={owned}
                            onActivate={() => setActivePersona(persona.id)}
                            onEdit={owned ? () => handleEdit(persona) : undefined}
                            onDelete={owned ? () => setConfirmDelete(persona.id) : undefined}
                          />

                          {/* Delete confirmation */}
                          {confirmDelete === persona.id && (
                            <div className="absolute inset-0 bg-app/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                              <p className="text-sm text-primary font-medium">
                                本当に削除しますか？
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDelete(persona.id)}
                                  className="px-4 py-1.5 rounded-lg bg-danger text-white text-sm"
                                >
                                  削除
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="btn-secondary text-sm"
                                >
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <PersonaEditor
          persona={editingPersona}
          onSave={handleSaveAndClose}
          onCancel={() => {
            setShowEditor(false);
            setEditingPersona(undefined);
          }}
        />
      )}
    </div>
  );
}
