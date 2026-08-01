import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "./authSlice";
import gamificationReducer from "./gamificationSlice";
import measurementReducer from "./measurementSlice";
import nutritionReducer from "./nutritionSlice";
import nutritionHistoryReducer from "./nutritionHistorySlice";
import profileReducer from "./profileSlice";
import weightReducer from "./weightSlice";
import workoutReducer from "./workoutSlice";

const ACTIVE_WORKOUT_KEY = "ls_active_workout";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workout: workoutReducer,
    nutrition: nutritionReducer,
    nutritionHistory: nutritionHistoryReducer,
    gamification: gamificationReducer,
    weight: weightReducer,
    measurement: measurementReducer,
    profile: profileReducer,
  },
});

// Persist only the minimal active-session fields — not the full 501-workout history.
// Fired in store.subscribe so we never block the render.
store.subscribe(() => {
  const { workout } = store.getState();
  if (workout.activeRoutineTitle && !workout.completed) {
    try {
      const snapshot = {
        exercises: workout.exercises,
        activeRoutineTitle: workout.activeRoutineTitle,
        startedAt: workout.startedAt,
        notes: workout.notes,
      };
      localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(snapshot));
    } catch { /* quota exceeded — skip */ }
  } else {
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export { ACTIVE_WORKOUT_KEY };
