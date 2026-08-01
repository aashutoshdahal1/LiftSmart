import type { Exercise, SetEntry } from "./mock-data";
import type { RoutineExercise } from "@/features/workout/CreateRoutineSheet";
import type { CompletedWorkout } from "@/store/workoutSlice";

// Coaching cues keyed by lowercase exercise name — performance-focused, not instructional
const AI_TIPS: Record<string, string> = {
  "barbell bench press": "Last session: 3×10 @ 0 kg. Try adding 2.5 kg today — progressive overload is key.",
  "incline dumbbell press": "Keep elbows at 45°. Slow 3 s eccentric for maximum chest activation.",
  "dumbbell bench press": "Neutral grip reduces shoulder strain. Pause 1 s at the bottom for a deep stretch.",
  "cable bench press": "Keep constant tension throughout. Don't let the cables go slack at the top.",
  "chest fly": "Feel the stretch, don't chase the weight. Stop at 90° to protect the pec minor.",
  "squat": "Hit depth before adding weight. Knees out, chest tall — film a set if you're unsure.",
  "barbell squat": "Brace hard before you unrack. Drive through the whole foot, not just the heels.",
  "deadlift": "Pull the slack out before you pull the bar. Hinge, don't squat. Back stays neutral.",
  "romanian deadlift": "Feel the hamstring stretch at the bottom. Control the eccentric — 3 s down.",
  "pull-up": "Full dead hang at the bottom, chin over bar at the top. No kipping — strict reps only.",
  "barbell row": "Row to your lower chest, not your belly. Lead with elbows, not hands.",
  "dumbbell row": "Full stretch at the bottom, full contraction at the top. Don't rush the eccentric.",
  "cable row": "Sit tall. Pull elbows behind your torso and hold 1 s at the end range.",
  "overhead press": "Stack wrists over elbows. Ribs down — don't hyperextend your lower back.",
  "lateral raise": "Lead with your elbows, not your hands. Control the negative to prevent injury.",
  "face pull": "External rotation at the end — thumbs pointing behind you. Light weight, high reps.",
  "bicep curl": "Keep elbows pinned to your sides. Supinate at the top for peak contraction.",
  "tricep pushdown": "Lock elbows at your sides. Full lockout at the bottom — squeeze hard.",
  "overhead triceps extension": "Keep upper arms vertical. Full stretch overhead, then press to lockout.",
  "hip thrust": "Full hip extension and 1 s pause at the top. Chin tucked, ribs down.",
  "leg press": "Full range — don't lock out the knees. Foot placement determines muscle emphasis.",
  "leg curl": "Pause at full contraction. Keep hips pressed into the pad the whole set.",
  "bulgarian split squat": "Front foot takes the load. Slight torso lean forward for more glute activation.",
  "plank": "Don't hold your breath. Squeeze glutes and abs simultaneously. Quality over duration.",
};

const DEFAULT_TIP = "Focus on progressive overload — add reps or weight each week to keep making gains.";

interface LastSetData {
  weight: number;
  reps: number;
  date: string;
  summary: string; // e.g. "3 × 10 @ 75 kg"
}

/** Build a lookup map: lowercase exercise name → most recent set data */
export function buildLastSessionMap(history: CompletedWorkout[]): Map<string, LastSetData> {
  const map = new Map<string, LastSetData>();

  // History is sorted newest first from API
  for (const workout of history) {
    for (const ex of workout.exercises ?? []) {
      const key = ex.name.toLowerCase().trim();
      if (map.has(key)) continue; // already have a more recent entry

      const doneSets = ex.sets.filter((s) => s.done !== false && (s.weight ?? 0) > 0);
      if (doneSets.length === 0) continue;

      // Most common weight in the session (mode), fallback to first
      const weightCounts = new Map<number, number>();
      for (const s of doneSets) {
        const w = s.weight ?? 0;
        weightCounts.set(w, (weightCounts.get(w) ?? 0) + 1);
      }
      const topWeight = [...weightCounts.entries()].sort((a, b) => b[1] - a[1])[0]![0];

      // Average reps at that weight
      const setsAtTopWeight = doneSets.filter((s) => s.weight === topWeight);
      const avgReps = Math.round(setsAtTopWeight.reduce((s, x) => s + (x.reps ?? 0), 0) / setsAtTopWeight.length);

      const summary = `${doneSets.length} × ${avgReps} @ ${topWeight} kg`;
      map.set(key, { weight: topWeight, reps: avgReps, date: workout.date, summary });
    }
  }

  return map;
}

export function routineToExercises(
  exercises: RoutineExercise[],
  lastSessionMap?: Map<string, LastSetData>,
): Exercise[] {
  return exercises.map((re) => {
    const key = re.name.toLowerCase().trim();
    const aiTip = AI_TIPS[key] ?? DEFAULT_TIP;
    const last = lastSessionMap?.get(key);

    // Use last session weight/reps as the default for every set; fall back to 0
    const defaultWeight = last?.weight ?? 0;
    const defaultReps = last?.reps ?? re.reps;

    const sets: SetEntry[] = Array.from({ length: re.sets }, (_, i) => ({
      id: `${re.id}-s${i}`,
      targetReps: defaultReps,
      targetWeight: defaultWeight,
      reps: defaultReps,
      weight: defaultWeight,
      done: false,
    }));

    const lastSessionLabel = last
      ? `${last.summary} on ${new Date(last.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : "No history yet";

    return {
      id: re.id,
      name: re.name,
      muscle: re.target ?? re.muscle_group ?? re.bodyPart ?? "Muscle",
      equipment: re.equipment ?? "Equipment",
      aiTip: last
        ? `Last session: ${last.summary}. ${last.weight > 0 ? `Try ${last.weight + 2.5} kg today.` : aiTip}`
        : aiTip,
      lastSession: lastSessionLabel,
      sets,
      imageUrl: re.imageUrl,
    } as Exercise & { imageUrl?: string };
  });
}
