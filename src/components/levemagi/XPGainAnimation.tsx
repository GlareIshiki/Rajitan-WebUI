"use client";

import { useEffect, useState } from "react";

interface XPGainAnimationProps {
  xp: number;
  onComplete: () => void;
}

export function XPGainAnimation({ xp, onComplete }: XPGainAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
      style={{ animation: "fadeOut 1.5s ease-out forwards" }}
    >
      <div
        className="text-6xl font-black"
        style={{
          color: "var(--theme-primary)",
          textShadow: "0 0 30px var(--theme-glow)",
          animation: "xpPop 0.5s ease-out forwards",
        }}
      >
        +{xp} XP
      </div>
      <style jsx>{`
        @keyframes xpPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          0%,
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
