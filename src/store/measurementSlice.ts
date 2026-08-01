import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface MeasurementEntry {
  date: string; // YYYY-MM-DD
  value: number; // cm
}

export interface MeasurementRecord {
  id: string;
  label: string;
  unit: string;
  entries: MeasurementEntry[];
}

interface MeasurementState {
  records: MeasurementRecord[];
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const initialState: MeasurementState = {
  records: [
    { id: "1", label: "Chest", unit: "cm", entries: [{ date: daysAgo(42), value: 104.6 }, { date: daysAgo(14), value: 105.5 }, { date: daysAgo(0), value: 106 }] },
    { id: "2", label: "Waist", unit: "cm", entries: [{ date: daysAgo(42), value: 82.1 }, { date: daysAgo(14), value: 81 }, { date: daysAgo(0), value: 80 }] },
    { id: "3", label: "Arms", unit: "cm", entries: [{ date: daysAgo(42), value: 37.6 }, { date: daysAgo(14), value: 38.1 }, { date: daysAgo(0), value: 38.5 }] },
    { id: "4", label: "Thighs", unit: "cm", entries: [{ date: daysAgo(42), value: 59.9 }, { date: daysAgo(14), value: 60.5 }, { date: daysAgo(0), value: 61 }] },
    { id: "5", label: "Shoulders", unit: "cm", entries: [{ date: daysAgo(42), value: 124.2 }, { date: daysAgo(14), value: 125.4 }, { date: daysAgo(0), value: 126 }] },
    { id: "6", label: "Calves", unit: "cm", entries: [{ date: daysAgo(42), value: 38.6 }, { date: daysAgo(14), value: 39 }, { date: daysAgo(0), value: 39 }] },
  ],
};

const measurementSlice = createSlice({
  name: "measurement",
  initialState,
  reducers: {
    logMeasurement(state, action: PayloadAction<{ id: string; date: string; value: number }>) {
      const rec = state.records.find((r) => r.id === action.payload.id);
      if (!rec) return;
      const idx = rec.entries.findIndex((e) => e.date === action.payload.date);
      if (idx !== -1) {
        rec.entries[idx]!.value = action.payload.value;
      } else {
        rec.entries.push({ date: action.payload.date, value: action.payload.value });
        rec.entries.sort((a, b) => a.date.localeCompare(b.date));
      }
    },
    addRecord(state, action: PayloadAction<{ label: string; unit?: string }>) {
      state.records.push({
        id: `m-${Date.now()}`,
        label: action.payload.label,
        unit: action.payload.unit ?? "cm",
        entries: [],
      });
    },
    removeRecord(state, action: PayloadAction<string>) {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
    renameRecord(state, action: PayloadAction<{ id: string; label: string }>) {
      const rec = state.records.find((r) => r.id === action.payload.id);
      if (rec) rec.label = action.payload.label;
    },
    setRecords(state, action: PayloadAction<typeof state.records>) {
      state.records = action.payload;
    },
  },
});

export const { logMeasurement, addRecord, removeRecord, renameRecord, setRecords } = measurementSlice.actions;
export default measurementSlice.reducer;
