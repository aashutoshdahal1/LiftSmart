import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FitnessGoal = "lean-bulk" | "bulk" | "cut" | "maintenance" | "lose-weight";

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ProfileState {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: "male" | "female" | "other";
  goal: FitnessGoal;
  activityLevel: "sedentary" | "light" | "moderate" | "high" | "athlete";
}

/**
 * Accurate TDEE-based macro calculator.
 * Formula: Mifflin-St Jeor BMR × Harris activity factor → TDEE → goal surplus/deficit
 * Macros: protein by body-weight target, fat 25–30% of calories, carbs fill remainder.
 */
export function computeTargets(p: ProfileState): MacroTargets {
  // Step 1: BMR (Mifflin-St Jeor)
  const bmr =
    p.gender === "female"
      ? 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age - 161
      : 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + 5;

  // Step 2: TDEE
  const multipliers: Record<ProfileState["activityLevel"], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
    athlete: 1.9,
  };
  const tdee = bmr * multipliers[p.activityLevel];

  // Step 3: Calorie target based on goal (% of TDEE, more accurate than fixed offsets)
  const goalMultiplier: Record<FitnessGoal, number> = {
    "lean-bulk": 1.10,   // +10% surplus
    bulk: 1.20,           // +20% surplus
    cut: 0.80,            // -20% deficit
    maintenance: 1.00,
    "lose-weight": 0.75,  // -25% deficit
  };
  const calories = Math.round(Math.max(1200, tdee * goalMultiplier[p.goal]));

  // Step 4: Protein — evidence-based per lean body mass proxy
  const proteinPerKg: Record<FitnessGoal, number> = {
    "lean-bulk": 2.2,
    bulk: 2.0,
    cut: 2.4,
    maintenance: 1.8,
    "lose-weight": 2.4,
  };
  const protein = Math.round(p.weightKg * proteinPerKg[p.goal]);

  // Step 5: Fat — 25% of calories (minimum 40g for hormones)
  const fat = Math.max(40, Math.round((calories * 0.25) / 9));

  // Step 6: Carbs fill the remaining calories
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbs, fat };
}

const initialState: ProfileState = {
  name: "",
  age: 25,
  heightCm: 170,
  weightKg: 70,
  gender: "male",
  goal: "maintenance",
  activityLevel: "moderate",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setGoal(state, action: PayloadAction<FitnessGoal>) {
      state.goal = action.payload;
    },
    setBodyStats(
      state,
      action: PayloadAction<{ age?: number; heightCm?: number; weightKg?: number; gender?: ProfileState["gender"] }>
    ) {
      if (action.payload.age !== undefined) state.age = action.payload.age;
      if (action.payload.heightCm !== undefined) state.heightCm = action.payload.heightCm;
      if (action.payload.weightKg !== undefined) state.weightKg = action.payload.weightKg;
      if (action.payload.gender !== undefined) state.gender = action.payload.gender;
    },
    setActivityLevel(state, action: PayloadAction<ProfileState["activityLevel"]>) {
      state.activityLevel = action.payload;
    },
  },
});

export const { setGoal, setBodyStats, setActivityLevel } = profileSlice.actions;
export default profileSlice.reducer;
