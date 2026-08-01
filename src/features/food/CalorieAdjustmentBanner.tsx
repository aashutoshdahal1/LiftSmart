import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useCalorieAdjustment } from "@/lib/calorie-adjustment";

export function CalorieAdjustmentBanner() {
  const adj = useCalorieAdjustment();

  const colors = {
    "on-track": { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-500", Icon: Minus },
    increase:   { bg: "bg-blue-500/10",    border: "border-blue-500/30",    text: "text-blue-500",    Icon: TrendingUp },
    decrease:   { bg: "bg-amber-500/10",   border: "border-amber-500/30",   text: "text-amber-500",   Icon: TrendingDown },
  };

  // When no food logged, render a subtle info banner instead of a trend signal
  if (adj.usingFallback) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-muted bg-muted/40 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Info className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  TDEE target — {adj.adjustedTarget.toLocaleString()} kcal
                  {adj.delta !== 0 && (
                    <span className={`ml-2 ${adj.direction === "increase" ? "text-blue-500" : "text-amber-500"}`}>
                      ({adj.delta > 0 ? "+" : ""}{adj.delta} kcal trend adjustment)
                    </span>
                  )}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{adj.reason}</p>
              <p className="mt-1 text-xs font-semibold text-foreground/70">{adj.action}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const c = colors[adj.direction];
  const { Icon } = c;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border p-4 ${c.bg} ${c.border}`}
      >
        <div className="flex items-start gap-3">
          <span className={`grid size-8 shrink-0 place-items-center rounded-2xl bg-white/10 ${c.text}`}>
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className={`text-xs font-bold uppercase tracking-wide ${c.text}`}>
                {adj.direction === "on-track"
                  ? `On track · ${adj.adjustedTarget.toLocaleString()} kcal`
                  : adj.direction === "increase"
                  ? `+${Math.abs(adj.delta)} kcal · target ${adj.adjustedTarget.toLocaleString()} kcal`
                  : `-${Math.abs(adj.delta)} kcal · target ${adj.adjustedTarget.toLocaleString()} kcal`}
              </p>
              {adj.delta !== 0 && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  base {adj.baseTarget.toLocaleString()} kcal
                </p>
              )}
            </div>
            <p className="mt-0.5 text-xs text-foreground/80">{adj.reason}</p>
            <p className={`mt-1 text-xs font-semibold ${c.text}`}>{adj.action}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
