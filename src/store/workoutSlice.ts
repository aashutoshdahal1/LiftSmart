import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Exercise } from "@/lib/mock-data";

export interface CompletedWorkout {
  id: string;
  title: string;
  date: string; // ISO string
  durationMin: number;
  exercises: Exercise[];
  notes: string;
  volume: number; // total kg
  totalSets: number;
}

interface WorkoutState {
  exercises: Exercise[];
  activeRoutineTitle: string | null;
  activeRestSeconds: number | null;
  completed: boolean;
  notes: string;
  startedAt: number | null;
  history: CompletedWorkout[];
}

const initialState: WorkoutState = {
  exercises: [],
  activeRoutineTitle: null,
  activeRestSeconds: null,
  completed: false,
  notes: "",
  startedAt: null,
  history: [],
};

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    startRoutine(state, action: PayloadAction<{ title: string; exercises: Exercise[] }>) {
      state.exercises = action.payload.exercises;
      state.activeRoutineTitle = action.payload.title;
      state.completed = false;
      state.notes = "";
      state.startedAt = Date.now();
    },
    toggleSet(
      state,
      action: PayloadAction<{ exerciseId: string; setId: string; reps: number; weight: number }>,
    ) {
      const ex = state.exercises.find((e) => e.id === action.payload.exerciseId);
      const set = ex?.sets.find((s) => s.id === action.payload.setId);
      if (!set) return;
      set.done = !set.done;
      if (set.done) {
        set.reps = action.payload.reps;
        set.weight = action.payload.weight;
      }
    },
    updateSet(
      state,
      action: PayloadAction<{
        exerciseId: string;
        setId: string;
        field: "reps" | "weight" | "rpe";
        value: number;
      }>,
    ) {
      const ex = state.exercises.find((e) => e.id === action.payload.exerciseId);
      const set = ex?.sets.find((s) => s.id === action.payload.setId);
      if (!set) return;
      set[action.payload.field] = action.payload.value;
    },
    setNotes(state, action: PayloadAction<string>) {
      state.notes = action.payload;
    },
    addExercises(state, action: PayloadAction<Exercise[]>) {
      state.exercises = [...state.exercises, ...action.payload];
    },
    completeWorkout(state) {
      state.completed = true;
      const volume = state.exercises.reduce(
        (a, e) => a + e.sets.filter((s) => s.done).reduce((x, s) => x + (s.weight ?? 0) * (s.reps ?? 0), 0), 0
      );
      const totalSets = state.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
      const durationMin = state.startedAt ? Math.round((Date.now() - state.startedAt) / 60000) : 0;
      state.history.unshift({
        id: `w-${Date.now()}`,
        title: state.activeRoutineTitle ?? "Workout",
        date: new Date().toISOString(),
        durationMin,
        exercises: state.exercises,
        notes: state.notes,
        volume,
        totalSets,
      });
    },
    resetWorkout(state) {
      state.exercises = [];
      state.activeRoutineTitle = null;
      state.completed = false;
      state.notes = "";
      state.startedAt = null;
    },
    restoreActiveWorkout(
      state,
      action: PayloadAction<{ exercises: Exercise[]; activeRoutineTitle: string; startedAt: number; notes: string }>,
    ) {
      state.exercises = action.payload.exercises;
      state.activeRoutineTitle = action.payload.activeRoutineTitle;
      state.startedAt = action.payload.startedAt;
      state.notes = action.payload.notes;
      state.completed = false;
    },
    updateHistory(state, action: PayloadAction<CompletedWorkout>) {
      const idx = state.history.findIndex((w) => w.id === action.payload.id);
      if (idx !== -1) state.history[idx] = action.payload;
    },
    setHistory(state, action: PayloadAction<CompletedWorkout[]>) {
      state.history = action.payload;
    },
  },
});

export const { startRoutine, addExercises, toggleSet, updateSet, setNotes, completeWorkout, resetWorkout, restoreActiveWorkout, updateHistory, setHistory } =
  workoutSlice.actions;
export default workoutSlice.reducer;
