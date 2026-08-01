import { useEffect } from "react";
import { weightApi, nutritionApi, workoutsApi, measurementsApi, profileApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store";
import { ACTIVE_WORKOUT_KEY } from "@/store";
import { setBodyStats, setGoal, setActivityLevel } from "@/store/profileSlice";
import { setWeightEntries } from "@/store/weightSlice";
import { setUser } from "@/store/authSlice";
import { setGamification } from "@/store/gamificationSlice";
import { setHistory, restoreActiveWorkout } from "@/store/workoutSlice";
import { setRecords } from "@/store/measurementSlice";
import { setNutritionFromLog } from "@/store/nutritionSlice";
import { setNutritionHistory } from "@/store/nutritionHistorySlice";

export function AppDataLoader() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const activeRoutineTitle = useAppSelector((s) => s.workout.activeRoutineTitle);

  // Restore active workout from localStorage on every app mount (any route)
  useEffect(() => {
    if (activeRoutineTitle) return; // already in Redux — nothing to restore
    try {
      const raw = localStorage.getItem(ACTIVE_WORKOUT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        exercises: unknown[];
        activeRoutineTitle: string;
        startedAt: number;
        notes: string;
      };
      if (saved.activeRoutineTitle && Array.isArray(saved.exercises)) {
        dispatch(restoreActiveWorkout({
          exercises: saved.exercises as never[],
          activeRoutineTitle: saved.activeRoutineTitle,
          startedAt: saved.startedAt ?? Date.now(),
          notes: saved.notes ?? "",
        }));
      }
    } catch { /* malformed — ignore */ }
  // runs once on mount regardless of route
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        dispatch(setWeightEntries(entries.map((e) => ({ date: e.date, kg: e.kg }))));
      }),

      nutritionApi.get().then(({ log }) => {
        const meals = log.meals.map((m, i) => ({
          id: `${m.slot.toLowerCase()}-${i}`,
          slot: m.slot,
          time: m.time,
          items: m.items,
        }));
        const consumed = log.consumed ?? {
          calories: meals.flatMap((m) => m.items).reduce((s, it) => s + it.calories, 0),
          protein:  meals.flatMap((m) => m.items).reduce((s, it) => s + it.protein,  0),
          carbs:    meals.flatMap((m) => m.items).reduce((s, it) => s + it.carbs,    0),
          fat:      meals.flatMap((m) => m.items).reduce((s, it) => s + it.fat,      0),
        };
        dispatch(setNutritionFromLog({ meals, water: log.water, waterTarget: log.waterTarget, consumed }));
      }),

      workoutsApi.list(600).then(({ workouts }) => {
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

      nutritionApi.history(7).then(({ history }) => {
        dispatch(setNutritionHistory(history));
      }),
    ]);
  }, [token, dispatch]);

  return null;
}
