import { useEffect } from "react";
import { weightApi, nutritionApi, workoutsApi, measurementsApi, profileApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store";
import { setBodyStats, setGoal, setActivityLevel } from "@/store/profileSlice";
import { logWeight } from "@/store/weightSlice";
import { setUser } from "@/store/authSlice";
import { setGamification } from "@/store/gamificationSlice";
import { setHistory } from "@/store/workoutSlice";
import { setRecords } from "@/store/measurementSlice";
import { setNutritionFromLog } from "@/store/nutritionSlice";

export function AppDataLoader() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) return;

    // Load all user data in parallel on mount
    Promise.allSettled([
      profileApi.get().then(({ profile }) => {
        dispatch(setBodyStats({ age: profile.age, heightCm: profile.heightCm, weightKg: profile.weightKg, gender: profile.gender }));
        dispatch(setGoal(profile.goal));
        dispatch(setActivityLevel(profile.activityLevel));
        dispatch(setUser(profile));
        dispatch(setGamification({ xp: profile.xp, xpToNext: profile.xpToNext, level: profile.level, streak: profile.streak }));
      }),

      weightApi.list().then(({ entries }) => {
        for (const e of entries) dispatch(logWeight({ date: e.date, kg: e.kg }));
      }),

      nutritionApi.get().then(({ log }) => {
        dispatch(setNutritionFromLog(log));
      }),

      workoutsApi.list(20).then(({ workouts }) => {
        dispatch(setHistory(workouts.map((w) => ({
          id: w._id,
          title: w.title,
          date: w.date,
          durationMin: w.durationMin,
          exercises: w.exercises as never[],
          notes: w.notes,
          volume: w.volume,
          totalSets: w.totalSets,
        }))));
      }),

      measurementsApi.list().then(({ records }) => {
        dispatch(setRecords(records.map((r) => ({
          id: r._id,
          label: r.label,
          unit: r.unit,
          entries: r.entries,
        }))));
      }),
    ]);
  }, [token, dispatch]);

  return null;
}
