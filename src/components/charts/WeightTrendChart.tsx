import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "@/store";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame, axisProps, tooltipStyles } from "./ChartFrame";
import type { CompletedWorkout } from "@/store/workoutSlice";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Workout detail popup ───────────────────────────────────────────────────────
function WorkoutPopup({
  workouts,
  dateLabel,
  anchorRect,
  onClose,
}: {
  workouts: CompletedWorkout[];
  dateLabel: string;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const POPUP_W = 288;
  const GAP = 8;
  const MARGIN = 12; // min distance from viewport edge

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Horizontal: centre on the cell, clamp so it never leaves the viewport
  const rawLeft = anchorRect.left + anchorRect.width / 2 - POPUP_W / 2;
  const left = Math.max(MARGIN, Math.min(rawLeft, vw - POPUP_W - MARGIN));

  // Vertical: prefer below, flip above if not enough room
  const spaceBelow = vh - anchorRect.bottom - GAP;
  const showAbove = spaceBelow < 200;
  const top = showAbove
    ? anchorRect.top - GAP - 10   // will animate up from there
    : anchorRect.bottom + GAP;

  // Arrow horizontal offset relative to popup left edge
  const arrowCenter = anchorRect.left + anchorRect.width / 2 - left;
  const arrowLeft = Math.max(16, Math.min(arrowCenter, POPUP_W - 16));

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: showAbove ? 6 : -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: showAbove ? 6 : -6 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="fixed z-50 rounded-2xl bg-card shadow-2xl ring-1 ring-border"
        style={{ width: POPUP_W, left, top }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        <div
          className={`absolute size-3 rotate-45 rounded-sm bg-card ring-1 ring-border ${showAbove ? "-bottom-1.5" : "-top-1.5"}`}
          style={{ left: arrowLeft - 6 }}
        />

        <div className="p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{dateLabel}</p>
          <div className="space-y-1.5">
            {workouts.map((w) => (
              <div key={w.id} className="flex items-center gap-2 rounded-xl bg-elevated px-3 py-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg gradient-primary text-primary-foreground">
                  <Dumbbell className="size-3" />
                </span>
                <p className="text-sm font-semibold">{w.title}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Calendar day cell ──────────────────────────────────────────────────────────
function DayCell({
  day,
  isLogged,
  isToday,
  index,
  workouts,
  year,
  month,
}: {
  day: number;
  isLogged: boolean;
  isToday: boolean;
  index: number;
  workouts: CompletedWorkout[];
  year: number;
  month: number;
}) {
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const dateLabel = `${MONTH_NAMES[month]} ${day}, ${year}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLogged) return;
    // Read rect synchronously — currentTarget is nullified after the handler returns
    const rect = anchorRect ? null : e.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
  };

  return (
    <div className="relative flex justify-center">
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.004 }}
        onClick={handleClick}
        className={`flex h-9 w-full items-center justify-center rounded-full text-xs font-medium transition-colors
          ${isLogged
            ? "gradient-primary text-primary-foreground font-semibold shadow-sm cursor-pointer hover:opacity-90 active:scale-95"
            : isToday
            ? "border border-primary text-primary cursor-default"
            : "text-muted-foreground cursor-default"}`}
      >
        {day}
      </motion.button>

      <AnimatePresence>
        {anchorRect && (
          <WorkoutPopup
            workouts={workouts}
            dateLabel={dateLabel}
            anchorRect={anchorRect}
            onClose={() => setAnchorRect(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Calendar card ──────────────────────────────────────────────────────────────
export function WeightCalendarCard() {
  const now = new Date();
  const streak = useAppSelector((s) => s.gamification.streak);
  const workoutHistory = useAppSelector((s) => s.workout.history);
  const weekStreak = Math.max(streak > 0 ? Math.max(1, Math.round(streak / 7)) : 0, 0);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  // Map "YYYY-M-D" → workouts that day
  const workoutsByDay = new Map<string, CompletedWorkout[]>();
  for (const w of workoutHistory) {
    const [y, m, d] = w.date.slice(0, 10).split("-").map(Number);
    const key = `${y}-${m! - 1}-${d}`;
    const arr = workoutsByDay.get(key) ?? [];
    arr.push(w);
    workoutsByDay.set(key, arr);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  function prev() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section className="surface-card rounded-3xl p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight">Workout calendar</h3>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Tap a day to see what you trained</p>
            {weekStreak > 0 && (
              <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
                🔥 {weekStreak}-week streak
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 self-start sm:self-auto">
          <button onClick={prev} className="grid size-7 place-items-center rounded-xl bg-elevated text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="min-w-[110px] text-center text-sm font-semibold">{MONTH_NAMES[month]} {year}</span>
          <button onClick={next} className="grid size-7 place-items-center rounded-xl bg-elevated text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <p key={d} className="text-center text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</p>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const key = `${year}-${month}-${day}`;
          const dayWorkouts = workoutsByDay.get(key) ?? [];
          return (
            <DayCell
              key={key}
              day={day}
              isLogged={dayWorkouts.length > 0}
              isToday={key === todayKey}
              index={i}
              workouts={dayWorkouts}
              year={year}
              month={month}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full gradient-primary" />
          <span className="text-[10px] text-muted-foreground">Workout done · tap to view</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full border border-primary" />
          <span className="text-[10px] text-muted-foreground">Today</span>
        </div>
      </div>
    </section>
  );
}

export function WeightTrendChart({
  height = 280,
  action,
}: {
  height?: number;
  action?: React.ReactNode;
}) {
  const entries = useAppSelector((s) => s.weight.entries);

  const chartData = entries.map((e, i) => {
    const slice = entries.slice(Math.max(0, i - 6), i + 1);
    const avg = slice.reduce((sum, x) => sum + x.kg, 0) / slice.length;
    const d = new Date(e.date);
    const label = `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}`;
    return { date: label, weight: e.kg, avg: Math.round(avg * 10) / 10 };
  });

  if (chartData.length === 0) {
    return (
      <ChartFrame title="Weight trend" subtitle="Log weight daily to see your trend" height={height} action={action}>
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No weight entries yet</div>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      title="Weight trend"
      subtitle="Daily logs vs. 7-day rolling average"
      height={height}
      action={action}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.42} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis domain={["dataMin - 0.8", "dataMax + 0.8"]} {...axisProps} />
          <Tooltip {...tooltipStyles} formatter={(v: number) => `${v} kg`} />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fill="url(#weightFill)"
            animationDuration={1200}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={1400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
