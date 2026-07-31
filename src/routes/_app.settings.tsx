import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, Ruler, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LiftSmart" },
      {
        name: "description",
        content: "Manage your profile, units, notifications, privacy and subscription in LiftSmart.",
      },
      { property: "og:title", content: "Settings — LiftSmart" },
      { property: "og:description", content: "Profile, units, notifications and subscription." },
    ],
  }),
  component: SettingsPage,
});

function Row({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof User;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Profile, preferences and subscription">
      <div className="max-w-2xl space-y-6">
        <section className="surface-card rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-border">
              <AvatarFallback className="bg-elevated font-display text-lg font-semibold">
                {user.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={user.name} className="mt-2 h-11 rounded-2xl bg-elevated" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} className="mt-2 h-11 rounded-2xl bg-elevated" />
            </div>
          </div>
          <Button className="mt-5 rounded-2xl" onClick={() => toast.success("Profile saved")}>
            Save changes
          </Button>
        </section>

        <section>
          <SectionHeader title="Preferences" />
          <div className="surface-card divide-y divide-border rounded-3xl">
            <Row icon={Ruler} title="Metric units" desc="Kilograms and centimetres">
              <Switch defaultChecked aria-label="Metric units" />
            </Row>
            <Row icon={Bell} title="Smart notifications" desc="Workout, meal and recovery nudges">
              <Switch defaultChecked aria-label="Smart notifications" />
            </Row>
            <Row icon={ShieldCheck} title="Private profile" desc="Hide your stats from leaderboards">
              <Switch aria-label="Private profile" />
            </Row>
          </div>
        </section>

        <section>
          <SectionHeader title="Subscription" />
          <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
            <div>
              <p className="font-display text-base font-semibold">LiftSmart Pro</p>
              <p className="mt-1 text-sm text-muted-foreground">$12 / month · renews Aug 28</p>
            </div>
            <Button variant="secondary" className="rounded-2xl">
              <CreditCard className="size-4" />
              Manage billing
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
