import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartFrame } from "./ChartFrame";
import { useAppSelector } from "@/store";

function isoToWeekStart(iso: string): string {
  const d = new Date(iso);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export function ConsistencyChart({ height = 280 }: { height?: number }) {
  const history = useAppSelector((s) => s.workout.history);
  const profile = useAppSelector((s) => s.profile);
  // Use targetDays from profile if available, default 5
  const planned = (profile as { targetDays?: number }).targetDays ?? 5;

  // Count sessions per week, last 6 weeks
  const weekMap = new Map<string, number>();
  for (const w of history) {
    const ws = isoToWeekStart(w.date);
    weekMap.set(ws, (weekMap.get(ws) ?? 0) + 1);
  }
  const sortedWeeks = [...weekMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6);

  const data = sortedWeeks.map(([, sessions], i) => ({
    name: `W${i + 1}`,
    value: Math.min(100, Math.round((sessions / planned) * 100)),
    sessions,
    fill: i % 2 === 0 ? "var(--primary)" : "var(--accent)",
  }));

  return (
    <ChartFrame
      title="Weekly consistency"
      subtitle={`Sessions completed vs. ${planned} planned`}
      height={height}
    >
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No workouts logged yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            innerRadius="26%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "var(--muted)" }} />
            <Tooltip
              formatter={(v: number, _name, props) => [
                `${props.payload.sessions} / ${planned} sessions`,
                props.payload.name,
              ]}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
