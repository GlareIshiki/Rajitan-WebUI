"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

        {/* ステータスカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="🌐"
            label="サーバー数"
            value={botStats?.guilds ?? "-"}
            color="blue"
          />
          <StatCard
            icon="👥"
            label="ユーザー数"
            value={botStats?.users ?? "-"}
            color="green"
          />
          <StatCard
            icon="💬"
            label="チャンネル数"
            value={botStats?.channels ?? "-"}
            color="purple"
          />
          <StatCard
            icon="⏱️"
            label="稼働時間"
            value={botStats?.uptime ?? "-"}
            color="orange"
          />
        </div>

        {/* Bot状態 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Bot状態</h2>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  botStats?.status === "online"
                    ? "bg-green-500"
                    : botStats?.status === "connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-lg">
                {botStats?.status === "online"
                  ? "オンライン"
                  : botStats?.status === "connecting"
                  ? "接続中"
                  : "オフライン"}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Botは正常に動作しています。自動機能が有効です。
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">クイックアクション</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-secondary text-sm py-3">
                📝 全サーバー要約
              </button>
              <button className="btn-secondary text-sm py-3">
                🎮 クイズ一斉開始
              </button>
              <button className="btn-secondary text-sm py-3">
                🔄 Bot再起動
              </button>
              <button className="btn-secondary text-sm py-3">
                📊 詳細統計
              </button>
            </div>
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">最近のアクティビティ</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {activity.type === "summary"
                      ? "📝"
                      : activity.type === "quiz"
                      ? "🎮"
                      : "🎵"}
                  </span>
                  <div>
                    <div className="font-medium">
                      {activity.type === "summary"
                        ? "要約を生成"
                        : activity.type === "quiz"
                        ? "クイズを実行"
                        : "音楽を推薦"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {activity.guild} / #{activity.channel}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{activity.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-500/5",
    green: "from-green-500/20 to-green-500/5",
    purple: "from-purple-500/20 to-purple-500/5",
    orange: "from-orange-500/20 to-orange-500/5",
  };

  return (
    <div className={`card p-5 bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
