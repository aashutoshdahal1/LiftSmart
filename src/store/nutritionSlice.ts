import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type FoodItem, type Meal } from "@/lib/mock-data";

export interface CalorieAdjustment {
  delta: number;
  reason: string;
  date: string;
}

interface ConsumedTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionState {
  meals: Meal[];
  consumed: ConsumedTotals;
  water: number;
  waterTarget: number;
  calorieAdjustment: CalorieAdjustment | null;
  yesterdayMealsUsed: boolean;
}

const EMPTY_MEALS: Meal[] = [
  { id: "m-breakfast", slot: "Breakfast", time: "8:00 AM",  items: [] },
  { id: "m-lunch",     slot: "Lunch",     time: "12:30 PM", items: [] },
  { id: "m-snack",     slot: "Snack",     time: "3:30 PM",  items: [] },
  { id: "m-dinner",    slot: "Dinner",    time: "7:00 PM",  items: [] },
];

const initialState: NutritionState = {
  meals: EMPTY_MEALS,
  consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  water: 0,
  waterTarget: 9,
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
