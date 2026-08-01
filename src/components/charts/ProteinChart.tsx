import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame, axisProps, tooltipStyles } from "./ChartFrame";
import { useAppSelector } from "@/store";
import { computeTargets } from "@/store/profileSlice";

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ProteinChart({ height = 260 }: { height?: number }) {
  const days = useAppSelector((s) => s.nutritionHistory.days);
  const profile = useAppSelector((s) => s.profile);
  const latestWeight = useAppSelector((s) => s.weight.entries[s.weight.entries.length - 1]);
  const targets = computeTargets(latestWeight ? { ...profile, weightKg: latestWeight.kg } : profile);

  const data = days.map((d) => {
    const date = new Date(d.date);
    return { day: DAY_ABBR[date.getDay()], protein: d.protein };
  });

  const hasData = data.some((d) => d.protein > 0);

  return (
    <ChartFrame title="Protein" subtitle={`Target ${targets.protein} g / day`} height={height}>
      {!hasData ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No food logged yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="proteinFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyles} formatter={(v: number) => [`${v} g`]} />
            <ReferenceLine y={targets.protein} stroke="var(--primary)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="protein"
              stroke="var(--accent)"
              strokeWidth={2.5}
              fill="url(#proteinFill)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
