import { useAppSelector } from "@/store";
import { computeTargets } from "@/store/profileSlice";

export interface CalorieAdjustmentResult {
  baseTarget: number;       // TDEE-based target from profile alone
  adjustedTarget: number;   // baseTarget + delta from weight trend
  delta: number;            // 0, +200, -200, etc.
  direction: "on-track" | "increase" | "decrease";
  reason: string;
  action: string;
  weeklyRateKg: number;
}

function weeklyRate(entries: { kg: number }[]): number {
  if (entries.length < 2) return 0;
  const recent = entries.slice(-7);
  const diff = recent[recent.length - 1]!.kg - recent[0]!.kg;
  const weekFraction = (recent.length - 1) / 7;
  return weekFraction > 0 ? diff / weekFraction : 0;
}

// Target weekly rate ranges per goal
const TARGET_RATE: Record<string, { min: number; max: number }> = {
  "lean-bulk":   { min: 0.10,  max: 0.25  },
  bulk:          { min: 0.25,  max: 0.50  },
  cut:           { min: -0.75, max: -0.25 },
  maintenance:   { min: -0.05, max: 0.05  },
  "lose-weight": { min: -1.00, max: -0.25 },
};

export function computeAdjustment(
  goal: string,
  weightEntries: { kg: number }[],
  baseTarget: number,
): CalorieAdjustmentResult {
  const rate = Math.round(weeklyRate(weightEntries) * 100) / 100;
  const range = TARGET_RATE[goal] ?? TARGET_RATE["maintenance"]!;

  if (weightEntries.length < 3 || (rate >= range.min && rate <= range.max)) {
    return {
      baseTarget,
      adjustedTarget: baseTarget,
      delta: 0,
      direction: "on-track",
      reason: weightEntries.length < 3
        ? "Log weight for 3+ days to unlock automatic calorie adjustments."
        : `Gaining ${Math.abs(rate).toFixed(2)} kg/week — right on target.`,
      action: "Keep it up!",
      weeklyRateKg: rate,
    };
  }

  const isCutGoal = goal === "cut" || goal === "lose-weight";

  if (rate < range.min) {
    if (isCutGoal) {
      // Losing too slowly → decrease more
      return {
        baseTarget,
        adjustedTarget: baseTarget - 200,
        delta: -200,
        direction: "decrease",
        reason: `Losing ${Math.abs(rate).toFixed(2)} kg/week — target is ${Math.abs(range.max)}–${Math.abs(range.min)} kg/week.`,
        action: "Reduce by 200 kcal. Skip 1 snack or swap rice for vegetables.",
        weeklyRateKg: rate,
      };
    }
    // Gaining too slowly → eat more
    return {
      baseTarget,
      adjustedTarget: baseTarget + 200,
      delta: 200,
      direction: "increase",
      reason: `Gaining ${rate.toFixed(2)} kg/week — below target ${range.min}–${range.max} kg/week.`,
      action: "Add 200 kcal. Try an extra snack or bigger portions.",
      weeklyRateKg: rate,
    };
  }

  // Gaining/losing too fast
  if (isCutGoal) {
    return {
      baseTarget,
      adjustedTarget: baseTarget + 200,
      delta: 200,
      direction: "increase",
      reason: `Losing ${Math.abs(rate).toFixed(2)} kg/week — too fast, risk muscle loss.`,
      action: "Eat 200 kcal more. Add a protein snack or extra carbs.",
      weeklyRateKg: rate,
    };
  }
  return {
    baseTarget,
    adjustedTarget: baseTarget - 200,
    delta: -200,
    direction: "decrease",
    reason: `Gaining ${rate.toFixed(2)} kg/week — above target, may be gaining excess fat.`,
    action: "Reduce by 200 kcal. Cut 1 tbsp oil or smaller rice portion.",
    weeklyRateKg: rate,
  };
}

/** React hook — reads weight entries + profile from Redux, returns adjustment */
export function useCalorieAdjustment(): CalorieAdjustmentResult {
  const entries = useAppSelector((s) => s.weight.entries);
  const profile = useAppSelector((s) => s.profile);
  const latestWeight = entries[entries.length - 1];
  const effectiveProfile = latestWeight ? { ...profile, weightKg: latestWeight.kg } : profile;
  const base = computeTargets(effectiveProfile);
  return computeAdjustment(profile.goal, entries, base.calories);
}
