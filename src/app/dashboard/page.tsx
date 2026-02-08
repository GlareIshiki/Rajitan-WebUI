"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import { api } from "@/lib/api";

interface BotStats {
  guilds: number;
  users: number;
  humans: number;
  bots: number;
  channels: number;
  uptime: string;
  status: "online" | "offline";
  latency: number;
  ready: boolean;
}

interface UserBreakdown {
  total: number;
  humans: number;
  bots: number;
  perGuild: {
    id: string;
    name: string;
    humans: number;
    bots: number;
    total: number;
  }[];
}

interface RecentActivity {
  id: number;
  activityType: "summary" | "quiz" | "music" | "schedule";
  description: string;
  guildId: string;
  channelId: string;
  createdAt: string;
}

interface Guild {
  id: string;
  name: string;
  memberCount: number;
  iconUrl: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDark } = useTheme();
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [servers, setServers] = useState<Guild[]>([]);
  const [mounted, setMounted] = useState(false);

  const token = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const [statsData, activityData, guildsData] = await Promise.allSettled([
        api.get<BotStats>("/api/bot/stats", token),
        api.get<RecentActivity[]>("/api/bot/activity?limit=10", token),
        api.get<Guild[]>("/api/bot/guilds", token),
      ]);

      if (statsData.status === "fulfilled") {
        setBotStats(statsData.value);
      }
      if (activityData.status === "fulfilled") {
        setRecentActivity(activityData.value);
      }
      if (guildsData.status === "fulfilled") {
        setServers(guildsData.value);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling every 30 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token, fetchData]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mode-bg)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚙️</div>
          <div style={{ color: 'var(--mode-text-secondary)' }}>読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isOnline = botStats?.status === "online";

  return (
    <div className="min-h-screen overflow-hidden transition-colors" style={{ backgroundColor: 'var(--mode-bg)', color: 'var(--mode-text)' }}>
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: isDark ? 'radial-gradient(ellipse at top, rgba(var(--theme-particle), 0.15) 0%, transparent 50%)' : 'radial-gradient(ellipse at top, rgba(var(--theme-particle), 0.08) 0%, transparent 50%)' }} />
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[150px]" style={{ backgroundColor: isDark ? 'rgba(var(--theme-particle), 0.1)' : 'rgba(var(--theme-particle), 0.05)' }} />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ backgroundColor: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)' }} />

        {/* 歯車 */}
        <div className="absolute top-20 right-20" style={{ opacity: isDark ? 0.05 : 0.03 }}>
          <Gear size={200} speed={80} isDark={isDark} />
        </div>
        <div className="absolute bottom-20 left-20" style={{ opacity: isDark ? 0.03 : 0.02 }}>
          <Gear size={150} speed={60} reverse isDark={isDark} />
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
                <h1 className="text-3xl sm:text-4xl font-black" style={{ color: 'var(--theme-primary)' }}>
                  ダッシュボード
                </h1>
              </div>
              <p style={{ color: 'var(--mode-text-secondary)' }}>
                おかえり、{session.user?.name}さん☆
              </p>
            </div>

            {/* ユーザー情報 */}
            <div className="flex items-center gap-3 backdrop-blur-xl px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--mode-bg-card)', border: '1px solid var(--mode-border)' }}>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-sm" style={{ color: 'var(--mode-text-secondary)' }}>{session.user?.name}</span>
            </div>
          </div>

          {/* Bot状態バナー */}
          <div className="relative mb-8 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${isOnline ? 'from-green-600/20 via-emerald-600/10 to-cyan-600/20' : 'from-gray-600/20 via-gray-600/10 to-gray-600/20'} rounded-2xl`} />
            <div className="absolute inset-[1px] backdrop-blur-xl rounded-2xl" style={{ backgroundColor: isDark ? 'rgba(10, 10, 15, 0.8)' : 'rgba(255, 255, 255, 0.9)' }} />
            <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${isOnline ? 'from-green-500 to-emerald-600' : 'from-gray-500 to-gray-600'} flex items-center justify-center text-3xl shadow-lg ${isOnline ? 'shadow-green-500/20' : 'shadow-gray-500/20'}`}>
                    ⚙️
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'} rounded-full`} style={{ border: `2px solid var(--mode-bg)` }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold" style={{ color: 'var(--mode-text)' }}>らじたん</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${isOnline ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                      {isOnline ? 'オンライン' : 'オフライン'}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--mode-text-secondary)' }}>
                    {isOnline ? '正常に動作中' : '停止中'}
                    {botStats?.latency != null && isOnline ? ` • ${botStats.latency}ms` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm mb-1" style={{ color: 'var(--mode-text-secondary)' }}>稼働時間</div>
                <div className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${isOnline ? 'from-green-400 to-cyan-400' : 'from-gray-400 to-gray-500'}`}>
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
            <UserStatCard
              botStats={botStats}
              token={token}
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
              label="レイテンシ"
              value={botStats?.latency != null ? `${botStats.latency}ms` : "-"}
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
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'var(--mode-text-secondary)' }}>
                      アクティビティはまだありません
                    </div>
                  ) : (
                    recentActivity.map((activity, i) => (
                      <ActivityItem key={activity.id} activity={activity} index={i} />
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* サーバー一覧 */}
          <GlassCard title="管理中のサーバー" icon="🏠">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {servers.length === 0 ? (
                <div className="col-span-full text-center py-8" style={{ color: 'var(--mode-text-secondary)' }}>
                  サーバーが見つかりません
                </div>
              ) : (
                servers.map((server) => (
                  <ServerCard key={server.id} server={server} />
                ))
              )}
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
      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{ background: 'linear-gradient(to right, rgba(var(--theme-particle), 0.2), rgba(var(--theme-particle), 0.1), rgba(var(--theme-particle), 0.2))' }} />
      <div className="relative backdrop-blur-xl rounded-2xl p-6" style={{ backgroundColor: 'var(--mode-bg-card)', border: '1px solid var(--mode-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{icon}</span>
          <h2 className="text-lg font-bold" style={{ color: 'var(--mode-text)' }}>{title}</h2>
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

// ユーザー数カード（内訳ポップオーバー付き）
function UserStatCard({
  botStats,
  token,
}: {
  botStats: BotStats | null;
  token: string | undefined;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState<UserBreakdown | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClick = async () => {
    if (showBreakdown) {
      setShowBreakdown(false);
      return;
    }
    setShowBreakdown(true);
    if (!breakdown && token) {
      setLoadingBreakdown(true);
      try {
        const data = await api.get<UserBreakdown>("/api/bot/stats/users", token);
        setBreakdown(data);
      } catch (e) {
        console.error("Failed to fetch user breakdown:", e);
      } finally {
        setLoadingBreakdown(false);
      }
    }
  };

  // 外側クリックで閉じる
  useEffect(() => {
    if (!showBreakdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowBreakdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showBreakdown]);

  const humans = botStats?.humans ?? 0;
  const bots = botStats?.bots ?? 0;
  const total = botStats?.users ?? 0;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleClick}
        className="w-full text-left relative group bg-gradient-to-br from-pink-500/20 to-pink-500/5 backdrop-blur-xl rounded-2xl border border-pink-500/20 p-5 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-pink-500/10 cursor-pointer"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">👥</span>
          <span className="text-gray-400 text-sm">ユーザー数</span>
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--mode-bg-secondary)', color: 'var(--mode-text-secondary)' }}>
            詳細
          </span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-pink-400">
          {humans.toLocaleString()}
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--mode-text-secondary)' }}>
            <span>🤖 Bot: {bots.toLocaleString()}</span>
          </div>
        )}
      </button>

      {/* 内訳ポップオーバー */}
      {showBreakdown && (
        <div
          className="absolute z-50 top-full mt-2 left-0 right-0 min-w-[280px] rounded-xl p-4 backdrop-blur-xl shadow-2xl"
          style={{
            backgroundColor: 'var(--mode-bg-card)',
            border: '1px solid var(--mode-border)',
          }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--mode-text)' }}>
            ユーザー内訳
          </h3>

          {/* 全体サマリー */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--mode-bg-secondary)' }}>
              <div className="text-lg font-bold text-pink-400">{total.toLocaleString()}</div>
              <div className="text-xs" style={{ color: 'var(--mode-text-secondary)' }}>合計</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--mode-bg-secondary)' }}>
              <div className="text-lg font-bold text-green-400">{humans.toLocaleString()}</div>
              <div className="text-xs" style={{ color: 'var(--mode-text-secondary)' }}>人間</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--mode-bg-secondary)' }}>
              <div className="text-lg font-bold text-blue-400">{bots.toLocaleString()}</div>
              <div className="text-xs" style={{ color: 'var(--mode-text-secondary)' }}>Bot</div>
            </div>
          </div>

          {/* サーバー別内訳 */}
          {loadingBreakdown ? (
            <div className="text-center py-3 text-sm" style={{ color: 'var(--mode-text-secondary)' }}>
              読み込み中...
            </div>
          ) : breakdown?.perGuild && breakdown.perGuild.length > 0 ? (
            <>
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--mode-text-secondary)' }}>
                サーバー別
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {breakdown.perGuild.map((guild) => (
                  <div
                    key={guild.id}
                    className="flex items-center justify-between p-2 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--mode-bg-secondary)' }}
                  >
                    <span className="truncate flex-1 mr-2" style={{ color: 'var(--mode-text)' }}>
                      {guild.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs shrink-0">
                      <span className="text-green-400">{guild.humans}</span>
                      <span style={{ color: 'var(--mode-text-secondary)' }}>/</span>
                      <span className="text-blue-400">{guild.bots}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--mode-text-secondary)' }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 人間</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Bot</span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

// アクションボタン
function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300" style={{ backgroundColor: 'var(--mode-bg-secondary)', border: '1px solid var(--mode-border)' }}>
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" style={{ background: 'linear-gradient(to right, transparent, rgba(var(--theme-particle), 0.1), transparent)' }} />
      <div className="relative text-center">
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-xs transition-colors" style={{ color: 'var(--mode-text-secondary)' }}>{label}</div>
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
  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    summary: { icon: "📝", label: "要約を生成", color: "text-blue-400" },
    quiz: { icon: "🎮", label: "クイズを実行", color: "text-pink-400" },
    music: { icon: "🎵", label: "音楽を推薦", color: "text-purple-400" },
    schedule: { icon: "📅", label: "スケジュール実行", color: "text-cyan-400" },
  };

  const config = typeConfig[activity.activityType] || { icon: "⚡", label: activity.activityType, color: "text-gray-400" };

  // Format the timestamp
  const formatTimestamp = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin < 1) return "たった今";
      if (diffMin < 60) return `${diffMin}分前`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}時間前`;
      const diffDay = Math.floor(diffHour / 24);
      return `${diffDay}日前`;
    } catch {
      return createdAt;
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl transition-all group"
      style={{ backgroundColor: 'var(--mode-bg-secondary)', border: '1px solid var(--mode-border)', animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--mode-bg-card)' }}>
          {config.icon}
        </div>
        <div>
          <div className={`font-medium ${config.color}`}>{config.label}</div>
          <div className="text-sm" style={{ color: 'var(--mode-text-secondary)' }}>
            {activity.description || `${activity.guildId} / ${activity.channelId}`}
          </div>
        </div>
      </div>
      <div className="text-sm" style={{ color: 'var(--mode-text-secondary)' }}>{formatTimestamp(activity.createdAt)}</div>
    </div>
  );
}

// サーバーカード
function ServerCard({
  server,
}: {
  server: Guild;
}) {
  return (
    <div className="group relative rounded-xl p-4 transition-all cursor-pointer" style={{ backgroundColor: 'var(--mode-bg-secondary)', border: '1px solid var(--mode-border)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(var(--theme-particle), 0.2), rgba(var(--theme-particle), 0.1))' }}>
          {server.iconUrl ? (
            <Image src={server.iconUrl} alt={server.name} width={48} height={48} className="rounded-xl" />
          ) : (
            "🏠"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate" style={{ color: 'var(--mode-text)' }}>{server.name}</div>
          <div className="text-sm" style={{ color: 'var(--mode-text-secondary)' }}>{server.memberCount} メンバー</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs" style={{ color: 'var(--mode-text-secondary)' }}>
            接続中
          </span>
        </div>
        <button className="text-xs transition-colors" style={{ color: 'var(--theme-primary)' }}>
          設定 →
        </button>
      </div>
    </div>
  );
}

// 歯車コンポーネント
function Gear({ size, speed, reverse = false, isDark = true }: { size: number; speed: number; reverse?: boolean; isDark?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        animation: `spin ${speed}s linear infinite ${reverse ? "reverse" : ""}`,
        color: 'var(--theme-primary)',
      }}
    >
      <path
        fill="currentColor"
        d="M50 10 L55 25 L65 20 L60 35 L75 35 L65 45 L80 50 L65 55 L75 65 L60 65 L65 80 L55 75 L50 90 L45 75 L35 80 L40 65 L25 65 L35 55 L20 50 L35 45 L25 35 L40 35 L35 20 L45 25 Z"
      />
      <circle cx="50" cy="50" r="15" style={{ fill: 'var(--mode-bg)' }} />
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
            background: `radial-gradient(circle, rgba(var(--theme-particle), 0.8) 0%, rgba(var(--theme-particle), 0) 70%)`,
            animation: `float-up ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: "0 0 10px var(--theme-glow)",
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
