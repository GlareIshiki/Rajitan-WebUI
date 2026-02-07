"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#5865f2]/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="text-6xl mb-6 pulse-glow inline-block p-4 rounded-full bg-[#1e1e1e]">
              📻
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              <span className="gradient-text">Rajitan</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-4">
              会話を彩るラジオDJ Bot
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Discordの会話を「ラジオ番組」のように演出。<br />
              AIが会話の流れを読み、要約・クイズ・音楽推薦で会話体験をデザインします。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {session ? (
                <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
                  ダッシュボードへ
                </Link>
              ) : (
                <button
                  onClick={() => signIn("discord")}
                  className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Discordでログイン
                </button>
              )}
              <a
                href="https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=8&scope=bot%20applications.commands"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-lg px-8 py-3"
              >
                Botを招待
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon="📝"
            title="自動要約"
            description="会話が一段落したタイミングで、AIがこれまでの会話を要約。話題の整理に役立ちます。"
          />
          <FeatureCard
            icon="🎮"
            title="クイズ生成"
            description="会話の内容からクイズを自動生成。盛り上がりをさらに加速させます。"
          />
          <FeatureCard
            icon="🎵"
            title="音楽推薦"
            description="会話の雰囲気に合わせて音楽を推薦。YouTube/Spotifyリンク付き。"
          />
          <FeatureCard
            icon="⏰"
            title="スケジュール機能"
            description="定期的な要約やクイズを自動実行。運営の手間を削減。"
          />
          <FeatureCard
            icon="🎭"
            title="キャラクター設定"
            description="7種類の性格タイプから選択。サーバーに合った雰囲気を演出。"
          />
          <FeatureCard
            icon="🤖"
            title="自動介入"
            description="会話の流れを読んで、適切なタイミングで機能を提案。"
          />
        </div>
      </section>

      {/* コマンド一覧 */}
      <section className="bg-[#1a1a1a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">スラッシュコマンド</h2>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <CommandCard command="/setup" description="キャラクター設定を変更" />
            <CommandCard command="/chat" description="プライベートチャット" />
            <CommandCard command="/summary" description="会話を要約" />
            <CommandCard command="/quiz" description="クイズを開始" />
            <CommandCard command="/status" description="Bot状態を確認" />
            <CommandCard command="/help" description="ヘルプを表示" />
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-[#2a2a2a] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2024 Rajitan. Made with ❤️</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6 card-hover transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function CommandCard({
  command,
  description,
}: {
  command: string;
  description: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <code className="bg-[#2a2a2a] px-3 py-1 rounded text-[#5865f2] font-mono">
        {command}
      </code>
      <span className="text-gray-300">{description}</span>
    </div>
  );
}
