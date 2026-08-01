import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface NutritionDay {
  date: string;    // YYYY-MM-DD
  calories: number;
  protein: number;
}

interface NutritionHistoryState {
  days: NutritionDay[];
}

const initialState: NutritionHistoryState = {
  days: [],
};

const nutritionHistorySlice = createSlice({
  name: "nutritionHistory",
  initialState,
  reducers: {
    setNutritionHistory(state, action: PayloadAction<NutritionDay[]>) {
      state.days = action.payload;
    },
  },
});

export const { setNutritionHistory } = nutritionHistorySlice.actions;
export default nutritionHistorySlice.reducer;
