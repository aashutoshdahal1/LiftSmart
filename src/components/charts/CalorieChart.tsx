import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame, axisProps, tooltipStyles } from "./ChartFrame";
import { calorieSeries } from "@/lib/mock-data";

export function CalorieChart({ height = 260 }: { height?: number }) {
  return (
    <ChartFrame title="Calories" subtitle="Last 7 days vs. adaptive target" height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={calorieSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipStyles} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
          <ReferenceLine y={2980} stroke="var(--accent)" strokeDasharray="4 4" />
          <Bar dataKey="calories" radius={[10, 10, 4, 4]} animationDuration={1100}>
            {calorieSeries.map((d) => (
              <Cell
                key={d.day}
                fill={d.calories >= d.target ? "var(--primary)" : "var(--warning)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
