import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { consumed, meals, waterGlasses, type FoodItem, type Meal } from "@/lib/mock-data";

interface NutritionState {
  meals: Meal[];
  consumed: typeof consumed;
  water: number;
  waterTarget: number;
}

const initialState: NutritionState = {
  meals,
  consumed,
  water: waterGlasses.current,
  waterTarget: waterGlasses.target,
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
  },
});

export const { addFood, removeFood, addWater, removeWater } = nutritionSlice.actions;
export default nutritionSlice.reducer;
