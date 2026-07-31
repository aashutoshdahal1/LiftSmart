import { createFileRoute } from "@tanstack/react-router";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { MacroDonut } from "@/components/charts/MacroDonut";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Progress } from "@/components/ui/progress";
import { CalorieAdjustmentBanner } from "@/features/food/CalorieAdjustmentBanner";
import { FoodSearchSheet } from "@/features/food/FoodSearchSheet";
import { MealTimeline } from "@/features/food/MealTimeline";
import { WaterTracker } from "@/features/food/WaterTracker";
import { useCalorieAdjustment } from "@/lib/calorie-adjustment";
import { calorieSeries, type Meal } from "@/lib/mock-data";
import { useAppDispatch, useAppSelector } from "@/store";
import { carryYesterdayMeals } from "@/store/nutritionSlice";
import { computeTargets } from "@/store/profileSlice";

export const Route = createFileRoute("/_app/food")({
  head: () => ({
    meta: [
      { title: "Food Tracker — LiftSmart" },
      {
        name: "description",
        content: "Log meals on a timeline, track calories, macros and water, and get AI meal suggestions tuned to your goal.",
      },
      { property: "og:title", content: "Food Tracker — LiftSmart" },
      { property: "og:description", content: "Meals, macros and water in seconds." },
    ],
  }),
  component: FoodPage,
});

function FoodPage() {
  const dispatch = useAppDispatch();
  const [slot, setSlot] = useState<Meal["slot"] | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const consumed = useAppSelector((s) => s.nutrition.consumed);
  const meals = useAppSelector((s) => s.nutrition.meals);
  const yesterdayUsed = useAppSelector((s) => s.nutrition.yesterdayMealsUsed);
  const profile = useAppSelector((s) => s.profile);
  const latestWeight = useAppSelector((s) => s.weight.entries[s.weight.entries.length - 1]);
  // Use adjusted target (same source as dashboard CalorieBar + banner)
  const adj = useCalorieAdjustment();
  const targets = { ...computeTargets(latestWeight ? { ...profile, weightKg: latestWeight.kg } : profile), calories: adj.adjustedTarget };

  // If no food logged today, carry forward yesterday's meals (mock: check if all slots empty)
  const totalItems = meals.reduce((n, m) => n + m.items.length, 0);
  useEffect(() => {
    if (totalItems === 0 && !yesterdayUsed) {
      // In production this would load actual yesterday's meals from storage.
      // For demo we skip auto-carry so the UI stays clean.
    }
  }, [totalItems, yesterdayUsed, dispatch]);

  const calLeft = Math.max(0, targets.calories - Math.round(consumed.calories));
  const pct = Math.min(100, Math.round((consumed.calories / targets.calories) * 100));

  // Yesterday vs today comparison
  const yesterdayCal = calorieSeries[calorieSeries.length - 2]?.calories ?? null;
  const todayCal = Math.round(consumed.calories);
  const calDiff = yesterdayCal !== null ? todayCal - yesterdayCal : null;

  const macros = [
    { label: "Protein", consumed: Math.round(consumed.protein), target: targets.protein, unit: "g", color: "bg-violet-500" },
    { label: "Carbs",   consumed: Math.round(consumed.carbs),   target: targets.carbs,   unit: "g", color: "bg-amber-500"  },
    { label: "Fat",     consumed: Math.round(consumed.fat),     target: targets.fat,     unit: "g", color: "bg-emerald-500" },
  ];

  return (
    <AppShell title="Food" subtitle={`${Math.round(consumed.calories).toLocaleString()} of ${targets.calories.toLocaleString()} kcal today`}>
      <div className="space-y-5">

        {/* Compact calorie + macro strip */}
        <div className="surface-card rounded-3xl p-5">
          {/* Calories row */}
          <div className="flex items-end justify-between gap-2 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Calories today</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold tabular-nums">{Math.round(consumed.calories).toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ {targets.calories.toLocaleString()} kcal</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold tabular-nums">{calLeft.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">kcal left</p>
            </div>
          </div>
          <Progress value={pct} className="h-2 rounded-full mb-1" />
          <div className="flex items-center justify-end gap-2">
            {calDiff !== null && (
              <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                calDiff === 0 ? "bg-muted text-muted-foreground"
                : calDiff > 0  ? "bg-blue-500/12 text-blue-500"
                               : "bg-amber-500/12 text-amber-500"
              }`}>
                {calDiff === 0
                  ? <><Minus className="size-2.5" /> Same as yesterday</>
                  : calDiff > 0
                  ? <><TrendingUp className="size-2.5" /> +{calDiff.toLocaleString()} kcal vs yesterday</>
                  : <><TrendingDown className="size-2.5" /> {calDiff.toLocaleString()} kcal vs yesterday</>}
              </span>
            )}
          </div>

          {/* Macro mini-bars */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {macros.map((m) => (
              <div key={m.label}>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-semibold tabular-nums">{m.consumed}<span className="text-muted-foreground font-normal">/{m.target}{m.unit}</span></span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${m.color}`}
                    style={{ width: `${Math.min(100, (m.consumed / m.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calorie adjustment banner — driven by weight trend */}
        <CalorieAdjustmentBanner />

        {/* Today's timeline */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader title="Today's timeline" subtitle="Tap + on a meal or add below" />
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-primary/12 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="size-3.5" /> Add Meal
              </button>
            </div>
            <MealTimeline onAdd={setSlot} />
          </div>

          <div className="space-y-4">
            <div className="surface-card rounded-3xl p-5">
              <SectionHeader title="Macro split" />
              <MacroDonut height={200} />
            </div>
            <WaterTracker />
          </div>
        </section>
      </div>

      {/* timeline + pre-selects slot; Add Meal button shows slot picker (slot=null) */}
      <FoodSearchSheet
        open={slot !== null || addOpen}
        slot={slot}
        onClose={() => { setSlot(null); setAddOpen(false); }}
      />
    </AppShell>
  );
}
