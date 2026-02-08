"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme, ThemeColor, themeConfigs } from "@/components/ThemeProvider";

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
  const { theme, setTheme } = useTheme();
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
    <div className="min-h-screen bg-[#050508] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">設定</h1>

        {/* テーマ設定 */}
        <div className="mb-8 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🎨</span> カラーテーマ
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative p-4 rounded-xl border transition-all ${
                  theme === t.id
                    ? "border-white/50 bg-white/10 scale-105"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div className={`w-8 h-8 mx-auto rounded-full ${t.color} mb-2 shadow-lg`} />
                <div className="text-xs text-center text-gray-300">{t.name}</div>
                {theme === t.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* サーバー一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <h2 className="font-bold mb-4">サーバー一覧</h2>
              <div className="space-y-2">
                {guilds.map((guild) => (
                  <button
                    key={guild.id}
                    onClick={() => setSelectedGuild(guild)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedGuild?.id === guild.id
                        ? "bg-[var(--theme-primary)] text-white"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
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
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
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
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-4">キャラクター</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CHARACTER_TYPES.map((char) => (
                      <button
                        key={char.id}
                        onClick={() =>
                          setSelectedGuild({ ...selectedGuild, character: char.id })
                        }
                        className={`p-4 rounded-xl text-left transition-all ${
                          selectedGuild.character === char.id
                            ? "bg-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)]"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-medium">{char.name}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {char.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* タイミング設定 */}
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all"
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all"
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
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-[var(--theme-primary)]" : "bg-white/20"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
