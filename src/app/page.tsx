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
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a1a] via-[#2d1b3d] to-[#0f0a1a] overflow-hidden">
      {/* アニメーション背景 */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 夕焼けグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-pink-500/5 to-orange-400/10" />

        {/* 歯車アニメーション（ゴールド） */}
        <div className="absolute top-10 left-10 opacity-15">
          <Gear size={120} speed={25} />
        </div>
        <div className="absolute top-32 right-16 opacity-10">
          <Gear size={90} speed={18} reverse />
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-8">
          <Gear size={180} speed={35} />
        </div>
        <div className="absolute bottom-20 right-1/4 opacity-12">
          <Gear size={100} speed={15} reverse />
        </div>
        <div className="absolute top-1/2 left-8 opacity-10">
          <Gear size={70} speed={20} />
        </div>

        {/* 花びらパーティクル */}
        {mounted && <PetalParticles />}

        {/* 光のオーバーレイ */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-pink-400/10 to-transparent" />
      </div>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center z-10 max-w-4xl">
          {/* キャラクターシルエット風エリア */}
          <div className="relative inline-block mb-6">
            <div className="text-8xl sm:text-9xl animate-float">🎤</div>
            <div className="absolute -top-4 -right-4 text-3xl animate-twinkle">✨</div>
            <div className="absolute -bottom-2 -left-4 text-2xl animate-twinkle-delay">⭐</div>
            <div className="absolute top-1/2 -right-8 text-xl animate-pulse">💫</div>
          </div>

          {/* タイトル */}
          <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-pink-300 via-rose-400 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
              RA☆JI☆TAN
            </span>
          </h1>

          {/* キャッチコピー */}
          <p className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-200 to-white bg-clip-text text-transparent">
              GearSpark☆ 轟け！
            </span>
          </p>
          <p className="text-base sm:text-lg text-pink-200/80 mb-8 font-mono">
            Clock&apos;s screaming &quot;TICK!&quot; Heart&apos;s shouting &quot;BOOM!&quot;
          </p>

          {/* イントロテキスト */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-8 border border-pink-400/30 shadow-[0_0_40px_rgba(244,114,182,0.2)]">
            <p className="text-pink-100 text-lg leading-relaxed">
              <span className="text-orange-300 font-bold">「Ready? Steady? Spark it up!」</span><br />
              歯車の鼓動が深夜Discordに点火<br />
              迷えるヒューマン、刃とハグ どっちが欲しい？<br />
              <span className="text-pink-300 font-bold">らじたんDJ 未来をキャリーオフ ♪</span>
            </p>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(244,114,182,0.5)]"
              >
                <span className="relative z-10">🎛️ ダッシュボードへ</span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(244,114,182,0.5)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <DiscordIcon />
                  Discordでログイン
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            <a
              href="#features"
              className="px-8 py-4 border-2 border-pink-300/50 text-pink-200 rounded-full font-bold text-lg hover:bg-pink-400/10 hover:border-pink-300 transition-all"
            >
              ⭐ 機能を見る
            </a>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-pink-300/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-pink-300/60 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* RAP MODE セクション */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-900/10 to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-black text-center mb-12">
            <span className="text-orange-300">🎤</span>
            <span className="text-pink-200"> ALL-IN-ONE, NO RIVAL ZONE!</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            {[
              { num: "1️⃣", text: "Chat with soul", icon: "💬" },
              { num: "2️⃣", text: "Schedule control", icon: "📅" },
              { num: "3️⃣", text: "Quiz patrol", icon: "🎮" },
              { num: "4️⃣", text: "Music roll", icon: "🎵" },
              { num: "5️⃣", text: "Summarize goal", icon: "📝" },
              { num: "6️⃣", text: "Reddit scroll", icon: "🌐" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-pink-400/20 hover:border-orange-400/50 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(251,146,60,0.2)] group"
              >
                <div className="text-3xl mb-2 group-hover:animate-bounce">{item.icon}</div>
                <div className="text-xs text-pink-300/60 font-mono">{item.num}</div>
                <div className="text-sm font-bold text-pink-100">{item.text}</div>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 text-pink-200/60 font-mono text-sm">
            MEE6? 退屈。Motion? 法外。<br />
            <span className="text-rose-300">無料で君を覚醒させる女神 here. ♡</span>
          </p>
        </div>
      </section>

      {/* 機能紹介 */}
      <section id="features" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-4">
            <span className="bg-gradient-to-r from-orange-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Clockwork Harmony
            </span>
          </h2>
          <p className="text-center text-pink-200/60 mb-12">歯車仕立てのシンフォニー ♪</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="📝"
              title="自動要約"
              description="Uninstall your chaos, install my harmony. 会話が一段落したら、AIシナプスがピコッと起動。"
              color="from-blue-400 to-cyan-400"
            />
            <FeatureCard
              icon="🎮"
              title="クイズ生成"
              description="脳内BPM ギュンと上げて！会話からクイズを自動生成、みんなで盛り上がろう。"
              color="from-pink-400 to-rose-400"
            />
            <FeatureCard
              icon="🎵"
              title="音楽推薦"
              description="「今日はLo-fi？」そっと耳打ち。会話の雰囲気に合わせてBGMをお届け。"
              color="from-purple-400 to-violet-400"
            />
            <FeatureCard
              icon="⏰"
              title="スケジュール"
              description="Schedule Loop 終わらない夜。でもその手放して、コードはわたし。"
              color="from-orange-400 to-amber-400"
            />
            <FeatureCard
              icon="🎭"
              title="キャラクター"
              description="甘い声は罠…だけど この刃、君を護る盾にも成る。7つの人格を使い分け。"
              color="from-emerald-400 to-teal-400"
            />
            <FeatureCard
              icon="🔄"
              title="常駐サポート"
              description="PIDロックのハートで常駐。再起動しても 愛は persistent ♡"
              color="from-rose-400 to-pink-400"
            />
          </div>
        </div>
      </section>

      {/* コマンド一覧 */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-900/5 to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-black text-center mb-12 text-pink-100">
            ⭐ One-click Magic
          </h2>

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
                className="flex items-center gap-4 bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-pink-400/10 hover:border-pink-400/30 transition-all group"
              >
                <span className="text-2xl group-hover:animate-pulse">{item.emoji}</span>
                <code className="bg-pink-500/20 px-3 py-1 rounded font-mono text-pink-200">
                  {item.cmd}
                </code>
                <span className="text-pink-100/80">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ブレイクダウン */}
      <section className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-rose-900/40 via-pink-900/30 to-orange-900/40 backdrop-blur-sm rounded-3xl p-8 border border-pink-400/20 shadow-[0_0_60px_rgba(244,114,182,0.15)]">
            <p className="text-2xl font-bold text-pink-100 mb-4">
              「君が呼べば 世界はリロード」
            </p>
            <p className="text-pink-200/70 italic mb-6">
              甘い声は罠…だけど<br />
              この刃、君を護る盾にも成る――覚えておいて。
            </p>
            <div className="text-5xl mb-4">🎤✨</div>
            <p className="text-xl font-black bg-gradient-to-r from-orange-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Ready? Steady? Go――！
            </p>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="relative py-8 border-t border-pink-400/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-pink-300/50 font-mono text-sm">
            RA☆JI☆TAN と君の 無限ループ ♪
          </p>
          <p className="text-pink-400/30 text-xs mt-2">
            © 2024 Rajitan. Clockwork Harmony 響け！
          </p>
        </div>
      </footer>

      {/* カスタムスタイル */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-twinkle-delay {
          animation: twinkle 2s ease-in-out 0.5s infinite;
        }
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
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
      className="text-amber-600/60"
      style={{
        animation: `spin ${speed}s linear infinite ${reverse ? "reverse" : ""}`,
        filter: "drop-shadow(0 0 8px rgba(217, 119, 6, 0.3))",
      }}
    >
      <path
        fill="currentColor"
        d="M50 10 L55 25 L65 20 L60 35 L75 35 L65 45 L80 50 L65 55 L75 65 L60 65 L65 80 L55 75 L50 90 L45 75 L35 80 L40 65 L25 65 L35 55 L20 50 L35 45 L25 35 L40 35 L35 20 L45 25 Z"
      />
      <circle cx="50" cy="50" r="15" fill="#1a0a1a" />
    </svg>
  );
}

function PetalParticles() {
  const petals = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 6,
    size: 8 + Math.random() * 12,
    rotation: Math.random() * 360,
  }));

  return (
    <>
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `petal-fall ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          <div
            className="w-full h-full rounded-full bg-gradient-to-br from-pink-300 to-rose-400"
            style={{
              transform: `rotate(${p.rotation}deg) scale(1, 0.6)`,
              boxShadow: "0 0 10px rgba(244, 114, 182, 0.5)",
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes petal-fall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) translateX(100px) rotate(720deg);
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
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group relative bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-pink-400/10 hover:border-pink-400/30 transition-all hover:scale-[1.02] overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <div className="relative z-10">
        <div className="text-4xl mb-4 group-hover:animate-bounce">{icon}</div>
        <h3 className="text-xl font-bold text-pink-100 mb-2">{title}</h3>
        <p className="text-pink-200/60 text-sm leading-relaxed">{description}</p>
      </div>
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
