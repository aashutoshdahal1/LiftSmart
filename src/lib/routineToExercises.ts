import type { Exercise, SetEntry } from "./mock-data";
import type { RoutineExercise } from "@/features/workout/CreateRoutineSheet";

// Fallback tips for exercises not from the DB
const AI_TIPS: Record<string, string> = {
  "barbell bench press": "Control the descent for 2–3 s. Drive your feet into the floor for leg drive.",
  "incline dumbbell press": "Keep a slight arch, elbows 45°. Squeeze at the top for an extra contraction.",
  "squat": "Brace your core before unracking. Drive knees out over toes throughout the movement.",
  "deadlift": "Big breath, brace, pull the slack out of the bar before you lift. Back flat throughout.",
  "pull-up": "Dead hang start. Initiate with your lats, not your arms. Full ROM every rep.",
  "overhead press": "Stack wrists over elbows. Tuck ribs, don't hyperextend your lower back.",
  "barbell row": "Pull to your lower chest, not your belly. Row with your elbows, not your hands.",
};

const DEFAULT_TIP = "Focus on controlled reps and full range of motion. Quality beats quantity.";

export function routineToExercises(exercises: RoutineExercise[]): Exercise[] {
  return exercises.map((re) => {
    const key = re.name.toLowerCase().trim();

    // Build instruction steps from DB data if available
    const steps = re.instruction_steps?.en;
    const aiTip = steps && steps.length > 0
      ? steps[0]
      : (AI_TIPS[key] ?? DEFAULT_TIP);

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
      // Pass image through to ExerciseCard via notes field isn't ideal,
      // so we store it in a custom prop — ExerciseCard will pick it up
      imageUrl: re.imageUrl,
    } as Exercise & { imageUrl?: string };
  });
}
