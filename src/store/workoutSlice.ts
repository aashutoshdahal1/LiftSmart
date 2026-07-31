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

// Seed mock history so there's data to show from day one
const MOCK_HISTORY: CompletedWorkout[] = [
  {
    id: "h1",
    title: "Push Day",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    durationMin: 58,
    notes: "Felt strong on bench today.",
    volume: 8420,
    totalSets: 12,
    exercises: [
      { id: "e1", name: "Barbell Bench Press", muscle: "pectorals", equipment: "barbell", aiTip: "", lastSession: "", sets: [{ id: "s1", targetReps: 8, targetWeight: 80, reps: 8, weight: 80, done: true }, { id: "s2", targetReps: 8, targetWeight: 80, reps: 8, weight: 80, done: true }, { id: "s3", targetReps: 8, targetWeight: 80, reps: 7, weight: 80, done: true }] },
      { id: "e2", name: "Overhead Press", muscle: "deltoids", equipment: "barbell", aiTip: "", lastSession: "", sets: [{ id: "s4", targetReps: 10, targetWeight: 50, reps: 10, weight: 50, done: true }, { id: "s5", targetReps: 10, targetWeight: 50, reps: 9, weight: 50, done: true }, { id: "s6", targetReps: 10, targetWeight: 50, reps: 9, weight: 50, done: true }] },
      { id: "e3", name: "Tricep Pushdown", muscle: "triceps", equipment: "cable", aiTip: "", lastSession: "", sets: [{ id: "s7", targetReps: 12, targetWeight: 30, reps: 12, weight: 30, done: true }, { id: "s8", targetReps: 12, targetWeight: 30, reps: 12, weight: 30, done: true }, { id: "s9", targetReps: 12, targetWeight: 30, reps: 11, weight: 30, done: true }] },
    ],
  },
  {
    id: "h2",
    title: "Pull Day",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    durationMin: 65,
    notes: "",
    volume: 9100,
    totalSets: 15,
    exercises: [
      { id: "e4", name: "Deadlift", muscle: "hamstrings", equipment: "barbell", aiTip: "", lastSession: "", sets: [{ id: "s10", targetReps: 5, targetWeight: 120, reps: 5, weight: 120, done: true }, { id: "s11", targetReps: 5, targetWeight: 120, reps: 5, weight: 120, done: true }, { id: "s12", targetReps: 5, targetWeight: 120, reps: 4, weight: 120, done: true }] },
      { id: "e5", name: "Pull-up", muscle: "lats", equipment: "bodyweight", aiTip: "", lastSession: "", sets: [{ id: "s13", targetReps: 8, targetWeight: 0, reps: 8, weight: 0, done: true }, { id: "s14", targetReps: 8, targetWeight: 0, reps: 7, weight: 0, done: true }, { id: "s15", targetReps: 8, targetWeight: 0, reps: 6, weight: 0, done: true }] },
      { id: "e6", name: "Barbell Row", muscle: "lats", equipment: "barbell", aiTip: "", lastSession: "", sets: [{ id: "s16", targetReps: 10, targetWeight: 70, reps: 10, weight: 70, done: true }, { id: "s17", targetReps: 10, targetWeight: 70, reps: 10, weight: 70, done: true }, { id: "s18", targetReps: 10, targetWeight: 70, reps: 9, weight: 70, done: true }] },
    ],
  },
  {
    id: "h3",
    title: "Leg Day",
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    durationMin: 72,
    notes: "Quads were sore from Monday.",
    volume: 12800,
    totalSets: 15,
    exercises: [
      { id: "e7", name: "Barbell Squat", muscle: "quadriceps", equipment: "barbell", aiTip: "", lastSession: "", sets: [{ id: "s19", targetReps: 6, targetWeight: 100, reps: 6, weight: 100, done: true }, { id: "s20", targetReps: 6, targetWeight: 100, reps: 6, weight: 100, done: true }, { id: "s21", targetReps: 6, targetWeight: 100, reps: 5, weight: 100, done: true }] },
      { id: "e8", name: "Romanian Deadlift", muscle: "hamstrings", equipment: "barbell", aiTip: "", lastSession: "", sets: [{ id: "s22", targetReps: 10, targetWeight: 80, reps: 10, weight: 80, done: true }, { id: "s23", targetReps: 10, targetWeight: 80, reps: 10, weight: 80, done: true }, { id: "s24", targetReps: 10, targetWeight: 80, reps: 9, weight: 80, done: true }] },
      { id: "e9", name: "Leg Press", muscle: "quadriceps", equipment: "machine", aiTip: "", lastSession: "", sets: [{ id: "s25", targetReps: 12, targetWeight: 140, reps: 12, weight: 140, done: true }, { id: "s26", targetReps: 12, targetWeight: 140, reps: 12, weight: 140, done: true }, { id: "s27", targetReps: 12, targetWeight: 140, reps: 11, weight: 140, done: true }] },
    ],
  },
  {
    id: "h4",
    title: "Upper Body — Full",
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    durationMin: 50,
    notes: "",
    volume: 7200,
    totalSets: 12,
    exercises: [
      { id: "e10", name: "Dumbbell Bench Press", muscle: "pectorals", equipment: "dumbbell", aiTip: "", lastSession: "", sets: [{ id: "s28", targetReps: 10, targetWeight: 32, reps: 10, weight: 32, done: true }, { id: "s29", targetReps: 10, targetWeight: 32, reps: 10, weight: 32, done: true }, { id: "s30", targetReps: 10, targetWeight: 32, reps: 9, weight: 32, done: true }] },
      { id: "e11", name: "Cable Row", muscle: "lats", equipment: "cable", aiTip: "", lastSession: "", sets: [{ id: "s31", targetReps: 12, targetWeight: 55, reps: 12, weight: 55, done: true }, { id: "s32", targetReps: 12, targetWeight: 55, reps: 12, weight: 55, done: true }, { id: "s33", targetReps: 12, targetWeight: 55, reps: 11, weight: 55, done: true }] },
    ],
  },
];

const initialState: WorkoutState = {
  exercises: [],
  activeRoutineTitle: null,
  activeRestSeconds: null,
  completed: false,
  notes: "",
  startedAt: null,
  history: MOCK_HISTORY,
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
    updateHistory(state, action: PayloadAction<CompletedWorkout>) {
      const idx = state.history.findIndex((w) => w.id === action.payload.id);
      if (idx !== -1) state.history[idx] = action.payload;
    },
  },
});

export const { startRoutine, addExercises, toggleSet, updateSet, setNotes, completeWorkout, resetWorkout, updateHistory } =
  workoutSlice.actions;
export default workoutSlice.reducer;
