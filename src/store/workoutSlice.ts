import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Exercise } from "@/lib/mock-data";

interface WorkoutState {
  exercises: Exercise[];
  activeRoutineTitle: string | null;
  activeRestSeconds: number | null;
  completed: boolean;
  notes: string;
}

const initialState: WorkoutState = {
  exercises: [],
  activeRoutineTitle: null,
  activeRestSeconds: null,
  completed: false,
  notes: "",
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
    },
    resetWorkout(state) {
      state.exercises = [];
      state.activeRoutineTitle = null;
      state.completed = false;
      state.notes = "";
    },
  },
});

export const { startRoutine, addExercises, toggleSet, updateSet, setNotes, completeWorkout, resetWorkout } =
  workoutSlice.actions;
export default workoutSlice.reducer;
