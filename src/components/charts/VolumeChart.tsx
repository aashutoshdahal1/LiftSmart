import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame, axisProps, tooltipStyles } from "./ChartFrame";
import { useAppSelector } from "@/store";

function isoToWeekStart(iso: string): string {
  const d = new Date(iso);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function VolumeChart({ height = 260 }: { height?: number }) {
  const history = useAppSelector((s) => s.workout.history);

  // Group by ISO week start, keep last 8 weeks
  const weekMap = new Map<string, number>();
  for (const w of history) {
    const ws = isoToWeekStart(w.date);
    weekMap.set(ws, (weekMap.get(ws) ?? 0) + (w.volume ?? 0));
  }
  const sorted = [...weekMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-8);

  const data = sorted.map(([ws, volume], i) => ({
    week: `W${i + 1}`,
    volume,
  }));

  return (
    <ChartFrame title="Weekly volume" subtitle="Total tonnage lifted (kg)" height={height}>
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No workouts logged yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary-glow)" />
                <stop offset="100%" stopColor="var(--primary)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" {...axisProps} />
            <YAxis tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} {...axisProps} />
            <Tooltip
              {...tooltipStyles}
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              formatter={(v: number) => [`${v.toLocaleString()} kg`]}
            />
            <Bar
              dataKey="volume"
              fill="url(#volumeFill)"
              radius={[10, 10, 4, 4]}
              animationDuration={1100}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
