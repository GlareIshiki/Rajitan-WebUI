"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DailyStats {
  date: string;
  summaries: number;
  quizzes: number;
  music: number;
  total: number;
}

interface Guild {
  id: string;
  name: string;
  memberCount: number;
  iconUrl: string | null;
}

interface GuildStats {
  id: string;
  name: string;
  totalMessages: number;
  totalSummaries: number;
  totalQuizzes: number;
  activeUsers: number;
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [guildStats, setGuildStats] = useState<GuildStats[]>([]);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");
  const [loading, setLoading] = useState(true);

  const token = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

    try {
      const [dailyData, guildsData] = await Promise.allSettled([
        api.get<DailyStats[]>(`/api/bot/stats/daily?days=${days}`, token),
        api.get<Guild[]>("/api/bot/guilds", token),
      ]);

      if (dailyData.status === "fulfilled") {
        // Format dates for display
        const formatted = dailyData.value.map((d) => ({
          ...d,
          date: formatDate(d.date),
        }));
        setDailyStats(formatted);
      } else {
        setDailyStats([]);
      }

      if (guildsData.status === "fulfilled") {
        // Convert guild list to guild stats format
        const stats: GuildStats[] = guildsData.value.map((g) => ({
          id: g.id,
          name: g.name,
          totalMessages: 0,
          totalSummaries: 0,
          totalQuizzes: 0,
          activeUsers: g.memberCount,
        }));
        setGuildStats(stats);
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setLoading(false);
    }
  }, [token, period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  // 集計
  const totals = dailyStats.reduce(
    (acc, day) => ({
      summaries: acc.summaries + day.summaries,
      quizzes: acc.quizzes + day.quizzes,
      music: acc.music + day.music,
      total: acc.total + day.total,
    }),
    { summaries: 0, quizzes: 0, music: 0, total: 0 }
  );

  const maxValue = dailyStats.length > 0
    ? Math.max(...dailyStats.map((d) => d.total))
    : 1;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">統計</h1>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === p
                    ? "bg-[#5865f2] text-white"
                    : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                }`}
              >
                {p === "7d" ? "7日" : p === "30d" ? "30日" : "90日"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">読み込み中...</div>
        ) : (
          <>
            {/* 概要カード */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <SummaryCard
                icon="📊"
                label="総アクティビティ"
                value={totals.total.toLocaleString()}
              />
              <SummaryCard
                icon="📝"
                label="要約生成"
                value={totals.summaries.toLocaleString()}
              />
              <SummaryCard
                icon="🎮"
                label="クイズ実行"
                value={totals.quizzes.toLocaleString()}
              />
              <SummaryCard
                icon="🎵"
                label="音楽推薦"
                value={totals.music.toLocaleString()}
              />
            </div>

            {/* グラフ */}
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">アクティビティ推移</h2>
              {dailyStats.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  データがありません
                </div>
              ) : (
                <>
                  <div className="h-64 flex items-end gap-1">
                    {dailyStats.map((day, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-full bg-[#5865f2] rounded-t transition-all hover:bg-[#6875f3]"
                          style={{ height: `${(day.total / maxValue) * 100}%`, minHeight: day.total > 0 ? '4px' : '0' }}
                          title={`${day.total} アクティビティ`}
                        />
                        {dailyStats.length <= 14 && (
                          <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {dailyStats.length > 14 && (
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{dailyStats[0]?.date}</span>
                      <span>{dailyStats[dailyStats.length - 1]?.date}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* サーバー別統計 */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">サーバー別統計</h2>
              {guildStats.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  サーバーが見つかりません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#3a3a3a]">
                        <th className="text-left py-3 px-4">サーバー</th>
                        <th className="text-right py-3 px-4">メンバー数</th>
                        <th className="text-right py-3 px-4">要約</th>
                        <th className="text-right py-3 px-4">クイズ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guildStats.map((guild) => (
                        <tr
                          key={guild.id}
                          className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a]"
                        >
                          <td className="py-3 px-4 font-medium">{guild.name}</td>
                          <td className="text-right py-3 px-4 text-gray-300">
                            {guild.activeUsers.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-300">
                            {guild.totalSummaries.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-300">
                            {guild.totalQuizzes.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
