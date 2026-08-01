const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem("ls_token") : null;
}

export function setToken(token: string) {
  localStorage.setItem("ls_token", token);
}

export function clearToken() {
  localStorage.removeItem("ls_token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message ?? "Request failed");
  return data as T;
}

const get  = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });
const put  = <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del  = <T>(path: string, body?: unknown) => request<T>(path, { method: "DELETE", ...(body ? { body: JSON.stringify(body) } : {}) });

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string) =>
    post<{ token: string; user: User }>("/api/auth/register", { name, email, password }),
  login: (email: string, password: string) =>
    post<{ token: string; user: User }>("/api/auth/login", { email, password }),
  me: () => get<{ user: User }>("/api/auth/me"),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => get<{ profile: User }>("/api/profile"),
  update: (data: Partial<User>) => patch<{ profile: User }>("/api/profile", data),
};

// ── Weight ────────────────────────────────────────────────────────────────────
export const weightApi = {
  list: () => get<{ entries: WeightEntryRes[] }>("/api/weight"),
  log: (date: string, kg: number) => post<{ entry: WeightEntryRes }>("/api/weight", { date, kg }),
  delete: (date: string) => del<{ message: string }>(`/api/weight/${date}`),
};

// ── Nutrition ─────────────────────────────────────────────────────────────────
export const nutritionApi = {
  get: (date?: string) => get<{ log: NutritionLogRes }>(`/api/nutrition${date ? `?date=${date}` : ""}`),
  addFood: (slot: string, item: FoodItemPayload, date?: string) =>
    post<{ log: NutritionLogRes }>("/api/nutrition/food", { slot, item, date }),
  removeFood: (slot: string, itemId: string, date?: string) =>
    del<{ log: NutritionLogRes }>("/api/nutrition/food", { slot, itemId, date }),
  setWater: (water: number, date?: string) =>
    patch<{ log: NutritionLogRes }>("/api/nutrition/water", { water, date }),
};

// ── Workouts ──────────────────────────────────────────────────────────────────
export const workoutsApi = {
  list: (limit = 20) => get<{ workouts: WorkoutRes[] }>(`/api/workouts?limit=${limit}`),
  save: (data: WorkoutPayload) => post<{ workout: WorkoutRes; user: User }>("/api/workouts", data),
  delete: (id: string) => del<{ message: string }>(`/api/workouts/${id}`),
};

// ── Routines ──────────────────────────────────────────────────────────────────
export const routinesApi = {
  list: () => get<{ routines: RoutineRes[] }>("/api/routines"),
  create: (title: string, exercises: RoutineExercisePayload[]) =>
    post<{ routine: RoutineRes }>("/api/routines", { title, exercises }),
  update: (id: string, data: Partial<{ title: string; exercises: RoutineExercisePayload[] }>) =>
    put<{ routine: RoutineRes }>(`/api/routines/${id}`, data),
  delete: (id: string) => del<{ message: string }>(`/api/routines/${id}`),
};

// ── Measurements ──────────────────────────────────────────────────────────────
export const measurementsApi = {
  list: () => get<{ records: MeasurementRes[] }>("/api/measurements"),
  create: (label: string, unit?: string) =>
    post<{ record: MeasurementRes }>("/api/measurements", { label, unit }),
  log: (id: string, date: string, value: number) =>
    post<{ record: MeasurementRes }>(`/api/measurements/${id}/log`, { date, value }),
  rename: (id: string, label: string) =>
    patch<{ record: MeasurementRes }>(`/api/measurements/${id}`, { label }),
  delete: (id: string) => del<{ message: string }>(`/api/measurements/${id}`),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (messages: { role: string; content: string }[], page?: string) =>
    post<{ reply: string }>("/api/ai/chat", { messages, page }),
  suggestions: (page: "workout" | "food" | "progress") =>
    post<{ suggestions: AiSuggestion[] }>("/api/ai/suggestions", { page }),
  workoutPlan: (focus?: string, equipment?: string) =>
    post<{ plan: AiWorkoutPlan }>("/api/ai/workout-plan", { focus, equipment }),
  mealPlan: (targetCalories: number, targetProtein: number) =>
    post<{ meals: NutritionLogRes["meals"] }>("/api/ai/meal-plan", { targetCalories, targetProtein }),
};

// ── Response types ────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: "male" | "female" | "other";
  goal: "lean-bulk" | "bulk" | "cut" | "maintenance" | "lose-weight";
  activityLevel: "sedentary" | "light" | "moderate" | "high" | "athlete";
  experience: "beginner" | "intermediate" | "advanced";
  targetDays: number;
  gymAccess: "full-gym" | "home-gym" | "bodyweight";
  foodPreferences: string[];
  units: "metric" | "imperial";
  xp: number;
  xpToNext: number;
  level: number;
  streak: number;
}

export interface WeightEntryRes {
  _id: string;
  date: string;
  kg: number;
}

export interface FoodItemPayload {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: number;
}

export interface NutritionLogRes {
  _id: string;
  date: string;
  meals: {
    slot: "Breakfast" | "Lunch" | "Dinner" | "Snack";
    time: string;
    items: FoodItemPayload[];
  }[];
  water: number;
  waterTarget: number;
  consumed: { calories: number; protein: number; carbs: number; fat: number };
}

export interface WorkoutPayload {
  title: string;
  date?: string;
  durationMin?: number;
  exercises?: unknown[];
  notes?: string;
  volume?: number;
  totalSets?: number;
}

export interface WorkoutRes {
  _id: string;
  title: string;
  date: string;
  durationMin: number;
  exercises: unknown[];
  notes: string;
  volume: number;
  totalSets: number;
}

export interface RoutineExercisePayload {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  muscle?: string;
  equipment?: string;
}

export interface RoutineRes {
  _id: string;
  title: string;
  exercises: RoutineExercisePayload[];
}

export interface MeasurementRes {
  _id: string;
  label: string;
  unit: string;
  entries: { date: string; value: number }[];
}

export interface AiSuggestion {
  title: string;
  body: string;
  tag: "nutrition" | "training" | "recovery" | "progress";
}

export interface AiWorkoutPlan {
  title: string;
  exercises: { name: string; sets: number; reps: number; muscle: string; equipment: string }[];
}
