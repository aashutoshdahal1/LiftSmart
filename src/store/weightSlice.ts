import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  kg: number;
}

interface WeightState {
  entries: WeightEntry[];
}

const initialState: WeightState = {
  entries: [],
};

const weightSlice = createSlice({
  name: "weight",
  initialState,
  reducers: {
    logWeight(state, action: PayloadAction<{ date: string; kg: number }>) {
      const idx = state.entries.findIndex((e) => e.date === action.payload.date);
      if (idx !== -1) {
        state.entries[idx]!.kg = action.payload.kg;
      } else {
        state.entries.push(action.payload);
        state.entries.sort((a, b) => a.date.localeCompare(b.date));
      }
    },
    setWeightEntries(state, action: PayloadAction<WeightEntry[]>) {
      state.entries = [...action.payload].sort((a, b) => a.date.localeCompare(b.date));
    },
  },
});

export const { logWeight, setWeightEntries } = weightSlice.actions;
export default weightSlice.reducer;
