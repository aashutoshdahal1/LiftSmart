import { Check, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { missions } from "@/lib/mock-data";

export function MissionList() {
  return (
    <div className="surface-card divide-y divide-border rounded-3xl">
      {missions.map((m) => {
        const done = m.progress >= m.total;
        const pct = Math.round((m.progress / m.total) * 100);
        return (
          <div key={m.id} className="flex items-center gap-4 p-4">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-2xl ${
                done ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="size-4" /> : <Target className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">{m.label}</p>
                <span className="shrink-0 text-xs font-semibold text-primary">+{m.xp} XP</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={pct} className="h-1.5" />
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {m.progress}/{m.total}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
