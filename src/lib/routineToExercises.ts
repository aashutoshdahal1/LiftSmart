import type { Exercise, SetEntry } from "./mock-data";
import type { RoutineExercise } from "@/features/workout/CreateRoutineSheet";

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

export function routineToExercises(exercises: RoutineExercise[]): Exercise[] {
  return exercises.map((re) => {
    const key = re.name.toLowerCase().trim();
    const aiTip = AI_TIPS[key] ?? DEFAULT_TIP;

    const sets: SetEntry[] = Array.from({ length: re.sets }, (_, i) => ({
      id: `${re.id}-s${i}`,
      targetReps: re.reps,
      targetWeight: 0,
      done: false,
    }));

    return {
      id: re.id,
      name: re.name,
      muscle: re.target ?? re.muscle_group ?? re.bodyPart ?? "Muscle",
      equipment: re.equipment ?? "Equipment",
      aiTip,
      lastSession: "No history yet",
      sets,
      imageUrl: re.imageUrl,
    } as Exercise & { imageUrl?: string };
  });
}
