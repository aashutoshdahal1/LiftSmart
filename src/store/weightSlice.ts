import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  kg: number;
}

interface WeightState {
  entries: WeightEntry[];
}

const today = new Date();
function daysAgo(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const initialState: WeightState = {
  entries: [
    { date: daysAgo(8), kg: 79.2 },
    { date: daysAgo(7), kg: 79.0 },
    { date: daysAgo(6), kg: 78.9 },
    { date: daysAgo(5), kg: 78.7 },
    { date: daysAgo(4), kg: 78.6 },
    { date: daysAgo(3), kg: 78.5 },
    { date: daysAgo(2), kg: 78.5 },
    { date: daysAgo(1), kg: 78.4 },
  ],
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
  },
});

export const { logWeight } = weightSlice.actions;
export default weightSlice.reducer;
