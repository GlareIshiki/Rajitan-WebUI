"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTheme, ThemeColor } from "@/components/ThemeProvider";
import { api } from "@/lib/api";

interface Guild {
  id: string;
  name: string;
  memberCount: number;
  iconUrl: string | null;
}

interface GuildSettingsData {
  guildId: string;
  guildName: string;
  characterName: string;
  personalityType: string;
  features: {
    autoSummary: boolean;
    autoQuiz: boolean;
    autoMusic: boolean;
  };
}

interface GuildSettings {
  id: string;
  name: string;
  icon?: string;
  features: {
    autoSummary: boolean;
    autoQuiz: boolean;
    autoMusic: boolean;
  };
  character: string;
  summaryInterval: number;
  quizInterval: number;
}

const CHARACTER_TYPES = [
  { id: "default", name: "デフォルト", description: "バランスの取れた標準キャラクター" },
  { id: "cheerful", name: "チアフル", description: "明るく元気な雰囲気" },
  { id: "calm", name: "カーム", description: "落ち着いた穏やかな雰囲気" },
  { id: "witty", name: "ウィッティ", description: "機転の利いたユーモア" },
  { id: "professional", name: "プロフェッショナル", description: "ビジネスライクで的確" },
  { id: "friendly", name: "フレンドリー", description: "親しみやすく気さく" },
  { id: "sarcastic", name: "サーカスティック", description: "皮肉の効いた辛口" },
];

const THEME_OPTIONS: { id: ThemeColor; name: string; color: string }[] = [
  { id: "purple", name: "パープル", color: "bg-purple-500" },
  { id: "cyan", name: "シアン", color: "bg-cyan-500" },
  { id: "pink", name: "ピンク", color: "bg-pink-500" },
  { id: "green", name: "グリーン", color: "bg-green-500" },
  { id: "amber", name: "アンバー", color: "bg-amber-500" },
  { id: "rose", name: "ローズ", color: "bg-rose-500" },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme, toggleMode, isDark } = useTheme();
  const [guilds, setGuilds] = useState<GuildSettings[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<GuildSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch guilds list
  const fetchGuilds = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const guildList = await api.get<Guild[]>("/api/bot/guilds", token);

      // Fetch settings for each guild
      const guildSettingsList: GuildSettings[] = [];
      for (const guild of guildList) {
        try {
          const settings = await api.get<GuildSettingsData>(
            `/api/bot/guilds/${guild.id}/settings`,
            token
          );
          guildSettingsList.push({
            id: guild.id,
            name: guild.name,
            icon: guild.iconUrl || undefined,
            features: settings.features,
            character: settings.personalityType,
            summaryInterval: 30,
            quizInterval: 45,
          });
        } catch {
          // If settings fetch fails, use defaults
          guildSettingsList.push({
            id: guild.id,
            name: guild.name,
            icon: guild.iconUrl || undefined,
            features: { autoSummary: false, autoQuiz: false, autoMusic: false },
            character: "default",
            summaryInterval: 30,
            quizInterval: 45,
          });
        }
      }

      setGuilds(guildSettingsList);
      if (guildSettingsList.length > 0 && !selectedGuild) {
        setSelectedGuild(guildSettingsList[0]);
      }
    } catch (e) {
      console.error("Failed to fetch guilds:", e);
    } finally {
      setLoading(false);
    }
  }, [token, selectedGuild]);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  // When selecting a guild, fetch its latest settings
  const handleSelectGuild = useCallback(
    async (guild: GuildSettings) => {
      if (!token) {
        setSelectedGuild(guild);
        return;
      }

      try {
        const settings = await api.get<GuildSettingsData>(
          `/api/bot/guilds/${guild.id}/settings`,
          token
        );
        const updated: GuildSettings = {
          ...guild,
          features: settings.features,
          character: settings.personalityType,
        };
        setSelectedGuild(updated);
      } catch {
        setSelectedGuild(guild);
      }
    },
    [token]
  );

  const handleSave = async () => {
    if (!selectedGuild || !token) return;
    setSaving(true);

    try {
      await api.put(
        `/api/bot/guilds/${selectedGuild.id}/settings`,
        { personalityType: selectedGuild.character },
        token
      );

      // Update the guilds list with saved data
      setGuilds((prev) =>
        prev.map((g) =>
          g.id === selectedGuild.id ? { ...selectedGuild } : g
        )
      );

      alert("設定を保存しました");
    } catch (e) {
      console.error("Failed to save settings:", e);
      alert("設定の保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-muted">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-app text-primary p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-accent">設定</h1>

        {/* 外観設定 */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>🎨</span> 外観設定
          </h2>

          {/* ダーク/ライトモード切り替え */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-muted">モード</h3>
            <div className="flex gap-3">
              <button
                onClick={() => toggleMode()}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
                  isDark ? "bg-accent border-accent text-white" : "bg-panel border-panel text-primary"
                }`}
              >
                <span className="text-2xl">🌙</span>
                <span className="font-medium">ダーク</span>
                {isDark && <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/20">選択中</span>}
              </button>
              <button
                onClick={() => toggleMode()}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
                  !isDark ? "bg-accent border-accent text-white" : "bg-panel border-panel text-primary"
                }`}
              >
                <span className="text-2xl">☀️</span>
                <span className="font-medium">ライト</span>
                {!isDark && <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/20">選択中</span>}
              </button>
            </div>
          </div>

          {/* カラーテーマ */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted">アクセントカラー</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all bg-panel ${
                    theme === t.id ? "scale-105 border-accent shadow-glow-sm" : "border-panel"
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto rounded-full ${t.color} mb-2 shadow-lg ${theme === t.id ? 'ring-4 ring-white/50' : ''}`} />
                  <div className={`text-xs text-center font-medium ${theme === t.id ? "text-accent" : "text-muted"}`}>
                    {t.name}
                  </div>
                  {theme === t.id && <div className="absolute top-2 right-2 text-sm">✓</div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* サーバー一覧 */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h2 className="font-bold mb-4">サーバー一覧</h2>
              {loading ? (
                <div className="text-center py-4 text-muted">読み込み中...</div>
              ) : guilds.length === 0 ? (
                <div className="text-center py-4 text-muted">サーバーが見つかりません</div>
              ) : (
                <div className="space-y-2">
                  {guilds.map((guild) => (
                    <button
                      key={guild.id}
                      onClick={() => handleSelectGuild(guild)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedGuild?.id === guild.id
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

          {/* 設定フォーム */}
          <div className="lg:col-span-3 space-y-6">
            {selectedGuild && (
              <>
                {/* 自動機能設定 */}
                <div className="card p-6">
                  <h2 className="text-xl font-bold mb-4">自動機能</h2>
                  <div className="space-y-4">
                    <ToggleSetting
                      label="自動要約"
                      description="会話が落ち着いたタイミングで自動的に要約を生成"
                      checked={selectedGuild.features.autoSummary}
                      onChange={(checked) =>
                        setSelectedGuild({
                          ...selectedGuild,
                          features: { ...selectedGuild.features, autoSummary: checked },
                        })
                      }
                    />
                    <ToggleSetting
                      label="自動クイズ"
                      description="会話が盛り上がった後にクイズを提案"
                      checked={selectedGuild.features.autoQuiz}
                      onChange={(checked) =>
                        setSelectedGuild({
                          ...selectedGuild,
                          features: { ...selectedGuild.features, autoQuiz: checked },
                        })
                      }
                    />
                    <ToggleSetting
                      label="自動音楽推薦"
                      description="会話の雰囲気に合わせて音楽を推薦"
                      checked={selectedGuild.features.autoMusic}
                      onChange={(checked) =>
                        setSelectedGuild({
                          ...selectedGuild,
                          features: { ...selectedGuild.features, autoMusic: checked },
                        })
                      }
                    />
                  </div>
                </div>

                {/* キャラクター設定 */}
                <div className="card p-6">
                  <h2 className="text-xl font-bold mb-4">キャラクター</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CHARACTER_TYPES.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => setSelectedGuild({ ...selectedGuild, character: char.id })}
                        className={`p-4 rounded-xl text-left transition-all border ${
                          selectedGuild.character === char.id
                            ? "bg-accent text-white border-accent"
                            : "bg-card text-primary border-panel hover:border-accent"
                        }`}
                      >
                        <div className="font-medium">{char.name}</div>
                        <div className={`text-sm mt-1 ${selectedGuild.character === char.id ? "text-white/80" : "text-muted"}`}>
                          {char.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* タイミング設定 */}
                <div className="card p-6">
                  <h2 className="text-xl font-bold mb-4">タイミング設定</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        要約のクールダウン（分）
                      </label>
                      <input
                        type="number"
                        value={selectedGuild.summaryInterval}
                        onChange={(e) =>
                          setSelectedGuild({
                            ...selectedGuild,
                            summaryInterval: parseInt(e.target.value) || 30,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        クイズのクールダウン（分）
                      </label>
                      <input
                        type="number"
                        value={selectedGuild.quizInterval}
                        onChange={(e) =>
                          setSelectedGuild({
                            ...selectedGuild,
                            quizInterval: parseInt(e.target.value) || 45,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* 保存ボタン */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {saving ? "保存中..." : "設定を保存"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-panel">
      <div>
        <div className="font-medium text-primary">{label}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-accent" : "border-panel bg-card"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
