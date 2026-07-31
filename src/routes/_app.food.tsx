import { createFileRoute } from "@tanstack/react-router";
import { Flame, Beef, Croissant, Droplet } from "lucide-react";
import { useState } from "react";
import { MacroDonut } from "@/components/charts/MacroDonut";
import { MetricCard } from "@/components/common/MetricCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { AiRecommendationCard } from "@/features/ai/AiRecommendationCard";
import { FoodSearchSheet } from "@/features/food/FoodSearchSheet";
import { MealTimeline } from "@/features/food/MealTimeline";
import { WaterTracker } from "@/features/food/WaterTracker";
import { aiInsights, favoriteMeals, targets, type Meal } from "@/lib/mock-data";
import { useAppSelector } from "@/store";

export const Route = createFileRoute("/_app/food")({
  head: () => ({
    meta: [
      { title: "Food Tracker — LiftSmart" },
      {
        name: "description",
        content:
          "Log meals on a timeline, track calories, macros and water, and get AI meal suggestions tuned to your goal.",
      },
      { property: "og:title", content: "Food Tracker — LiftSmart" },
      { property: "og:description", content: "Meals, macros and water in seconds." },
    ],
  }),
  component: FoodPage,
});

function FoodPage() {
  const [slot, setSlot] = useState<Meal["slot"] | null>(null);
  const consumed = useAppSelector((s) => s.nutrition.consumed);

  return (
    <AppShell title="Food" subtitle={`${Math.round(consumed.calories)} of ${targets.calories} kcal today`}>
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Calories" value={consumed.calories} unit={`/ ${targets.calories}`} icon={Flame} tone="warning" />
          <MetricCard label="Protein" value={consumed.protein} unit={`/ ${targets.protein} g`} icon={Beef} tone="accent" />
          <MetricCard label="Carbs" value={consumed.carbs} unit={`/ ${targets.carbs} g`} icon={Croissant} tone="primary" />
          <MetricCard label="Fat" value={consumed.fat} unit={`/ ${targets.fat} g`} icon={Droplet} tone="success" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeader title="Today's timeline" subtitle="Tap + to add food to any meal" />
            <MealTimeline onAdd={setSlot} />
          </div>

          <div className="space-y-4">
            <div className="surface-card rounded-3xl p-5">
              <SectionHeader title="Macro split" />
              <MacroDonut height={200} />
            </div>
            <WaterTracker />
            <AiRecommendationCard
              title="Suggested dinner"
              body="Salmon, 250 g potatoes and greens lands you at 192 g protein and 2,980 kcal — exactly on target for a training day."
              tag="Daily Nutrition"
            />
            <div className="surface-card rounded-3xl p-5">
              <SectionHeader title="Favourites" subtitle="One tap to log again" />
              <ul className="space-y-2">
                {favoriteMeals.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-elevated px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.calories} kcal · P {f.protein}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {aiInsights.slice(1, 2).map((i) => (
              <AiRecommendationCard key={i.id} title={i.title} body={i.body} tag={i.tag} />
            ))}
          </div>
        </section>
      </div>

      <FoodSearchSheet slot={slot} onClose={() => setSlot(null)} />
    </AppShell>
  );
}
