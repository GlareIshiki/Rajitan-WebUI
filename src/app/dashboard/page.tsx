"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface BotStats {
  guilds: number;
  users: number;
  channels: number;
  uptime: string;
  status: "online" | "offline" | "connecting";
}

interface RecentActivity {
  type: "summary" | "quiz" | "music";
  channel: string;
  guild: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // デモデータ（実際のAPIに置き換え）
    setBotStats({
      guilds: 5,
      users: 128,
      channels: 24,
      uptime: "3日 12時間",
      status: "online",
    });

    setRecentActivity([
      { type: "summary", channel: "一般", guild: "テストサーバー", timestamp: "5分前" },
      { type: "quiz", channel: "雑談", guild: "テストサーバー", timestamp: "15分前" },
      { type: "music", channel: "音楽", guild: "テストサーバー", timestamp: "30分前" },
      { type: "summary", channel: "開発", guild: "開発サーバー", timestamp: "1時間前" },
    ]);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚙️</div>
          <div className="text-gray-400">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-hidden">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,50,200,0.15)_0%,_transparent_50%)]" />
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />

        {/* 歯車 */}
        <div className="absolute top-20 right-20 opacity-[0.05]">
          <Gear size={200} speed={80} />
        </div>
        <div className="absolute bottom-20 left-20 opacity-[0.03]">
          <Gear size={150} speed={60} reverse />
        </div>

        {/* パーティクル */}
        {mounted && <SparkParticles />}
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">⚙️</span>
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  ダッシュボード
                </h1>
              </div>
              <p className="text-gray-400">
                おかえり、{session.user?.name}さん☆
              </p>
            </div>

            {/* ユーザー情報 */}
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-sm text-gray-300">{session.user?.name}</span>
            </div>
          </div>

          {/* Bot状態バナー */}
          <div className="relative mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/10 to-cyan-600/20 rounded-2xl" />
            <div className="absolute inset-[1px] bg-[#0a0a0f]/80 backdrop-blur-xl rounded-2xl" />
            <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl shadow-lg shadow-green-500/20">
                    ⚙️
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold">らじたん</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                      オンライン
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">正常に動作中 • 自動機能 ON</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">稼働時間</div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                  {botStats?.uptime ?? "-"}
                </div>
              </div>
            </div>
          </div>

          {/* ステータスカード */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="🌐"
              label="サーバー数"
              value={botStats?.guilds ?? 0}
              color="purple"
              delay={0}
            />
            <StatCard
              icon="👥"
              label="ユーザー数"
              value={botStats?.users ?? 0}
              color="pink"
              delay={100}
            />
            <StatCard
              icon="💬"
              label="チャンネル数"
              value={botStats?.channels ?? 0}
              color="cyan"
              delay={200}
            />
            <StatCard
              icon="📊"
              label="今日の対応"
              value={42}
              color="amber"
              delay={300}
            />
          </div>

          {/* メインコンテンツ */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* クイックアクション */}
            <div className="lg:col-span-1">
              <GlassCard title="クイックアクション" icon="⚡">
                <div className="grid grid-cols-2 gap-3">
                  <ActionButton icon="📝" label="全サーバー要約" />
                  <ActionButton icon="🎮" label="クイズ開始" />
                  <ActionButton icon="🎵" label="音楽推薦" />
                  <ActionButton icon="🔄" label="Bot再起動" />
                </div>
              </GlassCard>
            </div>

            {/* 最近のアクティビティ */}
            <div className="lg:col-span-2">
              <GlassCard title="最近のアクティビティ" icon="📋">
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <ActivityItem key={i} activity={activity} index={i} />
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* サーバー一覧 */}
          <GlassCard title="管理中のサーバー" icon="🏠">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "テストサーバー", members: 45, active: true },
                { name: "開発サーバー", members: 12, active: true },
                { name: "コミュニティ", members: 156, active: false },
              ].map((server, i) => (
                <ServerCard key={i} server={server} />
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ガラスモーフィズムカード
function GlassCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{icon}</span>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

// 統計カード
function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: "purple" | "pink" | "cyan" | "amber";
  delay: number;
}) {
  const colorStyles = {
    purple: {
      gradient: "from-purple-500/20 to-purple-500/5",
      border: "border-purple-500/20",
      text: "text-purple-400",
      glow: "shadow-purple-500/10",
    },
    pink: {
      gradient: "from-pink-500/20 to-pink-500/5",
      border: "border-pink-500/20",
      text: "text-pink-400",
      glow: "shadow-pink-500/10",
    },
    cyan: {
      gradient: "from-cyan-500/20 to-cyan-500/5",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      glow: "shadow-cyan-500/10",
    },
    amber: {
      gradient: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-500/20",
      text: "text-amber-400",
      glow: "shadow-amber-500/10",
    },
  };

  const styles = colorStyles[color];

  return (
    <div
      className={`relative group bg-gradient-to-br ${styles.gradient} backdrop-blur-xl rounded-2xl border ${styles.border} p-5 hover:scale-[1.02] transition-all duration-300 shadow-lg ${styles.glow}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className={`text-3xl sm:text-4xl font-black ${styles.text}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

// アクションボタン
function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl p-4 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <div className="relative text-center">
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-xs text-gray-400 group-hover:text-white transition-colors">{label}</div>
      </div>
    </button>
  );
}

// アクティビティアイテム
function ActivityItem({
  activity,
  index,
}: {
  activity: RecentActivity;
  index: number;
}) {
  const typeConfig = {
    summary: { icon: "📝", label: "要約を生成", color: "text-blue-400" },
    quiz: { icon: "🎮", label: "クイズを実行", color: "text-pink-400" },
    music: { icon: "🎵", label: "音楽を推薦", color: "text-purple-400" },
  };

  const config = typeConfig[activity.type];

  return (
    <div
      className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/5 hover:border-white/10 transition-all group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
          {config.icon}
        </div>
        <div>
          <div className={`font-medium ${config.color}`}>{config.label}</div>
          <div className="text-sm text-gray-500">
            {activity.guild} / #{activity.channel}
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-600">{activity.timestamp}</div>
    </div>
  );
}

// サーバーカード
function ServerCard({
  server,
}: {
  server: { name: string; members: number; active: boolean };
}) {
  return (
    <div className="group relative bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/5 hover:border-purple-500/30 p-4 transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
          🏠
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white truncate">{server.name}</div>
          <div className="text-sm text-gray-500">{server.members} メンバー</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${server.active ? "bg-green-500" : "bg-gray-500"}`} />
          <span className="text-xs text-gray-400">
            {server.active ? "自動機能 ON" : "自動機能 OFF"}
          </span>
        </div>
        <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          設定 →
        </button>
      </div>
    </div>
  );
}

// 歯車コンポーネント
function Gear({ size, speed, reverse = false }: { size: number; speed: number; reverse?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="text-purple-400"
      style={{
        animation: `spin ${speed}s linear infinite ${reverse ? "reverse" : ""}`,
      }}
    >
      <path
        fill="currentColor"
        d="M50 10 L55 25 L65 20 L60 35 L75 35 L65 45 L80 50 L65 55 L75 65 L60 65 L65 80 L55 75 L50 90 L45 75 L35 80 L40 65 L25 65 L35 55 L20 50 L35 45 L25 35 L40 35 L35 20 L45 25 Z"
      />
      <circle cx="50" cy="50" r="15" fill="#050508" />
    </svg>
  );
}

// パーティクル
function SparkParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
    size: 2 + Math.random() * 2,
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0) 70%)`,
            animation: `float-up ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-up {
          0%, 100% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          5% {
            opacity: 0.8;
            transform: translateY(95vh) scale(1);
          }
          95% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-10vh) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
