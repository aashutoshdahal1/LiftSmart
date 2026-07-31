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
