import { Link } from "@tanstack/react-router";
import { Activity, Bell, Menu, Search } from "lucide-react";
import { navItems } from "./nav-items";
import { StreakFlame } from "@/components/common/StreakFlame";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { user } from "@/lib/mock-data";
import { useAppSelector } from "@/store";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string | undefined }) {
  const streak = useAppSelector((s) => s.gamification.streak);

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-6">
              <SheetTitle className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl gradient-primary text-primary-foreground">
                  <Activity className="size-4" />
                </span>
                LiftSmart
              </SheetTitle>
              <nav className="mt-8 flex flex-col gap-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
                  >
                    <Icon className="size-4.5" />
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StreakFlame days={streak} className="hidden sm:flex" />
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
          </Button>
          <Link to="/settings" aria-label="Profile">
            <Avatar className="size-9 border border-border">
              <AvatarFallback className="bg-elevated text-xs font-semibold">
                {user.avatarInitials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
