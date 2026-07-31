import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import gamificationReducer from "./gamificationSlice";
import nutritionReducer from "./nutritionSlice";
import workoutReducer from "./workoutSlice";

export const store = configureStore({
  reducer: {
    workout: workoutReducer,
    nutrition: nutritionReducer,
    gamification: gamificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
