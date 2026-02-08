"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "ダッシュボード", icon: "📊", auth: true },
    { href: "/levemagi", label: "LeveMagi", icon: "🌰" },
    { href: "/calendar", label: "カレンダー", icon: "📅", auth: true },
    { href: "/settings", label: "設定", icon: "⚙️", auth: true },
    { href: "/stats", label: "統計", icon: "📈", auth: true },
  ];

  const visibleItems = navItems.filter((item) => !item.auth || session);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-panel border-b border-panel backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📻</span>
            <span className="text-xl font-bold text-accent">Rajitan</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "text-muted hover:bg-card hover:text-primary"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* 右側：ユーザーメニュー + ハンバーガー */}
          <div className="flex items-center gap-3">
            {/* ユーザーメニュー */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-card animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm text-muted">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary text-sm hidden sm:block"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="btn-primary flex items-center gap-2 hidden sm:flex"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Discordでログイン
              </button>
            )}

            {/* ハンバーガーメニュー（モバイル） */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-card transition-colors"
            >
              <span className="text-xl">{isMenuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-panel bg-panel">
          <div className="px-4 py-3 space-y-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "text-muted hover:bg-card hover:text-primary"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}

            {/* モバイル用ログイン/ログアウト */}
            <div className="pt-3 border-t border-panel">
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-card transition-colors text-left"
                >
                  🚪 ログアウト
                </button>
              ) : (
                <button
                  onClick={() => signIn("discord")}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-accent text-white transition-colors text-left"
                >
                  🎮 Discordでログイン
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
