import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame, axisProps, tooltipStyles } from "./ChartFrame";
import { useAppSelector } from "@/store";

// Names to match against (case-insensitive contains)
const LIFTS = [
  { key: "bench",    label: "Bench",    patterns: ["bench"],              color: "var(--primary)" },
  { key: "squat",    label: "Squat",    patterns: ["squat"],              color: "var(--accent)" },
  { key: "deadlift", label: "Deadlift", patterns: ["deadlift", "rdl"],    color: "var(--warning)" },
];

function topSetWeight(exercise: { name: string; sets: { weight?: number; done?: boolean }[] }): number {
  const doneSets = exercise.sets.filter((s) => s.done !== false);
  return Math.max(0, ...doneSets.map((s) => s.weight ?? 0));
}

function isoToWeekStart(iso: string): string {
  const d = new Date(iso);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export function StrengthChart({ height = 280 }: { height?: number }) {
  const history = useAppSelector((s) => s.workout.history);

  // For each lift, collect best top-set per week
  const weekKeys = new Set<string>();
  const liftData: Record<string, Map<string, number>> = {};
  for (const lift of LIFTS) liftData[lift.key] = new Map();

  for (const workout of history) {
    const ws = isoToWeekStart(workout.date);
    weekKeys.add(ws);
    for (const ex of workout.exercises ?? []) {
      for (const lift of LIFTS) {
        if (lift.patterns.some((p) => ex.name.toLowerCase().includes(p))) {
          const top = topSetWeight(ex);
          if (top > (liftData[lift.key]!.get(ws) ?? 0)) {
            liftData[lift.key]!.set(ws, top);
          }
        }
      }
    }
  }

  const sortedWeeks = [...weekKeys].sort().slice(-8);
  const data = sortedWeeks.map((ws, i) => {
    const row: Record<string, string | number> = { week: `W${i + 1}` };
    for (const lift of LIFTS) {
      const v = liftData[lift.key]!.get(ws);
      if (v !== undefined) row[lift.key] = v;
    }
    return row;
  });

  const hasAnyData = LIFTS.some((l) => liftData[l.key]!.size > 0);

  return (
    <ChartFrame title="Strength progression" subtitle="Top set load per lift (kg)" height={height}>
      {!hasAnyData ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No workouts logged yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyles} formatter={(v: number) => [`${v} kg`]} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)", paddingTop: 8 }}
              iconType="circle"
            />
            {LIFTS.map((lift) => (
              <Line
                key={lift.key}
                type="monotone"
                dataKey={lift.key}
                name={lift.label}
                stroke={lift.color}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: lift.color }}
                connectNulls
                animationDuration={1200}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
