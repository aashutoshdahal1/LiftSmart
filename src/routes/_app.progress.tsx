import { createFileRoute } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { CalorieChart } from "@/components/charts/CalorieChart";
import { ConsistencyChart } from "@/components/charts/ConsistencyChart";
import { ProteinChart } from "@/components/charts/ProteinChart";
import { StrengthChart } from "@/components/charts/StrengthChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementGrid } from "@/features/gamification/AchievementGrid";
import { measurements } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — LiftSmart" },
      {
        name: "description",
        content:
          "Charts for weight, calories, protein, strength, volume and consistency, plus measurements, photos and achievements.",
      },
      { property: "og:title", content: "Progress — LiftSmart" },
      { property: "og:description", content: "Six weeks of training data, beautifully visualised." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  return (
    <AppShell title="Progress" subtitle="Week 6 · everything trending the right way">
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="w-full max-w-md rounded-2xl bg-elevated">
          {["charts", "body", "photos", "awards"].map((t) => (
            <TabsTrigger key={t} value={t} className="flex-1 rounded-xl capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <WeightTrendChart height={260} />
            <StrengthChart />
            <VolumeChart />
            <CalorieChart />
            <ProteinChart />
            <ConsistencyChart />
          </div>
        </TabsContent>

        <TabsContent value="body">
          <SectionHeader title="Measurements" subtitle="Since you started · 6 weeks ago" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {measurements.map((m) => (
              <div key={m.label} className="surface-card rounded-3xl p-5">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="mt-2 font-display text-2xl font-semibold">{m.value}</p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    m.delta.startsWith("-") ? "text-accent" : "text-primary"
                  }`}
                >
                  {m.delta} cm
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <EmptyState
            icon={Camera}
            title="No progress photos yet"
            description="Front, side and back every four weeks is the fastest way to see real change."
            actionLabel="Add first photo"
          />
        </TabsContent>

        <TabsContent value="awards" className="space-y-4">
          <SectionHeader title="Achievements" subtitle="4 of 6 unlocked" />
          <AchievementGrid />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
