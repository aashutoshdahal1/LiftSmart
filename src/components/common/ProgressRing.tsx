import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "warning" | "destructive" | "success";

const toneVar: Record<Tone, string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  success: "var(--success)",
};

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  tone?: Tone;
  label?: string;
  sublabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  size = 132,
  thickness = 10,
  tone = "primary",
  label,
  sublabel,
  className,
  children,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? "Progress"}: ${Math.round(pct * 100)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneVar[tone]}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <>
            <span className="font-display text-2xl font-semibold leading-none">{label}</span>
            {sublabel ? (
              <span className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                {sublabel}
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
