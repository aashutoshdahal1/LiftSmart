import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { navItems } from "./nav-items";
import { StreakFlame } from "@/components/common/StreakFlame";
import { useAppSelector } from "@/store";

export function Sidebar() {
  const { level, xp, xpToNext, streak } = useAppSelector((s) => s.gamification);
  const pct = Math.round((xp / xpToNext) * 100);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-2">
        <span className="grid size-9 place-items-center rounded-2xl gradient-primary text-primary-foreground">
          <Activity className="size-5" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">LiftSmart</span>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{
              className: "bg-sidebar-accent text-sidebar-accent-foreground",
            }}
          >
            <Icon className="size-4.5 transition-transform group-hover:scale-110" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-4 rounded-3xl border border-sidebar-border bg-elevated p-4">
        <StreakFlame days={streak} />
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Level {level}</span>
            <span className="text-muted-foreground">
              {xp} / {xpToNext} XP
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
