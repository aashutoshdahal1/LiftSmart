import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { weightSeries } from "@/lib/mock-data";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const LOGGED_DAYS = new Set<string>(
  weightSeries.map(({ date }) => {
    const parts = date.split(" ");
    const mon = parts[0] ?? "";
    const day = parts[1] ?? "0";
    const monthIdx = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(mon);
    return `2025-${monthIdx}-${Number(day)}`;
  })
);

export function WeightCalendarCard() {
  const now = new Date();
  const streak = useAppSelector((s) => s.gamification.streak);
  const weekStreak = Math.max(1, Math.round(streak / 7));
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(5); // June

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
      {/* Header — stacks on mobile, side-by-side on sm+ */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight">Weight log calendar</h3>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Days you logged your weight</p>
            <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
              🔥 {weekStreak}-week streak
            </span>
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

      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <p key={d} className="text-center text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const key = `${year}-${month}-${day}`;
          const isLogged = LOGGED_DAYS.has(key);
          const isToday = key === todayKey;
          return (
            <motion.div
              key={key}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.004 }}
              className={`flex h-9 w-full items-center justify-center rounded-full text-xs font-medium transition-colors
                ${isLogged
                  ? "gradient-primary text-primary-foreground font-semibold shadow-sm"
                  : isToday
                  ? "border border-primary text-primary"
                  : "text-muted-foreground hover:bg-elevated"}`}
            >
              {day}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full gradient-primary" />
          <span className="text-[10px] text-muted-foreground">Weight logged</span>
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
  return (
    <ChartFrame
      title="Weight trend"
      subtitle="Daily logs vs. 7-day rolling average"
      height={height}
      action={action}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={weightSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
