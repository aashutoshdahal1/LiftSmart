import { cn } from "@/lib/utils";

interface ChartFrameProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  height?: number;
  className?: string;
  children: React.ReactNode;
}

export function ChartFrame({
  title,
  subtitle,
  action,
  height = 260,
  className,
  children,
}: ChartFrameProps) {
  return (
    <section className={cn("surface-card rounded-3xl p-5 sm:p-6", className)}>
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div style={{ height }}>{children}</div>
    </section>
  );
}

export const axisProps = {
  stroke: "var(--muted-foreground)",
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

export const tooltipStyles = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    color: "var(--popover-foreground)",
    fontSize: 12,
    boxShadow: "var(--shadow-float)",
  },
  labelStyle: { color: "var(--muted-foreground)", marginBottom: 4 },
  itemStyle: { color: "var(--popover-foreground)" },
} as const;
