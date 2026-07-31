import type { Exercise, SetEntry } from "./mock-data";
import type { RoutineExercise } from "@/features/workout/CreateRoutineSheet";

const MUSCLE_MAP: Record<string, string> = {
  "barbell bench press": "Chest",
  "incline dumbbell press": "Chest",
  "chest fly": "Chest",
  "squat": "Quads",
  "bulgarian split squat": "Quads",
  "leg press": "Quads",
  "leg curl": "Hamstrings",
  "romanian deadlift": "Hamstrings",
  "deadlift": "Full Body",
  "hip thrust": "Glutes",
  "pull-up": "Back",
  "barbell row": "Back",
  "dumbbell row": "Back",
  "cable row": "Back",
  "overhead press": "Shoulders",
  "lateral raise": "Shoulders",
  "face pull": "Rear Delt",
  "bicep curl": "Biceps",
  "tricep pushdown": "Triceps",
  "overhead triceps extension": "Triceps",
};

const EQUIPMENT_MAP: Record<string, string> = {
  "barbell bench press": "Barbell",
  "incline dumbbell press": "Dumbbells",
  "chest fly": "Cable / Dumbbells",
  "squat": "Barbell",
  "bulgarian split squat": "Dumbbells",
  "leg press": "Machine",
  "leg curl": "Machine",
  "romanian deadlift": "Barbell",
  "deadlift": "Barbell",
  "hip thrust": "Barbell",
  "pull-up": "Bodyweight",
  "barbell row": "Barbell",
  "dumbbell row": "Dumbbells",
  "cable row": "Cable",
  "overhead press": "Barbell",
  "lateral raise": "Dumbbells",
  "face pull": "Cable",
  "bicep curl": "Dumbbells",
  "tricep pushdown": "Cable",
  "overhead triceps extension": "Cable / Dumbbell",
};

const AI_TIPS: Record<string, string> = {
  "barbell bench press": "Control the descent for 2–3 s. Drive your feet into the floor for leg drive.",
  "incline dumbbell press": "Keep a slight arch, elbows 45°. Squeeze at the top for an extra contraction.",
  "chest fly": "Don't let the stretch overload your pecs. Stop at a slight stretch and squeeze back.",
  "squat": "Brace your core before unracking. Drive knees out over toes throughout the movement.",
  "bulgarian split squat": "Rear foot elevation ~60 cm. Let your torso lean slightly forward for glute emphasis.",
  "leg press": "Full range of motion — don't lock out knees at the top. Control the eccentric.",
  "leg curl": "Pause at full contraction. Keep hips pressed into the pad to isolate hamstrings.",
  "romanian deadlift": "Hinge, don't squat. Feel the stretch at the bottom and drive hips forward.",
  "deadlift": "Big breath, brace, pull the slack out of the bar before you lift. Back flat throughout.",
  "hip thrust": "Full hip extension at the top, pause 1 s. Keep chin tucked to protect your lower back.",
  "pull-up": "Dead hang start. Initiate with your lats, not your arms. Full ROM every rep.",
  "barbell row": "Pull to your lower chest, not your belly. Row with your elbows, not your hands.",
  "dumbbell row": "Support yourself on a bench. Let the weight hang, then row explosively, lower slowly.",
  "cable row": "Sit tall, neutral spine. Pull elbows behind your torso — don't round at the end.",
  "overhead press": "Stack wrists over elbows. Tuck ribs, don't hyperextend your lower back.",
  "lateral raise": "Slight forward lean helps isolate the lateral delt. Control the negative carefully.",
  "face pull": "Set the cable at face height. External rotation at the end — thumbs point behind you.",
  "bicep curl": "Keep elbows pinned. Supinate at the top for a peak contraction.",
  "tricep pushdown": "Keep elbows fixed at your sides. Lock out completely and squeeze at the bottom.",
  "overhead triceps extension": "Keep upper arms vertical. Get a full stretch overhead before pressing down.",
};

const DEFAULT_TIP = "Focus on controlled reps and full range of motion. Quality over quantity.";
const DEFAULT_MUSCLE = "Muscle";
const DEFAULT_EQUIPMENT = "Equipment";

export function routineToExercises(exercises: RoutineExercise[]): Exercise[] {
  return exercises.map((re) => {
    const key = re.name.toLowerCase().trim();
    const sets: SetEntry[] = Array.from({ length: re.sets }, (_, i) => ({
      id: `${re.id}-s${i}`,
      targetReps: re.reps,
      targetWeight: 0,
      done: false,
    }));
    return {
      id: re.id,
      name: re.name,
      muscle: MUSCLE_MAP[key] ?? DEFAULT_MUSCLE,
      equipment: EQUIPMENT_MAP[key] ?? DEFAULT_EQUIPMENT,
      aiTip: AI_TIPS[key] ?? DEFAULT_TIP,
      lastSession: "No history yet",
      sets,
    };
  });
}
