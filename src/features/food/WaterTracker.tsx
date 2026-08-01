import { motion } from "framer-motion";
import { Droplets, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { addWater, removeWater } from "@/store/nutritionSlice";
import { nutritionApi } from "@/lib/api";

export function WaterTracker() {
  const dispatch = useAppDispatch();
  const { water, waterTarget } = useAppSelector((s) => s.nutrition);

  function syncWater(newCount: number) {
    nutritionApi.setWater(newCount).catch(() => {});
  }

  return (
    <div className="surface-card rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Droplets className="size-4.5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Water</p>
            <p className="text-xs text-muted-foreground">
              {water} of {waterTarget} glasses
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Remove a glass"
            onClick={() => { dispatch(removeWater()); syncWater(Math.max(0, water - 1)); }}
          >
            <Minus className="size-4" />
          </Button>
          <Button size="icon" aria-label="Add a glass" onClick={() => { dispatch(addWater()); syncWater(water + 1); }}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5">
        {Array.from({ length: waterTarget }).map((_, i) => (
          <motion.span
            key={i}
            animate={{
              backgroundColor: i < water ? "var(--accent)" : "var(--muted)",
              scaleY: i < water ? 1 : 0.7,
            }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="h-10 flex-1 origin-bottom rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
