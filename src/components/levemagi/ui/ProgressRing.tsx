"use client";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  percentage,
  size = 48,
  strokeWidth = 4,
  className = "",
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;
  const center = size / 2;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" role="progressbar" aria-valuenow={Math.round(percentage)}>
        <defs>
          <linearGradient id={`ring-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "var(--theme-primary)" }} />
            <stop offset="100%" style={{ stopColor: "var(--theme-accent)" }} />
          </linearGradient>
        </defs>
        {/* 背景トラック */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--mode-border)"
          strokeWidth={strokeWidth}
        />
        {/* プログレス */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#ring-grad-${size})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
