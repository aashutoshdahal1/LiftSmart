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
import { useAppSelector } from "@/store";
import { useCalorieAdjustment } from "@/lib/calorie-adjustment";

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalorieChart({ height = 260 }: { height?: number }) {
  const days = useAppSelector((s) => s.nutritionHistory.days);
  const adj = useCalorieAdjustment();
  const target = adj.adjustedTarget;

  const data = days.map((d) => {
    const date = new Date(d.date);
    return {
      day: DAY_ABBR[date.getDay()],
      calories: d.calories,
      target,
    };
  });

  const hasData = data.some((d) => d.calories > 0);

  return (
    <ChartFrame title="Calories" subtitle="Last 7 days vs. adaptive target" height={height}>
      {!hasData ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No food logged yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              {...tooltipStyles}
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              formatter={(v: number) => [`${v.toLocaleString()} kcal`]}
            />
            <ReferenceLine y={target} stroke="var(--accent)" strokeDasharray="4 4" />
            <Bar dataKey="calories" radius={[10, 10, 4, 4]} animationDuration={1100}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.calories === 0 ? "var(--muted)" : d.calories >= d.target ? "var(--primary)" : "var(--warning)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
