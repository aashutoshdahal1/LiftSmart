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
import { proteinSeries, targets } from "@/lib/mock-data";

export function ProteinChart({ height = 260 }: { height?: number }) {
  return (
    <ChartFrame title="Protein" subtitle={`Target ${targets.protein} g / day`} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={proteinSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="proteinFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipStyles} formatter={(v: number) => `${v} g`} />
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
    </ChartFrame>
  );
}
