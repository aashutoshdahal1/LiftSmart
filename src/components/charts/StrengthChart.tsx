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
import { strengthSeries } from "@/lib/mock-data";

export function StrengthChart({ height = 280 }: { height?: number }) {
  return (
    <ChartFrame title="Strength progression" subtitle="Top set load per lift (kg)" height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={strengthSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="week" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipStyles} formatter={(v: number) => `${v} kg`} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)", paddingTop: 8 }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="bench"
            name="Bench"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: "var(--primary)" }}
            animationDuration={1200}
          />
          <Line
            type="monotone"
            dataKey="squat"
            name="Squat"
            stroke="var(--accent)"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: "var(--accent)" }}
            animationDuration={1400}
          />
          <Line
            type="monotone"
            dataKey="deadlift"
            name="Deadlift"
            stroke="var(--warning)"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: "var(--warning)" }}
            animationDuration={1600}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
