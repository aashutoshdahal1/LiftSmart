import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { tooltipStyles } from "./ChartFrame";
import { useAppSelector } from "@/store";

const COLORS = ["var(--accent)", "var(--primary)", "var(--warning)"];

export function MacroDonut({ height = 190 }: { height?: number }) {
  const consumed = useAppSelector((s) => s.nutrition.consumed);
  const data = [
    { name: "Protein", value: Math.round(consumed.protein * 4) },
    { name: "Carbs", value: Math.round(consumed.carbs * 4) },
    { name: "Fat", value: Math.round(consumed.fat * 9) },
  ];

  return (
    <div style={{ height }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip {...tooltipStyles} formatter={(v: number) => `${v} kcal`} />
          <Pie
            data={data}
            dataKey="value"
            innerRadius="66%"
            outerRadius="100%"
            paddingAngle={3}
            stroke="none"
            animationDuration={1100}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={COLORS[i]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-semibold">{consumed.calories}</span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">kcal</span>
      </div>
    </div>
  );
}
