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
import { volumeSeries } from "@/lib/mock-data";

export function VolumeChart({ height = 260 }: { height?: number }) {
  return (
    <ChartFrame title="Weekly volume" subtitle="Total tonnage lifted (kg)" height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={volumeSeries} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-glow)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="week" {...axisProps} />
          <YAxis tickFormatter={(v: number) => `${v / 1000}k`} {...axisProps} />
          <Tooltip
            {...tooltipStyles}
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            formatter={(v: number) => `${v.toLocaleString()} kg`}
          />
          <Bar
            dataKey="volume"
            fill="url(#volumeFill)"
            radius={[10, 10, 4, 4]}
            animationDuration={1100}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
