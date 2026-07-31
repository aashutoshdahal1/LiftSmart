import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "warning" | "destructive" | "success" | "muted";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  accent: "bg-accent/15 text-accent",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  success: "bg-success/15 text-success",
  muted: "bg-muted text-muted-foreground",
};

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  decimals?: number;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  icon?: LucideIcon;
  tone?: Tone;
  footer?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  decimals = 0,
  delta,
  deltaTone = "flat",
  icon: Icon,
  tone = "primary",
  footer,
  className,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={cn("surface-card rounded-3xl p-5", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span className={cn("grid size-9 place-items-center rounded-2xl", toneClasses[tone])}>
            <Icon className="size-4.5" />
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold tracking-tight">
          {typeof value === "number" ? <AnimatedNumber value={value} decimals={decimals} /> : value}
        </span>
        {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
      </div>
      {delta ? (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            deltaTone === "up" && "text-success",
            deltaTone === "down" && "text-destructive",
            deltaTone === "flat" && "text-muted-foreground",
          )}
        >
          {delta}
        </p>
      ) : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </motion.div>
  );
}
