export interface DbExercise {
  id: string;
  name: string;
  body_part: string;
  category: string;
  equipment: string;
  target: string;
  muscle_group: string;
  secondary_muscles: string[];
  image: string;
  gif_url: string;
  media_id: string;
  instructions: Record<string, string>;
  instruction_steps: Record<string, string[]>;
  attribution: string;
  created_at: string;
}

export const REPO_BASE =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main";

export function getImageUrl(ex: DbExercise): string {
  return `${REPO_BASE}/${ex.image}`;
}

export function getGifUrl(ex: DbExercise): string {
  return `${REPO_BASE}/${ex.gif_url}`;
}

export const BODY_PARTS = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

export const BODY_PART_LABELS: Record<string, string> = {
  back: "Back",
  cardio: "Cardio",
  chest: "Chest",
  "lower arms": "Forearms",
  "lower legs": "Calves",
  neck: "Neck",
  shoulders: "Shoulders",
  "upper arms": "Arms",
  "upper legs": "Legs",
  waist: "Core",
};

// Module-level singleton cache — fetched once per session
let _cache: DbExercise[] | null = null;
let _inflight: Promise<DbExercise[]> | null = null;

export async function fetchExercises(): Promise<DbExercise[]> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;
  _inflight = fetch(`${REPO_BASE}/data/exercises.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<DbExercise[]>;
    })
    .then((data) => {
      _cache = data;
      _inflight = null;
      return data;
    })
    .catch((err) => {
      _inflight = null;
      throw err;
    });
  return _inflight;
}
