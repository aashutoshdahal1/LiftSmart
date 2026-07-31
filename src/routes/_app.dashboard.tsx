import { Link, createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Flame, Scale, Target, Zap } from "lucide-react";
import { MacroDonut } from "@/components/charts/MacroDonut";
import { WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { MetricCard } from "@/components/common/MetricCard";
import { ProgressRing } from "@/components/common/ProgressRing";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AiRecommendationCard } from "@/features/ai/AiRecommendationCard";
import { QuickActions } from "@/features/dashboard/QuickActions";
import { MissionList } from "@/features/gamification/MissionList";
import { ScoreGrid } from "@/features/gamification/ScoreGrid";
import { aiInsights, targets, todayWorkout, user } from "@/lib/mock-data";
import { useAppSelector } from "@/store";

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
  const { streak, level, xp, xpToNext } = useAppSelector((s) => s.gamification);

  return (
    <AppShell title="Good morning, Alex" subtitle="Friday · Week 6 of your lean bulk block">
      <div className="space-y-8">
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass relative overflow-hidden rounded-4xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-primary">Today's workout</p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  {todayWorkout.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{todayWorkout.subtitle}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {[
                    `${todayWorkout.exercises.length} exercises`,
                    `~${todayWorkout.durationMin} min`,
                    `${(todayWorkout.volumeKg / 1000).toFixed(1)}k kg planned`,
                    todayWorkout.intensity,
                  ].map((chip) => (
                    <span key={chip} className="rounded-full bg-elevated px-3 py-1.5">
                      {chip}
                    </span>
                  ))}
                </div>
                <Button asChild size="lg" className="mt-6 h-12 rounded-2xl px-6">
                  <Link to="/workout">
                    <Dumbbell className="size-4" />
                    Start workout
                  </Link>
                </Button>
              </div>
              <ProgressRing value={consumed.calories} max={targets.calories} size={140} tone="primary">
                <span className="font-display text-2xl font-semibold">
                  {targets.calories - consumed.calories}
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  kcal left
                </span>
              </ProgressRing>
            </div>
          </div>

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

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Streak" value={streak} unit="days" icon={Flame} tone="warning" delta="Personal best" deltaTone="up" />
          <MetricCard label="Weight" value={user.weightKg} decimals={1} unit="kg" icon={Scale} tone="accent" delta="-0.4 kg this week" deltaTone="down" />
          <MetricCard label="Goal" value="Lean bulk" icon={Target} tone="primary" delta="On track · 82%" deltaTone="up" />
          <MetricCard
            label={`Level ${level}`}
            value={xp}
            unit={`/ ${xpToNext} XP`}
            icon={Zap}
            tone="success"
            footer={<Progress value={(xp / xpToNext) * 100} className="h-1.5" />}
          />
        </section>

        <section>
          <SectionHeader title="Today's AI recommendations" subtitle="Generated at 05:30 from last night's review" />
          <div className="grid gap-4 lg:grid-cols-2">
            {aiInsights.slice(0, 2).map((i) => (
              <AiRecommendationCard key={i.id} title={i.title} body={i.body} tag={i.tag} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Your scores" subtitle="Rolling 7-day windows" />
          <ScoreGrid />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <WeightTrendChart height={260} />
          <div>
            <SectionHeader title="Weekly missions" subtitle="Resets Monday 00:00" />
            <MissionList />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
