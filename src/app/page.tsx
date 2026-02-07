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
    <div className="min-h-screen bg-[#08080c] text-white overflow-hidden">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        {/* グリッドパターン */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* グラデーントオーブ */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />

        {/* 歯車（洗練版） */}
        <div className="absolute top-20 left-16 opacity-[0.08]">
          <GearIcon size={140} speed={40} />
        </div>
        <div className="absolute top-40 right-24 opacity-[0.06]">
          <GearIcon size={100} speed={30} reverse />
        </div>
        <div className="absolute bottom-32 left-1/3 opacity-[0.05]">
          <GearIcon size={200} speed={50} />
        </div>

        {/* パーティクル */}
        {mounted && <FloatingParticles />}
      </div>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="text-center z-10 max-w-3xl">
          {/* ロゴマーク */}
          <div className="relative inline-flex items-center justify-center mb-10">
            <div className="absolute w-32 h-32 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full blur-2xl" />
            <div className="relative text-7xl sm:text-8xl">⚙️</div>
          </div>

          {/* タイトル */}
          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight leading-none">
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              RAJITAN
            </span>
          </h1>

          {/* サブタイトル */}
          <p className="text-lg sm:text-xl text-gray-400 mb-4 font-light tracking-wide">
            Clockwork Harmony for Discord
          </p>

          {/* キャッチコピー */}
          <p className="text-sm text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
            AIが会話の流れを読み、要約・クイズ・音楽で<br className="hidden sm:block" />
            あなたのDiscord体験をデザインします
          </p>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-sm tracking-wide overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                ダッシュボードへ
              </Link>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-sm tracking-wide overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-3"
              >
                <DiscordIcon />
                Discordでログイン
              </button>
            )}
            <a
              href="#features"
              className="px-8 py-4 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              詳しく見る →
            </a>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 border border-gray-700 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-gray-600 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.3em] text-purple-400 uppercase mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              All-in-One Bot
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              6つのコア機能であなたのサーバーを進化させる
            </p>
          </div>

          {/* 機能グリッド */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              number="01"
              title="Auto Summary"
              description="会話が落ち着いたタイミングで、AIが自動的に要約を生成"
              icon="📝"
            />
            <FeatureCard
              number="02"
              title="Quiz Generator"
              description="会話の内容からクイズを自動生成し、盛り上がりを加速"
              icon="🎮"
            />
            <FeatureCard
              number="03"
              title="Music Recommender"
              description="会話の雰囲気を分析し、最適なBGMを提案"
              icon="🎵"
            />
            <FeatureCard
              number="04"
              title="Smart Scheduler"
              description="定期的な要約やクイズを自動実行"
              icon="⏰"
            />
            <FeatureCard
              number="05"
              title="Character System"
              description="7つの性格タイプから選択可能"
              icon="🎭"
            />
            <FeatureCard
              number="06"
              title="Always Online"
              description="24時間常駐でいつでも対応"
              icon="🔄"
            />
          </div>
        </div>
      </section>

      {/* コマンドセクション */}
      <section className="relative py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-cyan-400 uppercase mb-4">Commands</p>
            <h2 className="text-3xl font-bold">Slash Commands</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { cmd: "/setup", desc: "キャラクター設定" },
              { cmd: "/chat", desc: "プライベートチャット" },
              { cmd: "/summary", desc: "会話を要約" },
              { cmd: "/quiz", desc: "クイズを開始" },
              { cmd: "/music", desc: "音楽を推薦" },
              { cmd: "/status", desc: "Bot状態確認" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <code className="px-3 py-1.5 bg-white/5 rounded-lg text-sm font-mono text-purple-300 group-hover:text-purple-200 transition-colors">
                  {item.cmd}
                </code>
                <span className="text-gray-500 text-sm">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="relative py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative">
            {/* 背景グロー */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-cyan-600/20 blur-3xl" />

            <div className="relative bg-white/[0.02] backdrop-blur-sm rounded-3xl p-12 border border-white/5">
              <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-6">Get Started</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to upgrade your server?
              </h2>
              <p className="text-gray-500 mb-8">
                らじたんと一緒に、新しいDiscord体験を
              </p>

              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
                >
                  ダッシュボードへ
                </Link>
              ) : (
                <button
                  onClick={() => signIn("discord")}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
                >
                  <DiscordIcon />
                  今すぐ始める
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="relative py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-gray-600 text-sm">© 2024 Rajitan</p>
          <p className="text-gray-700 text-xs">Clockwork Harmony</p>
        </div>
      </footer>

      {/* アニメーション */}
      <style jsx>{`
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(4px); opacity: 1; }
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function GearIcon({ size, speed, reverse = false }: { size: number; speed: number; reverse?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="text-white"
      style={{
        animation: `spin ${speed}s linear infinite ${reverse ? "reverse" : ""}`,
      }}
    >
      <path
        fill="currentColor"
        d="M50 10 L55 25 L65 20 L60 35 L75 35 L65 45 L80 50 L65 55 L75 65 L60 65 L65 80 L55 75 L50 90 L45 75 L35 80 L40 65 L25 65 L35 55 L20 50 L35 45 L25 35 L40 35 L35 20 L45 25 Z"
      />
      <circle cx="50" cy="50" r="15" fill="#08080c" />
    </svg>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 20 + Math.random() * 30,
    delay: Math.random() * 20,
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: 0.1 + Math.random() * 0.2,
            animation: `drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -20px); }
          50% { transform: translate(-20px, 30px); }
          75% { transform: translate(20px, 20px); }
        }
      `}</style>
    </>
  );
}

function FeatureCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-gray-700 font-mono">{number}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white/90">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
