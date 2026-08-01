import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { consumed, meals, waterGlasses, type FoodItem, type Meal } from "@/lib/mock-data";

export interface CalorieAdjustment {
  delta: number;         // + means increase, - means decrease
  reason: string;        // human-readable explanation
  date: string;          // YYYY-MM-DD this adjustment was computed
}

interface NutritionState {
  meals: Meal[];
  consumed: typeof consumed;
  water: number;
  waterTarget: number;
  calorieAdjustment: CalorieAdjustment | null;
  yesterdayMealsUsed: boolean;  // true if today's meals were carried from yesterday
}

const initialState: NutritionState = {
  meals,
  consumed,
  water: waterGlasses.current,
  waterTarget: waterGlasses.target,
  calorieAdjustment: null,
  yesterdayMealsUsed: false,
};

const nutritionSlice = createSlice({
  name: "nutrition",
  initialState,
  reducers: {
    addFood(state, action: PayloadAction<{ slot: Meal["slot"]; item: FoodItem }>) {
      const meal = state.meals.find((m) => m.slot === action.payload.slot);
      const item = { ...action.payload.item, id: `${action.payload.item.id}-${Date.now()}` };
      if (meal) meal.items.push(item);
      state.consumed.calories += item.calories;
      state.consumed.protein += item.protein;
      state.consumed.carbs += item.carbs;
      state.consumed.fat += item.fat;
    },
    removeFood(state, action: PayloadAction<{ mealId: string; itemId: string }>) {
      const meal = state.meals.find((m) => m.id === action.payload.mealId);
      if (!meal) return;
      const item = meal.items.find((i) => i.id === action.payload.itemId);
      if (!item) return;
      meal.items = meal.items.filter((i) => i.id !== action.payload.itemId);
      state.consumed.calories -= item.calories;
      state.consumed.protein -= item.protein;
      state.consumed.carbs -= item.carbs;
      state.consumed.fat -= item.fat;
    },
    addWater(state) {
      state.water += 1;
    },
    removeWater(state) {
      state.water = Math.max(0, state.water - 1);
    },
    setCalorieAdjustment(state, action: PayloadAction<CalorieAdjustment | null>) {
      state.calorieAdjustment = action.payload;
    },
    carryYesterdayMeals(state, action: PayloadAction<Meal[]>) {
      state.meals = action.payload;
      const totals = action.payload
        .flatMap((m) => m.items)
        .reduce((acc, item) => ({
          calories: acc.calories + item.calories,
          protein:  acc.protein  + item.protein,
          carbs:    acc.carbs    + item.carbs,
          fat:      acc.fat      + item.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      state.consumed = totals;
      state.yesterdayMealsUsed = true;
    },
    setNutritionFromLog(state, action: PayloadAction<{ meals: Meal[]; water: number; waterTarget: number; consumed: typeof state.consumed }>) {
      state.meals = action.payload.meals;
      state.consumed = action.payload.consumed;
      state.water = action.payload.water;
      state.waterTarget = action.payload.waterTarget;
    },
  },
});

export const { addFood, removeFood, addWater, removeWater, setCalorieAdjustment, carryYesterdayMeals, setNutritionFromLog } = nutritionSlice.actions;
export default nutritionSlice.reducer;
