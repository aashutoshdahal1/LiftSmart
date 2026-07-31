import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export interface RoutineExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

export interface Routine {
  id: string;
  title: string;
  exercises: RoutineExercise[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (routine: Routine) => void;
}

const EXERCISE_LIST = [
  "Barbell Bench Press",
  "Incline Dumbbell Press",
  "Squat",
  "Romanian Deadlift",
  "Deadlift",
  "Pull-Up",
  "Barbell Row",
  "Dumbbell Row",
  "Overhead Press",
  "Lateral Raise",
  "Cable Row",
  "Leg Press",
  "Hip Thrust",
  "Bicep Curl",
  "Tricep Pushdown",
  "Face Pull",
  "Bulgarian Split Squat",
  "Leg Curl",
  "Chest Fly",
  "Overhead Triceps Extension",
];

function newExercise(): RoutineExercise {
  return { id: Date.now().toString() + Math.random(), name: "", sets: 3, reps: 10 };
}

export function CreateRoutineSheet({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([newExercise()]);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const add = () => setExercises((prev) => [...prev, newExercise()]);
  const remove = (id: string) => setExercises((prev) => prev.filter((e) => e.id !== id));
  const update = (id: string, field: keyof RoutineExercise, val: string | number) =>
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)));

  const suggestions = (query: string) =>
    EXERCISE_LIST.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

  const canSave = title.trim().length > 0 && exercises.some((e) => e.name.trim().length > 0);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      exercises: exercises.filter((e) => e.name.trim()),
    });
    setTitle("");
    setExercises([newExercise()]);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl bg-card px-6 pb-8 pt-5"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted" />

        <div className="mb-6">
          <SheetTitle className="font-display text-xl font-semibold">New Routine</SheetTitle>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Routine name</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Push Day A, Leg Day, Full Body"
              className="h-12 rounded-2xl bg-elevated text-base"
            />
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Exercises</Label>
            <AnimatePresence initial={false}>
              {exercises.map((ex, i) => (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl bg-elevated p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Exercise {i + 1}
                      </span>
                      {exercises.length > 1 && (
                        <button
                          onClick={() => remove(ex.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Remove exercise"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>

                    {/* Name + autocomplete */}
                    <div className="relative">
                      <Input
                        value={ex.name}
                        onChange={(e) => update(ex.id, "name", e.target.value)}
                        onFocus={() => setFocusedId(ex.id)}
                        onBlur={() => setTimeout(() => setFocusedId(null), 150)}
                        placeholder="Exercise name"
                        className="h-10 rounded-xl bg-background"
                      />
                      <AnimatePresence>
                        {focusedId === ex.id && ex.name.length > 0 && suggestions(ex.name).length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                          >
                            {suggestions(ex.name).map((s) => (
                              <button
                                key={s}
                                onMouseDown={() => {
                                  update(ex.id, "name", s);
                                  setFocusedId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-elevated"
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Sets</Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={10}
                          value={ex.sets}
                          onChange={(e) => update(ex.id, "sets", Number(e.target.value))}
                          className="h-10 rounded-xl bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Reps</Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={50}
                          value={ex.reps}
                          onChange={(e) => update(ex.id, "reps", Number(e.target.value))}
                          className="h-10 rounded-xl bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              className="h-12 w-full gap-2 rounded-2xl border-dashed"
              onClick={add}
            >
              <Plus className="size-4" />
              Add exercise
            </Button>
          </div>

          <Button
            size="lg"
            className="h-14 w-full rounded-3xl text-base"
            disabled={!canSave}
            onClick={handleSave}
          >
            Save routine
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
