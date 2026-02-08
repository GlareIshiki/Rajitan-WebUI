"use client";

import { useEffect, useState } from "react";
import type { GachaItem } from "@/lib/levemagi/types";

interface GachaResultProps {
  item: GachaItem;
  onClose: () => void;
}

export function GachaResult({ item, onClose }: GachaResultProps) {
  const [phase, setPhase] = useState<"opening" | "reveal" | "done">("opening");

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("reveal"), 1000);
    const timer2 = setTimeout(() => setPhase("done"), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={phase === "done" ? onClose : undefined}
    >
      <div className="text-center">
        {phase === "opening" && (
          <div className="text-8xl animate-bounce">🎁</div>
        )}

        {(phase === "reveal" || phase === "done") && (
          <div
            style={{
              animation: "gachaReveal 0.5s ease-out forwards",
            }}
          >
            <div
              className={`text-9xl mb-6 ${
                item.rarity === "rare" ? "animate-pulse" : ""
              }`}
              style={{
                filter:
                  item.rarity === "rare"
                    ? "drop-shadow(0 0 30px gold)"
                    : "drop-shadow(0 0 20px var(--theme-glow))",
              }}
            >
              {item.emoji}
            </div>

            <div
              className={`text-2xl font-bold mb-2 ${
                item.rarity === "rare" ? "text-yellow-400" : "text-primary"
              }`}
            >
              {item.name}
            </div>

            <div className="text-muted mb-4">{item.description}</div>

            <div
              className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                item.rarity === "rare"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                  : "bg-card text-muted border border-panel"
              }`}
            >
              {item.rarity === "rare" ? "★ RARE ★" : "NORMAL"}
            </div>

            {phase === "done" && (
              <div className="mt-6 text-sm text-muted animate-pulse">
                タップして閉じる
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gachaReveal {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
