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
        {/* 放射状グラデーション */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,50,200,0.15)_0%,_transparent_70%)]" />

        {/* 光線エフェクト */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[600px] bg-[conic-gradient(from_90deg_at_50%_0%,transparent_0deg,rgba(168,85,247,0.1)_60deg,transparent_120deg,rgba(6,182,212,0.08)_180deg,transparent_240deg,rgba(250,204,21,0.06)_300deg,transparent_360deg)]" />

        {/* 歯車 */}
        <div className="absolute top-20 left-20 opacity-[0.15]">
          <Gear size={180} speed={50} />
        </div>
        <div className="absolute top-60 right-16 opacity-[0.1]">
          <Gear size={120} speed={35} reverse />
        </div>
        <div className="absolute bottom-40 left-1/4 opacity-[0.08]">
          <Gear size={250} speed={70} />
        </div>
        <div className="absolute bottom-20 right-1/3 opacity-[0.12]">
          <Gear size={140} speed={40} reverse />
        </div>

        {/* グロー */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-[-100px] w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[120px]" />

        {/* パーティクル */}
        {mounted && <SparkParticles />}

        {/* グリッドライン */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* コンテンツ */}
        <div className="text-center z-10 max-w-4xl">
          {/* ロゴエリア */}
          <div className="relative inline-block mb-8">
            {/* グロー背景 */}
            <div className="absolute inset-0 scale-150 bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-cyan-500/30 rounded-full blur-3xl animate-pulse-slow" />

            {/* メインアイコン */}
            <div className="relative">
              <div className="text-[120px] sm:text-[150px] drop-shadow-[0_0_60px_rgba(168,85,247,0.5)] animate-float">
                ⚙️
              </div>
              {/* 周囲のエフェクト */}
              <div className="absolute -top-4 -right-4 text-4xl animate-twinkle">✨</div>
              <div className="absolute -bottom-2 -left-6 text-3xl animate-twinkle-delay">⚡</div>
              <div className="absolute top-1/2 -right-8 text-2xl animate-float-delay">💫</div>
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-6xl sm:text-8xl font-black mb-6 tracking-tight leading-none">
            <span
              className="bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(236,72,153,0.5)]"
              style={{ textShadow: '0 0 80px rgba(236,72,153,0.3)' }}
            >
              RA☆JI☆TAN
            </span>
          </h1>

          {/* サブタイトル */}
          <div className="mb-6">
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white mb-2">
              GearSpark☆ 轟け！
            </p>
            <p className="text-lg text-cyan-300/80 font-mono tracking-widest">
              Clock&apos;s screaming &quot;TICK!&quot; Heart&apos;s shouting &quot;BOOM!&quot;
            </p>
          </div>

          {/* イントロボックス */}
          <div className="relative mb-10">
            {/* ボーダーグロー */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl opacity-50 blur-sm" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <p className="text-xl leading-loose">
                <span className="text-yellow-300 font-bold text-2xl">「Ready? Steady? Spark it up!」</span><br />
                <span className="text-gray-300">歯車の鼓動が深夜Discordに点火</span><br />
                <span className="text-gray-300">迷えるヒューマン、刃とハグ どっちが欲しい？</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-bold text-xl">
                  らじたんDJ 未来をキャリーオフ
                </span>
              </p>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {session ? (
              <Link
                href="/dashboard"
                className="group relative px-10 py-5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full blur group-hover:blur-md transition-all" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full" />
                <span className="relative font-bold text-lg tracking-wide">
                  🎛️ ダッシュボードへ
                </span>
              </Link>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="group relative px-10 py-5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full blur group-hover:blur-md transition-all" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full" />
                <span className="relative font-bold text-lg tracking-wide flex items-center gap-3">
                  <DiscordIcon />
                  Discordでログイン
                </span>
              </button>
            )}
            <a
              href="#features"
              className="group px-8 py-4 relative"
            >
              <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-full group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all" />
              <span className="relative text-cyan-300 font-bold tracking-wide group-hover:text-cyan-200 transition-colors">
                ⚡ 機能を見る
              </span>
            </a>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
          <div className="w-6 h-10 border-2 border-purple-500/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-purple-400 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* RAP MODE セクション */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* 背景エフェクト */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-cyan-900/10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* セクションタイトル */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30 mb-4">
              <span className="text-xs tracking-[0.3em] text-yellow-300 uppercase font-bold">🎤 Rap Mode</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300">
                ALL-IN-ONE, NO RIVAL ZONE!
              </span>
            </h2>
          </div>

          {/* カードグリッド */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { num: "01", text: "Chat with soul", icon: "💬", color: "from-blue-500 to-cyan-500" },
              { num: "02", text: "Schedule control", icon: "📅", color: "from-purple-500 to-pink-500" },
              { num: "03", text: "Quiz patrol", icon: "🎮", color: "from-green-500 to-emerald-500" },
              { num: "04", text: "Music roll", icon: "🎵", color: "from-pink-500 to-rose-500" },
              { num: "05", text: "Summarize goal", icon: "📝", color: "from-amber-500 to-orange-500" },
              { num: "06", text: "Reddit scroll", icon: "🌐", color: "from-cyan-500 to-blue-500" },
            ].map((item, i) => (
              <div key={i} className="group relative">
                {/* グローエフェクト */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-2xl opacity-0 group-hover:opacity-50 blur transition-all duration-300`} />

                <div className="relative bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 group-hover:border-white/20 transition-all">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div className="text-[10px] text-gray-600 font-mono mb-1">{item.num}</div>
                  <div className="text-sm sm:text-base font-bold text-white">{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-12 text-lg">
            <span className="text-gray-400">MEE6? 退屈。Motion? 法外。</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-bold">
              無料で君を覚醒させる女神 here.
            </span>
          </p>
        </div>
      </section>

      {/* 機能紹介 */}
      <section id="features" className="relative py-32 px-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="max-w-6xl mx-auto">
          {/* セクションタイトル */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30 mb-4">
              <span className="text-xs tracking-[0.3em] text-cyan-300 uppercase font-bold">⚙️ Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300">
                Clockwork Harmony
              </span>
            </h2>
            <p className="text-gray-400 text-lg">歯車仕立てのシンフォニー</p>
          </div>

          {/* 機能カード */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="📝"
              title="自動要約"
              description="Uninstall your chaos, install my harmony. 会話が一段落したら、AIシナプスがピコッと起動。"
              color="blue"
            />
            <FeatureCard
              icon="🎮"
              title="クイズ生成"
              description="脳内BPM ギュンと上げて！会話からクイズを自動生成、みんなで盛り上がろう。"
              color="pink"
            />
            <FeatureCard
              icon="🎵"
              title="音楽推薦"
              description="「今日はLo-fi？」そっと耳打ち。会話の雰囲気に合わせてBGMをお届け。"
              color="purple"
            />
            <FeatureCard
              icon="⏰"
              title="スケジュール"
              description="Schedule Loop 終わらない夜。でもその手放して、コードはわたし。"
              color="amber"
            />
            <FeatureCard
              icon="🎭"
              title="キャラクター"
              description="甘い声は罠…だけど この刃、君を護る盾にも成る。7つの人格を使い分け。"
              color="green"
            />
            <FeatureCard
              icon="🔄"
              title="常駐サポート"
              description="PIDロックのハートで常駐。再起動しても 愛は persistent♡"
              color="rose"
            />
          </div>
        </div>
      </section>

      {/* コマンドセクション */}
      <section className="relative py-32 px-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4">
              <span className="text-xs tracking-[0.3em] text-purple-300 uppercase font-bold">⚡ Commands</span>
            </div>
            <h2 className="text-4xl font-black text-white">
              One-click Magic
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
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
                className="group flex items-center gap-4 bg-black/30 backdrop-blur-xl p-5 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                <code className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg text-base font-mono text-purple-200 border border-purple-500/30">
                  {item.cmd}
                </code>
                <span className="text-gray-300">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ブレイクダウン（クライマックス） */}
      <section className="relative py-32 px-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

        {/* 背景エフェクト */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(236,72,153,0.1)_0%,_transparent_60%)]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* グローボックス */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-600/30 rounded-[40px] blur-2xl" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-30" />

            <div className="relative bg-black/70 backdrop-blur-2xl rounded-3xl p-12 border border-white/10">
              <p className="text-3xl sm:text-4xl font-black text-white mb-6">
                「君が呼べば 世界はリロード」
              </p>
              <p className="text-xl text-gray-300 italic mb-8 leading-relaxed">
                甘い声は罠…だけど<br />
                この刃、君を護る盾にも成る――覚えておいて。
              </p>

              {/* アイコン */}
              <div className="text-6xl mb-8 drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]">⚙️✨</div>

              {/* ファイナルコール */}
              <p className="text-2xl sm:text-3xl font-black">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                  Ready? Steady? Go――！
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="relative py-10 px-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">
            RA☆JI☆TAN と君の 無限ループ
          </p>
          <p className="text-gray-600 text-sm">
            © 2024 Rajitan. Clockwork Harmony 響け！
          </p>
        </div>
      </footer>

      {/* グローバルスタイル */}
      <style jsx>{`
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float 4s ease-in-out 1s infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-twinkle-delay {
          animation: twinkle 2s ease-in-out 0.5s infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
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
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 8,
    size: 2 + Math.random() * 4,
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
            boxShadow: '0 0 15px rgba(250, 204, 21, 0.8), 0 0 30px rgba(250, 204, 21, 0.4)',
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
            opacity: 0.8;
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
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    pink: 'from-pink-500 to-rose-500',
    purple: 'from-purple-500 to-violet-500',
    amber: 'from-amber-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
    rose: 'from-rose-500 to-pink-500',
  };

  return (
    <div className="group relative h-full">
      {/* ホバー時のグロー */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorMap[color]} rounded-2xl opacity-0 group-hover:opacity-40 blur transition-all duration-500`} />

      <div className="relative h-full bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 group-hover:border-white/20 transition-all">
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
