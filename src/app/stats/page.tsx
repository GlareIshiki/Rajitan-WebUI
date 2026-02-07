"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DailyStats {
  date: string;
  summaries: number;
  quizzes: number;
  music: number;
  messages: number;
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // デモデータ生成
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const stats: DailyStats[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
        summaries: Math.floor(Math.random() * 20) + 5,
        quizzes: Math.floor(Math.random() * 15) + 2,
        music: Math.floor(Math.random() * 10) + 1,
        messages: Math.floor(Math.random() * 500) + 100,
      });
    }

    setDailyStats(stats);

    setGuildStats([
      {
        id: "1",
        name: "テストサーバー",
        totalMessages: 15234,
        totalSummaries: 342,
        totalQuizzes: 128,
        activeUsers: 45,
      },
      {
        id: "2",
        name: "開発サーバー",
        totalMessages: 8921,
        totalSummaries: 156,
        totalQuizzes: 67,
        activeUsers: 23,
      },
      {
        id: "3",
        name: "コミュニティ",
        totalMessages: 42156,
        totalSummaries: 891,
        totalQuizzes: 234,
        activeUsers: 156,
      },
    ]);
  }, [period]);

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
      messages: acc.messages + day.messages,
    }),
    { summaries: 0, quizzes: 0, music: 0, messages: 0 }
  );

  const maxValue = Math.max(...dailyStats.map((d) => d.messages));

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

        {/* 概要カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon="💬"
            label="総メッセージ"
            value={totals.messages.toLocaleString()}
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
          <div className="h-64 flex items-end gap-1">
            {dailyStats.map((day, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-[#5865f2] rounded-t transition-all hover:bg-[#6875f3]"
                  style={{ height: `${(day.messages / maxValue) * 100}%` }}
                  title={`${day.messages} メッセージ`}
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
        </div>

        {/* サーバー別統計 */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6">サーバー別統計</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3a3a3a]">
                  <th className="text-left py-3 px-4">サーバー</th>
                  <th className="text-right py-3 px-4">メッセージ</th>
                  <th className="text-right py-3 px-4">要約</th>
                  <th className="text-right py-3 px-4">クイズ</th>
                  <th className="text-right py-3 px-4">アクティブユーザー</th>
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
                      {guild.totalMessages.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-300">
                      {guild.totalSummaries.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-300">
                      {guild.totalQuizzes.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-300">
                      {guild.activeUsers.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
