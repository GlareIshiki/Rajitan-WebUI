"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme, ThemeColor } from "@/components/ThemeProvider";

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
  const { theme, setTheme, mode, toggleMode, isDark } = useTheme();
  const [guilds, setGuilds] = useState<GuildSettings[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<GuildSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // デモデータ
    const demoGuilds: GuildSettings[] = [
      {
        id: "1",
        name: "テストサーバー",
        features: { autoSummary: true, autoQuiz: true, autoMusic: false },
        character: "cheerful",
        summaryInterval: 30,
        quizInterval: 45,
      },
      {
        id: "2",
        name: "開発サーバー",
        features: { autoSummary: true, autoQuiz: false, autoMusic: true },
        character: "professional",
        summaryInterval: 60,
        quizInterval: 60,
      },
    ];
    setGuilds(demoGuilds);
    setSelectedGuild(demoGuilds[0]);
  }, []);

  const handleSave = async () => {
    if (!selectedGuild) return;
    setSaving(true);
    // API呼び出し（デモ）
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert("設定を保存しました");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 transition-colors" style={{ backgroundColor: 'var(--mode-bg)', color: 'var(--mode-text)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--theme-primary)' }}>設定</h1>

        {/* 外観設定 */}
        <div className="mb-8 backdrop-blur-xl rounded-2xl p-6" style={{ backgroundColor: 'var(--mode-bg-card)', border: '1px solid var(--mode-border)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>🎨</span> 外観設定
          </h2>

          {/* ダーク/ライトモード切り替え */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--mode-text-secondary)' }}>モード</h3>
            <div className="flex gap-3">
              <button
                onClick={() => toggleMode()}
                className="flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3"
                style={{
                  borderColor: isDark ? 'var(--theme-primary)' : 'var(--mode-border)',
                  backgroundColor: isDark ? 'var(--theme-primary)' : 'var(--mode-bg-secondary)',
                  color: isDark ? 'white' : 'var(--mode-text)',
                }}
              >
                <span className="text-2xl">🌙</span>
                <span className="font-medium">ダーク</span>
                {isDark && <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/20">選択中</span>}
              </button>
              <button
                onClick={() => toggleMode()}
                className="flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3"
                style={{
                  borderColor: !isDark ? 'var(--theme-primary)' : 'var(--mode-border)',
                  backgroundColor: !isDark ? 'var(--theme-primary)' : 'var(--mode-bg-secondary)',
                  color: !isDark ? 'white' : 'var(--mode-text)',
                }}
              >
                <span className="text-2xl">☀️</span>
                <span className="font-medium">ライト</span>
                {!isDark && <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/20">選択中</span>}
              </button>
            </div>
          </div>

          {/* カラーテーマ */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--mode-text-secondary)' }}>アクセントカラー</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    theme === t.id ? "scale-105" : ""
                  }`}
                  style={{
                    borderColor: theme === t.id ? 'var(--theme-primary)' : 'var(--mode-border)',
                    backgroundColor: 'var(--mode-bg-secondary)',
                    boxShadow: theme === t.id ? '0 0 0 3px var(--theme-glow)' : 'none',
                  }}
                >
                  <div className={`w-10 h-10 mx-auto rounded-full ${t.color} mb-2 shadow-lg ${theme === t.id ? 'ring-4 ring-white/50' : ''}`} />
                  <div className="text-xs text-center font-medium" style={{ color: theme === t.id ? 'var(--theme-primary)' : 'var(--mode-text-secondary)' }}>{t.name}</div>
                  {theme === t.id && (
                    <div className="absolute top-2 right-2 text-sm">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* サーバー一覧 */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl rounded-2xl p-4" style={{ backgroundColor: 'var(--mode-bg-card)', border: '1px solid var(--mode-border)' }}>
              <h2 className="font-bold mb-4">サーバー一覧</h2>
              <div className="space-y-2">
                {guilds.map((guild) => (
                  <button
                    key={guild.id}
                    onClick={() => setSelectedGuild(guild)}
                    className="w-full text-left p-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: selectedGuild?.id === guild.id ? 'var(--theme-primary)' : 'var(--mode-bg-card)',
                      color: selectedGuild?.id === guild.id ? 'white' : 'var(--mode-text)',
                    }}
                  >
                    {guild.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 設定フォーム */}
          <div className="lg:col-span-3 space-y-6">
            {selectedGuild && (
              <>
                {/* 自動機能設定 */}
                <div className="backdrop-blur-xl rounded-2xl p-6" style={{ backgroundColor: 'var(--mode-bg-card)', border: '1px solid var(--mode-border)' }}>
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
                <div className="backdrop-blur-xl rounded-2xl p-6" style={{ backgroundColor: 'var(--mode-bg-card)', border: '1px solid var(--mode-border)' }}>
                  <h2 className="text-xl font-bold mb-4">キャラクター</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CHARACTER_TYPES.map((char) => (
                      <button
                        key={char.id}
                        onClick={() =>
                          setSelectedGuild({ ...selectedGuild, character: char.id })
                        }
                        className="p-4 rounded-xl text-left transition-all"
                        style={{
                          backgroundColor: selectedGuild.character === char.id ? 'var(--theme-primary)' : 'var(--mode-bg-card)',
                          color: selectedGuild.character === char.id ? 'white' : 'var(--mode-text)',
                          border: selectedGuild.character === char.id ? '2px solid var(--theme-primary)' : '1px solid var(--mode-border)',
                        }}
                      >
                        <div className="font-medium">{char.name}</div>
                        <div className="text-sm mt-1" style={{ color: selectedGuild.character === char.id ? 'rgba(255,255,255,0.8)' : 'var(--mode-text-secondary)' }}>
                          {char.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* タイミング設定 */}
                <div className="backdrop-blur-xl rounded-2xl p-6" style={{ backgroundColor: 'var(--mode-bg-card)', border: '1px solid var(--mode-border)' }}>
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
                        className="w-full rounded-xl px-4 py-3 focus:ring-2 focus:outline-none transition-all"
                        style={{ backgroundColor: 'var(--mode-bg-secondary)', border: '1px solid var(--mode-border)', color: 'var(--mode-text)' }}
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
                        className="w-full rounded-xl px-4 py-3 focus:ring-2 focus:outline-none transition-all"
                        style={{ backgroundColor: 'var(--mode-bg-secondary)', border: '1px solid var(--mode-border)', color: 'var(--mode-text)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 保存ボタン */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-[var(--theme-primary)] hover:opacity-90 rounded-xl font-bold transition-all disabled:opacity-50"
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
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--mode-bg-secondary)' }}>
      <div>
        <div className="font-medium" style={{ color: 'var(--mode-text)' }}>{label}</div>
        <div className="text-sm" style={{ color: 'var(--mode-text-secondary)' }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{ backgroundColor: checked ? 'var(--theme-primary)' : 'var(--mode-border)' }}
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
