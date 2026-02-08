"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] overflow-hidden text-white">
      {/* 背景レイヤー */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,50,200,0.15)_0%,_transparent_70%)]" />
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px]" />

        {/* 歯車 */}
        <div className="absolute top-20 left-20 opacity-[0.1]">
          <Gear size={150} speed={60} />
        </div>
        <div className="absolute top-60 right-16 opacity-[0.08]">
          <Gear size={100} speed={45} reverse />
        </div>
        <div className="absolute bottom-40 left-1/4 opacity-[0.06]">
          <Gear size={200} speed={80} />
        </div>

        {/* パーティクル */}
        {mounted && <SparkParticles />}
      </div>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="text-center z-10 max-w-3xl">
          {/* ロゴ */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 scale-150 bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-cyan-500/30 rounded-full blur-3xl" />
            <div className="relative text-[100px] sm:text-[130px] drop-shadow-[0_0_60px_rgba(168,85,247,0.5)]">
              ⚙️
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
              RA☆JI☆TAN
            </span>
          </h1>

          {/* サブタイトル */}
          <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white mb-4">
            GearSpark☆ 轟け！
          </p>

          {/* 説明 */}
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            会話を読み取り、要約・クイズ・音楽でDiscordを盛り上げるAI Bot
          </p>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
              >
                ダッシュボードへ
              </Link>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
              >
                <DiscordIcon />
                Discordでログイン
              </button>
            )}
            <a
              href="#features"
              className="px-8 py-4 border-2 border-white/20 rounded-full font-medium text-gray-300 hover:border-white/40 hover:text-white transition-all"
            >
              できること見てく？
            </a>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.3em] text-purple-400 uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Clockwork Harmony
            </h2>
            <p className="text-gray-500 mt-2">歯車仕立てのシンフォニー</p>
          </div>

          <div className="space-y-24">
            {/* 自動要約 */}
            <FeatureRow
              reverse={false}
              title="自動要約"
              description="会話が落ち着いたら、まとめとくね"
              mockMessage={{
                content: "📝 **会話のまとめ**\n\n今日の話題:\n• 新作ゲームの話で盛り上がった\n• 週末の予定を決めた\n• おすすめの映画を共有した\n\n参加者: 5人 | メッセージ: 42件",
              }}
            />

            {/* クイズ生成 */}
            <FeatureRow
              reverse={true}
              title="クイズ生成"
              description="話題からクイズ作るよ。盛り上がるでしょ？"
              mockMessage={{
                content: "🎮 **クイズタイム！**\n\nさっきの話題から出題するよ〜\n\n**Q. この中で、今日話題に出た映画はどれ？**\n\n1️⃣ インターステラー\n2️⃣ マトリックス\n3️⃣ インセプション\n4️⃣ テネット",
              }}
            />

            {/* 音楽推薦 */}
            <FeatureRow
              reverse={false}
              title="音楽推薦"
              description="雰囲気に合う曲、見つけてきた♪"
              mockMessage={{
                content: "🎵 **今の雰囲気にぴったりの曲**\n\n夜更かしトークに合いそう！\n\n**Midnight City - M83**\n🔗 YouTube | Spotify\n\n気に入った？ 👍 👎",
              }}
            />

            {/* スケジュール */}
            <FeatureRow
              reverse={true}
              title="スケジュール"
              description="決まった時間に自動でやっとく。任せて"
              mockMessage={{
                content: "⏰ **定期レポート**\n\n毎週日曜 21:00 に自動投稿中\n\n今週の統計:\n• 総メッセージ: 1,234件\n• アクティブユーザー: 28人\n• 一番盛り上がった日: 金曜日",
              }}
            />

            {/* キャラクター */}
            <FeatureRow
              reverse={false}
              title="キャラクター"
              description="7つの人格から選べるよ。どれがいい？"
              mockMessage={{
                content: "🎭 **キャラクター設定**\n\n現在: **元気系DJ**\n\n選べるタイプ:\n• 元気系DJ（現在）\n• クール系\n• 癒し系\n• ツンデレ\n• 知的系\n• ミステリアス\n• カオス",
              }}
            />

            {/* 常駐サポート */}
            <FeatureRow
              reverse={true}
              title="常駐サポート"
              description="24時間ここにいるから。いつでも呼んで"
              mockMessage={{
                content: "🔄 **ステータス**\n\n✅ オンライン\n⏱️ 稼働時間: 7日 12時間\n📊 今日の対応: 156件\n\n何かあったら @らじたん で呼んでね！",
              }}
            />
          </div>
        </div>
      </section>

      {/* コマンドセクション */}
      <section className="relative py-24 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-cyan-400 uppercase mb-3">Commands</p>
            <h2 className="text-3xl font-black text-white">
              スラッシュコマンド
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { cmd: "/setup", desc: "キャラクター設定", emoji: "🎭" },
              { cmd: "/chat", desc: "プライベートチャット", emoji: "💬" },
              { cmd: "/summary", desc: "会話を要約", emoji: "📝" },
              { cmd: "/quiz", desc: "クイズを開始", emoji: "🎮" },
              { cmd: "/music", desc: "音楽を推薦", emoji: "🎵" },
              { cmd: "/status", desc: "Bot状態確認", emoji: "📊" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all"
              >
                <span className="text-2xl">{item.emoji}</span>
                <code className="px-3 py-1 bg-purple-500/20 rounded-lg text-sm font-mono text-purple-300">
                  {item.cmd}
                </code>
                <span className="text-gray-400">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="relative py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">⚙️✨</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            始める？
          </h2>
          <p className="text-gray-400 mb-8">
            わたし、割と有能だから。ふふっ
          </p>

          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
            >
              ダッシュボードへ
            </Link>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
            >
              <DiscordIcon />
              Discordでログイン
            </button>
          )}
        </div>
      </section>

      {/* フッター */}
      <footer className="relative py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">
            RA☆JI☆TAN
          </p>
          <p className="text-gray-600 text-sm">
            © 2024 Rajitan
          </p>
        </div>
      </footer>
    </div>
  );
}

// Discord風メッセージモック
function DiscordMock({ content }: { content: string }) {
  return (
    <div className="bg-[#313338] rounded-lg p-4 max-w-md shadow-xl border border-white/5">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
          ⚙️
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">らじたん</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#5865f2] rounded text-white font-medium">BOT</span>
          </div>
          <span className="text-xs text-gray-400">今日 23:45</span>
        </div>
      </div>

      {/* メッセージ内容 */}
      <div className="text-[#dbdee1] text-sm leading-relaxed whitespace-pre-line">
        {content.split('\n').map((line, i) => {
          // 太字処理
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <div key={i}>
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 機能セクションの行コンポーネント
function FeatureRow({
  reverse,
  title,
  description,
  mockMessage,
}: {
  reverse: boolean;
  title: string;
  description: string;
  mockMessage: { content: string };
}) {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
      {/* モック */}
      <div className="flex-1 flex justify-center">
        <DiscordMock content={mockMessage.content} />
      </div>

      {/* テキスト */}
      <div className="flex-1 text-center lg:text-left">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">{title}</h3>
        <p className="text-xl text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function Gear({ size, speed, reverse = false }: { size: number; speed: number; reverse?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="text-purple-400"
      style={{
        animation: `spin ${speed}s linear infinite ${reverse ? 'reverse' : ''}`,
        filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))',
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

function SparkParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 8,
    size: 2 + Math.random() * 3,
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
            background: `radial-gradient(circle, rgba(250,204,21,1) 0%, rgba(250,204,21,0) 70%)`,
            animation: `float-up ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: '0 0 10px rgba(250, 204, 21, 0.6)',
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
            opacity: 1;
            transform: translateY(95vh) scale(1);
          }
          95% {
            opacity: 0.6;
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

function DiscordIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
