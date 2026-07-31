import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import gamificationReducer from "./gamificationSlice";
import measurementReducer from "./measurementSlice";
import nutritionReducer from "./nutritionSlice";
import profileReducer from "./profileSlice";
import weightReducer from "./weightSlice";
import workoutReducer from "./workoutSlice";

export const store = configureStore({
  reducer: {
    workout: workoutReducer,
    nutrition: nutritionReducer,
    gamification: gamificationReducer,
    weight: weightReducer,
    measurement: measurementReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
