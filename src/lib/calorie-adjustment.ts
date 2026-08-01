import { useAppSelector } from "@/store";
import { computeTargets } from "@/store/profileSlice";

export interface CalorieAdjustmentResult {
  baseTarget: number;       // TDEE-based target from profile alone
  adjustedTarget: number;   // baseTarget ± delta from weight trend
  delta: number;            // 0, +200, -200, etc.
  direction: "on-track" | "increase" | "decrease";
  reason: string;
  action: string;
  weeklyRateKg: number;
  /** true when no food has been logged today — targets are TDEE-based fallbacks */
  usingFallback: boolean;
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
  /** Total calories logged today (0 = nothing logged yet) */
  consumedCalories: number,
): CalorieAdjustmentResult {
  const usingFallback = consumedCalories === 0;
  const rate = Math.round(weeklyRate(weightEntries) * 100) / 100;
  const range = TARGET_RATE[goal] ?? TARGET_RATE["maintenance"]!;

  // Not enough weight data — return TDEE target, note fallback if applicable
  if (weightEntries.length < 3) {
    return {
      baseTarget,
      adjustedTarget: baseTarget,
      delta: 0,
      direction: "on-track",
      reason: usingFallback
        ? "Target based on your profile (TDEE). Log food + 3 days of weight to unlock auto-adjustment."
        : "Log weight for 3+ days to unlock automatic calorie adjustments.",
      action: usingFallback ? "Start logging meals to track your intake." : "Keep it up!",
      weeklyRateKg: rate,
      usingFallback,
    };
  }

  // Weight trend is within target range
  if (rate >= range.min && rate <= range.max) {
    return {
      baseTarget,
      adjustedTarget: baseTarget,
      delta: 0,
      direction: "on-track",
      reason: usingFallback
        ? `Weight trending well (${rate >= 0 ? "+" : ""}${rate.toFixed(2)} kg/wk). Target is your TDEE-based goal — log food to track today.`
        : `Gaining ${Math.abs(rate).toFixed(2)} kg/week — right on target.`,
      action: usingFallback ? "Log your meals to see live progress." : "Keep it up!",
      weeklyRateKg: rate,
      usingFallback,
    };
  }

  const isCutGoal = goal === "cut" || goal === "lose-weight";

  if (rate < range.min) {
    if (isCutGoal) {
      return {
        baseTarget,
        adjustedTarget: baseTarget - 200,
        delta: -200,
        direction: "decrease",
        reason: `Losing ${Math.abs(rate).toFixed(2)} kg/week — target is ${Math.abs(range.max)}–${Math.abs(range.min)} kg/week.`,
        action: usingFallback
          ? "Reduce by 200 kcal. Skip 1 snack or swap rice for vegetables."
          : "Reduce by 200 kcal. Skip 1 snack or swap rice for vegetables.",
        weeklyRateKg: rate,
        usingFallback,
      };
    }
    return {
      baseTarget,
      adjustedTarget: baseTarget + 200,
      delta: 200,
      direction: "increase",
      reason: `Gaining ${rate.toFixed(2)} kg/week — below target ${range.min}–${range.max} kg/week.`,
      action: usingFallback
        ? "Add 200 kcal today. Try an extra snack or bigger portions."
        : "Add 200 kcal. Try an extra snack or bigger portions.",
      weeklyRateKg: rate,
      usingFallback,
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
      action: usingFallback
        ? "Eat 200 kcal more today. Add a protein snack or extra carbs."
        : "Eat 200 kcal more. Add a protein snack or extra carbs.",
      weeklyRateKg: rate,
      usingFallback,
    };
  }
  return {
    baseTarget,
    adjustedTarget: baseTarget - 200,
    delta: -200,
    direction: "decrease",
    reason: `Gaining ${rate.toFixed(2)} kg/week — above target, may be gaining excess fat.`,
    action: usingFallback
      ? "Reduce by 200 kcal today. Cut 1 tbsp oil or smaller rice portion."
      : "Reduce by 200 kcal. Cut 1 tbsp oil or smaller rice portion.",
    weeklyRateKg: rate,
    usingFallback,
  };
}

/** React hook — reads weight entries + profile + consumed from Redux, returns adjustment */
export function useCalorieAdjustment(): CalorieAdjustmentResult {
  const entries = useAppSelector((s) => s.weight.entries);
  const profile = useAppSelector((s) => s.profile);
  const consumedCalories = useAppSelector((s) => s.nutrition.consumed.calories);
  const latestWeight = entries[entries.length - 1];
  const effectiveProfile = latestWeight ? { ...profile, weightKg: latestWeight.kg } : profile;
  const base = computeTargets(effectiveProfile);
  return computeAdjustment(profile.goal, entries, base.calories, consumedCalories);
}
