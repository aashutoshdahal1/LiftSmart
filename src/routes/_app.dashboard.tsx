import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { MacroDonut } from "@/components/charts/MacroDonut";
import { MetricCard } from "@/components/common/MetricCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Progress } from "@/components/ui/progress";
import { AiCoachSuggestions } from "@/features/ai/AiCoachSuggestions";
import { QuickActions } from "@/features/dashboard/QuickActions";
import { useCalorieAdjustment } from "@/lib/calorie-adjustment";
import { useAppSelector } from "@/store";
import { computeTargets, type FitnessGoal } from "@/store/profileSlice";

const GOAL_LABELS: Record<FitnessGoal, string> = {
  "lean-bulk": "Lean Bulk",
  bulk: "Bulk",
  cut: "Cut",
  maintenance: "Maintain",
  "lose-weight": "Lose Weight",
};

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Today — LiftSmart AI Fitness Coach" },
      {
        name: "description",
        content:
          "Your daily overview: today's adaptive workout, calories, macros, weight trend, streak and AI recommendation.",
      },
      { property: "og:title", content: "Today — LiftSmart" },
      { property: "og:description", content: "One screen for training, nutrition and recovery." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const consumed = useAppSelector((s) => s.nutrition.consumed);
  const profile = useAppSelector((s) => s.profile);
  const latestWeight = useAppSelector((s) => s.weight.entries[s.weight.entries.length - 1]);
  const adj = useCalorieAdjustment();
  const targets = { ...computeTargets(latestWeight ? { ...profile, weightKg: latestWeight.kg } : profile), calories: adj.adjustedTarget };

  return (
    <AppShell title="Good morning, Alex" subtitle="Friday · Week 6 of your lean bulk block">
      <div className="space-y-8">
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <AiCoachSuggestions />

          <div className="surface-card rounded-4xl p-6">
            <SectionHeader title="Nutrition" subtitle={`Target ${targets.calories} kcal`} />
            <MacroDonut />
            <div className="mt-4 space-y-3">
              {[
                { label: "Protein", value: consumed.protein, target: targets.protein, unit: "g" },
                { label: "Carbs", value: consumed.carbs, target: targets.carbs, unit: "g" },
                { label: "Fat", value: consumed.fat, target: targets.fat, unit: "g" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">
                      {Math.round(m.value)} / {m.target} {m.unit}
                    </span>
                  </div>
                  <Progress value={(m.value / m.target) * 100} className="mt-1.5 h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Quick actions" />
          <QuickActions />
        </section>

        <section className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
          <MetricCard label="Goal" value={GOAL_LABELS[profile.goal] ?? profile.goal} icon={Target} tone="primary" delta="On track · 82%" deltaTone="up" />
        </section>
      </div>
    </AppShell>
  );
}
