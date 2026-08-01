import { AnimatePresence, motion } from "framer-motion";
import { Apple, ChevronLeft, ChevronRight, Flame, Sparkles, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { useCalorieAdjustment } from "@/lib/calorie-adjustment";
import { useAppSelector } from "@/store";
import { computeTargets } from "@/store/profileSlice";

// ── Calorie progress bar ──────────────────────────────────────────────────────
import type { CalorieAdjustmentResult } from "@/lib/calorie-adjustment";

function CalorieBar({ consumed, target, adj }: { consumed: number; target: number; adj: CalorieAdjustmentResult }) {
  const pct = Math.min((consumed / target) * 100, 100);
  const remaining = Math.max(target - consumed, 0);
  const over = consumed - target;

  const adjColors = {
    "on-track": { chip: "bg-emerald-500/12 text-emerald-500", Icon: null },
    increase:   { chip: "bg-blue-500/12 text-blue-500",       Icon: TrendingUp },
    decrease:   { chip: "bg-amber-500/12 text-amber-500",     Icon: TrendingDown },
  };
  const ac = adjColors[adj.direction];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card rounded-3xl p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-orange-500/12">
          <Flame className="size-4.5 text-orange-500" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Calories today</p>
          <p className="text-sm font-semibold">
            {consumed.toLocaleString()} <span className="text-muted-foreground font-normal">/ {target.toLocaleString()} kcal</span>
          </p>
        </div>
        <div className="text-right shrink-0">
          {remaining > 0 ? (
            <>
              <p className="text-lg font-bold tabular-nums text-orange-500">{remaining.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">kcal left</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold tabular-nums text-red-500">+{over.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">over goal</p>
            </>
          )}
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-elevated overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="h-full rounded-full"
          style={{ background: pct >= 100 ? "#ef4444" : "linear-gradient(90deg, #f97316, #f59e0b)" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {pct >= 100
            ? "You've hit your calorie goal for today."
            : `${Math.round(pct)}% of daily goal reached — ${remaining.toLocaleString()} kcal to go.`}
        </p>
        {adj.delta !== 0 && ac.Icon && (
          <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ac.chip}`}>
            <ac.Icon className="size-2.5" />
            {adj.delta > 0 ? `+${adj.delta}` : adj.delta} kcal adjusted
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface Slide {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  title: string;
  body: string;
}

// ── Slideshow ─────────────────────────────────────────────────────────────────
function SuggestionSlideshow({ slides }: { slides: Slide[] }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  function go(next: number) {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  }

  const slide = slides[idx]!;
  const Icon = slide.icon;

  return (
    <div className="surface-card rounded-3xl p-4 overflow-hidden">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={idx}
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: d * 40, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d * -40, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div className="flex items-start gap-3">
            <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${slide.iconBg}`}>
              <Icon className={`size-4.5 ${slide.iconColor}`} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`mb-0.5 text-[10px] font-bold uppercase tracking-wider ${slide.iconColor}`}>
                {slide.label}
              </p>
              <p className="text-sm font-semibold leading-snug">{slide.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{slide.body}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-200 ${
                i === idx ? "w-4 h-1.5 bg-primary" : "size-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => go((idx - 1 + slides.length) % slides.length)}
            className="grid size-7 place-items-center rounded-xl bg-elevated text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => go((idx + 1) % slides.length)}
            className="grid size-7 place-items-center rounded-xl bg-elevated text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function AiCoachSuggestions() {
  const nutrition = useAppSelector((s) => s.nutrition);
  const weightEntries = useAppSelector((s) => s.weight.entries);
  const workout = useAppSelector((s) => s.workout);
  const profile = useAppSelector((s) => s.profile);

  // Single source of truth for calorie target + weight-trend adjustment
  const adj = useCalorieAdjustment();
  const target = adj.adjustedTarget;  // already incorporates weight-trend delta

  // Dynamic macro targets based on latest logged weight
  const latestLoggedWeight = weightEntries[weightEntries.length - 1];
  const dynamicTargets = computeTargets(
    latestLoggedWeight ? { ...profile, weightKg: latestLoggedWeight.kg } : profile
  );

  const consumed = nutrition.consumed.calories;
  const remaining = Math.max(target - consumed, 0);
  const proteinLeft = Math.max(dynamicTargets.protein - nutrition.consumed.protein, 0);

  const latest = weightEntries[weightEntries.length - 1];
  const prev = weightEntries[weightEntries.length - 8];
  const weekDelta = latest && prev ? latest.kg - prev.kg : 0;
  const isGaining = weekDelta >= 0;

  const lastWorkout = workout.history[0];
  const prevWorkout = workout.history[1];
  const volumeDelta = lastWorkout && prevWorkout ? lastWorkout.volume - prevWorkout.volume : 0;

  const goalLabels: Record<string, string> = {
    "lean-bulk": "lean bulk",
    bulk: "bulk",
    cut: "cut",
    maintenance: "maintenance",
    "lose-weight": "weight loss",
  };

  // Food slide — driven by real adjustment, not mock text
  const foodTitle = adj.direction === "on-track"
    ? remaining > 0 ? `${remaining.toLocaleString()} kcal left today` : "Calorie goal hit!"
    : adj.direction === "increase"
    ? `+${adj.delta} kcal today → ${target.toLocaleString()} kcal`
    : `-${Math.abs(adj.delta)} kcal today → ${target.toLocaleString()} kcal`;

  const foodBody = adj.direction !== "on-track"
    ? `${adj.reason} ${adj.action}`
    : remaining > 600
    ? `${remaining.toLocaleString()} kcal to go. Add a high-protein meal — chicken breast, rice & veg (~${Math.min(remaining, 650)} kcal, 45g protein).`
    : remaining > 200
    ? `${remaining} kcal short. A protein shake + banana (≈320 kcal, 28g protein) will top you up.`
    : proteinLeft > 10
    ? `Almost at calories. Still need ${Math.round(proteinLeft)}g protein — Greek yoghurt or cottage cheese works.`
    : "You've hit your calorie and protein targets for today. Great work!";

  const weightBody = isGaining
    ? `You gained ${Math.abs(weekDelta).toFixed(1)} kg this week — on track for ${goalLabels[profile.goal] ?? profile.goal}. Keep calories at ${target.toLocaleString()} kcal and push progressive overload.`
    : `You lost ${Math.abs(weekDelta).toFixed(1)} kg this week. Eat ${remaining > 0 ? remaining : 200} more kcal daily from whole foods to support your ${goalLabels[profile.goal] ?? profile.goal} goal.`;

  const progressionBody = lastWorkout
    ? volumeDelta >= 0
      ? `${lastWorkout.title} volume up ${(volumeDelta / 1000).toFixed(1)}k kg vs previous. Add 2.5 kg to your main lifts next session.`
      : `${lastWorkout.title} volume dipped slightly. Focus on form — try 1 extra set per exercise instead of adding weight.`
    : "Complete your first workout to unlock personalised progression tips.";

  const slides: Slide[] = [
    {
      icon: Apple,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/12",
      label: "Food suggestion",
      title: foodTitle,
      body: foodBody,
    },
    {
      icon: TrendingUp,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/12",
      label: "Weight trend",
      title: isGaining ? "On track" : "Increase daily intake",
      body: weightBody,
    },
    {
      icon: Zap,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/12",
      label: "Exercise progression",
      title: lastWorkout ? `Next: ${lastWorkout.title}` : "Start your first workout",
      body: progressionBody,
    },
  ];

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 px-1"
      >
        <span className="grid size-8 place-items-center rounded-2xl gradient-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="text-sm font-bold">Today's AI recommendations</p>
          <p className="text-[10px] text-muted-foreground">Based on your logged data</p>
        </div>
      </motion.div>

      <CalorieBar consumed={consumed} target={target} adj={adj} />
      <SuggestionSlideshow slides={slides} />
    </div>
  );
}

// Export targets hook for use in dashboard/food pages
export { computeTargets };
