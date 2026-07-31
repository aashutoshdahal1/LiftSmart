import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { todayWorkout, type Exercise } from "@/lib/mock-data";

interface WorkoutState {
  exercises: Exercise[];
  activeRestSeconds: number | null;
  completed: boolean;
  notes: string;
}

const initialState: WorkoutState = {
  exercises: todayWorkout.exercises,
  activeRestSeconds: null,
  completed: false,
  notes: "",
};

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
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
    completeWorkout(state) {
      state.completed = true;
    },
    resetWorkout() {
      return { ...initialState, exercises: initialState.exercises.map((e) => ({ ...e })) };
    },
  },
});

export const { toggleSet, updateSet, setNotes, completeWorkout, resetWorkout } =
  workoutSlice.actions;
export default workoutSlice.reducer;
