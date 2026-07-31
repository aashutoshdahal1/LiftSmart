import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { removeFood } from "@/store/nutritionSlice";
import type { Meal } from "@/lib/mock-data";

const slotEmoji: Record<Meal["slot"], string> = {
  Breakfast: "🌅",
  Lunch: "🥗",
  Dinner: "🍽️",
  Snack: "🥤",
};

export function MealTimeline({ onAdd }: { onAdd: (slot: Meal["slot"]) => void }) {
  const dispatch = useAppDispatch();
  const meals = useAppSelector((s) => s.nutrition.meals);

  return (
    <div className="relative space-y-4 pl-6">
      <span className="absolute left-2 top-3 bottom-3 w-px bg-border" aria-hidden />
      {meals.map((meal, i) => {
        const kcal = meal.items.reduce((a, b) => a + b.calories, 0);
        const protein = meal.items.reduce((a, b) => a + b.protein, 0);
        return (
          <motion.section
            key={meal.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.45 }}
            className="relative"
          >
            <span className="absolute -left-[18px] top-6 size-2.5 rounded-full bg-primary ring-4 ring-background" />
            <div className="surface-card rounded-3xl p-5">
              <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span aria-hidden className="text-lg">
                    {slotEmoji[meal.slot]}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">{meal.slot}</h3>
                    <p className="text-xs text-muted-foreground">
                      {meal.time} · {kcal} kcal · {protein} g protein
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label={`Add food to ${meal.slot}`}
                  onClick={() => onAdd(meal.slot)}
                >
                  <Plus className="size-4" />
                </Button>
              </header>

              <ul className="mt-4 space-y-2">
                {meal.items.map((item) => (
                  <li
                    key={item.id}
                    className="group flex items-center justify-between gap-3 rounded-2xl bg-elevated px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.serving} · P {item.protein} · C {item.carbs} · F {item.fat}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">{item.calories}</span>
                      <button
                        aria-label={`Remove ${item.name}`}
                        onClick={() =>
                          dispatch(removeFood({ mealId: meal.id, itemId: item.id }))
                        }
                        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
                {meal.items.length === 0 ? (
                  <li className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-xs text-muted-foreground">
                    Nothing logged yet
                  </li>
                ) : null}
              </ul>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
