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
    <div className="min-h-screen bg-[#08080d] overflow-hidden text-white">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 歯車アニメーション（控えめ） */}
        <div className="absolute top-16 left-16 opacity-[0.06]">
          <Gear size={160} speed={60} />
        </div>
        <div className="absolute top-48 right-24 opacity-[0.04]">
          <Gear size={100} speed={45} reverse />
        </div>
        <div className="absolute bottom-32 left-1/3 opacity-[0.03]">
          <Gear size={220} speed={80} />
        </div>

        {/* スパークパーティクル（控えめ） */}
        {mounted && <SparkParticles />}

        {/* グラデーションオーブ */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px]" />
      </div>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="text-center z-10 max-w-3xl">
          {/* ロゴ */}
          <div className="relative inline-flex items-center justify-center mb-10">
            <div className="absolute w-28 h-28 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full blur-2xl" />
            <div className="relative text-7xl sm:text-8xl">⚙️</div>
            <div className="absolute -top-1 -right-1 text-2xl animate-pulse">✨</div>
          </div>

          {/* タイトル */}
          <h1 className="text-5xl sm:text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              RA☆JI☆TAN
            </span>
          </h1>

          {/* キャッチコピー */}
          <p className="text-xl sm:text-2xl font-bold text-white/90 mb-3">
            GearSpark☆ 轟け！
          </p>
          <p className="text-sm text-gray-400 mb-10 font-mono tracking-wide">
            Clock&apos;s screaming &quot;TICK!&quot; Heart&apos;s shouting &quot;BOOM!&quot;
          </p>

          {/* イントロテキスト */}
          <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-8 mb-10 border border-white/[0.06]">
            <p className="text-gray-300 leading-loose">
              <span className="text-yellow-400/90 font-medium">「Ready? Steady? Spark it up!」</span><br />
              <span className="text-gray-400">歯車の鼓動が深夜Discordに点火</span><br />
              <span className="text-gray-400">迷えるヒューマン、刃とハグ どっちが欲しい？</span><br />
              <span className="text-pink-400/90 font-medium">らじたんDJ 未来をキャリーオフ</span>
            </p>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              >
                ダッシュボードへ
              </Link>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              >
                <DiscordIcon />
                Discordでログイン
              </button>
            )}
            <a
              href="#features"
              className="px-8 py-4 text-gray-400 hover:text-cyan-400 font-medium transition-colors"
            >
              機能を見る →
            </a>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* RAP MODE セクション */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-yellow-400/80 uppercase mb-3">Rap Mode</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              ALL-IN-ONE, NO RIVAL ZONE!
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { num: "01", text: "Chat with soul", icon: "💬" },
              { num: "02", text: "Schedule control", icon: "📅" },
              { num: "03", text: "Quiz patrol", icon: "🎮" },
              { num: "04", text: "Music roll", icon: "🎵" },
              { num: "05", text: "Summarize goal", icon: "📝" },
              { num: "06", text: "Reddit scroll", icon: "🌐" },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white/[0.02] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.05] hover:border-purple-500/30 transition-all"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="text-[10px] text-gray-600 font-mono mb-1">{item.num}</div>
                <div className="text-sm font-medium text-white/80">{item.text}</div>
              </div>
            ))}
          </div>

          <p className="text-center mt-10 text-gray-500 text-sm">
            MEE6? 退屈。Motion? 法外。<br />
            <span className="text-pink-400/70">無料で君を覚醒させる女神 here.</span>
          </p>
        </div>
      </section>

      {/* 機能紹介 */}
      <section id="features" className="relative py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-cyan-400/80 uppercase mb-3">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Clockwork Harmony
            </h2>
            <p className="text-gray-500 mt-3 text-sm">歯車仕立てのシンフォニー</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon="📝"
              title="自動要約"
              description="Uninstall your chaos, install my harmony. 会話が一段落したら、AIシナプスがピコッと起動。"
            />
            <FeatureCard
              icon="🎮"
              title="クイズ生成"
              description="脳内BPM ギュンと上げて！会話からクイズを自動生成、みんなで盛り上がろう。"
            />
            <FeatureCard
              icon="🎵"
              title="音楽推薦"
              description="「今日はLo-fi？」そっと耳打ち。会話の雰囲気に合わせてBGMをお届け。"
            />
            <FeatureCard
              icon="⏰"
              title="スケジュール"
              description="Schedule Loop 終わらない夜。でもその手放して、コードはわたし。"
            />
            <FeatureCard
              icon="🎭"
              title="キャラクター"
              description="甘い声は罠…だけど この刃、君を護る盾にも成る。7つの人格を使い分け。"
            />
            <FeatureCard
              icon="🔄"
              title="常駐サポート"
              description="PIDロックのハートで常駐。再起動しても 愛は persistent♡"
            />
          </div>
        </div>
      </section>

      {/* コマンド一覧 */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-purple-400/80 uppercase mb-3">Commands</p>
            <h2 className="text-2xl font-bold text-white">
              One-click Magic
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
                className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] hover:border-white/10 transition-all"
              >
                <span className="text-xl">{item.emoji}</span>
                <code className="px-3 py-1 bg-purple-500/10 rounded-lg text-sm font-mono text-purple-300">
                  {item.cmd}
                </code>
                <span className="text-gray-400 text-sm">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ブレイクダウン */}
      <section className="relative py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-pink-600/10 blur-3xl" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm rounded-3xl p-10 border border-white/[0.05]">
              <p className="text-xl font-bold text-white/90 mb-4">
                「君が呼べば 世界はリロード」
              </p>
              <p className="text-gray-400 italic mb-8 leading-relaxed">
                甘い声は罠…だけど<br />
                この刃、君を護る盾にも成る――覚えておいて。
              </p>
              <div className="text-4xl mb-6">⚙️✨</div>
              <p className="text-lg font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Ready? Steady? Go――！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="relative py-8 px-6 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-gray-600 text-sm font-mono">
            RA☆JI☆TAN と君の 無限ループ
          </p>
          <p className="text-gray-700 text-xs">
            © 2024 Rajitan
          </p>
        </div>
      </footer>

      {/* カスタムスタイル */}
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

function Gear({ size, speed, reverse = false }: { size: number; speed: number; reverse?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="text-purple-400"
      style={{
        animation: `spin ${speed}s linear infinite ${reverse ? 'reverse' : ''}`,
      }}
    >
      <path
        fill="currentColor"
        d="M50 10 L55 25 L65 20 L60 35 L75 35 L65 45 L80 50 L65 55 L75 65 L60 65 L65 80 L55 75 L50 90 L45 75 L35 80 L40 65 L25 65 L35 55 L20 50 L35 45 L25 35 L40 35 L35 20 L45 25 Z"
      />
      <circle cx="50" cy="50" r="15" fill="#08080d" />
    </svg>
  );
}

function SparkParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3,
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-yellow-400/80"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: '0 0 8px rgba(250, 204, 21, 0.6)',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
            transform: translateY(90vh) scale(1);
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-10vh) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
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
    <div className="group bg-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.05] hover:border-purple-500/20 transition-all">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-white/90 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
