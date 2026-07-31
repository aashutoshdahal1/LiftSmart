import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { ChartFrame } from "./ChartFrame";
import { consistencySeries } from "@/lib/mock-data";

const data = consistencySeries.map((d, i) => ({
  name: d.week,
  value: Math.round((d.sessions / 5) * 100),
  fill: i % 2 === 0 ? "var(--primary)" : "var(--accent)",
}));

export function ConsistencyChart({ height = 280 }: { height?: number }) {
  return (
    <ChartFrame title="Weekly consistency" subtitle="Sessions completed vs. 5 planned" height={height}>
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
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
