import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { Camera } from "lucide-react";
import { CalorieChart } from "@/components/charts/CalorieChart";
import { ConsistencyChart } from "@/components/charts/ConsistencyChart";
import { ProteinChart } from "@/components/charts/ProteinChart";
import { StrengthChart } from "@/components/charts/StrengthChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { WeightCalendarCard, WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementGrid } from "@/features/gamification/AchievementGrid";
import { MeasurementsSection } from "@/features/measurements/MeasurementsSection";
import { WorkoutHistory } from "@/features/workout/WorkoutHistory";

const searchSchema = z.object({ tab: z.string().optional() });

export const Route = createFileRoute("/_app/progress")({
  validateSearch: searchSchema,
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
  const { tab } = useSearch({ from: "/_app/progress" });
  const navigate = useNavigate();
  const activeTab = tab ?? "charts";
  return (
    <AppShell title="Progress" subtitle="Week 6 · everything trending the right way">
      <Tabs value={activeTab} onValueChange={(t) => navigate({ to: "/progress", search: { tab: t } })} className="space-y-6">
        <TabsList className="w-full max-w-md rounded-2xl bg-elevated">
          {["charts", "body", "photos", "awards"].map((t) => (
            <TabsTrigger key={t} value={t} className="flex-1 rounded-xl capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <WeightCalendarCard />
          <WorkoutHistory />
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
          <MeasurementsSection />
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
